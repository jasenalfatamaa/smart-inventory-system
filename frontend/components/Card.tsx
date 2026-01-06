
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', glass = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-lg p-5
        ${glass ? 'glass shadow-lg border border-white/40' : 'bg-white shadow-sm border border-slate-100'}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
