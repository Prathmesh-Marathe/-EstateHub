import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFeaturedProperties } from '../utils/api';
import PropertyCard from '../components/properties/PropertyCard';
import './Home.css';

const STATS = [
  { label: 'Properties Listed', value: '5,000+' },
  { label: 'Happy Clients', value: '12,000+' },
  { label: 'Cities Covered', value: '50+' },
  { label: 'Years Experience', value: '10+' }
];

const PROPERTY_TYPES = [
  { type: 'house', label: 'House', icon: '🏠', desc: 'Independent homes & bungalows' },
  { type: 'apartment', label: 'Apartment', icon: '🏢', desc: 'Modern flats & apartments' },
  { type: 'villa', label: 'Villa', icon: '🏡', desc: 'Luxury villas & farmhouses' },
  { type: 'commercial', label: 'Commercial', icon: '🏪', desc: 'Shops, showrooms & more' },
  { type: 'land', label: 'Land', icon: '🌾', desc: 'Plots & agricultural land' },
  { type: 'office', label: 'Office', icon: '🏗️', desc: 'Office spaces & co-working' }
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getFeaturedProperties()
      .then(({ data }) => setFeatured(data.properties))
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    navigate(`/properties?search=${heroSearch}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-tag">India's Premier Real Estate Platform</div>
          <h1 className="hero-title">
            Find Your <span className="hero-highlight">Dream</span><br />
            Property Today
          </h1>
          <p className="hero-subtitle">
            Discover thousands of premium properties across India. From cozy apartments to luxury villas — your perfect home awaits.
          </p>
          <form className="hero-search" onSubmit={handleHeroSearch}>
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Search by city, locality or property type..."
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-gold btn-lg hero-search-btn">
              Search Properties
            </button>
          </form>
          <div className="hero-quick-links">
            <span>Popular:</span>
            {['Mumbai', 'Delhi', 'Bangalore', 'Pune'].map((c) => (
              <button key={c} onClick={() => navigate(`/properties?city=${c}`)} className="quick-link">{c}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types */}
      <section className="types-section">
        <div className="container">
          <div className="section-heading">
            <h2>Browse by Property Type</h2>
            <div className="divider" />
            <p>Explore properties categorized to match your needs</p>
          </div>
          <div className="types-grid">
            {PROPERTY_TYPES.map(({ type, label, icon, desc }) => (
              <Link key={type} to={`/properties?type=${type}`} className="type-card">
                <div className="type-icon">{icon}</div>
                <h4>{label}</h4>
                <p>{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="container">
            <div className="section-heading-row">
              <div className="section-heading">
                <h2>Featured Properties</h2>
                <div className="divider" />
                <p>Handpicked premium listings</p>
              </div>
              <Link to="/properties" className="btn btn-outline">View All →</Link>
            </div>
            <div className="properties-grid">
              {featured.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-text">
              <h2>Ready to List Your Property?</h2>
              <p>Join thousands of sellers who trust EstateHub to find the right buyers.</p>
            </div>
            <Link to="/properties/new" className="btn btn-gold btn-lg">List Property Free</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
