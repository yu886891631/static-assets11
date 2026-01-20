import React from 'react';
import { GameState } from '../../types';
import Icon from '../Icon';
import { GlassCard } from '../ui/GlassCard';

export const CharacterApp: React.FC<{ state: GameState }> = ({ state }) => {
  const { 角色基础, 核心状态, 永久状态 } = state;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center pt-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary p-[2px] shadow-xl shadow-brand-primary/20">
          <div className="w-full h-full rounded-full bg-[#1a1f35] flex items-center justify-center overflow-hidden">
            <Icon name="User" size={40} className="text-white/80" />
          </div>
        </div>
        <h2 className="mt-3 text-xl font-bold">学员 No.402</h2>
        <div className="text-sm text-white/50">
          {角色基础._段位} 级 | 声望 {角色基础._声望}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3 bg-white/5">
          <div className="text-xs text-white/40 mb-1">魅力</div>
          <div className="text-xl font-bold text-brand-secondary">{角色基础._魅力}</div>
        </GlassCard>
        <GlassCard className="p-3 bg-white/5">
          <div className="text-xs text-white/40 mb-1">幸运</div>
          <div className="text-xl font-bold text-yellow-400">{角色基础._幸运}</div>
        </GlassCard>
        <GlassCard className="p-3 bg-white/5">
          <div className="text-xs text-white/40 mb-1">基础性斗力</div>
          <div className="text-xl font-bold text-indigo-400">{核心状态.$基础性斗力}</div>
        </GlassCard>
        <GlassCard className="p-3 bg-white/5">
          <div className="text-xs text-white/40 mb-1">基础忍耐力</div>
          <div className="text-xl font-bold text-emerald-400">{核心状态.$基础忍耐力}</div>
        </GlassCard>
      </div>

      {/* Detailed Stats */}
      <GlassCard className="p-4">
        <h3 className="text-sm font-bold text-white/60 mb-4 uppercase tracking-wider">核心状态</h3>
        <div className="space-y-4">
          {/* Stamina */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>耐力</span>
              <span className="text-white/60">
                {核心状态.$耐力} / {核心状态.$最大耐力}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(核心状态.$耐力 / 核心状态.$最大耐力) * 100}%` }}
              />
            </div>
          </div>
          {/* Pleasure */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>快感积累</span>
              <span className="text-white/60">
                {核心状态.$快感} / {核心状态.$最大快感}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500"
                style={{ width: `${(核心状态.$快感 / 核心状态.$最大快感) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Traits */}
      <div>
        <h3 className="text-sm font-bold text-white/60 mb-3 px-1">被动特质</h3>
        <div className="flex flex-wrap gap-2">
          {永久状态.状态列表.map((trait, i) => (
            <span key={i} className="px-3 py-1.5 rounded-lg bg-glass-300 text-xs border border-white/10 shadow-sm">
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
