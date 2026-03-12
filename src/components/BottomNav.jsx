import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoSearch, IoCart, IoPerson, IoStorefront } from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/theme';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { isVendor } = useAuth();

  const baseNavItems = [
    { path: '/', icon: IoHome, label: 'Home' },
    { path: '/browse', icon: IoSearch, label: 'Browse' },
    { path: '/cart', icon: IoCart, label: 'Cart' },
  ];

  // Add either Account or Dashboard based on vendor status
  const finalNavItems = [
    ...baseNavItems,
    isVendor()
      ? { path: '/vendor/dashboard', icon: IoStorefront, label: 'Dashboard' }
      : { path: '/profile', icon: IoPerson, label: 'Account' }
  ];

  // Don't show bottom nav on auth pages
  const hideOnPaths = ['/login', '/register', '/verify-registration', '/forgot-password', '/reset-password'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {finalNavItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon 
              size={24} 
              color={isActive ? Colors.primary : Colors.textLight}
            />
            <span className={`bottom-nav-label ${isActive ? 'active' : ''}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
