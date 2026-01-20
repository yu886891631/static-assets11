export type StatType = 'sexPower' | 'endurance' | 'evasion' | 'crit' | 'charm' | 'luck' | 'willpower';

export interface CombatStats {
  maxEndurance: number; // _最大耐力
  currentEndurance: number; // _耐力
  maxPleasure: number; // _最大快感
  currentPleasure: number; // _快感
  willpower: number; // _意志力
  climaxCount: number; // $高潮次数
  maxClimaxCount: number; // $高潮次数上限

  // Seven Core Stats
  sexPower: number; // $性斗力
  baseEndurance: number; // $忍耐力 (Resistance/Defense)
  evasion: number; // $闪避率
  crit: number; // $暴击率
  charm: number; // $魅力
  luck: number; // $幸运
  baseWillpower: number; // $意志力 (Stat base)
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number; // Costs Willpower or Stamina
  type: 'attack' | 'heal' | 'buff' | 'debuff' | 'ultimate';
  cooldown: number;
  currentCooldown: number;
  effect: (user: Character, target: Character) => CombatLogEntry;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  effect: (user: Character, target: Character) => CombatLogEntry;
}

export interface Character {
  id: string;
  name: string;
  avatarUrl: string; // URL for sprite
  stats: CombatStats;
  skills: Skill[];
  items: Item[]; // Only player usually uses items, but good for type safety
  isPlayer: boolean;
  statusEffects: StatusEffect[];
}

export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  icon: string;
  type: 'buff' | 'debuff';
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  message: string;
  source: string; // 'player' | 'enemy' | 'system'
  type: 'damage' | 'heal' | 'info' | 'critical';
}

export interface TurnState {
  currentTurn: number;
  phase: 'playerInput' | 'processing' | 'enemyAction' | 'victory' | 'defeat' | 'climaxResolution';
  enemyIntention: Skill | null; // For telegraphing
  climaxTarget: 'player' | 'enemy' | null; // Track who is climaxing
}
