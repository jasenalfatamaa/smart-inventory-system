
import React from 'react';
import { StockStatus } from '../types';

interface StockBadgeProps {
  status: StockStatus;
}

const StockBadge: React.FC<StockBadgeProps> = ({ status }) => {
  const styles = {
    'Safe': 'bg-green-50 text-green-700 border-green-100',
    'Low': 'bg-amber-50 text-amber-700 border-amber-100',
    'Out of Stock': 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StockBadge;
