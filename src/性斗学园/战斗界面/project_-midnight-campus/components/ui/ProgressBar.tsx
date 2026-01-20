import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color: 'blue' | 'red' | 'purple' | 'green' | 'pink';
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, color, label, showValue = true, size = 'md', icon }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    blue: 'from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    red: 'from-rose-500 to-red-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]',
    purple: 'from-violet-500 to-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]',
    green: 'from-emerald-400 to-green-600 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    pink: 'from-pink-400 to-rose-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]',
  };

  const bgColors = {
    blue: 'bg-blue-900/40',
    red: 'bg-red-900/40',
    purple: 'bg-purple-900/40',
    green: 'bg-green-900/40',
    pink: 'bg-pink-900/40',
  };

  const heights = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className="w-full mb-3 group">
      <div className="flex justify-between items-center mb-1 text-xs uppercase tracking-widest font-bold text-slate-300">
        <span className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          {label}
        </span>
        {showValue && (
          <span className="font-mono text-white/80">
            {value} / {max}
          </span>
        )}
      </div>
      <div className={`w-full ${bgColors[color]} rounded-full overflow-hidden backdrop-blur-sm border border-white/5`}>
        <div
          className={`${heights[size]} bg-gradient-to-r ${colors[color]} transition-all duration-700 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
