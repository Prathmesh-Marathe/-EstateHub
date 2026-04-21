import React, { useState } from 'react';
import './SearchFilter.css';

const SearchFilter = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '', type: '', priceType: '',
    minPrice: '', maxPrice: '', city: '', bedrooms: '',
    ...initialFilters
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty values
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    onFilter(clean);
  };

  const handleReset = () => {
    const empty = { search: '', type: '', priceType: '', minPrice: '', maxPrice: '', city: '', bedrooms: '' };
    setFilters(empty);
    onFilter({});
  };

  return (
    <form className="search-filter" onSubmit={handleSubmit}>
      <div className="filter-row">
        <div className="filter-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search by title, city..."
            className="filter-input"
          />
        </div>

        <select name="type" value={filters.type} onChange={handleChange} className="filter-select">
          <option value="">All Types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="commercial">Commercial</option>
          <option value="land">Land</option>
          <option value="office">Office</option>
        </select>

        <select name="priceType" value={filters.priceType} onChange={handleChange} className="filter-select">
          <option value="">Buy or Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>

        <input
          type="text"
          name="city"
          value={filters.city}
          onChange={handleChange}
          placeholder="City"
          className="filter-input filter-input-sm"
        />

        <input
          type="number"
          name="minPrice"
          value={filters.minPrice}
          onChange={handleChange}
          placeholder="Min Price"
          className="filter-input filter-input-sm"
        />

        <input
          type="number"
          name="maxPrice"
          value={filters.maxPrice}
          onChange={handleChange}
          placeholder="Max Price"
          className="filter-input filter-input-sm"
        />

        <select name="bedrooms" value={filters.bedrooms} onChange={handleChange} className="filter-select filter-select-sm">
          <option value="">Bedrooms</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
          <button type="button" className="btn btn-outline" onClick={handleReset}>Reset</button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilter;
