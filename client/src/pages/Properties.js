import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getProperties } from '../utils/api';
import PropertyCard from '../components/properties/PropertyCard';
import SearchFilter from '../components/properties/SearchFilter';
import './Properties.css';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  const [filters, setFilters] = useState({});

  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL query params as initial filters
  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(location.search));
    setFilters(params);
    fetchProperties(params, 1);
  }, []); // eslint-disable-line

  const fetchProperties = useCallback(async (filterParams, page = 1) => {
    setLoading(true);
    try {
      const { data } = await getProperties({ ...filterParams, page, limit: 9 });
      setProperties(data.properties);
      setPagination({ total: data.total, totalPages: data.totalPages, currentPage: data.currentPage });
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchProperties(newFilters, 1);
    // Update URL
    const params = new URLSearchParams(newFilters);
    navigate(`/properties?${params.toString()}`, { replace: true });
  };

  const handlePageChange = (page) => {
    fetchProperties(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Browse Properties</h1>
          <p className="page-subtitle">
            {pagination.total > 0
              ? `${pagination.total} properties found`
              : 'Find your perfect property'}
          </p>
        </div>

        <SearchFilter onFilter={handleFilter} initialFilters={filters} />

        {loading ? (
          <div className="spinner-container"><div className="spinner" /></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h3>No Properties Found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="properties-grid">
              {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  ← Previous
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagination.currentPage) <= 2)
                  .map((page) => (
                    <button
                      key={page}
                      className={`pagination-page ${page === pagination.currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  className="btn btn-outline btn-sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
