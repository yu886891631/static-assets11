import React from 'react';
import { GameState } from '../../types';
import Icon from '../Icon';

interface HeaderProps {
  state: GameState;
}

export const Header: React.FC<HeaderProps> = ({ state }) => {
  const { 时间系统 } = state;

  return (
    <div className="absolute top-0 left-0 right-0 h-10 px-6 flex items-center justify-between z-50 text-xs font-medium text-white/90 select-none">
      {/* Time */}
      <div className="flex items-center gap-2">
        <span>{时间系统?.时间 || ''}</span>
      </div>

      {/* Notch Area (Visual only) - optional, keeping it clean for now */}

      {/* Status Icons */}
      <div className="flex items-center gap-2">
        <Icon name="Stats" size={12} className="text-white/60" /> {/* Signal strength fake */}
        <span className="text-[10px] font-mono opacity-60">5G</span>
        <div className="w-6 h-3 rounded-[2px] border border-white/40 relative ml-1">
          <div className="absolute top-[2px] bottom-[2px] left-[2px] right-[4px] bg-white/90 rounded-[1px]" />
        </div>
      </div>
    </div>
  );
};
