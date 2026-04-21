import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import PropertyForm from '../components/properties/PropertyForm';

const EditProperty = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await getProperty(id);
        const p = data.property;

        // Check ownership
        if (p.owner._id !== user._id && user.role !== 'admin') {
          toast.error('Not authorized');
          navigate('/dashboard');
          return;
        }

        // Build initialData compatible with PropertyForm
        setProperty({
          title: p.title,
          description: p.description,
          price: p.price,
          priceType: p.priceType,
          type: p.type,
          status: p.status,
          address: p.location?.address || '',
          city: p.location?.city || '',
          state: p.location?.state || '',
          country: p.location?.country || 'India',
          zipCode: p.location?.zipCode || '',
          bedrooms: p.features?.bedrooms || '',
          bathrooms: p.features?.bathrooms || '',
          area: p.features?.area || '',
          parking: p.features?.parking ? 'true' : 'false',
          furnished: p.features?.furnished ? 'true' : 'false',
          yearBuilt: p.features?.yearBuilt || '',
          amenities: p.amenities || [],
          images: p.images || []
        });
      } catch {
        toast.error('Failed to load property');
        navigate('/dashboard');
      } finally {
        setFetching(false);
      }
    };
    fetchProperty();
  }, [id]); // eslint-disable-line

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await updateProperty(id, formData);
      toast.success('Property updated successfully!');
      navigate(`/properties/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 860 }}>
        <div className="page-header">
          <h1>Edit Property</h1>
          <p className="page-subtitle">Update your property details below</p>
        </div>
        {property && <PropertyForm initialData={property} onSubmit={handleSubmit} loading={loading} />}
      </div>
    </div>
  );
};

export default EditProperty;
