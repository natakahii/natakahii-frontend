import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import {
  BarChart3,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { getVendorStorefrontPath } from '../../utils/storefront';

export function VendorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
    { name: 'Analytics', path: '/vendor/dashboard/analytics', icon: BarChart3 },
    { name: 'Dropoffs', path: '/vendor/dashboard/dropoffs', icon: Truck },
    { name: 'Plan', path: '/vendor/dashboard/subscription', icon: ShieldCheck },
    { name: 'Wallet', path: '/vendor/dashboard/wallet', icon: Wallet },
    { name: 'Payouts', path: '/vendor/dashboard/payouts', icon: CreditCard },
    { name: 'Settings', path: '/vendor/dashboard/settings', icon: Settings },
  ];

  const mobilePrimaryNav = [
    { name: 'Home', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
    { name: 'Dropoffs', path: '/vendor/dashboard/dropoffs', icon: Truck },
    { name: 'Plan', path: '/vendor/dashboard/subscription', icon: ShieldCheck },
  ];

  const displayName = user?.vendor?.shop_name || user?.name || 'Vendor Account';
  const displayImage = user?.vendor?.logo || user?.profile_photo || undefined;
  const displayInitials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
  const workspaceLabel = user?.vendor?.has_premium_verification
    ? 'Premium vendor store'
    : user?.vendor?.has_kyc_verification
      ? 'Approved vendor'
      : 'Vendor workspace';
  const storefrontPath = getVendorStorefrontPath(user?.vendor);
  const hasStorefront = Boolean(user?.vendor?.shop_slug || user?.vendor?.id);
  const sidebarLinks = [
    { name: 'Marketplace Home', path: '/', icon: Globe2 },
    ...(hasStorefront ? [{ name: 'Your Storefront', path: storefrontPath, icon: Store }] : []),
  ];

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-page)] text-[var(--color-text-body)]">
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-primary-darker)] text-white fixed h-full z-10 shadow-[var(--shadow-level-3)]">
        <div className="p-6 pb-2 border-b border-white/10 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex gap-2 items-center">
            <Store className="w-6 h-6 text-[var(--color-accent)]" />
            <span>Nataka Hii</span>
          </div>
        </div>

        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-[var(--color-accent)] rounded-lg">
            <AvatarImage src={displayImage} />
            <AvatarFallback className="rounded-lg">{displayInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-white truncate">{displayName}</h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] inline-block"></span>
              {workspaceLabel}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3 custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <p className="px-3 text-[11px] font-black uppercase tracking-[0.24em] text-white/50">Quick Links</p>
          {sidebarLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.name}</span>
            </Link>
          ))}

          <Button
            variant="ghost"
            className="w-full flex justify-start gap-3 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 h-10 px-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full relative">
        <header className="md:hidden sticky top-0 z-30 border-b border-white/10 bg-[rgba(9,22,57,0.96)] text-white backdrop-blur">
          <div className="flex items-center justify-between gap-3 p-4 pb-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">{workspaceLabel}</p>
              <div className="mt-1 font-bold flex gap-2 items-center min-w-0">
                <Store className="w-5 h-5 shrink-0 text-[var(--color-accent)]" />
                <span className="truncate">{displayName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => navigate('/')}
              >
                <Globe2 className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => setIsMobileNavOpen((currentState) => !currentState)}
              >
                {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="px-4 pb-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {hasStorefront && (
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => navigate(storefrontPath)}
              >
                View Storefront
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="h-9 shrink-0 border-white/15 bg-white/5 text-white hover:bg-white/10"
              onClick={() => navigate('/vendor/dashboard/subscription')}
            >
              Plan & Badge
            </Button>
          </div>
        </header>

        {isMobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/55"
              aria-label="Close vendor navigation"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <aside className="absolute right-0 top-0 flex h-full w-[88vw] max-w-sm flex-col bg-[var(--color-primary-darker)] text-white shadow-[var(--shadow-level-3)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Vendor Navigation</p>
                  <p className="mt-1 text-base font-bold">{displayName}</p>
                </div>
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

              <div className="border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-[var(--color-accent)] rounded-lg">
                    <AvatarImage src={displayImage} />
                    <AvatarFallback className="rounded-lg">{displayInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">{displayName}</h3>
                    <p className="truncate text-xs text-[var(--color-text-muted)]">{workspaceLabel}</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.path === '/vendor/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.name}</span>
                  </NavLink>
                ))}

                <div className="pt-4">
                  <p className="px-3 text-[11px] font-black uppercase tracking-[0.24em] text-white/50">Go To</p>
                  <div className="mt-2 space-y-1">
                    {sidebarLinks.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              <div className="border-t border-white/10 p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 text-[var(--color-text-muted)] hover:bg-white/5 hover:text-white"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] flex items-center justify-around px-2 z-20 shadow-[var(--shadow-level-3)]">
          {mobilePrimaryNav.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor/dashboard'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-6 h-6 ${isActive ? 'fill-[var(--color-primary-bg)]' : ''}`} />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            className={`flex h-full w-full flex-col items-center justify-center space-y-1 ${
              isMobileNavOpen ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className={`w-6 h-6 ${isMobileNavOpen ? 'fill-[var(--color-primary-bg)]' : ''}`} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </main>
    </div>
  );
}
