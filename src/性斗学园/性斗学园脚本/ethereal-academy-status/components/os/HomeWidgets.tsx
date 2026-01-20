import React from 'react';
import { GameState, Quest } from '../../types';
import Icon from '../Icon';
import { GlassCard } from '../ui/GlassCard';

export const HomeWidgets: React.FC<{ state: GameState }> = ({ state }) => {
  const { 角色基础, 核心状态, 任务系统, 位置系统, 物品系统, 时间系统 } = state;

  const weekdayText = (day: number) => {
    const map = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const idx = Math.min(7, Math.max(1, Number(day || 1))) - 1;
    return map[idx];
  };

  return (
    <div className="space-y-4 px-1">
      <GlassCard className="p-3 flex flex-col justify-between h-20 bg-gradient-to-br from-slate-500/10 to-slate-700/10">
        <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider">
          <Icon name="Clock" size={12} />
          <span>时间</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-lg font-bold leading-tight">{时间系统?.日期 || ''}</div>
          <div className="text-sm text-white/70 font-medium">{weekdayText(时间系统?.星期)}</div>
        </div>
      </GlassCard>

      {/* 1. Top Widget: Location & Money & Weather */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-3 flex flex-col justify-between h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider">
            <Icon name="Location" size={12} />
            <span>Location</span>
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">{位置系统.地点名称}</div>
            <div className="text-xs text-white/50">
              {位置系统.楼层}F - {位置系统.坐标}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-3 flex flex-col justify-between h-24 bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
          <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider">
            <Icon name="Money" size={12} />
            <span>Assets</span>
          </div>
          <div className="text-right">
            <div className="text-xl font-mono font-bold text-yellow-100">{物品系统.学园金币.toLocaleString()}</div>
            <div className="text-xs text-white/40">学园币</div>
          </div>
        </GlassCard>
      </div>

      {/* 2. Main Hero: Character Status */}
      <GlassCard className="p-4 bg-glass-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-xs text-brand-primary font-bold border border-brand-primary/30 px-2 py-0.5 rounded inline-block mb-1">
              NO.402
            </div>
            <div className="text-xl font-bold">学员等级 Lv.{角色基础._等级}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Icon name="User" size={20} />
          </div>
        </div>

        {/* Compact Bars */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Icon name="Zap" size={14} className="text-teal-400" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400"
                style={{ width: `${(核心状态.$耐力 / 核心状态.$最大耐力) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="Heart" size={14} className="text-pink-500" />
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500"
                style={{ width: `${(核心状态.$快感 / 核心状态.$最大快感) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Quest Widget */}
      <GlassCard className="p-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-3 opacity-10">
          <Icon name="Quest" size={60} />
        </div>
        <div className="relative z-10">
          <div className="text-xs font-bold text-white/40 mb-1 uppercase">Current Objective</div>
          <div className="font-medium truncate">{任务系统.主线任务.名称}</div>
          <div className="text-xs text-white/60 mt-1 line-clamp-2">{任务系统.主线任务.描述}</div>
        </div>

        <div className="mt-3 flex gap-2">
          {Object.values(任务系统.支线任务)
            .filter((q: Quest) => q.状态 === '进行中')
            .slice(0, 2)
            .map((q: Quest, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            ))}
        </div>
      </GlassCard>

      {/* 4. Notification / Feed Area (To Ensure Scrollability) */}
      <div className="pt-2">
        <h3 className="text-xs font-bold text-white/40 mb-3 px-1 uppercase tracking-widest">System Feed</h3>
        <div className="space-y-2">
          {[
            {
              title: '学生会公告',
              time: '10m ago',
              text: '本周性斗排位赛将在体育馆举行，请各位学员准时参加。',
              type: 'info',
            },
            { title: '账户变动', time: '1h ago', text: '你收到了一笔转账：500 学园币。', type: 'money' },
            { title: '警告', time: '2h ago', text: '检测到心率异常，请注意休息。', type: 'alert' },
            { title: '校园传闻', time: '4h ago', text: '据说旧校舍深夜会有奇怪的声音传出...', type: 'gossip' },
          ].map((item, idx) => (
            <GlassCard key={idx} className="p-3 bg-white/5 border-white/5 flex gap-3">
              <div
                className={`
                    w-1 h-full rounded-full shrink-0
                    ${item.type === 'alert' ? 'bg-red-500' : item.type === 'money' ? 'bg-yellow-500' : 'bg-brand-primary'}
                  `}
              />
              <div>
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-bold text-xs">{item.title}</span>
                  <span className="text-[10px] text-white/30">{item.time}</span>
                </div>
                <div className="text-[11px] text-white/60 leading-snug">{item.text}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
