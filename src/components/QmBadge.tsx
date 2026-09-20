import React from 'react';
import { WaltonSealLogo } from './WaltonSealLogo';

interface QmBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export const QmBadge: React.FC<QmBadgeProps> = ({ size = 'md', className = '', animated = true }) => {
  const dimensions = {
    sm: 'w-12 h-12',
    md: 'w-[66px] h-[66px] sm:w-[72px] sm:h-[72px]',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32 sm:w-36 sm:h-36',
  }[size];

  return (
    <div
      id="qm-brand-badge"
      className={`rounded-full flex items-center justify-center shrink-0 ${dimensions} ${className} transition-all duration-300 group-hover:scale-105 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] group-hover:drop-shadow-[0_0_16px_rgba(62,181,67,0.6)]`}
    >
      <WaltonSealLogo animated={animated} className="w-full h-full object-contain select-none" />
    </div>
  );
};

