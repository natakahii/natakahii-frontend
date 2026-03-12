import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  IoPerson, IoMail, IoCall, IoCheckmarkCircle,
  IoStorefront, IoCube, IoRefresh, IoHeart,
  IoLocation, IoCard, IoNotifications, IoLockClosed,
  IoChatbubble, IoStar, IoLogOut, IoLogIn, IoChevronForward,
  IoAlert, IoCheckmark
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import VendorApplicationForm from '../components/VendorApplicationForm';
import { userApi } from '../api/userApi';
import './Profile.css';

const MenuRow = ({ icon: Icon, label, onClick, to }) => {
  const content = (
    <>
      <div className="menu-icon">
        <Icon size={20} color={Colors.primary} />
      </div>
      <span className="menu-label">{label}</span>
      <IoChevronForward size={18} color={Colors.textLight} />
    </>
  );

  if (to) {
    return (
      <Link to={to} className="menu-row">
        {content}
      </Link>
    );
  }

  return (
    <button className="menu-row" onClick={onClick}>
      {content}
    </button>
  );
};

const Profile = () => {
  const { isAuthenticated, user, logout, isVendor } = useAuth();
  const navigate = useNavigate();
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [vendorApplication, setVendorApplication] = useState(null);
  const [loadingVendorStatus, setLoadingVendorStatus] = useState(false);

  // Fetch vendor application status
  useEffect(() => {
    if (!isAuthenticated || isVendor()) return;

    const fetchVendorStatus = async () => {
      setLoadingVendorStatus(true);
      try {
        const response = await userApi.vendorApplicationStatus();
        setVendorApplication(response.application || null);
      } catch (error) {
        console.error('Failed to fetch vendor application status:', error);
      } finally {
        setLoadingVendorStatus(false);
      }
    };

    fetchVendorStatus();
  }, [isAuthenticated, isVendor]);

  const handleLogout = () => {
    logout();
  };

  const handleBecomeVendor = () => {
    // If application is already approved, navigate to dashboard
    if (vendorApplication?.status === 'approved') {
      navigate('/vendor/dashboard');
    } else {
      // Otherwise open the application form
      setShowVendorForm(true);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">Account</h1>
      </div>

      {/* Profile Card - Auth Aware */}
      {isAuthenticated ? (
        <div className="profile-card">
          <div className="avatar-container">
            <div className="avatar-fallback">
              <span className="avatar-initial">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="online-indicator" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <div className="role-badge">
              <IoCheckmarkCircle size={12} color={Colors.success} />
              <span className="role-badge-text">
                {isVendor() ? 'Verified Vendor' : 'Verified Customer'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Link to="/login" className="login-card">
          <div className="login-card-icon">
            <IoPerson size={28} color={Colors.white} />
          </div>
          <div className="login-card-content">
            <h3 className="login-card-title">Sign in to your account</h3>
            <p className="login-card-subtitle">
              Access orders, wishlist, and exclusive deals
            </p>
          </div>
          <IoChevronForward size={20} color={Colors.accent} />
        </Link>
      )}

      {/* Show Vendor Dashboard for Vendors */}
      {isAuthenticated && isVendor() && (
        <Link to="/vendor/dashboard" className="vendor-dashboard-banner">
          <div className="vendor-banner-content">
            <div className="vendor-banner-icon">
              <IoStorefront size={28} color={Colors.white} />
            </div>
            <div className="vendor-banner-text">
              <h3 className="vendor-banner-title">Vendor Dashboard</h3>
              <p className="vendor-banner-subtitle">View sales, orders & analytics</p>
            </div>
          </div>
          <IoChevronForward size={20} color={Colors.accent} />
        </Link>
      )}

      {/* Vendor Application Status Banner */}
      {isAuthenticated && !isVendor() && (
        <>
          {vendorApplication && vendorApplication.status !== 'approved' ? (
            <div className="switch-banner" style={{ 
              backgroundColor: vendorApplication.status === 'pending' ? '#fff8e1' : '#fee'
            }}>
              <div className="switch-banner-content">
                <div className="switch-banner-icon" style={{
                  backgroundColor: vendorApplication.status === 'pending' ? Colors.accent : Colors.error
                }}>
                  {vendorApplication.status === 'pending' && <IoAlert size={24} color="white" />}
                  {vendorApplication.status === 'rejected' && <IoAlert size={24} color="white" />}
                </div>
                <div className="switch-banner-text">
                  <h3 className="switch-banner-title" style={{ color: '#333' }}>
                    {vendorApplication.status === 'pending' && 'Application Pending'}
                    {vendorApplication.status === 'rejected' && 'Application Rejected'}
                  </h3>
                  <p className="switch-banner-subtitle" style={{ color: '#666' }}>
                    {vendorApplication.status === 'pending' && 'Your vendor application is under review. We\'ll notify you soon.'}
                    {vendorApplication.status === 'rejected' && vendorApplication.rejection_reason || 'Your application was not approved.'}
                  </p>
                </div>
              </div>
              <IoChevronForward size={20} style={{ color: '#999' }} />
            </div>
          ) : (
            <button 
              type="button"
              className="switch-banner" 
              onClick={handleBecomeVendor}
            >
              <div className="switch-banner-content">
                <div className="switch-banner-icon">
                  <IoStorefront size={28} color={Colors.white} />
                </div>
                <div className="switch-banner-text">
                  <h3 className="switch-banner-title">
                    {vendorApplication?.status === 'approved' ? 'Switch to Vendor Mode' : 'Ready to Start Selling?'}
                  </h3>
                  <p className="switch-banner-subtitle">
                    {vendorApplication?.status === 'approved' ? 'Manage your store and products' : 'Access your vendor dashboard and control your store'}
                  </p>
                </div>
              </div>
              <IoChevronForward size={20} color={Colors.accent} />
            </button>
          )}
        </>
      )}

      {/* Menu Sections */}
      <div className="menu-section">
        <h3 className="menu-section-title">Orders</h3>
        <div className="menu-card">
          <MenuRow icon={IoCube} label="My Orders" to="/orders" />
          <MenuRow icon={IoRefresh} label="Returns & Refunds" to="/returns" />
          <MenuRow icon={IoHeart} label="Wishlist" to="/wishlist" />
        </div>
      </div>

      <div className="menu-section">
        <h3 className="menu-section-title">Settings</h3>
        <div className="menu-card">
          <MenuRow icon={IoLocation} label="Delivery Addresses" to="/addresses" />
          <MenuRow icon={IoCard} label="Payment Methods" to="/payment-methods" />
          <MenuRow icon={IoNotifications} label="Notifications" to="/notifications" />
          <MenuRow icon={IoLockClosed} label="Privacy & Security" to="/security" />
        </div>
      </div>

      <div className="menu-section">
        <h3 className="menu-section-title">Support</h3>
        <div className="menu-card">
          <MenuRow icon={IoChatbubble} label="Help Center" to="/help" />
          <MenuRow icon={IoCall} label="Contact Us" to="/contact" />
          <MenuRow icon={IoStar} label="Rate the App" onClick={() => alert('Thank you!')} />
        </div>
      </div>

      {/* Logout / Login Button */}
      {isAuthenticated ? (
        <button className="logout-button" onClick={handleLogout}>
          <IoLogOut size={20} color={Colors.error} />
          <span>Log Out</span>
        </button>
      ) : (
        <Link to="/login" className="signin-button">
          <IoLogIn size={20} color={Colors.white} />
          <span>Sign In / Create Account</span>
        </Link>
      )}

      {/* Version Info */}
      <div className="version-container">
        <h1 className="brand-name-footer">
          <span style={{ color: Colors.primary, opacity: 0.3 }}>NATAKA</span>
          <span style={{ color: Colors.accent, opacity: 0.3 }}>HII</span>
        </h1>
        <p className="version-text">Version 1.0.0</p>
      </div>

      {/* Vendor Application Form Modal */}
      {showVendorForm && (
        <VendorApplicationForm
          onClose={() => setShowVendorForm(false)}
          onSuccess={async () => {
            // Refresh vendor application status
            try {
              const response = await userApi.vendorApplicationStatus();
              setVendorApplication(response.application || null);
            } catch (error) {
              console.error('Failed to refresh vendor status:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default Profile;
