import React, { useEffect, useRef, useState } from 'react';
import { CombatLogEntry } from '../types';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
}

const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Auto-scroll only when expanded
  useEffect(() => {
    if (isExpanded) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  return (
    <div
      className={`
      relative bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-inner overflow-hidden transition-all duration-300
      ${isExpanded ? 'h-48' : 'h-12'}
    `}
    >
      {/* Header / Toggle Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center justify-between px-3 cursor-pointer hover:bg-white/10 transition-colors z-10"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <MessageSquare size={12} />
          <span>战斗日志</span>
        </div>
        <div className="text-slate-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</div>
      </div>

      {/* Content Area */}
      <div className={`pt-10 pb-2 px-4 h-full overflow-y-auto ${!isExpanded ? 'opacity-50' : ''}`}>
        {/* If collapsed, show the last message in a specific way or just let the scroll hide it? 
             Better: when collapsed, just hide the list and maybe show a marquee or nothing.
             For this design, changing height is enough, but let's show the latest log if collapsed.
         */}

        {!isExpanded && logs.length > 0 && (
          <div className="absolute top-8 left-4 right-4 truncate text-sm text-slate-300">
            <span className="opacity-50 text-xs mr-2">[{logs[logs.length - 1].turn}]</span>
            {logs[logs.length - 1].message}
          </div>
        )}

        {/* Full List */}
        <div className={!isExpanded ? 'invisible' : ''}>
          {logs.length === 0 && <p className="text-slate-500 text-center italic mt-10">战斗即将开始...</p>}
          {logs.map(log => (
            <div
              key={log.id}
              className={`
                animate-slide-up 
                pb-1 border-b border-white/5 last:border-0 mb-1
                text-sm font-mono
                ${log.type === 'critical' ? 'text-yellow-400 font-bold' : ''}
                ${log.type === 'damage' ? 'text-red-300' : ''}
                ${log.type === 'heal' ? 'text-green-300' : ''}
                ${log.type === 'info' ? 'text-slate-300' : ''}
                `}
            >
              <span className="opacity-50 text-xs mr-2">[{log.turn}]</span>
              {log.message}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default CombatLog;
