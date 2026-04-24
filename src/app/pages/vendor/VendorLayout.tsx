import { NavLink, Outlet, useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  BarChart3,
  Bell,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export function VendorLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
    { name: 'Orders', path: '/vendor/dashboard/orders', icon: ShoppingCart },
    { name: 'Analytics', path: '/vendor/dashboard/analytics', icon: BarChart3 },
    { name: 'Media', path: '/vendor/dashboard/media', icon: ImageIcon },
    { name: 'Dropoffs', path: '/vendor/dashboard/dropoffs', icon: Truck },
    { name: 'Messages', path: '/vendor/dashboard/messages', icon: MessageSquare, badge: 3 },
    { name: 'Earnings', path: '/vendor/dashboard/earnings', icon: Wallet },
    { name: 'Settings', path: '/vendor/dashboard/settings', icon: Settings },
  ];

  const displayName = user?.name || 'Vendor Account';
  const displayInitials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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
            <AvatarImage src={user?.profile_photo || undefined} />
            <AvatarFallback className="rounded-lg">{displayInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-white truncate">{displayName}</h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] inline-block"></span>
              Vendor workspace
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
              {item.badge && (
                <Badge className="bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-dark)] h-5 px-1.5 flex items-center justify-center text-[10px] rounded-full">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
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
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--color-primary-darker)] text-white sticky top-0 z-20">
          <div className="font-bold flex gap-2 items-center">
            <Store className="w-5 h-5 text-[var(--color-accent)]" />
            <span>Nataka Hii Vendor</span>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-accent)] rounded-full"></span>
          </Button>
        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[var(--color-border)] flex items-center justify-around px-2 z-20 shadow-[var(--shadow-level-3)]">
          {[
            { name: 'Home', path: '/vendor/dashboard', icon: LayoutDashboard },
            { name: 'Products', path: '/vendor/dashboard/products', icon: Package },
            { name: 'Orders', path: '/vendor/dashboard/orders', icon: ShoppingCart },
            { name: 'More', path: '/vendor/dashboard/settings', icon: Settings },
          ].map((item) => (
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
        </div>
      </main>
    </div>
  );
}
