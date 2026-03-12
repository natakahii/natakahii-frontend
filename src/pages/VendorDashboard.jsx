import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoCube, IoCart, IoPeople, IoAdd, IoAnalytics,
  IoCash, IoStar, IoRefresh, IoStorefront
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import { Colors } from '../constants/theme';
import './VendorDashboard.css';

const StatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
};

const ActionCard = ({ icon: Icon, label, onClick }) => {
  const bgColor = label === 'Add Product' 
    ? Colors.accent 
    : label === 'Manage Products' 
    ? Colors.primary 
    : Colors.success;
  
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-icon" style={{ backgroundColor: `${bgColor}15` }}>
        <Icon size={24} color={bgColor} />
      </div>
      <p className="action-label">{label}</p>
    </button>
  );
};

const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return Colors.accent;
      case 'processing': return Colors.primary;
      case 'completed': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.textLight;
    }
  };

  return (
    <div className="order-card">
      <div className="order-left">
        <p className="order-id">{order.id}</p>
        <p className="order-product">{order.customer}</p>
        <p className="order-date">{order.date}</p>
      </div>
      <div className="order-right">
        <p className="order-amount">TZS {order.amount.toLocaleString()}</p>
        <span 
          className="status-badge"
          style={{ 
            color: getStatusColor(order.status),
            backgroundColor: `${getStatusColor(order.status)}15`
          }}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>
    </div>
  );
};

const InventoryItem = ({ count, label, color }) => {
  return (
    <div className="inventory-item">
      <p className="inventory-number" style={{ color }}>
        {count}
      </p>
      <p className="inventory-label">{label}</p>
    </div>
  );
};

const VendorDashboard = () => {
  const { isAuthenticated, isVendor, user } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if user has vendor access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const checkVendorAccess = async () => {
      try {
        if (isVendor()) {
          setHasAccess(true);
          setIsCheckingAccess(false);
          return;
        }

        const response = await userApi.vendorApplicationStatus();
        const application = response.application;
        
        if (application?.status === 'approved') {
          setHasAccess(true);
        } else {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking vendor access:', error);
        navigate('/profile');
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkVendorAccess();
  }, [isAuthenticated, isVendor, navigate]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // Mock data
  const analyticsData = {
    products: 24,
    revenue: '125.7k',
    rating: 4.8,
    totalSales: 1250,
    inStock: 22,
    outOfStock: 2,
    featured: 5,
  };

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 45000, status: 'completed', date: 'Today' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 32500, status: 'processing', date: 'Yesterday' },
    { id: 'ORD-003', customer: 'Alex Johnson', amount: 78900, status: 'pending', date: '2 days ago' },
  ];

  if (isCheckingAccess) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-content">
        {/* Header with Greeting */}
        <div className="dashboard-header">
          <div className="greeting-section">
            <p className="greeting-time">Good morning,</p>
            <h1 className="greeting-name">{user?.name?.split(' ')[0] || 'Vendor'}</h1>
          </div>
          <button 
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <IoRefresh 
              size={20} 
              style={{
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} 
            />
          </button>
        </div>

        {/* Vendor Mode Banner */}
        <div className="vendor-banner">
          <IoStorefront size={18} />
          <span>Vendor Dashboard</span>
        </div>

        {/* Stats Grid - Single Column */}
        <div className="stats-grid">
          <StatCard
            icon={IoCube}
            label="Products"
            value={analyticsData.products}
            color={Colors.primary}
          />
          <StatCard
            icon={IoCash}
            label="Revenue"
            value={`TZS ${analyticsData.revenue}`}
            color={Colors.success}
          />
          <StatCard
            icon={IoStar}
            label="Rating"
            value={analyticsData.rating}
            color="#FBBF24"
          />
          <StatCard
            icon={IoCart}
            label="Total Sales"
            value={analyticsData.totalSales}
            color={Colors.accent}
          />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <ActionCard 
              icon={IoAdd}
              label="Add Product"
              onClick={() => navigate('/vendor/products/new')}
            />
            <ActionCard 
              icon={IoCube}
              label="Manage Products"
              onClick={() => navigate('/vendor/products')}
            />
            <ActionCard 
              icon={IoAnalytics}
              label="Analytics"
              onClick={() => navigate('/vendor/analytics')}
            />
          </div>
        </div>

        {/* Inventory Status */}
        <div className="inventory-section">
          <h2 className="section-title">Inventory Status</h2>
          <div className="inventory-card">
            <InventoryItem
              count={analyticsData.inStock}
              label="In Stock"
              color={Colors.success}
            />
            <div className="inventory-divider" />
            <InventoryItem
              count={analyticsData.outOfStock}
              label="Out of Stock"
              color={Colors.error}
            />
            <div className="inventory-divider" />
            <InventoryItem
              count={analyticsData.featured}
              label="Featured"
              color={Colors.accent}
            />
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <h2 className="section-title">Recent Orders</h2>
          <div className="orders-list">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Bottom Spacer */}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
};

export default VendorDashboard;
