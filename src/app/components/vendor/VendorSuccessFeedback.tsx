import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface VendorSuccessFeedbackProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export function VendorSuccessFeedback({ show, message = 'Success!', onComplete }: VendorSuccessFeedbackProps) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
    if (show) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-3 rounded-[24px] bg-white/95 backdrop-blur-md px-10 py-8 shadow-2xl border border-[var(--vendor-accent-success)]/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
            >
              <CheckCircle2 className="w-16 h-16 text-[var(--vendor-accent-success)]" />
            </motion.div>
            <p className="font-bold text-lg text-[var(--color-text-heading)] vendor-heading">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
