import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  label?: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'bg-brand-primary',
  label,
  subLabel,
  icon,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full mb-3 group">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-white/80">{icon}</span>}
          {label && <span className="text-sm font-medium text-white/90">{label}</span>}
        </div>
        <div className="text-xs font-mono text-white/60">
          <span className="text-white font-bold">{value}</span> / {max}
          {subLabel && <span className="ml-2 opacity-70">({subLabel})</span>}
        </div>
      </div>
      <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full ${color} shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
};
