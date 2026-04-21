import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  const { stats, recentProperties, recentUsers } = data;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="page-subtitle">Overview of platform activity</p>
          </div>
          <div className="admin-nav-links">
            <Link to="/admin/users" className="btn btn-outline btn-sm">Manage Users</Link>
            <Link to="/admin/properties" className="btn btn-outline btn-sm">Manage Properties</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#4f46e5' },
            { label: 'Total Properties', value: stats.totalProperties, icon: '🏘️', color: '#059669' },
            { label: 'Available', value: stats.availableProperties, icon: '✅', color: '#0891b2' },
            { label: 'Sold/Rented', value: stats.soldProperties, icon: '🔑', color: '#d97706' },
            { label: 'Enquiries', value: stats.totalContacts, icon: '📩', color: '#db2777' }
          ].map((s) => (
            <div key={s.label} className="admin-stat-card" style={{ '--accent': s.color }}>
              <div className="admin-stat-icon">{s.icon}</div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-bottom-grid">
          {/* Recent Properties */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3>Recent Listings</h3>
              <Link to="/admin/properties" className="panel-link">View all →</Link>
            </div>
            <div className="admin-list">
              {recentProperties.map((p) => (
                <div key={p._id} className="admin-list-item">
                  <div className="list-item-thumb">
                    {p.images?.[0]?.url
                      ? <img src={p.images[0].url} alt={p.title} />
                      : <span>🏠</span>}
                  </div>
                  <div className="list-item-info">
                    <Link to={`/properties/${p._id}`} className="list-item-title">{p.title}</Link>
                    <div className="list-item-meta">{p.owner?.name} · {p.location?.city}</div>
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3>New Members</h3>
              <Link to="/admin/users" className="panel-link">View all →</Link>
            </div>
            <div className="admin-list">
              {recentUsers.map((u) => (
                <div key={u._id} className="admin-list-item">
                  <div className="user-list-avatar">{u.name?.charAt(0)}</div>
                  <div className="list-item-info">
                    <div className="list-item-title">{u.name}</div>
                    <div className="list-item-meta">{u.email}</div>
                  </div>
                  <div className="list-item-date">{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
