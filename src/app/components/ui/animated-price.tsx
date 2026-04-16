import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

export function AnimatedPrice({ value, currency = "KES", className = "" }: { value: number; currency?: string; className?: string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => 
    `${currency} ${Math.round(current).toLocaleString()}`
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}