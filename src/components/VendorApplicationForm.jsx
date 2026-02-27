import React, { useState } from 'react';
import { IoClose, IoStorefront } from 'react-icons/io5';
import { TANZANIA_REGIONS } from '../constants/tanzaniaRegions';
import { Colors } from '../constants/theme';
import { userApi } from '../api/userApi';
import './VendorApplicationForm.css';

const VendorApplicationForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    full_name: '',
    phone: '',
    address: '',
    ward: '',
    street: '',
    region: '',
    city: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!formData.business_name.trim()) {
      setError('Business name is required.');
      setLoading(false);
      return;
    }
    if (!formData.business_email.trim()) {
      setError('Business email is required.');
      setLoading(false);
      return;
    }
    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      setLoading(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      setLoading(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required.');
      setLoading(false);
      return;
    }
    if (!formData.ward.trim()) {
      setError('Ward is required.');
      setLoading(false);
      return;
    }
    if (!formData.street.trim()) {
      setError('Street is required.');
      setLoading(false);
      return;
    }
    if (!formData.region.trim()) {
      setError('Region is required.');
      setLoading(false);
      return;
    }

    try {
      await userApi.submitVendorApplication(formData);
      setSuccess(true);
      onSuccess && onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to submit application.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-app-overlay">
      <div className="vendor-app-modal">
        <div className="vendor-app-header">
          <div className="vendor-app-title-container">
            <IoStorefront size={24} color={Colors.primary} />
            <h2>Become a Vendor</h2>
          </div>
          <button
            className="vendor-app-close"
            onClick={onClose}
            type="button"
          >
            <IoClose size={24} />
          </button>
        </div>

        {success ? (
          <div className="vendor-app-success">
            <div className="success-icon">✓</div>
            <h3>Application Submitted!</h3>
            <p>
              Thank you for applying. We'll review your application and notify you
              within 2-3 business days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="vendor-app-form">
            <div className="form-section">
              <h3>Business Information</h3>
              
              <div className="form-group">
                <label>Business Name *</label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Your shop name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Business Email *</label>
                <input
                  type="email"
                  name="business_email"
                  value={formData.business_email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What does your business offer?"
                  rows={3}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Your Information</h3>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+255 7XX XXX XXX"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Business Location</h3>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Physical address"
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                <div className="form-group form-col-2">
                  <label>Ward *</label>
                  <input
                    type="text"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="Ward"
                    disabled={loading}
                  />
                </div>

                <div className="form-group form-col-2">
                  <label>Street *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-col-2">
                  <label>Region (City) *</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select a region</option>
                    {TANZANIA_REGIONS.map((region) => (
                      <option key={region.code} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group form-col-2">
                  <label>City (Optional)</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="form-error">
                <p>{error}</p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VendorApplicationForm;
