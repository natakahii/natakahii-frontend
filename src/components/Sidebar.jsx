import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  IoHome,
  IoSearch,
  IoCart,
  IoPerson,
  IoStorefront,
  IoLogOut,
  IoMenu,
  IoClose,
  IoChevronDown,
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isVendor, user, logout } = useAuth();

  // Navigation items
  const baseNavItems = [
    { path: '/', label: 'Home', icon: IoHome },
    { path: '/browse', label: 'Browse', icon: IoSearch },
    { path: '/cart', label: 'My Cart', icon: IoCart },
  ];

  const navItems = isVendor()
    ? [
        ...baseNavItems,
        { path: '/vendor/dashboard', label: 'Dashboard', icon: IoStorefront },
      ]
    : baseNavItems;

  // Don't show sidebar on auth pages
  const hideOnPaths = ['/login', '/register', '/verify-registration', '/forgot-password', '/reset-password'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <IoStorefront size={28} color={Colors.primary} />
            <span className={`sidebar-brand ${!isOpen ? 'hidden' : ''}`}>Natakahii</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon
                  size={20}
                  color={isActive ? Colors.primary : Colors.textLight}
                />
                <span className={`sidebar-nav-label ${!isOpen ? 'hidden' : ''}`}>
                  {item.label}
                </span>
                {isActive && <div className="active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="sidebar-divider" />

        {/* User Section */}
        <div className="sidebar-user">
          <div className={`user-profile ${!isOpen ? 'collapsed' : ''}`}>
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={`user-info ${!isOpen ? 'hidden' : ''}`}>
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-email">{user?.email || 'user@natakahii.com'}</p>
            </div>
          </div>

          {/* Profile & Logout Buttons */}
          <Link
            to="/profile"
            className="sidebar-profile-link"
            onClick={() => setIsOpen(false)}
          >
            <IoPerson size={18} />
            <span className={!isOpen ? 'hidden' : ''}>Profile</span>
          </Link>

          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <IoLogOut size={18} />
            <span className={!isOpen ? 'hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;
