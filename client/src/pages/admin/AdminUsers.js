import React, { useState, useEffect } from 'react';
import { getAdminUsers, toggleUserStatus, deleteUser } from '../../utils/api';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async (s = search, p = page) => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search: s, page: p, limit: 10 });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(search, 1);
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their listings?`)) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Manage Users</h1>
            <p className="page-subtitle">View and manage all registered users</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="admin-search-bar">
          <input
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="table-user">
                        <div className="user-list-avatar">{u.name?.charAt(0)}</div>
                        <div>
                          <div className="user-name-cell">{u.name}</div>
                          <div className="user-email-cell">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        {u.role !== 'admin' && (
                          <>
                            <button
                              className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-gold'}`}
                              onClick={() => handleToggleStatus(u._id)}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(u._id, u.name)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-page ${p === page ? 'active' : ''}`}
                    onClick={() => { setPage(p); fetchUsers(search, p); }}
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

export default AdminUsers;
