import React from 'react';
import { GameState, InventoryItem } from '../../types';
import { GlassCard } from '../ui/GlassCard';

export const InventoryContent: React.FC<{ state: GameState }> = ({ state }) => {
  const items = Object.entries(state.物品系统.背包);
  const equipment = state.物品系统._装备栏;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Equipment Slots */}
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">当前装备</h3>
        <div className="space-y-3">
          {Object.entries(equipment).map(([slot, item]) => (
            <GlassCard key={slot} className="p-3 flex items-center gap-3 bg-black/20">
              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs text-white/30 border border-white/5">
                {slot[0]}
              </div>
              <div>
                <div className="text-xs text-white/40">{slot}</div>
                <div className={`text-sm font-medium ${item?.名称 ? 'text-brand-accent' : 'text-white/20'}`}>
                  {item?.名称 || '未装备'}
                </div>
                {item?.等级 && <div className="text-[10px] text-white/30 mt-1">{item.等级}</div>}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="md:col-span-2">
        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">背包物品 ({items.length}/20)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(([name, item]: [string, InventoryItem]) => (
            <GlassCard
              key={name}
              interactive
              className="p-3 bg-white/5 aspect-square flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    item.等级 === 'S' || item.等级 === 'SS'
                      ? 'border-yellow-500/50 text-yellow-300 bg-yellow-500/10'
                      : item.等级 === 'A'
                        ? 'border-purple-500/50 text-purple-300 bg-purple-500/10'
                        : 'border-white/20 text-white/40 bg-white/5'
                  }`}
                >
                  {item.等级}
                </span>
                <span className="text-xs font-mono text-white/50">x{item.数量}</span>
              </div>
              <div className="text-center my-2">
                <div className="font-medium text-sm text-white/90 group-hover:text-brand-primary transition-colors">
                  {name}
                </div>
              </div>
              <div className="text-[10px] text-white/40 line-clamp-2 leading-tight">{item.描述}</div>
            </GlassCard>
          ))}
          {/* Empty slots filler */}
          {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-2xl border border-white/5 bg-black/10 aspect-square flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
