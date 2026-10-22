import React from 'react';
import { getBallColorClass } from '../utils/lotto';

interface LottoBallProps {
  number: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isBonus?: boolean;
  animate?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LottoBall: React.FC<LottoBallProps> = ({
  number,
  size = 'md',
  isBonus = false,
  animate = false,
  selected = false,
  onClick,
  className = '',
}) => {
  const colorClass = getBallColorClass(number);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-extrabold',
    lg: 'w-14 h-14 text-xl font-black tracking-tight',
    xl: 'w-18 h-18 text-2xl font-black tracking-tight',
  }[size];

  return (
    <div className="relative inline-flex flex-col items-center group">
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`relative flex items-center justify-center rounded-full transition-all duration-200 select-none ${sizeClasses} ${colorClass} ${
          isBonus ? 'bonus-ring' : ''
        } ${selected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : ''} ${
          animate ? 'animate-bounce' : ''
        } ${onClick ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} ${className}`}
        style={{
          boxShadow: isBonus
            ? '0 0 20px rgba(245, 158, 11, 0.7), inset -3px -3px 8px rgba(0,0,0,0.5)'
            : undefined,
        }}
        aria-label={`로또 번호 ${number}${isBonus ? ' (보너스 번호)' : ''}`}
      >
        {/* Subtle glass reflection highlight on top-left */}
        <span
          className="absolute rounded-full pointer-events-none opacity-60"
          style={{
            top: '12%',
            left: '18%',
            width: '32%',
            height: '24%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 80%)',
            transform: 'rotate(-20deg)',
          }}
        />

        {/* The number */}
        <span className="relative z-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          {number}
        </span>
      </button>

      {isBonus && (
        <span className="mt-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full border border-amber-500/40">
          보너스
        </span>
      )}
    </div>
  );
};
