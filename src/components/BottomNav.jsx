import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoHome, IoSearch, IoCart, IoPerson } from 'react-icons/io5';
import { Colors } from '../constants/theme';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: IoHome, label: 'Home' },
    { path: '/browse', icon: IoSearch, label: 'Browse' },
    { path: '/cart', icon: IoCart, label: 'Cart' },
    { path: '/profile', icon: IoPerson, label: 'Account' },
  ];

  // Don't show bottom nav on auth pages
  const hideOnPaths = ['/login', '/register', '/verify-registration', '/forgot-password', '/reset-password'];
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
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
