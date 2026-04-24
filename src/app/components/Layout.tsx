import { Outlet, useLocation } from 'react-router';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { AIAssistant } from './AIAssistant';
import { PageTransition } from './ui/page-transition';
import { AnimatePresence } from 'motion/react';

export function Layout() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-body)]">
      <Navbar />
      <main className="flex-1 w-full pb-16 lg:pb-0 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomNav />
      <AIAssistant />
    </div>
  );
}
