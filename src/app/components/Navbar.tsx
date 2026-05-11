import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, Heart, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { Button, cn } from './ui/button';
import { SearchInput } from './ui/input';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import headerLogo from '../../assets/Nataka Hii Header.png';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { defaultRoute, hasRole, isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();

  const homePath = isAuthenticated ? defaultRoute : '/';
  const profileTarget = hasRole('vendor') ? '/vendor/dashboard' : '/profile';
  const displayName = user?.name || 'Your account';
  const profilePhoto = user?.profile_photo || undefined;

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[var(--shadow-level-1)]">
      <div className="container mx-auto px-4 h-[72px] flex items-center justify-between gap-4 lg:gap-8">
        {/* Logo */}
        <Link to={homePath} className="flex items-center flex-shrink-0">
          <img
            src={headerLogo}
            alt="Nataka Hii"
            className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] lg:max-w-[180px] object-contain"
          />
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-auto">
          <SearchInput placeholder="Search products, brands, or vendors..." />
        </div>

        {/* Mobile Search - inline between logo and icons */}
        {isMobileSearchOpen && (
          <div className="lg:hidden flex-1 flex items-center gap-2 mx-2">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = mobileSearchQuery.trim();
                setIsMobileSearchOpen(false);
                setMobileSearchQuery('');
                navigate(query ? `/explore?search=${encodeURIComponent(query)}` : '/explore');
              }}
              className="relative flex-1"
            >
              <input
                type="text"
                placeholder="Search..."
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-page)] text-[var(--color-text-heading)] text-[13px] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                autoFocus
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            </form>
          </div>
        )}

        {/* Desktop Right Icons */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {!isAuthenticated ? (
            <>
              <Link to="/login"><Button variant="ghost" className="font-semibold text-[14px]">Login</Button></Link>
              <Link to="/register"><Button variant="primary" className="font-semibold text-[14px]">Sign Up</Button></Link>
            </>
          ) : (
            <>
              <button className="relative p-2 text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full border-2 border-white"></span>
              </button>
              <Link to="/cart" className="relative p-2 text-[var(--color-text-body)] hover:text-[var(--color-primary)] transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              <Link to={profileTarget} className="h-8 w-8 rounded-full bg-[var(--color-primary-bg)] overflow-hidden border-2 border-[var(--color-primary)] flex items-center justify-center hover:opacity-80 transition-opacity">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-[var(--color-primary)]" />
                )}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Right Icons */}
        <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
          {!isMobileSearchOpen ? (
            <>
              <button 
                onClick={() => setIsMobileSearchOpen(true)} 
                className="p-2 text-[var(--color-text-heading)]"
              >
                <Search className="w-6 h-6" />
              </button>
              <Link to="/cart" className="relative p-2 text-[var(--color-text-heading)]">
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              <button
                className="p-2 text-[var(--color-text-heading)]"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => {
                setIsMobileSearchOpen(false);
                setMobileSearchQuery('');
              }}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-[var(--color-text-max)]/50 backdrop-blur-sm lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-[var(--shadow-level-3)] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[18px] font-bold text-[var(--color-primary-darker)]">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!isAuthenticated ? (
                <div className="space-y-4">
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}><Button variant="primary" className="w-full justify-center">Sign Up</Button></Link>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button variant="secondary" className="w-full justify-center">Login</Button></Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={displayName} className="h-12 w-12 rounded-full object-cover border border-[var(--color-border)]" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                        <User className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-[var(--color-text-heading)] text-[16px]">{displayName}</div>
                      <Link to={profileTarget} onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] text-[var(--color-primary)] font-bold hover:underline">
                        {hasRole('vendor') ? 'Open Dashboard' : 'View Profile'}
                      </Link>
                    </div>
                  </div>

                  <nav className="space-y-4">
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); setIsNotificationPanelOpen(true); }}
                      className="block w-full text-left text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]"
                    >
                      Notifications
                    </button>
                    <Link to="/customer" onClick={() => setIsMobileMenuOpen(false)} className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Home</Link>
                    {hasRole('vendor') && <Link to="/vendor/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Vendor Dashboard</Link>}
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Account Settings</Link>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={cn(
                        "block w-full text-left text-[16px] font-medium py-2 border-b border-[var(--color-border)]",
                        "text-red-600 disabled:opacity-50"
                      )}
                    >
                      {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />
    </header>
  );
}
