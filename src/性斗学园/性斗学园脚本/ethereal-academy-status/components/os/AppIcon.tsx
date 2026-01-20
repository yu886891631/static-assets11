import React from 'react';
import Icon, { Icons } from '../Icon';

interface AppIconProps {
  name: string;
  icon: keyof typeof Icons;
  color: string;
  onClick: () => void;
  notificationCount?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, icon, color, onClick, notificationCount }) => {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group w-full">
      <div
        className={`
          relative w-[64px] h-[64px] rounded-[18px] 
          flex items-center justify-center 
          shadow-lg border border-white/10
          transition-all duration-200 active:scale-90 group-hover:scale-105
        `}
        style={{ background: color }}
      >
        {/* Glossy overlay */}
        <div className="absolute inset-0 rounded-[18px] bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

        <Icon name={icon} size={28} className="text-white drop-shadow-md" />

        {notificationCount ? (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/20">
            {notificationCount}
          </div>
        ) : null}
      </div>
      <span className="text-[11px] font-medium text-white/90 drop-shadow-md tracking-wide">{name}</span>
    </button>
  );
};
