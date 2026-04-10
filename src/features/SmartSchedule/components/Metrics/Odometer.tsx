import React, { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion } from 'motion/react';

interface OdometerProps {
  value: number;
  className?: string;
  decimals?: number;
}

export const Odometer: React.FC<OdometerProps> = ({ value, className = "", decimals = 0 }) => {
  const springValue = useSpring(value, {
    stiffness: 70,
    damping: 15,
    mass: 1
  });
  
  const displayValue = useTransform(springValue, latest => 
    (Number(latest) || 0).toFixed(decimals)
  );

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  return (
    <motion.span className={className}>
      {displayValue}
    </motion.span>
  );
};
