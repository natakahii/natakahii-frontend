import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ChevronDown,
  Menu,
  Star,
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Watch,
  Sparkles,
  Zap,
  Dumbbell,
  type LucideIcon,
} from 'lucide-react';
import { cn } from './ui/button';
import { fetchCategories, CatalogCategory } from '../services/productService';

const CATEGORY_ICON_MAP: { pattern: RegExp; icon: LucideIcon }[] = [
  { pattern: /fashion|apparel|clothing|dress|shoe/, icon: Shirt },
  { pattern: /electronics|phone|tech|device|smart/, icon: Smartphone },
  { pattern: /home|living|furniture|decor/, icon: HomeIcon },
  { pattern: /accessories|watch|jewelry/, icon: Watch },
  { pattern: /beauty|cosmetic|skin/, icon: Sparkles },
  { pattern: /sport|fitness/, icon: Dumbbell },
];

function getCategoryIcon(category: CatalogCategory): LucideIcon {
  const label = `${category.icon || ''} ${category.slug} ${category.name}`.toLowerCase();
  return CATEGORY_ICON_MAP.find((entry) => entry.pattern.test(label))?.icon || Zap;
}

const FEATURED = 'featured' as const;
type ActiveKey = number | typeof FEATURED;

export function MegaMenu() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<ActiveKey>(FEATURED);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchCategories()
      .then((data) => {
        if (isMounted) setCategories(data);
      })
      .catch(() => {
        /* keep menu functional even if categories fail to load */
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const closeAll = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setIsCategoriesOpen(false);
      setIsAppMenuOpen(false);
    }, 120);
  };

  const openCategories = () => {
    cancelClose();
    setIsAppMenuOpen(false);
    setIsCategoriesOpen(true);
  };

  const openAppMenu = () => {
    cancelClose();
    setIsCategoriesOpen(false);
    setIsAppMenuOpen(true);
  };

  const closeNonCategory = () => {
    cancelClose();
    setIsCategoriesOpen(false);
    setIsAppMenuOpen(false);
  };

  const activeCategory =
    activeKey === FEATURED ? null : categories.find((category) => category.id === activeKey) || null;

  const gridItems: CatalogCategory[] = activeCategory
    ? activeCategory.children.length > 0
      ? activeCategory.children
      : [activeCategory]
    : categories;

  const panelTitle = activeCategory ? activeCategory.name : 'Categories for you';

  const linkClass =
    'px-3 py-2 text-[14px] font-medium text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap';

  return (
    <div
      className="hidden lg:block w-full bg-white border-b border-[var(--color-border)] relative z-40"
      onMouseLeave={closeAll}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-12">
          {/* Left group */}
          <div className="flex items-center">
            <button
              type="button"
              onMouseEnter={openCategories}
              onClick={openCategories}
              aria-expanded={isCategoriesOpen}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-[14px] font-semibold transition-colors whitespace-nowrap border-b-2',
                isCategoriesOpen
                  ? 'text-[var(--color-primary)] border-[var(--color-primary)]'
                  : 'text-[var(--color-text-heading)] border-transparent hover:text-[var(--color-primary)]',
              )}
            >
              <Menu className="w-4 h-4" />
              All Categories
              <ChevronDown
                className={cn('w-4 h-4 transition-transform', isCategoriesOpen && 'rotate-180')}
              />
            </button>

            <Link to="/explore" className={linkClass} onMouseEnter={closeNonCategory}>
              Top Verified Seller/Vendor
            </Link>
            <Link to="/explore" className={linkClass} onMouseEnter={closeNonCategory}>
              Find near products
            </Link>
          </div>

          {/* Right group */}
          <div className="flex items-center">
            <Link to="/explore" className={linkClass} onMouseEnter={closeNonCategory}>
              Resource Center
            </Link>

            <div className="relative" onMouseEnter={openAppMenu}>
              <button
                type="button"
                onClick={openAppMenu}
                aria-expanded={isAppMenuOpen}
                className={cn(linkClass, 'flex items-center gap-1')}
              >
                App &amp; extension
                <ChevronDown
                  className={cn('w-4 h-4 transition-transform', isAppMenuOpen && 'rotate-180')}
                />
              </button>
              {isAppMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-[12px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-level-2)] p-4">
                  <p className="text-[14px] font-medium text-[var(--color-text-muted)]">
                    Coming soon...
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/vendor/apply"
              className="ml-2 px-4 py-2 text-[14px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-primary)] transition-colors whitespace-nowrap"
              onMouseEnter={closeNonCategory}
            >
              Sell on natakahii
            </Link>
          </div>
        </nav>
      </div>

      {/* Mega dropdown panel */}
      {isCategoriesOpen && (
        <div className="absolute left-0 right-0 top-full" onMouseEnter={cancelClose}>
          <div className="container mx-auto px-4">
            <div className="flex bg-white rounded-b-[16px] border border-t-0 border-[var(--color-border)] shadow-[var(--shadow-level-3)] overflow-hidden max-h-[70vh]">
              {/* Sidebar */}
              <div className="w-[280px] shrink-0 border-r border-[var(--color-border)] py-3 overflow-y-auto">
                <button
                  type="button"
                  onMouseEnter={() => setActiveKey(FEATURED)}
                  className={cn(
                    'flex items-center gap-3 w-full text-left px-6 py-3 text-[14px] font-medium transition-colors',
                    activeKey === FEATURED
                      ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-page)]',
                  )}
                >
                  <Star className="w-4 h-4" />
                  Categories for you
                </button>

                {categories.map((category) => {
                  const Icon = getCategoryIcon(category);
                  const isActive = activeKey === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onMouseEnter={() => setActiveKey(category.id)}
                      className={cn(
                        'flex items-center gap-3 w-full text-left px-6 py-3 text-[14px] font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                          : 'text-[var(--color-text-body)] hover:bg-[var(--color-bg-page)]',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {/* Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-[18px] font-bold text-[var(--color-text-heading)] mb-5">
                  {panelTitle}
                </h3>

                {gridItems.length === 0 ? (
                  <p className="text-[14px] text-[var(--color-text-muted)]">
                    Categories will appear here soon.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-6">
                    {gridItems.map((item) => {
                      const Icon = getCategoryIcon(item);
                      return (
                        <Link
                          key={item.id}
                          to={`/explore?category=${item.id}`}
                          onClick={() => setIsCategoriesOpen(false)}
                          className="group flex flex-col items-center gap-2 text-center"
                        >
                          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-page)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary-bg)] transition-colors">
                            <Icon className="w-7 h-7 text-[var(--color-text-body)] group-hover:text-[var(--color-primary)] transition-colors" />
                          </div>
                          <span className="text-[13px] text-[var(--color-text-body)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
