import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toggleSavedProperty } from '../../utils/api';
import { toast } from 'react-toastify';
import './PropertyCard.css';

const PropertyCard = ({ property, onSaveToggle, isSaved: initialSaved = false }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const mainImage = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80';

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { toast.info('Please login to save properties'); return; }
    setSaving(true);
    try {
      const { data } = await toggleSavedProperty(property._id);
      setSaved(data.saved);
      toast.success(data.message);
      if (onSaveToggle) onSaveToggle(property._id, data.saved);
    } catch {
      toast.error('Failed to save property');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  };

  return (
    <Link to={`/properties/${property._id}`} className="property-card card">
      <div className="property-card-image">
        <img src={mainImage} alt={property.title} loading="lazy" />
        <div className="property-card-badges">
          <span className={`badge badge-${property.priceType}`}>
            {property.priceType === 'sale' ? 'For Sale' : 'For Rent'}
          </span>
          {property.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
        </div>
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
          title={saved ? 'Remove from saved' : 'Save property'}
        >
          <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className="property-card-body">
        <div className="property-type-badge">{property.type}</div>
        <h3 className="property-title">{property.title}</h3>
        <div className="property-location">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {property.location?.city}, {property.location?.state}
        </div>

        <div className="property-features">
          {property.features?.bedrooms > 0 && (
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>{property.features.bedrooms} Bed</span>
          )}
          {property.features?.bathrooms > 0 && (
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12H19M5 12a7 7 0 0 0 14 0M5 12V6a3 3 0 0 1 6 0v6"/></svg>{property.features.bathrooms} Bath</span>
          )}
          {property.features?.area > 0 && (
            <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>{property.features.area} sqft</span>
          )}
        </div>

        <div className="property-card-footer">
          <div className="property-price">
            {formatPrice(property.price)}
            {property.priceType === 'rent' && <span className="price-suffix">/mo</span>}
          </div>
          <div className="property-owner">
            <div className="owner-avatar">{property.owner?.name?.charAt(0)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
