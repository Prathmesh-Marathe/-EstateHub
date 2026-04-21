import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getMyConversations, getConversationMessages, getOrCreateConversation } from '../../utils/api';
import { toast } from 'react-toastify';
import './ChatWindow.css';

/* ─── Helpers ─────────────────────────────────────────────────── */
const formatTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* ─── ConversationItem (sidebar row) ─────────────────────────── */
const ConversationItem = ({ conv, currentUserId, isActive, onClick, onlineUsers }) => {
  const other = conv.buyer?._id === currentUserId ? conv.owner : conv.buyer;
  const isOnline = onlineUsers?.has(other?._id?.toString());
  const unread = conv.buyer?._id === currentUserId ? conv.unreadByBuyer : conv.unreadByOwner;

  return (
    <button className={`conv-item ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="conv-avatar-wrap">
        <div className="conv-avatar">{other?.name?.charAt(0).toUpperCase()}</div>
        {isOnline && <span className="online-dot" />}
      </div>
      <div className="conv-info">
        <div className="conv-top">
          <span className="conv-name">{other?.name}</span>
          <span className="conv-time">{formatTime(conv.lastMessageAt)}</span>
        </div>
        <div className="conv-bottom">
          <span className="conv-preview">
            {conv.property?.title
              ? `🏠 ${conv.property.title}`
              : conv.lastMessage || 'Start chatting...'}
          </span>
          {unread > 0 && <span className="unread-badge">{unread}</span>}
        </div>
      </div>
    </button>
  );
};

/* ─── Main ChatWindow ─────────────────────────────────────────── */
const ChatWindow = ({ initialPropertyId, onClose }) => {
  const { user } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'

  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  const activeConv = conversations.find((c) => c._id === activeConvId);

  /* Scroll to bottom on new messages */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  /* Load conversations */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyConversations();
        setConversations(data.conversations);

        // Auto-open conversation for a property if passed in
        if (initialPropertyId) {
          const existing = data.conversations.find(
            (c) => c.property?._id === initialPropertyId
          );
          if (existing) {
            openConversation(existing._id);
          } else {
            // Create new conversation
            try {
              const res = await getOrCreateConversation(initialPropertyId);
              const newConv = res.data.conversation;
              setConversations((prev) => [newConv, ...prev]);
              openConversation(newConv._id);
            } catch (e) {
              toast.error(e.response?.data?.message || 'Cannot start chat');
            }
          }
        } else if (data.conversations.length > 0 && window.innerWidth > 768) {
          openConversation(data.conversations[0]._id);
        }
      } catch {
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line

  /* Socket listeners */
  useEffect(() => {
    if (!socket) return;

    const offMsg = socket.onNewMessage(({ conversationId, message }) => {
      if (conversationId === activeConvId) {
        setMessages((prev) => [...prev, message]);
      }
      // Update sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
            : c
        )
      );
    });

    const offTyping = socket.onTyping(({ conversationId, name }) => {
      if (conversationId === activeConvId) setTypingUser(name);
    });

    const offStop = socket.onStopTyping(({ conversationId }) => {
      if (conversationId === activeConvId) setTypingUser(null);
    });

    return () => { offMsg(); offTyping(); offStop(); };
  }, [socket, activeConvId]);

  /* Open a conversation */
  const openConversation = async (convId) => {
    if (activeConvId === convId) return;

    // Leave old room
    if (activeConvId) socket?.leaveConversation(activeConvId);

    setActiveConvId(convId);
    setMessages([]);
    setTypingUser(null);
    setMobileView('chat');
    socket?.joinConversation(convId);

    setMsgLoading(true);
    try {
      const { data } = await getConversationMessages(convId);
      setMessages(data.messages);
      // Mark as read in sidebar
      setConversations((prev) =>
        prev.map((c) => {
          if (c._id !== convId) return c;
          const isOwner = c.owner?._id === user?._id;
          return isOwner
            ? { ...c, unreadByOwner: 0 }
            : { ...c, unreadByBuyer: 0 };
        })
      );
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setMsgLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  /* Send message */
  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || !activeConvId) return;
    socket?.sendMessage(activeConvId, input.trim());
    setInput('');
    socket?.stopTyping(activeConvId);
    clearTimeout(typingTimer.current);
  };

  /* Typing indicator */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeConvId) return;
    socket?.startTyping(activeConvId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.stopTyping(activeConvId);
    }, 1500);
  };

  /* Keyboard shortcut */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const other = c.buyer?._id === user?._id ? c.owner : c.buyer;
    const name = other?.name?.toLowerCase() || '';
    const title = c.property?.title?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || title.includes(q);
  });

  const otherUser = activeConv
    ? activeConv.buyer?._id === user?._id
      ? activeConv.owner
      : activeConv.buyer
    : null;

  const isOtherOnline = otherUser && socket?.onlineUsers?.has(otherUser._id?.toString());

  /* Group messages by date */
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="chat-window">
      {/* ── Sidebar ─────────────────────────────── */}
      <div className={`chat-sidebar ${mobileView === 'chat' ? 'hide-mobile' : ''}`}>
        <div className="chat-sidebar-header">
          <h3>Messages</h3>
          {onClose && (
            <button className="chat-close-btn" onClick={onClose} title="Close">✕</button>
          )}
        </div>

        <div className="chat-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="conv-list">
          {loading ? (
            <div className="chat-loading"><div className="spinner" /></div>
          ) : filteredConvs.length === 0 ? (
            <div className="chat-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConvs.map((c) => (
              <ConversationItem
                key={c._id}
                conv={c}
                currentUserId={user?._id}
                isActive={c._id === activeConvId}
                onClick={() => openConversation(c._id)}
                onlineUsers={socket?.onlineUsers}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat Area ───────────────────────────── */}
      <div className={`chat-main ${mobileView === 'list' ? 'hide-mobile' : ''}`}>
        {!activeConvId ? (
          <div className="chat-placeholder">
            <div className="chat-placeholder-icon">💬</div>
            <h3>Your Messages</h3>
            <p>Select a conversation to start chatting</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <button className="chat-back-btn" onClick={() => setMobileView('list')}>
                ←
              </button>
              <div className="chat-header-avatar-wrap">
                <div className="chat-header-avatar">
                  {otherUser?.name?.charAt(0).toUpperCase()}
                </div>
                {isOtherOnline && <span className="online-dot" />}
              </div>
              <div className="chat-header-info">
                <div className="chat-header-name">{otherUser?.name}</div>
                <div className="chat-header-sub">
                  {isOtherOnline ? (
                    <span className="online-text">● Online</span>
                  ) : (
                    <span>Offline</span>
                  )}
                </div>
              </div>
              {activeConv?.property && (
                <div className="chat-property-pill">
                  <span>🏠</span>
                  <span>{activeConv.property.title}</span>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {msgLoading ? (
                <div className="chat-loading"><div className="spinner" /></div>
              ) : messages.length === 0 ? (
                <div className="chat-empty chat-empty-messages">
                  <div className="chat-empty-icon">👋</div>
                  <p>Say hello to {otherUser?.name}!</p>
                  <small>Messages are end-to-end saved</small>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="date-divider"><span>{date === new Date().toDateString() ? 'Today' : date}</span></div>
                    {msgs.map((msg, idx) => {
                      const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                      const prevMsg = msgs[idx - 1];
                      const showAvatar = !isMine && (
                        !prevMsg || prevMsg.sender?._id !== msg.sender?._id
                      );
                      return (
                        <div key={msg._id} className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                          {!isMine && (
                            <div className={`msg-avatar-space ${showAvatar ? '' : 'invisible'}`}>
                              {showAvatar && (
                                <div className="msg-avatar">
                                  {msg.sender?.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="msg-bubble-wrap">
                            <div className={`msg-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                              {msg.text}
                            </div>
                            <div className="msg-time">{formatTime(msg.createdAt)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}

              {/* Typing indicator */}
              {typingUser && (
                <div className="msg-row theirs">
                  <div className="msg-avatar-space">
                    <div className="msg-avatar">{typingUser.charAt(0)}</div>
                  </div>
                  <div className="msg-bubble-wrap">
                    <div className="msg-bubble bubble-theirs typing-bubble">
                      <span className="dot" /><span className="dot" /><span className="dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-bar" onSubmit={handleSend}>
              <input
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${otherUser?.name || ''}...`}
                maxLength={1000}
              />
              <button
                type="submit"
                className={`chat-send-btn ${input.trim() ? 'active' : ''}`}
                disabled={!input.trim()}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
