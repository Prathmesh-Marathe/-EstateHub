import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProperty, toggleSavedProperty, deleteProperty, getOrCreateConversation } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ChatWindow from '../components/chat/ChatWindow';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await getProperty(id);
        setProperty(data.property);
      } catch {
        toast.error('Property not found');
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]); // eslint-disable-line

  const handleSave = async () => {
    if (!user) { toast.info('Please login to save properties'); return; }
    try {
      const { data } = await toggleSavedProperty(id);
      setSaved(data.saved);
      toast.success(data.message);
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(id);
      toast.success('Property deleted');
      navigate('/dashboard');
    } catch { toast.error('Failed to delete property'); }
  };

  const handleOpenChat = async () => {
    if (!user) { toast.info('Please login to message the seller'); return; }
    setChatLoading(true);
    try {
      // Ensure the conversation exists before showing chat
      await getOrCreateConversation(id);
      setShowChat(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot start chat');
    } finally {
      setChatLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString()}`;
  };

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  if (!property) return null;

  const isOwner = user && (user._id === property.owner?._id || user.role === 'admin');
  const images = property.images?.length > 0
    ? property.images
    : [{ url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80' }];

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> / <Link to="/properties">Properties</Link> /{' '}
          <span>{property.title}</span>
        </div>

        <div className="detail-layout">
          {/* ── Left Column ──────────────────────────── */}
          <div className="detail-main">
            {/* Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <img src={images[activeImg]?.url} alt={property.title} />
                {property.isFeatured && (
                  <span className="badge badge-featured gallery-featured-badge">⭐ Featured</span>
                )}
              </div>
              {images.length > 1 && (
                <div className="gallery-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`gallery-thumb ${i === activeImg ? 'active' : ''}`}
                      onClick={() => setActiveImg(i)}
                    >
                      <img src={img.url} alt={`thumb ${i}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info Card */}
            <div className="detail-card">
              <div className="detail-header">
                <div>
                  <div className="detail-type-badge">{property.type}</div>
                  <h1 className="detail-title">{property.title}</h1>
                  <div className="detail-location">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {property.location?.address}, {property.location?.city},{' '}
                    {property.location?.state}
                  </div>
                </div>
                <div className="detail-header-actions">
                  {isOwner ? (
                    <>
                      <Link to={`/properties/${id}/edit`} className="btn btn-outline btn-sm">
                        ✏️ Edit
                      </Link>
                      <button onClick={handleDelete} className="btn btn-danger btn-sm">
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSave}
                      className={`btn btn-sm ${saved ? 'btn-gold' : 'btn-outline'}`}
                    >
                      {saved ? '❤️ Saved' : '🤍 Save'}
                    </button>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="detail-price-row">
                <div className="detail-price">
                  {formatPrice(property.price)}
                  {property.priceType === 'rent' && (
                    <span className="price-suffix">/month</span>
                  )}
                </div>
                <div className="detail-badges">
                  <span className={`badge badge-${property.priceType}`}>
                    {property.priceType === 'sale' ? 'For Sale' : 'For Rent'}
                  </span>
                  <span className={`badge badge-${property.status}`}>{property.status}</span>
                </div>
              </div>

              {/* Features */}
              <div className="features-grid">
                {property.features?.bedrooms > 0 && (
                  <div className="feature-item">
                    <span className="feature-icon">🛏️</span>
                    <span className="feature-value">{property.features.bedrooms}</span>
                    <span className="feature-label">Bedrooms</span>
                  </div>
                )}
                {property.features?.bathrooms > 0 && (
                  <div className="feature-item">
                    <span className="feature-icon">🚿</span>
                    <span className="feature-value">{property.features.bathrooms}</span>
                    <span className="feature-label">Bathrooms</span>
                  </div>
                )}
                {property.features?.area > 0 && (
                  <div className="feature-item">
                    <span className="feature-icon">📐</span>
                    <span className="feature-value">{property.features.area}</span>
                    <span className="feature-label">Sq. Ft.</span>
                  </div>
                )}
                {property.features?.yearBuilt && (
                  <div className="feature-item">
                    <span className="feature-icon">🗓️</span>
                    <span className="feature-value">{property.features.yearBuilt}</span>
                    <span className="feature-label">Year Built</span>
                  </div>
                )}
                <div className="feature-item">
                  <span className="feature-icon">{property.features?.parking ? '✅' : '❌'}</span>
                  <span className="feature-value">{property.features?.parking ? 'Yes' : 'No'}</span>
                  <span className="feature-label">Parking</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">{property.features?.furnished ? '✅' : '❌'}</span>
                  <span className="feature-value">{property.features?.furnished ? 'Yes' : 'No'}</span>
                  <span className="feature-label">Furnished</span>
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h3>Description</h3>
                <p className="detail-description">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities?.length > 0 && (
                <div className="detail-section">
                  <h3>Amenities</h3>
                  <div className="amenities-list">
                    {property.amenities.map((a) => (
                      <span key={a} className="amenity-tag">✓ {a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Inline Chat Panel ──────────────────── */}
            {showChat && !isOwner && (
              <div className="inline-chat-panel">
                <div className="inline-chat-header">
                  <h3>💬 Chat with Seller</h3>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowChat(false)}
                  >
                    Close
                  </button>
                </div>
                <ChatWindow initialPropertyId={id} />
              </div>
            )}
          </div>

          {/* ── Right Sidebar ────────────────────────── */}
          <div className="detail-sidebar">
            {/* Owner Card */}
            <div className="sidebar-card owner-card">
              <h3>Listed By</h3>
              <div className="owner-info">
                <div className="owner-avatar-lg">
                  {property.owner?.name?.charAt(0)}
                </div>
                <div>
                  <div className="owner-name">{property.owner?.name}</div>
                  <div className="owner-since">
                    Member since {new Date(property.owner?.createdAt).getFullYear()}
                  </div>
                </div>
              </div>
              {property.owner?.phone && (
                <a
                  href={`tel:${property.owner.phone}`}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
                >
                  📞 {property.owner.phone}
                </a>
              )}

              {/* Message seller button — only for non-owners */}
              {!isOwner && (
                <button
                  className="btn btn-gold"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                  onClick={handleOpenChat}
                  disabled={chatLoading}
                >
                  {chatLoading ? 'Opening...' : showChat ? '💬 Chat Open ↓' : '💬 Message Seller'}
                </button>
              )}
            </div>

            {/* Property Details */}
            <div className="sidebar-card">
              <h3>Property Details</h3>
              <div className="detail-meta-list">
                <div className="detail-meta-item">
                  <span>Property ID</span>
                  <span>#{property._id?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="detail-meta-item">
                  <span>Type</span><span>{property.type}</span>
                </div>
                <div className="detail-meta-item">
                  <span>Status</span>
                  <span className="text-capitalize">{property.status}</span>
                </div>
                <div className="detail-meta-item">
                  <span>Views</span><span>{property.views}</span>
                </div>
                <div className="detail-meta-item">
                  <span>Listed</span>
                  <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
