/**
 * 战斗界面类型定义
 * 与MVU变量结构对应
 */

export type StatType = 'sexPower' | 'endurance' | 'evasion' | 'crit' | 'charm' | 'luck';

/** 战斗属性 - 对应MVU变量（已移除意志力相关字段） */
export interface CombatStats {
  maxEndurance: number; // 核心状态._最大耐力
  currentEndurance: number; // 核心状态._耐力
  maxPleasure: number; // 核心状态._最大快感
  currentPleasure: number; // 核心状态._快感
  climaxCount: number; // 性斗系统.$高潮次数
  maxClimaxCount: number; // 性斗系统.胜负规则.高潮次数上限

  // 核心属性
  sexPower: number; // 性斗系统.$实时性斗力
  baseEndurance: number; // 性斗系统.$实时忍耐力
  evasion: number; // 核心状态.$闪避率
  crit: number; // 核心状态.$暴击率
  charm: number; // 核心状态._魅力
  luck: number; // 核心状态._幸运
  level: number; // 角色基础._等级 / 对手等级
}

/** 技能伤害来源（已移除意志力） */
export enum DamageSource {
  SEX_POWER = 'sex_power',
  CHARM = 'charm',
  LUCK = 'luck',
  FIXED = 'fixed',
  TARGET_PLEASURE = 'target_pleasure', // 新增：目标快感
}

/** 技能类型 */
export enum SkillType {
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  CHARM = 'charm',
  SUPPORT = 'support',
  CONTROL = 'control',
  ULTIMATE = 'ultimate',
}

/** Buff类型（已移除意志力下降） */
export enum BuffType {
  ATK_UP = 'atk_up',
  DEF_UP = 'def_up',
  ATK_DOWN = 'atk_down',
  DEF_DOWN = 'def_down',
  SENSITIVE = 'sensitive',
  SILENCE = 'silence',
  BIND = 'bind',
  DODGE_UP = 'dodge_up',
  DODGE_DOWN = 'dodge_down',
  CRIT_UP = 'crit_up',
  CRIT_DOWN = 'crit_down',
  LUCK_DOWN = 'luck_down',
  CHARM_DOWN = 'charm_down',
  FOCUS = 'focus',
  SHAME = 'shame',
  HEAT = 'heat',
  FEAR = 'fear',
  DOT_LUST = 'dot_lust',
  REGEN = 'regen',
}

/** Buff效果 */
export interface BuffEffect {
  type: BuffType;
  value: number;
  isPercent: boolean;
  duration: number;
  stackable: boolean;
  maxStacks?: number;
}

/** 伤害公式组件 */
export interface DamageComponent {
  source: DamageSource;
  coefficient: number;
  baseValue: number;
}

/** 技能数据 */
export interface SkillData {
  id: string;
  name: string;
  description: string;
  effectDescription: string;
  icon?: string;
  type: SkillType;
  staminaCost: number;
  cooldown: number;
  castTime: number;
  damageFormula: DamageComponent[];
  accuracy: number;
  critModifier: number;
  buffs: BuffEffect[];
  canBeReflected: boolean;
  hitCount: number;
  voiceLine?: string;
}

/** 技能实例 (运行时) */
export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: SkillType;
  cooldown: number;
  currentCooldown: number;
  data: SkillData;
}

/** 物品 */
export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  effect: (user: Character, target: Character) => CombatLogEntry;
  // 物品数值信息（用于显示）
  staminaRestore?: number;
  pleasureReduce?: number;
  pleasureIncrease?: number;
  bonuses?: Record<string, number>; // 临时buff的加成属性
}

/** 角色 */
export interface Character {
  id: string;
  name: string;
  avatarUrl: string;
  stats: CombatStats;
  skills: Skill[];
  items: Item[];
  isPlayer: boolean;
  statusEffects: StatusEffect[];
}

/** 状态效果 (运行时) */
export interface StatusEffect {
  id: string;
  name: string;
  duration: number;
  icon: string;
  effect: BuffEffect;
  type: 'buff' | 'debuff';
}

