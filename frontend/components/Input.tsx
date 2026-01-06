
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input
        className={`
          w-full px-4 py-2.5 rounded-lg border bg-white text-slate-900
          transition-all duration-200 outline-none
          focus:ring-2 focus:ring-[#38BDF8]/20 focus:border-[#38BDF8]
          placeholder:text-slate-400
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-red-500 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
