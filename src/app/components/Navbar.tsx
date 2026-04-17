import { useState } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingCart, Bell, User, Menu, X, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { SearchInput } from './ui/input';
import { cn } from './ui/button';
import { NotificationPanel } from './NotificationPanel';

export function Navbar({ role = 'visitor' }: { role?: 'visitor' | 'customer' | 'vendor' }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-[var(--shadow-level-1)]">
      <div className="container mx-auto px-4 h-[72px] flex items-center justify-between gap-4 lg:gap-8">
        {/* Logo */}
        <Link to={role === 'customer' ? "/customer" : "/"} className="flex items-center flex-shrink-0">
          <img 
            src="/natakahii-logo.png" 
            alt="Nataka Hii" 
            className="h-20 w-auto max-w-[180px] object-contain"
          />
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-auto">
          <SearchInput placeholder="Search products, brands, or vendors..." />
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {role === 'visitor' ? (
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
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">
                  3
                </span>
              </Link>
              <Link to="/profile" className="h-8 w-8 rounded-full bg-[var(--color-primary-bg)] overflow-hidden border-2 border-[var(--color-primary)] flex items-center justify-center hover:opacity-80 transition-opacity">
                <User className="w-5 h-5 text-[var(--color-primary)]" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex lg:hidden items-center gap-3">
          <button className="p-2 text-[var(--color-text-heading)]">
            <Search className="w-6 h-6" />
          </button>
          <Link to="/cart" className="relative p-2 text-[var(--color-text-heading)]">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white">3</span>
          </Link>
          <button 
            className="p-2 text-[var(--color-text-heading)]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
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
              {role === 'visitor' ? (
                <div className="space-y-4">
                  <Link to="/register"><Button variant="primary" className="w-full justify-center">Sign Up</Button></Link>
                  <Link to="/login"><Button variant="secondary" className="w-full justify-center">Login</Button></Link>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                      <User className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--color-text-heading)] text-[16px]">Jane Doe</div>
                      <Link to="/profile" className="text-[13px] text-[var(--color-primary)] font-bold hover:underline">View Profile</Link>
                    </div>
                  </div>
                  <nav className="space-y-4">
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); setIsNotificationPanelOpen(true); }}
                      className="block w-full text-left text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]"
                    >
                      Notifications
                    </button>
                    <a href="#" className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Categories</a>
                    <a href="#" className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Orders</a>
                    <a href="#" className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Wishlist</a>
                    <a href="#" className="block text-[16px] font-medium text-[var(--color-text-body)] py-2 border-b border-[var(--color-border)]">Settings</a>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationPanel 
        isOpen={isNotificationPanelOpen} 
        onClose={() => setIsNotificationPanelOpen(false)} 
      />
    </header>
  );
}
