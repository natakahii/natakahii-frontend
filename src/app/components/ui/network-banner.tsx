import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setDismissed(false);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // For testing purposes, we can uncomment this to force it:
  // useEffect(() => setIsOffline(true), []);

  if (!isOffline || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-[#FFFBEB] border-b border-[#D97706]/30 px-4 py-2 relative z-40 overflow-hidden"
      >
        <div className="container mx-auto flex items-center justify-between gap-3 text-[#D97706] text-[13px] font-bold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>You're offline. Some features may not be available. Please check your connection.</span>
          </div>
          <button 
            onClick={() => setDismissed(true)} 
            className="p-1 hover:bg-[#D97706]/10 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
