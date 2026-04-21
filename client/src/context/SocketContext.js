import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      // Disconnect if logged out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Connect socket with JWT
    const socket = io(
      process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
      { auth: { token }, transports: ['websocket', 'polling'] }
    );

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('user_online', (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on('user_offline', (userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  const joinConversation = (id) => socketRef.current?.emit('join_conversation', id);
  const leaveConversation = (id) => socketRef.current?.emit('leave_conversation', id);
  const sendMessage = (conversationId, text) =>
    socketRef.current?.emit('send_message', { conversationId, text });
  const startTyping = (conversationId) =>
    socketRef.current?.emit('typing_start', { conversationId });
  const stopTyping = (conversationId) =>
    socketRef.current?.emit('typing_stop', { conversationId });
  const onNewMessage = (cb) => {
    socketRef.current?.on('new_message', cb);
    return () => socketRef.current?.off('new_message', cb);
  };
  const onTyping = (cb) => {
    socketRef.current?.on('typing', cb);
    return () => socketRef.current?.off('typing', cb);
  };
  const onStopTyping = (cb) => {
    socketRef.current?.on('stop_typing', cb);
    return () => socketRef.current?.off('stop_typing', cb);
  };
  const onConversationUpdated = (cb) => {
    socketRef.current?.on('conversation_updated', cb);
    return () => socketRef.current?.off('conversation_updated', cb);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      onlineUsers,
      joinConversation,
      leaveConversation,
      sendMessage,
      startTyping,
      stopTyping,
      onNewMessage,
      onTyping,
      onStopTyping,
      onConversationUpdated
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
