import React, { useState, useEffect } from 'react';
import { getSavedProperties } from '../utils/api';
import { toast } from 'react-toastify';
import PropertyCard from '../components/properties/PropertyCard';

const SavedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedProperties()
      .then(({ data }) => setProperties(data.properties))
      .catch(() => toast.error('Failed to load saved properties'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (propertyId, isSaved) => {
    if (!isSaved) setProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="page-header">
          <h1>Saved Properties</h1>
          <p className="page-subtitle">{properties.length} saved {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>

        {properties.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <h3>No saved properties yet</h3>
            <p>Browse properties and click the heart icon to save them here</p>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} isSaved={true} onSaveToggle={handleSaveToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;
