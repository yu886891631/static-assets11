import React, { useMemo } from 'react';
import { CharacterData, GameAttributes, INITIAL_ATTRIBUTES } from '../types';
import { DIFFICULTY_POINTS, MAX_STATS } from '../constants';
import { Plus, Minus, Zap, Heart, Star, Sparkles, TrendingUp, Shield } from 'lucide-react';

interface Props {
  data: CharacterData;
  updateData: (fields: Partial<CharacterData>) => void;
}

const Step3_Attributes: React.FC<Props> = ({ data, updateData }) => {
  const totalPointsAvailable = DIFFICULTY_POINTS[data.difficulty];

  // Calculate points used based on difference from INITIAL_ATTRIBUTES
  // Cost Logic:
  // Level: 1 pt = 1 level
  // Potential: 5 pts = 0.1 potential (Expensive!) -> Let's make it 10 pts = 0.5 potential
  // Charm/Luck: 1 pt = 1 val
  // Max Stamina/Pleasure: 1 pt = 5 val

  const pointsUsed = useMemo(() => {
    let used = 0;
    used += (data.attributes._等级 - INITIAL_ATTRIBUTES._等级) * 1;
    used += (data.attributes.$潜力 - INITIAL_ATTRIBUTES.$潜力) * 20; // 0.1 costs 2 points essentially
    used += (data.attributes._魅力 - INITIAL_ATTRIBUTES._魅力) * 1;
    used += (data.attributes._幸运 - INITIAL_ATTRIBUTES._幸运) * 1;
    used += (data.attributes._最大耐力 - INITIAL_ATTRIBUTES._最大耐力) / 5;
    used += (data.attributes._最大快感 - INITIAL_ATTRIBUTES._最大快感) / 5;
    return Math.max(0, Math.ceil(used));
  }, [data.attributes]);

  const remaining = totalPointsAvailable - pointsUsed;

  const handleStatChange = (key: keyof GameAttributes, delta: number) => {
    let cost = 1;
    let valueChange = delta;

    if (key === '_最大耐力' || key === '_最大快感') {
      cost = 1;
      valueChange = delta * 5;
    } else if (key === '$潜力') {
      cost = 2; // 2 points for 0.1 potential
      valueChange = delta * 0.1;
    }

    // Check if we can afford it (if adding)
    if (delta > 0 && remaining < cost) return;

    const currentVal = data.attributes[key];
    const maxVal = MAX_STATS[key as keyof typeof MAX_STATS] || 9999;
    const minVal = INITIAL_ATTRIBUTES[key];

    // Precision handling for floats
    let newVal = currentVal + valueChange;
    if (key === '$潜力') newVal = parseFloat(newVal.toFixed(1));

    if (newVal <= maxVal && newVal >= minVal) {
      updateData({
        attributes: {
          ...data.attributes,
          [key]: newVal,
        },
      });
    }
  };

  const StatRow = ({
    label,
    statKey,
    icon: Icon,
    color,
    costText,
  }: {
    label: string;
    statKey: keyof GameAttributes;
    icon: any;
    color: string;
    costText: string;
  }) => (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-black/20 ${color}`}>
          <Icon size={18} />
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-200">{label}</span>
          <span className="text-xs text-gray-500">{costText}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleStatChange(statKey, -1)}
          disabled={data.attributes[statKey] <= INITIAL_ATTRIBUTES[statKey]}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus size={14} />
        </button>

        <span className="w-12 text-center font-mono font-bold text-lg text-white">{data.attributes[statKey]}</span>

        <button
          onClick={() => handleStatChange(statKey, 1)}
          disabled={remaining <= 0} // Simplify check, real check in handler
          className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-white shadow-lg shadow-pink-500/20 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-4 rounded-xl border border-white/10">
        <div className="text-sm text-gray-300">
          <p>
            当前难度: <span className="text-white font-bold">{data.difficulty}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">初始点数: {totalPointsAvailable}</p>
        </div>
        <div className="text-right">
          <span className="block text-xs text-gray-400 uppercase tracking-wider">剩余点数</span>
          <span className={`text-3xl font-bold ${remaining === 0 ? 'text-gray-500' : 'text-secondary animate-pulse'}`}>
            {remaining}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatRow label="初始等级" statKey="_等级" icon={TrendingUp} color="text-yellow-400" costText="1点 = 1级" />
        <StatRow label="潜力资质" statKey="$潜力" icon={Star} color="text-purple-400" costText="2点 = 0.1潜力" />
        <StatRow label="最大耐力" statKey="_最大耐力" icon={Shield} color="text-green-400" costText="1点 = 5耐力" />
        <StatRow label="最大快感" statKey="_最大快感" icon={Heart} color="text-pink-400" costText="1点 = 5快感" />
        <StatRow label="个人魅力" statKey="_魅力" icon={Sparkles} color="text-rose-400" costText="1点 = 1魅力" />
        <StatRow label="幸运值" statKey="_幸运" icon={Zap} color="text-cyan-400" costText="1点 = 1幸运" />
      </div>
    </div>
  );
};

export default Step3_Attributes;
