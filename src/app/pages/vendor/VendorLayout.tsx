import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Wallet,
  X,
  Heart,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { getVendorStorefrontPath } from '../../utils/storefront';
import { cn } from '../../components/ui/utils';
import { NotificationPanel } from '../../components/NotificationPanel';
import { apiClient } from '../../services/apiClient';

const SIDEBAR_KEY = 'vendor-sidebar-collapsed';

const navItems = [
  { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
  { name: 'My Orders', path: '/vendor/dashboard/orders', icon: ShoppingBag },
  { name: 'Analytics', path: '/vendor/dashboard/analytics', icon: BarChart3 },
  { name: 'Dropoffs', path: '/vendor/dashboard/dropoffs', icon: Truck },
  { name: 'Plan', path: '/vendor/dashboard/subscription', icon: ShieldCheck },
  { name: 'Wallet', path: '/vendor/dashboard/wallet', icon: Wallet },
  { name: 'Wishlist', path: '/vendor/dashboard/wishlist', icon: Heart },
  { name: 'Payouts', path: '/vendor/dashboard/payouts', icon: CreditCard },
  { name: 'Settings', path: '/vendor/dashboard/settings', icon: Settings },
];

const mobilePrimaryNav = [
  { name: 'Home', path: '/vendor/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
  { name: 'Orders', path: '/vendor/dashboard/orders', icon: ShoppingBag },
];

const mobileDrawerGroups = [
  {
    label: 'Commerce',
    items: [
      { name: 'Analytics', path: '/vendor/dashboard/analytics', icon: BarChart3 },
      { name: 'Dropoffs', path: '/vendor/dashboard/dropoffs', icon: Truck },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Plan', path: '/vendor/dashboard/subscription', icon: ShieldCheck },
      { name: 'Payouts', path: '/vendor/dashboard/payouts', icon: CreditCard },
      { name: 'Settings', path: '/vendor/dashboard/settings', icon: Settings },
    ],
  },
];

function NavItemLink({
  item,
  collapsed,
  onNavigate,
  badge,
}: {
  item: (typeof navItems)[0];
  collapsed: boolean;
  onNavigate?: () => void;
  badge?: number;
}) {
  return (
    <NavLink
      to={item.path}
      end={item.path === '/vendor/dashboard'}
      onClick={onNavigate}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
          collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
          isActive
            ? 'bg-white/10 text-white shadow-[inset_3px_0_0_0_var(--vendor-accent-action)]'
            : 'text-[var(--vendor-text-muted-on-dark)] hover:bg-white/5 hover:text-white',
        )
      }
    >
      <div className="relative">
        <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
        {collapsed && badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--vendor-accent-action)] text-[9px] font-bold text-white border border-[var(--vendor-bg)]">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--vendor-accent-action)] px-1.5 text-[10px] font-bold text-white">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const displayName = user?.vendor?.shop_name || user?.name || 'Vendor Account';
  const displayImage = user?.vendor?.logo || user?.profile_photo || undefined;
  const displayInitials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
  const workspaceLabel = user?.vendor?.has_premium_verification
    ? 'Premium vendor'
    : user?.vendor?.has_kyc_verification
      ? 'Approved vendor'
      : 'Vendor workspace';
  const storefrontPath = getVendorStorefrontPath(user?.vendor);
  const hasStorefront = Boolean(user?.vendor?.shop_slug || user?.vendor?.id);
  const sidebarLinks = [
    { name: 'Marketplace', path: '/', icon: Globe2 },
    ...(hasStorefront ? [{ name: 'Storefront', path: storefrontPath, icon: Store }] : []),
  ];

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const sidebarWidth = collapsed ? 'md:ml-[72px]' : 'md:ml-60';

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [orderRes, notifRes] = await Promise.all([
          apiClient.get<any>('/vendor/orders/count'),
          apiClient.get<any>('/notifications')
        ]);
        setOrderCount(orderRes.count || 0);
        setUnreadNotifications(notifRes.unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch counts', error);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="vendor-command-center min-h-screen flex bg-[var(--vendor-bg)] text-[var(--color-text-body)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col fixed h-full z-20 transition-all duration-300 ease-out',
          'bg-[var(--vendor-bg)] border-r border-[var(--vendor-border)] shadow-2xl',
          collapsed ? 'w-[72px]' : 'w-60',
        )}
      >
        <div
          className={cn(
            'border-b border-[var(--vendor-border)] flex items-center',
            collapsed ? 'p-4 justify-center' : 'p-5 justify-between',
          )}
        >
          {!collapsed && (
            <div className="font-bold text-lg tracking-tight text-white flex gap-2 items-center vendor-heading">
              <Store className="w-5 h-5 text-[var(--vendor-accent-action)]" />
              <span>Nataka Hii</span>
            </div>
          )}
          {collapsed && <Store className="w-6 h-6 text-[var(--vendor-accent-action)]" />}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'p-1.5 rounded-lg text-[var(--vendor-text-muted-on-dark)] hover:bg-white/10 hover:text-white transition-colors',
              collapsed && 'mt-0',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-4 border-b border-[var(--vendor-border)] flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-[var(--vendor-accent-action)]/50 rounded-xl">
              <AvatarImage src={displayImage} />
              <AvatarFallback className="rounded-xl text-xs">{displayInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-semibold text-white text-sm truncate vendor-heading">{displayName}</h3>
              <p className="text-[11px] text-[var(--vendor-text-muted-on-dark)] truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--vendor-accent-success)]" />
                {workspaceLabel}
              </p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2 custom-scrollbar">
          {navItems.map((item) => (
            <NavItemLink 
              key={item.name} 
              item={item} 
              collapsed={collapsed} 
              badge={item.name === 'My Orders' ? orderCount : undefined}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--vendor-border)] space-y-1">
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Quick</p>
          )}
          {sidebarLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl text-sm font-medium text-[var(--vendor-text-muted-on-dark)] hover:bg-white/5 hover:text-white transition-colors',
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? 'Sign Out' : undefined}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl text-sm font-medium text-[var(--vendor-text-muted-on-dark)] hover:bg-white/5 hover:text-white transition-colors',
              collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className={cn('flex-1 flex flex-col min-h-screen w-full relative transition-all duration-300', sidebarWidth)}>
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-30 border-b border-[var(--vendor-border)] bg-[var(--vendor-bg)]/95 text-white backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">{workspaceLabel}</p>
              <div className="mt-0.5 font-bold flex gap-2 items-center min-w-0 vendor-heading">
                <Store className="w-5 h-5 shrink-0 text-[var(--vendor-accent-action)]" />
                <span className="truncate text-white">{displayName}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60"
                aria-label="Close navigation"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="absolute right-0 top-0 flex h-full w-[88vw] max-w-sm flex-col bg-[var(--vendor-bg)] text-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-[var(--vendor-border)] px-5 py-4">
                  <p className="font-bold vendor-heading">{displayName}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
                  {mobilePrimaryNav.map((item) => (
                    <NavItemLink
                      key={item.name}
                      item={item}
                      collapsed={false}
                      onNavigate={() => setIsMobileNavOpen(false)}
                      badge={item.name === 'Orders' ? orderCount : undefined}
                    />
                  ))}

                  {mobileDrawerGroups.map((group) => (
                    <div key={group.label} className="pt-4">
                      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                        {group.label}
                      </p>
                      {group.items.map((item) => (
                        <NavItemLink
                          key={item.name}
                          item={item}
                          collapsed={false}
                          onNavigate={() => setIsMobileNavOpen(false)}
                        />
                      ))}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-[var(--vendor-border)] mt-4">
                    {sidebarLinks.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileNavOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--vendor-text-muted-on-dark)] hover:bg-white/5 hover:text-white"
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--vendor-text-muted-on-dark)] hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                </nav>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 vendor-page-bg p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1400px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] flex items-center justify-around px-2 z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          {mobilePrimaryNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors',
                  isActive ? 'text-[var(--vendor-accent-action)]' : 'text-[var(--color-text-muted)]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('w-6 h-6', isActive && 'scale-110')} />
                  <span className="text-[10px] font-semibold">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            className={cn(
              'flex h-full w-full flex-col items-center justify-center space-y-0.5 relative',
              isNotificationPanelOpen ? 'text-[var(--vendor-accent-action)]' : 'text-[var(--color-text-muted)]',
            )}
            onClick={() => setIsNotificationPanelOpen(true)}
          >
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Notifications</span>
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-[30%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border border-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </main>
      <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
    </div>
  );
}
