import React from 'react';
import { CombatStats } from '../types';
import { Shield, Zap, Wind, Crosshair, Heart, Sparkles, Brain } from 'lucide-react';

interface StatsPanelProps {
  stats: CombatStats;
  align?: 'left' | 'right';
  compact?: boolean;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats, align = 'left', compact = false }) => {
  const StatItem = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
  }) => (
    <div
      className={`flex items-center justify-between ${compact ? 'p-1' : 'p-2'} rounded-lg ${compact ? '' : 'bg-white/5 border border-white/5'} ${align === 'right' && !compact ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-medium text-slate-400 uppercase`}>{label}</span>
      </div>
      <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold font-mono text-white`}>{value}</span>
    </div>
  );

  return (
    <div
      className={`grid grid-cols-2 gap-x-2 gap-y-1 w-full ${compact ? 'max-w-[180px]' : 'max-w-xs'} animate-fade-in`}
    >
      <StatItem icon={<Zap size={compact ? 12 : 14} />} label="性斗力" value={stats.sexPower} color="text-pink-400" />
      <StatItem
        icon={<Shield size={compact ? 12 : 14} />}
        label="忍耐力"
        value={stats.baseEndurance}
        color="text-green-400"
      />
      <StatItem icon={<Wind size={compact ? 12 : 14} />} label="闪避率" value={stats.evasion} color="text-cyan-400" />
      <StatItem
        icon={<Crosshair size={compact ? 12 : 14} />}
        label="暴击率"
        value={stats.crit}
        color="text-orange-400"
      />
      <StatItem icon={<Heart size={compact ? 12 : 14} />} label="魅力" value={stats.charm} color="text-rose-400" />
      <StatItem icon={<Sparkles size={compact ? 12 : 14} />} label="幸运" value={stats.luck} color="text-yellow-400" />
      <div className="col-span-2">
        <StatItem
          icon={<Brain size={compact ? 12 : 14} />}
          label="意志力"
          value={stats.willpower}
          color="text-purple-400"
        />
      </div>
    </div>
  );
};

export default StatsPanel;
