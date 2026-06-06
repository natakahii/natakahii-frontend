import { Home, Compass, PlaySquare, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { cn } from './ui/button';
import { useAuth } from '../providers/AuthProvider';

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;
  const { defaultRoute, isAuthenticated } = useAuth();

  const tabs = [
    { name: 'Home', path: defaultRoute, icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Video', path: '/video', icon: PlaySquare },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleProfileClick = (e: React.MouseEvent, targetPath: string) => {
    if (!isAuthenticated && (targetPath === '/profile' || targetPath === '/notifications')) {
      e.preventDefault();
      // We'll use window.dispatchEvent or a global state for the login popup if needed,
      // but for now, navigating to /login is the standard behavior in this app.
      // If the user specifically wants a "popup", we might need a global Login Modal.
      // Given current architecture, let's redirect to login with a return path.
      window.location.href = `/login?from=${encodeURIComponent(targetPath)}`;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] pb-safe lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {tabs.map((tab) => {
          const isActive = path === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={tab.path}
              onClick={(e) => handleProfileClick(e, tab.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 relative",
                isActive ? "text-[var(--color-primary)]" : "text-[var(--color-text-heading)] hover:text-[var(--color-primary)]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 w-10 h-1 rounded-b-md bg-[var(--color-primary)]"
                  transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                />
              )}
              <Icon className={cn("w-6 h-6", isActive && "fill-[var(--color-primary-bg)] text-[var(--color-primary)]")} />
              <span className="text-[11px] font-medium tracking-tight">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
