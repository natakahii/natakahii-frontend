import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  IoSearch, IoClose, IoStar, IoAdd,
  IoLaptop, IoShirt, IoHome, IoFootball, IoBook, 
  IoGameController, IoRestaurant, IoSparkles
} from 'react-icons/io5';
import { Colors } from '../constants/theme';
import { categories, vendors, products } from '../constants/data';
import './Browse.css';

// Icon mapping helper
const getIcon = (iconName, size = 14) => {
  const icons = {
    sparkles: IoSparkles,
    laptop: IoLaptop,
    shirt: IoShirt,
    home: IoHome,
    football: IoFootball,
    book: IoBook,
    'game-controller': IoGameController,
    restaurant: IoRestaurant,
  };
  const IconComponent = icons[iconName] || IoSparkles;
  return <IconComponent size={size} />;
};

const GridProductCard = ({ product }) => {
  const vendor = vendors.find((v) => v.id === product.vendorId);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="grid-card">
      <div className="grid-image-container">
        <img src={product.images[0]} alt={product.title} className="grid-image" />
        {hasDiscount && (
          <div className="discount-badge">-{discountPercent}%</div>
        )}
        <button className="quick-add" onClick={(e) => {
          e.preventDefault();
          // Add to cart logic
        }}>
          <IoAdd size={18} />
        </button>
      </div>
      <div className="grid-info">
        <p className="grid-vendor">{vendor?.name}</p>
        <h3 className="grid-title">{product.title}</h3>
        <div className="grid-rating">
          <IoStar size={12} color={Colors.star} />
          <span className="rating-val">{product.rating}</span>
          <span className="review-count">({product.reviewCount})</span>
        </div>
        <div className="grid-price-row">
          <span className="grid-price">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="grid-original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('default');

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const sortOptions = [
    { key: 'default', label: 'All' },
    { key: 'price_low', label: 'Price: Low' },
    { key: 'price_high', label: 'Price: High' },
    { key: 'rating', label: 'Top Rated' },
  ];

  const allCategories = [{ id: null, name: 'All', icon: 'sparkles' }, ...categories];

  return (
    <div className="browse-container">
      {/* Header */}
      <div className="browse-header">
        <h1 className="browse-title">Browse</h1>
        <div className="search-container">
          <IoSearch size={16} className="search-icon-left" />
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button className="clear-button" onClick={() => setSearchQuery('')}>
              <IoClose size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-container">
        <div className="category-pills">
          {allCategories.map((category) => {
            const isActive = category.id === selectedCategory;
            return (
              <button
                key={category.id || 'all'}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {getIcon(category.icon, 14)}
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Options */}
      <div className="sort-container">
        {sortOptions.map((option) => (
          <button
            key={option.key}
            className={`sort-pill ${sortBy === option.key ? 'active' : ''}`}
            onClick={() => setSortBy(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="results-header">
        <p className="results-count">{filteredProducts.length} products</p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid-container">
          {filteredProducts.map((product) => (
            <GridProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <IoSearch size={48} className="empty-icon" />
          <h2 className="empty-title">No products found</h2>
          <p className="empty-subtitle">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Browse;
