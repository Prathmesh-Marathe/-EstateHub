import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProperties, deleteProperty, getMyConversations } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatWindow from '../components/chat/ChatWindow';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('properties');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, convRes] = await Promise.all([
          getMyProperties(),
          getMyConversations()
        ]);
        setProperties(propRes.data.properties);

        // Count total unread messages
        const convs = convRes.data.conversations;
        const unread = convs.reduce((sum, c) => {
          const isOwner = c.owner?._id === user?._id;
          return sum + (isOwner ? c.unreadByOwner : c.unreadByBuyer);
        }, 0);
        setTotalUnread(unread);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await deleteProperty(id);
      setProperties(properties.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* ── Header ──────────────────────────────────── */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <div className="dashboard-avatar">{user?.name?.charAt(0)}</div>
            <div>
              <h1>Welcome, {user?.name?.split(' ')[0]}!</h1>
              <p>{user?.email} · {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}</p>
            </div>
          </div>
          <Link to="/properties/new" className="btn btn-gold">+ List New Property</Link>
        </div>

        {/* ── Stats ───────────────────────────────────── */}
        <div className="dashboard-stats">
          <div className="dash-stat">
            <div className="dash-stat-value">{properties.length}</div>
            <div className="dash-stat-label">My Listings</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{properties.filter(p => p.status === 'available').length}</div>
            <div className="dash-stat-label">Active</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{totalUnread}</div>
            <div className="dash-stat-label">Unread Messages</div>
          </div>
          <div className="dash-stat">
            <div className="dash-stat-value">{properties.reduce((acc, p) => acc + (p.views || 0), 0)}</div>
            <div className="dash-stat-label">Total Views</div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────── */}
        <div className="dashboard-tabs">
          <button
            className={`dash-tab ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            My Properties ({properties.length})
          </button>
          <button
            className={`dash-tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
            {totalUnread > 0 && (
              <span className="tab-unread-badge">{totalUnread}</span>
            )}
          </button>
        </div>

        {/* ── My Properties Tab ───────────────────────── */}
        {activeTab === 'properties' && (
          <div className="dashboard-content">
            {properties.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                <h3>No properties listed yet</h3>
                <p>Start by adding your first property listing</p>
                <Link to="/properties/new" className="btn btn-gold" style={{ marginTop: 16 }}>
                  + Add Property
                </Link>
              </div>
            ) : (
              <div className="property-table-container">
                <table className="property-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="table-property-name">
                            <div className="table-prop-img">
                              {p.images?.[0]?.url
                                ? <img src={p.images[0].url} alt={p.title} />
                                : <span>🏠</span>}
                            </div>
                            <div>
                              <Link to={`/properties/${p._id}`} className="table-prop-title">
                                {p.title}
                              </Link>
                              <div className="table-prop-location">
                                {p.location?.city}, {p.location?.state}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td><span className="type-pill">{p.type}</span></td>
                        <td><strong>{formatPrice(p.price)}</strong></td>
                        <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                        <td>{p.views || 0}</td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/properties/${p._id}/edit`} className="btn btn-outline btn-sm">
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(p._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Messages Tab (Instagram-style chat) ─────── */}
        {activeTab === 'messages' && (
          <div className="dashboard-content">
            <ChatWindow />
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
