import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  IoSearch, IoPerson, IoArrowForward, IoStar, IoAdd,
  IoLaptop, IoShirt, IoHome, IoFootball, IoBook, 
  IoGameController, IoRestaurant, IoDiamond, IoFlash,
  IoSparkles, IoAirplane, IoStorefront, IoCart, IoBag,
  IoCut, IoFastFood, IoHeadset, IoBriefcase,
  IoFlower, IoTv, IoWatch, IoCamera, IoBicycle, IoCall,
  IoHeart, IoBuild, IoPaw, IoBarbell, IoLeaf,
  IoMusicalNote, IoBed, IoTrendingUp, IoGrid, IoApps
} from 'react-icons/io5';
import { useAuth } from '../contexts/AuthContext';
import { fetchCategories } from '../api/catalogApi';
import { Colors, Spacing, FontSizes, BorderRadius, Breakpoints } from '../constants/theme';
import { vendors, products, heroSlides } from '../constants/data';
import './Home.css';

// Comprehensive icon mapping for react-icons/io5
const iconMap = {
  IoHome, IoCart, IoBag, IoSearch, IoCut, IoFastFood,
  IoBook, IoHeadset,IoFootball, IoBriefcase,
  IoFlower, IoGameController, IoTv, IoShirt, IoWatch,
  IoCamera, IoBicycle, IoLaptop, IoCall, IoHeart,
  IoBuild, IoPaw, IoBarbell, IoLeaf, IoMusicalNote,
  IoBed, IoFlash, IoTrendingUp, IoStar, IoDiamond,
  IoSparkles, IoAirplane, IoStorefront, IoRestaurant,
  IoGrid, IoApps
};

// Icon mapping helper - now supports full icon names from database
const getIcon = (iconName, size = 20) => {
  // Try to get the icon from the io5 icons using the full name (e.g., "IoHome")
  if (iconName && iconMap[iconName]) {
    const IconComponent = iconMap[iconName];
    return <IconComponent size={size} />;
  }
  
  // Fallback for any other icons
  return <IoSparkles size={size} />;
};

// Hero Carousel Component
const HeroCarousel = ({ slides }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimer = useRef(null);

  if (!slides || slides.length === 0) {
    return <div style={{ height: '300px', background: '#f0f0f0' }} />;
  }

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
        {slides.map((slide) => {
          try {
            return (
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
            );
          } catch (error) {
            console.error('Error rendering slide:', slide, error);
            return (
              <div
                key={slide.id}
                className="hero-slide"
                style={{ backgroundColor: slide.bgColor }}
              >
                <img src={slide.image} alt={slide.title} className="hero-background-image" />
                <div className="hero-overlay" />
                <div className="hero-icon-badge" style={{ backgroundColor: slide.accentColor }}>
                  <IoSparkles size={20} />
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
            );
          }
        })}
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
  try {
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
  } catch (error) {
    console.error('Error rendering product:', product, error);
    return (
      <div className="product-card" style={{ opacity: 0.5 }}>
        <div className="product-image-container" style={{ background: '#eee', height: '150px' }} />
        <div className="product-info">
          <p className="product-vendor">Product Error</p>
          <h3 className="product-title">Unable to load product</h3>
        </div>
      </div>
    );
  }
};

// Category Card Component (supports both mock data with icon and API data without)
const CategoryCard = ({ category }) => {
  try {
    return (
      <Link to={`/category/${category.id}`} className="category-card">
        <div className="category-icon-bg">
          {category.icon ? (
            getIcon(category.icon, 26)
          ) : (
            <span className="category-initial">{category.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="category-name">{category.name}</span>
        {category.products_count !== undefined && (
          <span className="category-count">{category.products_count} items</span>
        )}
      </Link>
    );
  } catch (error) {
    console.error('Error rendering category:', category, error);
    return (
      <Link to={`/category/${category.id}`} className="category-card">
        <div className="category-icon-bg">
          <span className="category-initial">{category.name?.charAt(0).toUpperCase()}</span>
        </div>
        <span className="category-name">{category.name}</span>
        {category.products_count !== undefined && (
          <span className="category-count">{category.products_count} items</span>
        )}
      </Link>
    );
  }
};

// Vendor Card Component
const VendorCard = ({ vendor }) => {
  try {
    return (
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
  } catch (error) {
    console.error('Error rendering vendor:', vendor, error);
    return (
      <div className="vendor-card" style={{ opacity: 0.5 }}>
        <div style={{ background: '#eee', height: '100px', marginBottom: '8px' }} />
        <h4 className="vendor-name">Vendor Error</h4>
      </div>
    );
  }
};

// Main Home Component
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setError(null);
      try {
        const response = await fetchCategories();
        console.log('Categories API Response:', response);
        
        // Handle multiple response formats
        let apiCategories = [];
        if (response?.data?.data && Array.isArray(response.data.data)) {
          apiCategories = response.data.data;
        } else if (response?.data && Array.isArray(response.data)) {
          apiCategories = response.data;
        } else if (response?.data?.categories && Array.isArray(response.data.categories)) {
          apiCategories = response.data.categories;
        }
        
        console.log('Parsed categories:', apiCategories);
        setCategories(apiCategories);
      } catch (err) {
        console.error('Failed to fetch categories:', err?.message || err);
        setError(err?.message || 'Failed to load categories');
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const featuredProducts = products.filter((p) => p.featured);
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  try {
    return (
      <div className="home-container">
        {/* Header */}
        <header className="home-header">
          <div className="header-left">
            <p className="welcome-text">
              {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0]}` : 'Welcome to'}
            </p>
            <h1 className="brand-name">
              <span style={{ color: Colors.primary }}>NATA</span>
              <span style={{ color: Colors.accent }}>KAHII</span>
            </h1>
          </div>
          <div className="header-right">
            <Link to="/browse" className="header-icon-btn">
              <IoSearch size={20} />
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="header-login-btn">
                <IoPerson size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </header>

        {/* Hero Carousel */}
        <HeroCarousel slides={heroSlides} />

        {/* Error Message */}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fee', color: '#c33', margin: '12px 0' }}>
            {error}
          </div>
        )}

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
            {categoriesLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading categories...</div>
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No categories available</div>
            )}
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
  } catch (err) {
    console.error('Error rendering Home:', err);
    return (
      <div className="home-container" style={{ padding: '20px' }}>
        <h2>Something went wrong</h2>
        <p>{err?.message || 'An unexpected error occurred'}</p>
      </div>
    );
  }
};

export default Home;
