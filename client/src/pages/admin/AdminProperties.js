import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties, toggleFeatured, deleteProperty } from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await getAdminProperties({ page: p, limit: 10 });
      setProperties(data.properties);
      setTotalPages(data.totalPages);
    } catch { toast.error('Failed to load properties'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProperties(); }, []); // eslint-disable-line

  const handleToggleFeatured = async (id) => {
    try {
      const { data } = await toggleFeatured(id);
      setProperties(properties.map((p) => p._id === id ? { ...p, isFeatured: data.property.isFeatured } : p));
      toast.success(data.message);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await deleteProperty(id);
      setProperties(properties.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Manage Properties</h1>
            <p className="page-subtitle">View and manage all property listings</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Price</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="table-property-name">
                        <div className="table-prop-img">
                          {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.title} /> : <span>🏠</span>}
                        </div>
                        <div>
                          <Link to={`/properties/${p._id}`} className="table-prop-title">{p.title}</Link>
                          <div className="table-prop-location">{p.location?.city}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="user-name-cell">{p.owner?.name}</div>
                      <div className="user-email-cell">{p.owner?.email}</div>
                    </td>
                    <td><strong>{formatPrice(p.price)}</strong></td>
                    <td><span className="type-pill">{p.type}</span></td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.isFeatured ? 'btn-gold' : 'btn-outline'}`}
                        onClick={() => handleToggleFeatured(p._id)}
                      >
                        {p.isFeatured ? '⭐ Featured' : 'Feature'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/properties/${p._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="admin-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-page ${p === page ? 'active' : ''}`}
                    onClick={() => { setPage(p); fetchProperties(p); }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;
