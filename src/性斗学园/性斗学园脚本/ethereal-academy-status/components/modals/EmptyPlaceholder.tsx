import React from 'react';

export const EmptyPlaceholder: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-white/30 space-y-4">
      <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center animate-[spin_10s_linear_infinite]">
        <div className="w-16 h-16 rounded-full bg-white/5" />
      </div>
      <p className="font-mono text-sm tracking-widest uppercase">{text} :: 初始化中</p>
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce delay-75" />
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce delay-150" />
        <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce delay-300" />
      </div>
    </div>
  );
};
