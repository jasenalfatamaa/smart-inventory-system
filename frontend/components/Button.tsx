
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  // Added icon prop to support rendering icons within buttons
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading,
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#38BDF8] text-white hover:bg-[#0EA5E9] shadow-sm",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    success: "bg-[#22C55E] text-white hover:bg-green-600 shadow-sm",
    warning: "bg-[#F59E0B] text-white hover:bg-amber-600 shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading}
      // Use any to bypass conflict between standard HTML onDrag and framer-motion onDrag types
      {...props as any}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        // Render icon when not in loading state
        icon
      )}
      {children}
    </motion.button>
  );
};

export default Button;
