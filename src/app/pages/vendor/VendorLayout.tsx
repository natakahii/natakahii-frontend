import { Outlet, NavLink, useNavigate } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Image as ImageIcon, 
  Truck, 
  MessageSquare, 
  Wallet, 
  Settings,
  Store,
  LogOut,
  Bell
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export function VendorLayout() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-page)] text-[var(--color-text-body)]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-primary-darker)] text-white fixed h-full z-10 shadow-[var(--shadow-level-3)]">
        <div className="p-6 pb-2 border-b border-white/10 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex gap-2 items-center">
            <Store className="w-6 h-6 text-[var(--color-accent)]" />
            <span>Nataka Hii</span>
          </div>
        </div>

        {/* Vendor Profile */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-[var(--color-accent)] rounded-lg">
            <AvatarImage src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200&h=200&fit=crop" />
            <AvatarFallback className="rounded-lg">MJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-white truncate">Mambo Jambo Store</h3>
            <p className="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] inline-block"></span>
              Online Seller
            </p>
          </div>
        </div>

        {/* Navigation */}
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10">
          <Button 
            variant="ghost" 
            className="w-full flex justify-start gap-3 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 h-10 px-3"
            onClick={() => navigate('/')}
          >
            <LogOut className="w-5 h-5" />
            Return to Store
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen w-full relative">
        {/* Mobile Header */}
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

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-[1400px] mx-auto w-full">
          <Outlet />
        </div>

        {/* Mobile Bottom Tab Bar */}
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
