import { Character, Skill, Item, CombatLogEntry } from './types';

// Mock Effect Generators
const createLog = (msg: string, source: string, type: CombatLogEntry['type'] = 'info'): CombatLogEntry => ({
  id: Math.random().toString(36).substr(2, 9),
  turn: 0, // Assigned at runtime
  message: msg,
  source,
  type,
});

// --- Skills ---

export const PLAYER_SKILLS: Skill[] = [
  {
    id: 's1',
    name: '挑逗言语',
    description: '轻声细语，攻击敌方精神，造成少量快感伤害。',
    cost: 5, // Consumes Endurance
    type: 'attack',
    cooldown: 0,
    currentCooldown: 0,
    effect: (user, target) => {
      const dmg = Math.floor(user.stats.charm * 1.5 + user.stats.sexPower * 0.5);
      target.stats.currentPleasure += dmg;
      return createLog(`${user.name} 使用 [挑逗言语]，消耗体力，造成了 ${dmg} 点快感！`, 'player', 'damage');
    },
  },
  {
    id: 's2',
    name: '绝对领域',
    description: '调整姿态，大幅提升本回合闪避率。',
    cost: 15, // Consumes Endurance
    type: 'buff',
    cooldown: 3,
    currentCooldown: 0,
    effect: (user, target) => {
      return createLog(`${user.name} 展开 [绝对领域]，消耗体力提升闪避！`, 'player', 'info');
    },
  },
  {
    id: 's3',
    name: '必杀·纯爱战神',
    description: '消耗大量体力，造成基于性斗力的巨额伤害。',
    cost: 40, // Consumes Endurance
    type: 'ultimate',
    cooldown: 5,
    currentCooldown: 0,
    effect: (user, target) => {
      const dmg = Math.floor(user.stats.sexPower * 3.5);
      target.stats.currentPleasure += dmg;
      return createLog(`${user.name} 发动 [必杀·纯爱战神]，造成 ${dmg} 点暴击快感！`, 'player', 'critical');
    },
  },
];

export const ENEMY_SKILLS: Skill[] = [
  {
    id: 'e1',
    name: '强硬手段',
    description: '无视防御的粗暴攻击，削减耐力。',
    cost: 0,
    type: 'attack',
    cooldown: 0,
    currentCooldown: 0,
    effect: (user, target) => {
      const dmg = 15;
      target.stats.currentEndurance -= dmg;
      return createLog(`${user.name} 使用 [强硬手段]，你的耐力减少了 ${dmg}！`, 'enemy', 'damage');
    },
  },
  {
    id: 'e2',
    name: '深渊凝视',
    description: '降低对手的耐力。',
    cost: 0,
    type: 'debuff',
    cooldown: 2,
    currentCooldown: 0,
    effect: (user, target) => {
      const dmg = 10;
      target.stats.currentEndurance -= dmg;
      return createLog(`${user.name} 施展 [深渊凝视]，你的耐力被削弱了 ${dmg} 点。`, 'enemy', 'damage');
    },
  },
  {
    id: 'e3',
    name: '触手纠缠',
    description: '造成持续快感。',
    cost: 0,
    type: 'attack',
    cooldown: 3,
    currentCooldown: 0,
    effect: (user, target) => {
      const dmg = 25;
      target.stats.currentPleasure += dmg;
      return createLog(`${user.name} 使用 [触手纠缠]，快感上升了 ${dmg} 点！`, 'enemy', 'damage');
    },
  },
];

// --- Items ---

export const PLAYER_ITEMS: Item[] = [
  {
    id: 'i1',
    name: '强走饮料',
    description: '恢复 30 点耐力。',
    quantity: 3,
    effect: (user, target) => {
      user.stats.currentEndurance = Math.min(user.stats.maxEndurance, user.stats.currentEndurance + 30);
      return createLog(`${user.name} 喝下 [强走饮料]，耐力恢复了。`, 'player', 'heal');
    },
  },
  {
    id: 'i2',
    name: '抑制剂',
    description: '减少 20 点当前快感。',
    quantity: 2,
    effect: (user, target) => {
      user.stats.currentPleasure = Math.max(0, user.stats.currentPleasure - 20);
      return createLog(`${user.name} 注射了 [抑制剂]，身体稍微冷却下来。`, 'player', 'heal');
    },
  },
];

// --- Initial Data ---

export const INITIAL_PLAYER: Character = {
  id: 'player',
  name: '学园偶像',
  avatarUrl: 'https://picsum.photos/400/600?random=1',
  isPlayer: true,
  statusEffects: [],
  items: PLAYER_ITEMS,
  skills: PLAYER_SKILLS,
  stats: {
    maxEndurance: 100,
    currentEndurance: 100,
    maxPleasure: 100,
    currentPleasure: 0,
    willpower: 100,
    baseWillpower: 100,
    climaxCount: 0,
    maxClimaxCount: 3,
    sexPower: 25,
    baseEndurance: 15,
    evasion: 10,
    crit: 5,
    charm: 30,
    luck: 15,
  },
};

export const INITIAL_ENEMY: Character = {
  id: 'enemy',
  name: '风纪委员长',
  avatarUrl: 'https://picsum.photos/400/600?random=2',
  isPlayer: false,
  statusEffects: [],
  items: [],
  skills: ENEMY_SKILLS,
  stats: {
    maxEndurance: 150,
    currentEndurance: 150,
    maxPleasure: 100,
    currentPleasure: 0,
    willpower: 80,
    baseWillpower: 80,
    climaxCount: 0,
    maxClimaxCount: 3,
    sexPower: 20,
    baseEndurance: 20,
    evasion: 5,
    crit: 10,
    charm: 10,
    luck: 5,
  },
};
