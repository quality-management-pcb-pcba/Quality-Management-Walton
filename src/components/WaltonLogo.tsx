import React from 'react';
import { WaltonSealLogo } from './WaltonSealLogo';

interface WaltonLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const WaltonLogo: React.FC<WaltonLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden shadow-xs bg-white flex items-center justify-center`}>
        <WaltonSealLogo className="w-full h-full" />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-bold text-sm tracking-tight text-[#0d1730]">
            WALTON QM
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            PCB &amp; PCBA
          </span>
        </div>
      )}
    </div>
  );
};

