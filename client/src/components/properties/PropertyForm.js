import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './PropertyForm.css';

const AMENITIES_OPTIONS = ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 'Elevator', 'Power Backup', 'Club House', 'WiFi', 'Air Conditioning'];

const PropertyForm = ({ initialData = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    title: '', description: '', price: '', priceType: 'sale', type: 'house', status: 'available',
    address: '', city: '', state: '', country: 'India', zipCode: '',
    bedrooms: '', bathrooms: '', area: '', parking: 'false', furnished: 'false', yearBuilt: '',
    amenities: [],
    ...initialData
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialData.images || []);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmenityToggle = (amenity) => {
    const updated = form.amenities.includes(amenity)
      ? form.amenities.filter((a) => a !== amenity)
      : [...form.amenities, amenity];
    setForm({ ...form, amenities: updated });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) { toast.error('Maximum 10 images allowed'); return; }

    setNewImages([...newImages, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeExistingImage = (idx) => {
    setExistingImages(existingImages.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImages(newImages.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    // Append all text fields
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'amenities') {
        val.forEach((a) => formData.append('amenities', a));
      } else {
        formData.append(key, val);
      }
    });

    // Append new image files
    newImages.forEach((file) => formData.append('images', file));

    // Append existing image data (for update)
    existingImages.forEach((img) => formData.append('existingImages', JSON.stringify(img)));

    onSubmit(formData);
  };

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        <div className="form-grid-2">
          <div className="form-group form-col-2">
            <label className="form-label">Property Title *</label>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Luxurious 3BHK in Bandra" required />
          </div>
          <div className="form-group">
            <label className="form-label">Property Type *</label>
            <select className="form-control" name="type" value={form.type} onChange={handleChange}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="office">Office</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Listing Type *</label>
            <select className="form-control" name="priceType" value={form.priceType} onChange={handleChange}>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input className="form-control" type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 5000000" required />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-control" name="status" value={form.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="form-group form-col-2">
            <label className="form-label">Description *</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Describe the property in detail..." required />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="form-section">
        <h3 className="form-section-title">Location</h3>
        <div className="form-grid-2">
          <div className="form-group form-col-2">
            <label className="form-label">Street Address *</label>
            <input className="form-control" name="address" value={form.address} onChange={handleChange} placeholder="e.g. 123 Main Street" required />
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <input className="form-control" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Mumbai" required />
          </div>
          <div className="form-group">
            <label className="form-label">State *</label>
            <input className="form-control" name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" required />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input className="form-control" name="country" value={form.country} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">ZIP Code</label>
            <input className="form-control" name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="e.g. 400001" />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="form-section">
        <h3 className="form-section-title">Features</h3>
        <div className="form-grid-3">
          <div className="form-group">
            <label className="form-label">Bedrooms</label>
            <input className="form-control" type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} min="0" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Bathrooms</label>
            <input className="form-control" type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} min="0" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Area (sqft)</label>
            <input className="form-control" type="number" name="area" value={form.area} onChange={handleChange} placeholder="e.g. 1200" />
          </div>
          <div className="form-group">
            <label className="form-label">Year Built</label>
            <input className="form-control" type="number" name="yearBuilt" value={form.yearBuilt} onChange={handleChange} placeholder="e.g. 2020" />
          </div>
          <div className="form-group">
            <label className="form-label">Parking</label>
            <select className="form-control" name="parking" value={form.parking} onChange={handleChange}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Furnished</label>
            <select className="form-control" name="furnished" value={form.furnished} onChange={handleChange}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="form-section">
        <h3 className="form-section-title">Amenities</h3>
        <div className="amenities-grid">
          {AMENITIES_OPTIONS.map((a) => (
            <label key={a} className={`amenity-chip ${form.amenities.includes(a) ? 'selected' : ''}`}>
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => handleAmenityToggle(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="form-section">
        <h3 className="form-section-title">Images (Max 10)</h3>
        <div className="image-upload-area">
          <label className="image-upload-label">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="image-input" />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Click to upload images</span>
            <small>JPG, PNG, WEBP up to 10MB each</small>
          </label>
        </div>

        {(existingImages.length > 0 || previews.length > 0) && (
          <div className="image-previews">
            {existingImages.map((img, i) => (
              <div key={`existing-${i}`} className="image-preview-item">
                <img src={img.url} alt={`existing ${i}`} />
                <button type="button" className="remove-image" onClick={() => removeExistingImage(i)}>×</button>
                <span className="image-label">Saved</span>
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={`new-${i}`} className="image-preview-item">
                <img src={url} alt={`new ${i}`} />
                <button type="button" className="remove-image" onClick={() => removeNewImage(i)}>×</button>
                <span className="image-label new-label">New</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
          {loading ? 'Saving...' : 'Save Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
