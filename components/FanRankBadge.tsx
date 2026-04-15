
import React from 'react';
import { FanRank } from '../types';

interface FanRankBadgeProps {
  rank?: FanRank;
  size?: 'xs' | 'sm';
  className?: string;
}

const FanRankBadge: React.FC<FanRankBadgeProps> = ({ rank = 'Amateur', size = 'xs', className = '' }) => {
  const configs = {
    'Amateur': { color: 'bg-gray-100 dark:bg-gray-800 text-gray-500', icon: '⚽' },
    'Supporter': { color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', icon: '📢' },
    'Regular': { color: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400', icon: '👕' },
    'Ultra': { color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400', icon: '🔥' },
    'Legend': { color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', icon: '🏆' },
    'Founding Legend': { color: 'gradient-primary text-white shadow-sm', icon: '👑' }
  };

  const config = configs[rank] || configs['Amateur'];
  const sizeStyles = size === 'xs' ? 'px-1.5 py-0.5 text-[7px]' : 'px-2 py-1 text-[8px]';

  return (
    <div className={`inline-flex items-center gap-1 rounded-md font-black uppercase tracking-widest ${config.color} ${sizeStyles} ${className}`}>
      <span>{config.icon}</span>
      <span>{rank}</span>
    </div>
  );
};

export default FanRankBadge;
