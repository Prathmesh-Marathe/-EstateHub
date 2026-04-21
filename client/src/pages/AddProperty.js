import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../utils/api';
import { toast } from 'react-toastify';
import PropertyForm from '../components/properties/PropertyForm';

const AddProperty = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await createProperty(formData);
      toast.success('Property listed successfully!');
      navigate(`/properties/${data.property._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="page-header">
          <h1>List a New Property</h1>
          <p className="page-subtitle">Fill in the details below to publish your property listing</p>
        </div>
        <PropertyForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default AddProperty;
