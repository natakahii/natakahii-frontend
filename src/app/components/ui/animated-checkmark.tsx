import { motion } from "motion/react";

export function AnimatedCheckmark({ className = "w-12 h-12 text-[var(--color-success)]" }: { className?: string }) {
  return (
    <div className={className}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}