/** 战斗日志条目 */
export interface CombatLogEntry {
  id: string;
  turn: number;
  message: string;
  source: string;
  type: 'damage' | 'heal' | 'info' | 'critical' | 'buff';
}

/** 回合状态 */
export interface TurnState {
  currentTurn: number;
  phase: 'playerInput' | 'processing' | 'enemyAction' | 'victory' | 'defeat' | 'climaxResolution';
  enemyIntention: Skill | null;
  climaxTarget: 'player' | 'enemy' | null;
}

/** MVU数据结构 - 对应新的Schema */
export interface MvuStatData {
  角色基础: {
    _等级: number;
    经验值: number;
    声望: number;
    _段位: string;
    段位积分: number;
  };
  核心状态: {
    $属性点: number;
    $技能点: number;
    $最大耐力: number;
    $耐力: number;
    $最大快感: number;
    $快感: number;
    堕落度: number;
    _潜力: number;
    _魅力: number;
    $基础魅力: number;
    _幸运: number;
    $基础幸运: number;
    $基础性斗力: number;
    $基础忍耐力: number;
    _闪避率: number;
    $基础闪避率: number;
    _暴击率: number;
    $基础暴击率: number;
    // 已移除意志力相关字段
  };
  临时状态: {
    状态列表: Record<string, number>;
    加成统计: BonusStats;
  };
  永久状态: {
    状态列表: string[];
    加成统计: BonusStats;
  };
  性斗系统: {
    对手名称: string;
    性斗类型: string;
    胜负规则: {
      高潮次数上限: number;
      允许认输: boolean;
    };
    当前回合: number;
    行动日志: Record<string, string>;
    高潮次数: number;
    实时性斗力: number;
    实时忍耐力: number;
    // 对手属性
    对手魅力: number;
    对手幸运: number;
    对手闪避率: number;
    对手暴击率: number;
    对手等级: number; // 新增
    对手耐力: number;
    对手最大耐力: number;
    对手快感: number;
    对手最大快感: number;
    对手高潮次数: number;
    对手性斗力: number;
    对手忍耐力: number;
    对手临时状态: {
      状态列表: Record<string, number>;
      加成统计: BonusStats;
    };
    对手技能冷却: Record<string, number>;
    对手可用技能: Record<string, any>;
    战斗物品: Record<string, number>;
  };
  物品系统: {
    学园金币: number;
    背包: Record<string, any>;
    _装备栏: {
      主装备: { 名称: string; 等级: string; 加成属性: BonusStats; 描述: string };
      副装备: { 名称: string; 等级: string; 加成属性: BonusStats; 描述: string };
      饰品1: { 名称: string; 等级: string; 加成属性: BonusStats; 描述: string };
      饰品2: { 名称: string; 等级: string; 加成属性: BonusStats; 描述: string };
      特殊装备: { 名称: string; 等级: string; 加成属性: BonusStats; 描述: string };
    };
    装备总加成: BonusStats;
  };
  技能系统: {
    主动技能: Record<string, any>;
  };
  关系系统: {
    在场人物: string[];
    [key: string]: any; // 动态关系字段
  };
  任务系统: {
    主线任务: {
      名称: string;
      描述: string;
      状态: string;
      目标: Record<string, any>;
      奖励: string;
      期限: string;
    };
    支线任务: Record<string, any>;
    已完成记录: string[];
  };
  位置系统: {
    坐标: string;
    楼层: number;
    地点名称: string;
  };
  时间系统: {
    日期: string;
    星期: number;
    时间: string;
  };
  势力声望: {
    学生会: number;
    女权协会: number;
    BF社: number;
    体育联盟: number;
    研究会: number;
    地下联盟: number;
    男性自保联盟: number;
    雌堕会: number;
  };
}

/** 加成统计（已移除意志力加成） */
export interface BonusStats {
  魅力加成: number;
  幸运加成: number;
  基础性斗力加成: number;
  基础性斗力成算: number;
  基础忍耐力加成: number;
  基础忍耐力成算: number;
  闪避率加成: number;
  暴击率加成: number;
}
