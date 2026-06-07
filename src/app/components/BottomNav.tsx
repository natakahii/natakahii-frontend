import { useEffect, useState } from 'react';
import { Home, Compass, PlaySquare, Bell, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { cn } from './ui/button';
import { useAuth } from '../providers/AuthProvider';
import { NotificationPanel } from './NotificationPanel';
import { apiClient } from '../services/apiClient';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { defaultRoute, isAuthenticated } = useAuth();

  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const res = await apiClient.get<any>('/notifications');
          setUnreadCount(res.unread_count || 0);
        } catch (error) {
          console.error('Failed to fetch unread count', error);
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const tabs = [
    { name: 'Home', path: defaultRoute, icon: Home },
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Video', path: '/video', icon: PlaySquare },
    { name: 'Notifications', path: '#notifications', icon: Bell, isNotification: true },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const handleTabClick = (e: React.MouseEvent, tab: typeof tabs[0]) => {
    if (tab.isNotification) {
      e.preventDefault();
      if (!isAuthenticated) {
        navigate('/login', { state: { from: { pathname: '/notifications' } } });
      } else {
        setIsNotificationPanelOpen(true);
      }
      return;
    }

    if (!isAuthenticated && tab.path === '/profile') {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: tab.path } } });
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-border)] pb-safe lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2 relative">
          {tabs.map((tab) => {
            const isActive = path === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                to={tab.path}
                onClick={(e) => handleTabClick(e, tab)}
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
                <div className="relative">
                  <Icon className={cn("w-6 h-6", isActive && "fill-[var(--color-primary-bg)] text-[var(--color-primary)]")} />
                  {tab.isNotification && isAuthenticated && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent)] text-[9px] font-bold text-white border-2 border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium tracking-tight">
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setIsNotificationPanelOpen(false)} />
    </>
  );
}
