import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  IoSearch, IoPerson, IoArrowForward, IoStar, IoAdd,
  IoLaptop, IoShirt, IoHome, IoFootball, IoBook, 
  IoGameController, IoRestaurant, IoDiamond, IoFlash,
  IoSparkles, IoAirplane, IoStorefront
} from 'react-icons/io5';
import { Colors, Spacing, FontSizes, BorderRadius, Breakpoints } from '../constants/theme';
import { categories, vendors, products, heroSlides } from '../constants/data';
import './Home.css';

// Icon mapping helper
const getIcon = (iconName, size = 20) => {
  const icons = {
    diamond: IoDiamond,
    flash: IoFlash,
    sparkles: IoSparkles,
    airplane: IoAirplane,
    storefront: IoStorefront,
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

// Hero Carousel Component
const HeroCarousel = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef(null);

  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [slides.length]);

  const goToSlide = (index) => {
    setActiveIndex(index);
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  return (
    <div className="hero-carousel">
      <div className="hero-slides" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="hero-slide"
            style={{ backgroundColor: slide.bgColor }}
          >
            <img src={slide.image} alt={slide.title} className="hero-background-image" />
            <div className="hero-overlay" />
            <div className="hero-icon-badge" style={{ backgroundColor: slide.accentColor }}>
              {getIcon(slide.icon, 20)}
            </div>
            <div className="hero-content">
              <div className="hero-tag-badge" style={{ 
                backgroundColor: `${slide.accentColor}22`, 
                borderColor: slide.accentColor 
              }}>
                <span style={{ color: slide.accentColor }}>{slide.tag}</span>
              </div>
              <h1 className="hero-title">{slide.title}</h1>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <Link to="/browse" className="hero-cta" style={{ backgroundColor: slide.accentColor }}>
                <span style={{ color: slide.bgColor }}>{slide.ctaText}</span>
                <IoArrowForward size={14} style={{ color: slide.bgColor }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-pagination">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hero-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const vendor = vendors.find((v) => v.id === product.vendorId);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image-container">
        <img src={product.images[0]} alt={product.title} className="product-image" />
        {hasDiscount && (
          <div className="discount-badge">-{discountPercent}%</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-vendor">{vendor?.name}</p>
        <h3 className="product-title">{product.title}</h3>
        <div className="rating-row">
          <IoStar size={12} color={Colors.star} />
          <span className="rating-text">{product.rating}</span>
          <span className="review-count">({product.reviewCount})</span>
        </div>
        <div className="price-row">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <button className="add-to-cart-mini" onClick={(e) => {
          e.preventDefault();
          // Add to cart logic
        }}>
          <IoAdd size={18} />
        </button>
      </div>
    </Link>
  );
};

// Category Card Component
const CategoryCard = ({ category }) => (
  <Link to={`/category/${category.id}`} className="category-card">
    <div className="category-icon-bg">
      {getIcon(category.icon, 26)}
    </div>
    <span className="category-name">{category.name}</span>
  </Link>
);

// Vendor Card Component
const VendorCard = ({ vendor }) => (
  <Link to={`/vendor/${vendor.id}`} className="vendor-card">
    <img src={vendor.logo} alt={vendor.name} className="vendor-logo" />
    <h4 className="vendor-name">{vendor.name}</h4>
    <div className="vendor-rating-row">
      <IoStar size={11} color={Colors.star} />
      <span className="vendor-rating">{vendor.rating}</span>
    </div>
    <p className="vendor-sales">{vendor.totalSales.toLocaleString()} sales</p>
  </Link>
);

// Main Home Component
const Home = () => {
  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <p className="welcome-text">Welcome to</p>
          <h1 className="brand-name">
            <span style={{ color: Colors.primary }}>NATA</span>
            <span style={{ color: Colors.accent }}>KAHII</span>
          </h1>
        </div>
        <div className="header-right">
          <Link to="/browse" className="header-icon-btn">
            <IoSearch size={20} />
          </Link>
          <Link to="/login" className="header-login-btn">
            <IoPerson size={16} />
            <span>Login</span>
          </Link>
        </div>
      </header>

      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Categories Section */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Categories</h2>
          <Link to="/browse" className="see-all-btn">
            <span>See All</span>
            <IoArrowForward size={14} />
          </Link>
        </div>
        <div className="categories-container">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Featured</h2>
          <Link to="/browse" className="see-all-btn">
            <span>See All</span>
            <IoArrowForward size={14} />
          </Link>
        </div>
        <div className="products-container">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Top Vendors */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Top Vendors</h2>
        </div>
        <div className="vendors-container">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/browse" className="see-all-btn">
            <span>See All</span>
            <IoArrowForward size={14} />
          </Link>
        </div>
        <div className="products-container">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
