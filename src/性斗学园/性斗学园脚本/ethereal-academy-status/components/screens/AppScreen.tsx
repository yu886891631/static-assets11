import React from 'react';
import { ModalType } from '../../types';
import Icon from '../Icon';

interface AppScreenProps {
  title: string;
  type: ModalType;
  onBack: () => void;
  children: React.ReactNode;
}

export const AppScreen: React.FC<AppScreenProps> = ({ title, type, onBack, children }) => {
  return (
    <div className="absolute inset-0 bg-[#0f172a] z-40 flex flex-col animate-slide-up">
      {/* App Header */}
      {/* Added backdrop-blur and z-index to ensure it stays on top of content when scrolling */}
      <div className="h-24 pt-10 px-4 flex items-center justify-between bg-glass-200 backdrop-blur-xl border-b border-white/5 shrink-0 z-50 sticky top-0">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Icon name="Menu" size={24} className="rotate-90" />
        </button>
        <span className="text-lg font-bold tracking-wide">{title}</span>
        <div className="w-10" /> {/* Spacer for balance */}
      </div>

      {/* App Content */}
      {/* 'flex-1' ensures it takes remaining height. 'overflow-y-auto' enables scrolling within this div. */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-12 custom-scrollbar">{children}</div>
    </div>
  );
};
