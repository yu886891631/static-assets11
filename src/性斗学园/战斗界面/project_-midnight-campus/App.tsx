import React, { useState, useEffect, useCallback } from 'react';
import { Character, TurnState, CombatLogEntry, Skill, Item, StatType } from './types';
import { INITIAL_PLAYER, INITIAL_ENEMY, ENEMY_SKILLS } from './constants';
import ProgressBar from './components/ui/ProgressBar';
import Card from './components/ui/Card';
import StatsPanel from './components/StatsPanel';
import CombatLog from './components/CombatLog';
import BackgroundAmbience from './components/ui/BackgroundAmbience';
import {
  Sword,
  Backpack,
  Flag,
  HeartPulse,
  Brain,
  Zap,
  Activity,
  Terminal,
  FastForward,
  MessageCircle,
  Clock,
} from 'lucide-react';

// Main Component
export default function App() {
  // --- State ---
  const [player, setPlayer] = useState<Character>(INITIAL_PLAYER);
  const [enemy, setEnemy] = useState<Character>(INITIAL_ENEMY);
  const [turnState, setTurnState] = useState<TurnState>({
    currentTurn: 1,
    phase: 'playerInput',
    enemyIntention: null,
    climaxTarget: null,
  });
  const [logs, setLogs] = useState<CombatLogEntry[]>([]);
  const [activeMenu, setActiveMenu] = useState<'main' | 'skills' | 'items'>('main');

  // --- Helpers ---

  const addLog = (message: string, source: string, type: CombatLogEntry['type'] = 'info') => {
    const newLog: CombatLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      turn: turnState.currentTurn,
      message,
      source,
      type,
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Helper to clone character without losing function references (which JSON.stringify does)
  const cloneCharacter = (char: Character): Character => ({
    ...char,
    stats: { ...char.stats },
    skills: char.skills.map(s => ({ ...s })),
    items: char.items.map(i => ({ ...i })),
    statusEffects: [...char.statusEffects],
  });

  // --- Combat Logic ---

  // Enemy AI: Determine next move (Telegraphing)
  const determineEnemyIntention = useCallback(() => {
    // Simple AI: Random skill for now
    const skill = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
    setTurnState(prev => ({ ...prev, enemyIntention: skill }));
  }, [enemy.skills]);

  // Initial setup
  useEffect(() => {
    addLog(`遭遇了 ${enemy.name} !`, 'system');
    determineEnemyIntention();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check Win/Loss conditions & Climax Logic
  useEffect(() => {
    // Don't check if we are already handling a climax or game over
    if (turnState.phase === 'climaxResolution' || turnState.phase === 'victory' || turnState.phase === 'defeat') return;

    // 1. Check Endurance (Instant Loss - Exhaustion)
    if (enemy.stats.currentEndurance <= 0) {
      setTurnState(prev => ({ ...prev, phase: 'victory' }));
      addLog('对手体力耗尽！战斗胜利！', 'system', 'critical');
      return;
    }
    if (player.stats.currentEndurance <= 0) {
      setTurnState(prev => ({ ...prev, phase: 'defeat' }));
      addLog('你体力耗尽... 败北。', 'system', 'damage');
      return;
    }

    // 2. Check Pleasure / Climax - Enemy
    if (enemy.stats.currentPleasure >= enemy.stats.maxPleasure) {
      setTurnState(prev => ({ ...prev, phase: 'climaxResolution', climaxTarget: 'enemy' }));
      return;
    }

    // 3. Check Pleasure / Climax - Player
    if (player.stats.currentPleasure >= player.stats.maxPleasure) {
      setTurnState(prev => ({ ...prev, phase: 'climaxResolution', climaxTarget: 'player' }));
      return;
    }
  }, [
    player.stats.currentPleasure,
    player.stats.currentEndurance,
    enemy.stats.currentPleasure,
    enemy.stats.currentEndurance,
    turnState.phase,
  ]);

  // Handle Climax Resolution Buttons
  const handleClimaxResolution = (action: 'skip' | 'process') => {
    const targetIsEnemy = turnState.climaxTarget === 'enemy';
    const char = targetIsEnemy ? enemy : player;

    // 1. Flavor Text
    if (action === 'process') {
      const texts = [
        `${char.name} 身体弓起，眼神失焦，无法抑制地颤抖着...`,
        `剧烈的快感如潮水般淹没了 ${char.name} 的理智...`,
        `${char.name} 发出了甜美的悲鸣，身体彻底瘫软下来...`,
      ];
      const randomText = texts[Math.floor(Math.random() * texts.length)];
      addLog(`>>> [过程] ${randomText}`, 'system', 'critical');
    } else {
      addLog(`${char.name} 达到了高潮！ (过程略)`, 'system', 'info');
    }

    // 2. Update Stats (Reset Pleasure, Inc Count)
    // Use clone helper to preserve methods
    const newChar = cloneCharacter(char);
    newChar.stats.currentPleasure = 0;
    newChar.stats.climaxCount += 1;

    if (targetIsEnemy) setEnemy(newChar);
    else setPlayer(newChar);

    // 3. Check Game Over
    if (newChar.stats.climaxCount >= newChar.stats.maxClimaxCount) {
      setTurnState(prev => ({ ...prev, phase: targetIsEnemy ? 'victory' : 'defeat', climaxTarget: null }));
      addLog(targetIsEnemy ? '对手彻底崩溃！战斗胜利！' : '你彻底崩溃... 败北。', 'system', 'critical');
      return;
    }

    // 4. Resume Combat
    // If Enemy climaxed (Player turn caused it), go to Enemy Turn
    // If Player climaxed (Enemy turn caused it), go to Player Turn (New Round)
    if (targetIsEnemy) {
      // It was Player's attack that caused this. Next is Enemy's turn.
      setTimeout(() => handleEnemyTurn(), 500);
    } else {
      // It was Enemy's attack that caused this. Next is Player's turn (New Round).
      setTimeout(() => {
        setTurnState(prev => ({
          ...prev,
          currentTurn: prev.currentTurn + 1,
          phase: 'playerInput',
          climaxTarget: null,
        }));
        determineEnemyIntention();

        // Passive Regen & Cooldowns
        setPlayer(p => {
          const newP = cloneCharacter(p);
          newP.stats.currentEndurance = Math.min(newP.stats.maxEndurance, newP.stats.currentEndurance + 5);

          // Decrement Cooldowns
          newP.skills.forEach(s => {
            if (s.currentCooldown > 0) s.currentCooldown--;
          });

          return newP;
        });

        addLog(`--- 第 ${turnState.currentTurn + 1} 回合 ---`, 'system', 'info');
      }, 500);
    }
  };

  // Handle Player Skill Use
  const handlePlayerSkill = (skill: Skill) => {
    if (turnState.phase !== 'playerInput') return;

    // Check Cooldown
    if (skill.currentCooldown > 0) {
      addLog('技能冷却中！', 'system', 'info');
      return;
    }

    // Check cost (Using Endurance now as "WP")
    if (skill.cost > player.stats.currentEndurance) {
      addLog('耐力不足，无法使用该技能！', 'system', 'info');
      return;
    }

    // Process Player Action
    setTurnState(prev => ({ ...prev, phase: 'processing' }));

    // Create copies using cloneCharacter instead of JSON methods
    const nextPlayer = cloneCharacter(player);
    const nextEnemy = cloneCharacter(enemy);

    // Deduct Cost
    nextPlayer.stats.currentEndurance -= skill.cost;

    // Set Cooldown
    const skillIndex = nextPlayer.skills.findIndex(s => s.id === skill.id);
    if (skillIndex !== -1) {
      nextPlayer.skills[skillIndex].currentCooldown = nextPlayer.skills[skillIndex].cooldown;
    }

    // Apply Effect
    const log = skill.effect(nextPlayer, nextEnemy);
    addLog(log.message, log.source, log.type);

    // Commit State
    setPlayer(nextPlayer);
    setEnemy(nextEnemy);

    // Flow Control
    // If climax is triggered, we DO NOT schedule next turn here. The useEffect will catch it.
    if (nextEnemy.stats.currentPleasure < nextEnemy.stats.maxPleasure) {
      setTimeout(() => {
        handleEnemyTurn();
      }, 1000);
    }
  };

  // Handle Player Item Use
  const handlePlayerItem = (item: Item) => {
    if (turnState.phase !== 'playerInput' || item.quantity <= 0) return;

    setTurnState(prev => ({ ...prev, phase: 'processing' }));

    const nextPlayer = cloneCharacter(player);
    const nextEnemy = cloneCharacter(enemy);

    const itemIndex = nextPlayer.items.findIndex((i: Item) => i.id === item.id);
    if (itemIndex > -1) {
      nextPlayer.items[itemIndex].quantity -= 1;
    }

    const log = item.effect(nextPlayer, nextEnemy);
    addLog(log.message, log.source, log.type);

    setPlayer(nextPlayer);
    setEnemy(nextEnemy);

    setActiveMenu('main');

    // Flow Control
    // Note: Items typically heal self or damage enemy. Check both.
    if (
      nextEnemy.stats.currentPleasure < nextEnemy.stats.maxPleasure &&
      nextPlayer.stats.currentPleasure < nextPlayer.stats.maxPleasure
    ) {
      setTimeout(() => {
        handleEnemyTurn();
      }, 1000);
    }
  };

  // Handle Enemy Turn
  const handleEnemyTurn = () => {
    setTurnState(prev => ({ ...prev, phase: 'enemyAction', climaxTarget: null }));

    setTimeout(() => {
      setEnemy(currentEnemy => {
        setPlayer(currentPlayer => {
          if (!turnState.enemyIntention) return currentPlayer;

          // AI Logic execution
          const nextEnemyChar = cloneCharacter(currentEnemy);
          const nextPlayerChar = cloneCharacter(currentPlayer);

          // Re-find skill to execute (telegraphed)
          const skillToUse =
            nextEnemyChar.skills.find((s: Skill) => s.id === turnState.enemyIntention?.id) || nextEnemyChar.skills[0];

          if (skillToUse && typeof skillToUse.effect === 'function') {
            const log = skillToUse.effect(nextEnemyChar, nextPlayerChar);
            addLog(log.message, log.source, log.type);
          } else {
            console.error('Skill effect missing', skillToUse);
            addLog('对手似乎犹豫了...', 'system', 'info');
          }

          // Flow Control
          // If player triggers climax, STOP. useEffect will handle phase switch.
          if (nextPlayerChar.stats.currentPleasure < nextPlayerChar.stats.maxPleasure) {
            setTimeout(() => {
              setTurnState(prev => ({
                ...prev,
                currentTurn: prev.currentTurn + 1,
                phase: 'playerInput',
              }));
              determineEnemyIntention();

              // Passive Regen & Cooldowns
              setPlayer(p => {
                const regenPlayer = cloneCharacter(p);
                regenPlayer.stats.currentEndurance = Math.min(
                  regenPlayer.stats.maxEndurance,
                  regenPlayer.stats.currentEndurance + 5,
                );

                // Decrement Cooldowns
                regenPlayer.skills.forEach(s => {
                  if (s.currentCooldown > 0) s.currentCooldown--;
                });

                return regenPlayer;
              });

              addLog(`--- 第 ${turnState.currentTurn + 1} 回合 ---`, 'system', 'info');
            }, 1000);
          }

          return nextPlayerChar;
        });
        return currentEnemy;
      });
    }, 1000);
  };

  // --- Render Helpers ---

  const renderCharacter = (char: Character, isEnemy: boolean) => (
    <div className="flex-1 min-w-0 flex flex-col items-center relative max-w-[45%] lg:max-w-md transition-all duration-300">
      {/* Name Badge */}
      <div
        className={`
        mb-2 px-3 py-1 lg:px-6 lg:py-2 rounded-full border border-white/10 backdrop-blur-md 
        ${isEnemy ? 'bg-rose-950/60 text-rose-200' : 'bg-cyan-950/60 text-cyan-200'}
        shadow-lg flex items-center gap-2 z-20 max-w-full
      `}
      >
        <span className="font-bold text-xs lg:text-lg tracking-wider truncate">{char.name}</span>
        {isEnemy && turnState.phase === 'playerInput' && turnState.enemyIntention && (
          <div className="hidden lg:flex absolute -top-8 right-0 bg-yellow-500/10 border border-yellow-500/50 text-yellow-200 text-xs px-2 py-1 rounded animate-pulse-slow items-center whitespace-nowrap">
            <span className="mr-1">⚠️</span>
            预告: {turnState.enemyIntention.name}
          </div>
        )}
      </div>

      {/* Avatar with Hover Stats */}
      <div className="relative group w-full aspect-square max-w-[160px] lg:max-w-[280px] mb-2 lg:mb-6 cursor-help">
        <div
          className={`absolute inset-0 rounded-2xl blur-xl lg:blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${isEnemy ? 'bg-rose-600' : 'bg-cyan-600'}`}
        ></div>

        {/* The Image */}
        <img
          src={char.avatarUrl}
          alt={char.name}
          className={`
            w-full h-full object-cover rounded-xl lg:rounded-2xl border-2 shadow-2xl z-10 relative transition-all duration-300
            ${isEnemy ? 'border-rose-500/30' : 'border-cyan-500/30'}
            ${turnState.phase === 'processing' && !isEnemy ? 'animate-pulse' : ''}
            ${turnState.phase === 'enemyAction' && isEnemy ? 'scale-105' : ''}
            ${turnState.phase === 'climaxResolution' && turnState.climaxTarget === (isEnemy ? 'enemy' : 'player') ? 'brightness-125 sepia-0 saturate-200 animate-pulse' : ''}
            group-hover:brightness-50 group-hover:blur-[2px]
          `}
        />

        {/* Mobile Warning Indicator (Icon only) */}
        {isEnemy && turnState.phase === 'playerInput' && turnState.enemyIntention && (
          <div className="lg:hidden absolute -top-2 -right-2 z-30 bg-yellow-500 text-black rounded-full p-1 animate-pulse border border-yellow-200 shadow-lg">
            <div className="text-[10px] font-bold">!</div>
          </div>
        )}

        {/* Stats Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-2xl bg-black/60 backdrop-blur-sm border border-white/10">
          <div className="text-[10px] lg:text-xs text-white/70 uppercase tracking-widest mb-1 lg:mb-2 font-bold">
            详细属性
          </div>
          <StatsPanel stats={char.stats} compact />
        </div>
      </div>

      {/* Main Bars */}
      <div className="w-full space-y-1 lg:space-y-2 px-0 lg:px-4">
        {/* Endurance is now the "WP" resource */}
        <ProgressBar
          value={char.stats.currentEndurance}
          max={char.stats.maxEndurance}
          color="green"
          label="体力"
          showValue={true}
          icon={<Activity size={10} />}
          size="sm"
        />
        {/* Pleasure is the "HP" (Damage) bar */}
        <ProgressBar
          value={char.stats.currentPleasure}
          max={char.stats.maxPleasure}
          color="pink"
          label="快感"
          showValue={true}
          icon={<HeartPulse size={10} />}
          size="sm"
        />
        <div className="w-full flex gap-2">
          <div className="flex-1">
            <ProgressBar
              value={char.stats.climaxCount}
              max={char.stats.maxClimaxCount}
              color="purple"
              label="高潮"
              showValue={true}
              icon={<Zap size={10} />}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#09090b] font-sans text-slate-200 overflow-x-hidden selection:bg-neonblue/30">
      {/* Background Ambience */}
      <BackgroundAmbience />

      {/* Top Header */}
      <header className="relative z-20 flex justify-between items-center p-4 lg:p-6 bg-transparent">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="flex items-center justify-center text-white/80">
            <Terminal className="w-5 h-5 lg:w-6 lg:h-6 text-purple-400 mr-1 lg:mr-2" />
          </div>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              性斗学园
            </h1>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-xl lg:text-2xl font-mono font-bold text-white/90">TURN {turnState.currentTurn}</div>
          <div className="text-[10px] lg:text-xs text-slate-500 uppercase tracking-widest">{turnState.phase}</div>
        </div>
      </header>

      {/* Main Battle Area */}
      {/* Responsive layout: flex-row even on mobile, just scale down */}
      <main className="relative z-10 container mx-auto px-2 lg:px-4 py-4 lg:py-8 pb-96 flex flex-row items-start justify-center gap-2 lg:gap-16 w-full max-w-6xl">
        {renderCharacter(player, false)}

        {/* Responsive VS Divider */}
        <div className="flex flex-col items-center justify-center opacity-30 pt-12 lg:pt-24 shrink-0 w-[10%]">
          <div className="h-12 lg:h-32 w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <span className="my-2 lg:my-4 font-black text-xl lg:text-4xl italic font-mono text-white/50">VS</span>
          <div className="h-12 lg:h-32 w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>

        {renderCharacter(enemy, true)}
      </main>

      {/* Climax Resolution Modal Overlay - Appears in the center or above footer */}
      {turnState.phase === 'climaxResolution' && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-purple-900/90 to-black border border-purple-500/50 rounded-2xl p-6 md:p-10 max-w-md w-full shadow-[0_0_50px_rgba(168,85,247,0.3)] text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 pointer-events-none"></div>

            <HeartPulse className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />

            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">高潮降临</h2>
            <p className="text-purple-200 mb-8 text-sm md:text-base">
              {turnState.climaxTarget === 'enemy' ? enemy.name : player.name} 已经达到了极限...
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleClimaxResolution('process')}
                className="group relative w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2 overflow-hidden"
              >
                <MessageCircle className="w-5 h-5" />
                <span>输出过程</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>

              <button
                onClick={() => handleClimaxResolution('skip')}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/5"
              >
                <FastForward className="w-5 h-5" />
                <span>跳过过程</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interface - Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full z-30 bg-[#09090b]/90 border-t border-white/5 backdrop-blur-xl pb-6 pt-2 px-4 lg:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Flex-col-reverse for mobile: Menu on bottom (easier to reach), Log on top */}
        <div className="container mx-auto flex flex-col-reverse lg:flex-row gap-4 h-full">
          {/* Combat Log */}
          <div className="w-full lg:flex-1 lg:max-w-xl relative">
            <CombatLog logs={logs} />
          </div>

          {/* Action Menu */}
          <div className="w-full flex-1 flex flex-col gap-2">
            {/* Menu Headers */}
            {turnState.phase === 'playerInput' ? (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setActiveMenu('main')}
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${activeMenu === 'main' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}
                >
                  行动
                </button>
                <div className="h-px w-8 bg-white/20"></div>
                <span className="text-xs text-slate-400">请选择你的行动</span>
              </div>
            ) : (
              <div className="h-8 flex items-center text-slate-500 text-sm animate-pulse">
                {turnState.phase === 'climaxResolution' ? '等待抉择...' : '等待行动结算...'}
              </div>
            )}

            {/* Grid Container with Slide Transition */}
            <div className="flex-1 relative overflow-hidden">
              {turnState.phase !== 'playerInput' && turnState.phase !== 'climaxResolution' && (
                <div className="absolute inset-0 z-10 bg-midnight/50 backdrop-blur-sm flex items-center justify-center rounded-xl border border-white/5 transition-opacity duration-300">
                  <span className="text-white/50 font-mono tracking-widest">计算中...</span>
                </div>
              )}

              {/* Animated Content Wrapper */}
              <div key={activeMenu} className="animate-slide-up h-full">
                {activeMenu === 'main' && (
                  <div className="flex gap-2 h-full w-full">
                    <Card
                      hover
                      onClick={() => setActiveMenu('skills')}
                      className="flex-1 min-w-0 flex flex-col items-center justify-center gap-2 group border-neonblue/20"
                    >
                      <Sword className="w-8 h-8 text-neonblue group-hover:scale-110 transition-transform" />
                      <span className="font-bold whitespace-nowrap">战斗技能</span>
                    </Card>
                    <Card
                      hover
                      onClick={() => setActiveMenu('items')}
                      className="flex-1 min-w-0 flex flex-col items-center justify-center gap-2 group"
                    >
                      <Backpack className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="font-bold whitespace-nowrap">物品背包</span>
                    </Card>
                    <Card
                      hover
                      onClick={() => addLog('不能逃跑！这是尊严之战！', 'system')}
                      className="flex-1 min-w-0 flex flex-col items-center justify-center gap-2 group border-red-500/20"
                    >
                      <Flag className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="font-bold whitespace-nowrap">投降</span>
                    </Card>
                  </div>
                )}

                {activeMenu === 'skills' && (
                  <div className="flex gap-2 h-full w-full overflow-x-auto no-scrollbar pb-1">
                    {player.skills.map(skill => {
                      const isCooldown = skill.currentCooldown > 0;
                      const canAfford = player.stats.currentEndurance >= skill.cost;
                      const isDisabled = isCooldown || !canAfford;

                      return (
                        <Card
                          key={skill.id}
                          hover={!isDisabled}
                          onClick={() => !isDisabled && handlePlayerSkill(skill)}
                          className={`flex-1 min-w-[100px] flex flex-col justify-between group relative overflow-hidden ${isDisabled ? 'opacity-60 grayscale-[0.5] border-white/5 bg-slate-900/50' : ''}`}
                        >
                          {isCooldown && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-[2px]">
                              {/* Diagonal stripes pattern */}
                              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]"></div>
                              <div className="flex flex-col items-center relative z-10">
                                <Clock className="w-5 h-5 text-neonblue mb-1 animate-pulse" />
                                <span className="text-2xl font-black text-white tracking-tighter">
                                  {skill.currentCooldown}
                                  <span className="text-[10px] ml-0.5 align-top opacity-60 font-normal">T</span>
                                </span>
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <span
                                className={`font-bold truncate mr-1 text-sm ${isDisabled ? 'text-slate-400' : 'text-neonblue'}`}
                              >
                                {skill.name}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-1 rounded whitespace-nowrap ${canAfford ? 'bg-white/10 text-slate-300' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}
                              >
                                {skill.cost} SP
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
                              {skill.description}
                            </p>
                          </div>
                          <div
                            className={`mt-2 text-[10px] uppercase font-bold transition-colors ${isDisabled ? 'text-slate-600' : 'text-slate-600 group-hover:text-neonblue'}`}
                          >
                            {skill.type}
                          </div>
                        </Card>
                      );
                    })}
                    <button
                      onClick={() => setActiveMenu('main')}
                      className="bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-sm font-bold text-slate-400 min-w-[60px]"
                    >
                      返回
                    </button>
                  </div>
                )}

                {activeMenu === 'items' && (
                  <div className="flex gap-2 h-full w-full overflow-x-auto no-scrollbar pb-1">
                    {player.items.map(item => (
                      <Card
                        key={item.id}
                        hover
                        onClick={() => handlePlayerItem(item)}
                        className={`flex-1 min-w-[100px] flex flex-col justify-between group ${item.quantity === 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-emerald-400 truncate mr-1 text-sm">{item.name}</span>
                            <span className="text-[10px] font-mono bg-emerald-900/40 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-200 whitespace-nowrap">
                              x{item.quantity}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                        </div>
                      </Card>
                    ))}
                    <button
                      onClick={() => setActiveMenu('main')}
                      className="bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-sm font-bold text-slate-400 min-w-[60px]"
                    >
                      返回
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for Victory/Defeat */}
        {(turnState.phase === 'victory' || turnState.phase === 'defeat') && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center animate-fade-in">
            <div className="text-center">
              <h2
                className={`text-6xl md:text-8xl font-black mb-4 tracking-tighter ${turnState.phase === 'victory' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-600' : 'text-slate-600'}`}
              >
                {turnState.phase === 'victory' ? '完全胜利' : '彻底败北'}
              </h2>
              <p className="text-xl text-slate-300 font-light tracking-widest mb-8">战斗结束</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                重新开始
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
