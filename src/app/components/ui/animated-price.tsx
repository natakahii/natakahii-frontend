import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { DEFAULT_CURRENCY_CODE, formatCurrency } from "../../utils/currency";

export function AnimatedPrice({ value, currency = DEFAULT_CURRENCY_CODE, className = "" }: { value: number; currency?: string; className?: string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => 
    formatCurrency(Math.round(current), currency)
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
