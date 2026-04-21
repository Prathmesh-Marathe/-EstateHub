import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">⬡</span>
            <span>EstateHub</span>
          </div>
          <p>Your trusted partner in finding the perfect property. Premium listings, seamless experience.</p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/properties">Properties</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Property Types</h4>
          <ul>
            <li><Link to="/properties?type=house">Houses</Link></li>
            <li><Link to="/properties?type=apartment">Apartments</Link></li>
            <li><Link to="/properties?type=villa">Villas</Link></li>
            <li><Link to="/properties?type=commercial">Commercial</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>📧 info@estatehub.com</li>
            <li>📞 +91 98765 43210</li>
            <li>📍 Mumbai, India</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} EstateHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
