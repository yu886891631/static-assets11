import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, interactive = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-glass-200 backdrop-blur-md border border-glass-border shadow-lg
        ${interactive ? 'cursor-pointer hover:bg-glass-300 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};
