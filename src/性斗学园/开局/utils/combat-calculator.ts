/**
 * 战斗数值计算系统
 * 用于PVE回合制战斗的核心计算公式
 *
 * 新变量结构适配版本
 */

// ==================== 常量定义 ====================

/** 每级升级所需经验值 */
export const EXP_PER_LEVEL = 100;

/** 高潮后进入贤者时间的性斗力减益 */
export const POST_ORGASM_SEX_POWER_REDUCTION = 0.2; // -20%

/** 高潮后进入贤者时间的忍耐力增益 */
export const POST_ORGASM_ENDURANCE_BOOST = 0.1; // +10%

/** 虚脱状态的耐力减益 */
export const EXHAUSTION_STAMINA_REDUCTION = 0.3; // -30%

// ==================== 类型定义 ====================

/**
 * 加成统计结构
 */
export interface BonusStats {
  魅力加成?: number;
  幸运加成?: number;
  基础性斗力加成?: number;
  基础性斗力成算?: number;
  基础忍耐力加成?: number;
  基础忍耐力成算?: number;
  闪避率加成?: number;
  暴击率加成?: number;
}

/**
 * MVU 变量数据接口（用于计算）
 * 适配新的变量结构
 */
export interface MvuCombatData {
  角色基础: {
    _等级: number;
    经验值?: number;
  };
  核心状态: {
    // 潜力
    _潜力: number;
    // 基础值
    $基础魅力: number;
    $基础幸运: number;
    $基础闪避率: number;
    $基础暴击率: number;
    // 最终值
    _魅力: number;
    _幸运: number;
    _闪避率: number;
    _暴击率: number;
    // 资源
    $最大耐力: number;
    $最大快感: number;
    $快感: number;
    $耐力: number;
  };
  物品系统?: {
    装备总加成?: BonusStats;
  };
  永久状态?: {
    状态列表?: string[];
    加成统计?: BonusStats;
  };
  临时状态?: {
    状态列表?: Record<string, number>; // 状态名 -> 剩余回合
    加成统计?: BonusStats;
  };
}

// ==================== 核心计算公式 ====================

/**
 * 计算实时性斗力
 * 公式: ((等级 x 潜力) + 装备基础性斗力加成 + 永久状态加成 + 临时状态加成) x (1 + (装备成算 + 永久状态成算 + 临时状态成算)/100)
 *
 * @param data MVU 变量数据
 * @param isPostOrgasm 是否处于贤者时间（高潮后）
 * @returns 计算后的性斗力
 */
export function calculateSexualCombatPower(data: MvuCombatData, isPostOrgasm: boolean = false): number {
  const level = data.角色基础._等级;
  const potential = data.核心状态._潜力;

  // 基础值：等级 x 潜力
  const baseValue = level * potential;

  // 装备加成
  const equipmentBonus = data.物品系统?.装备总加成?.基础性斗力加成 || 0;

  // 永久状态加成
  const permanentBonus = data.永久状态?.加成统计?.基础性斗力加成 || 0;

  // 临时状态加成（从临时状态的统一加成统计中获取）
  const tempBonus = data.临时状态?.加成统计?.基础性斗力加成 || 0;

  // 加成总和
  const totalBonus = baseValue + equipmentBonus + permanentBonus + tempBonus;

  // 成算（百分比加成）
  const equipmentMultiplier = data.物品系统?.装备总加成?.基础性斗力成算 || 0;
  const permanentMultiplier = data.永久状态?.加成统计?.基础性斗力成算 || 0;
  const tempMultiplier = data.临时状态?.加成统计?.基础性斗力成算 || 0;

  // 总成算（转换为倍数，例如 30% = 1.3）
  const totalMultiplier = 1 + (equipmentMultiplier + permanentMultiplier + tempMultiplier) / 100;

  // 最终性斗力
  let finalPower = totalBonus * totalMultiplier;

  // 贤者时间减益
  if (isPostOrgasm) {
    finalPower *= 1 - POST_ORGASM_SEX_POWER_REDUCTION;
  }

  return Math.max(0, Math.floor(finalPower));
}

/**
 * 计算实时忍耐力
 * 公式: ((等级 x 潜力) + 装备基础忍耐力加成 + 永久状态加成 + 临时状态加成) x (1 + (装备成算 + 永久状态成算 + 临时状态成算)/100)
 *
 * @param data MVU 变量数据
 * @param isPostOrgasm 是否处于贤者时间（高潮后）
 * @param isExhausted 是否处于虚脱状态
 * @returns 计算后的忍耐力
 */
export function calculateEndurance(
  data: MvuCombatData,
  isPostOrgasm: boolean = false,
  isExhausted: boolean = false,
): number {
  const level = data.角色基础._等级;
  const potential = data.核心状态._潜力;

  // 基础值：等级 x 潜力（与性斗力计算公式一致）
  const baseValue = level * potential;

  // 装备加成
  const equipmentBonus = data.物品系统?.装备总加成?.基础忍耐力加成 || 0;

  // 永久状态加成
  const permanentBonus = data.永久状态?.加成统计?.基础忍耐力加成 || 0;

  // 临时状态加成
  const tempBonus = data.临时状态?.加成统计?.基础忍耐力加成 || 0;

  // 加成总和
  const totalBonus = baseValue + equipmentBonus + permanentBonus + tempBonus;

  // 成算（百分比加成）
  const equipmentMultiplier = data.物品系统?.装备总加成?.基础忍耐力成算 || 0;
  const permanentMultiplier = data.永久状态?.加成统计?.基础忍耐力成算 || 0;
  const tempMultiplier = data.临时状态?.加成统计?.基础忍耐力成算 || 0;

  // 总成算
  const totalMultiplier = 1 + (equipmentMultiplier + permanentMultiplier + tempMultiplier) / 100;

  // 最终忍耐力
  let finalEndurance = totalBonus * totalMultiplier;

  // 贤者时间增益
  if (isPostOrgasm) {
    finalEndurance *= 1 + POST_ORGASM_ENDURANCE_BOOST;
  }

  // 虚脱状态减益
  if (isExhausted) {
    finalEndurance *= 1 - EXHAUSTION_STAMINA_REDUCTION;
  }

  return Math.max(0, Math.floor(finalEndurance));
}

// ==================== 快感与高潮系统 ====================

/**
 * 检查是否触发强制高潮
 * @param lust 当前快感值
 * @param maxLust 最大快感值（从变量中获取）
 * @returns 是否达到高潮阈值
 */
export function shouldTriggerOrgasm(lust: number, maxLust: number): boolean {
  return lust >= maxLust;
}

/**
 * 处理高潮事件
 * @param data MVU 变量数据
 * @returns 更新后的数据（需要写回MVU）
 */
export function handleOrgasm(data: MvuCombatData): any {
  const updates: any = {
    核心状态: {
      $快感: 0, // 清空快感值
    },
    临时状态: {
      状态列表: {
        ...data.临时状态?.状态列表,
        贤者时间: 3, // 持续3回合
      },
      加成统计: {
        ...data.临时状态?.加成统计,
        基础性斗力成算: (data.临时状态?.加成统计?.基础性斗力成算 || 0) - 20,
        基础忍耐力成算: (data.临时状态?.加成统计?.基础忍耐力成算 || 0) + 10,
      },
    },
  };

  return updates;
}

/**
 * 检查是否进入虚脱状态
 * @param orgasmCount 当前高潮次数
 * @param maxOrgasmCount 最大高潮次数上限
 * @returns 是否虚脱
 */
export function isExhausted(orgasmCount: number, maxOrgasmCount: number): boolean {
  return orgasmCount >= maxOrgasmCount;
}

// ==================== 经验与升级系统 ====================

/**
 * 计算升级所需经验
 * @param currentLevel 当前等级
 * @param currentExp 当前经验值
 * @returns 距离下一级所需经验
 */
export function getExpToNextLevel(currentLevel: number, currentExp: number): number {
  const expForNextLevel = currentLevel * EXP_PER_LEVEL;
  return Math.max(0, expForNextLevel - currentExp);
}

/**
 * 检查是否可以升级
 * @param currentLevel 当前等级
 * @param currentExp 当前经验值
 * @returns 是否可以升级
 */
export function canLevelUp(currentLevel: number, currentExp: number): boolean {
  if (currentLevel >= 100) return false; // 已达到最大等级
  const expNeeded = currentLevel * EXP_PER_LEVEL;
  return currentExp >= expNeeded;
}

/**
 * 计算升级后获得的自由属性点
 * @param potential 潜力值
 * @returns 获得的属性点数（向下取整）
 */
export function getAttributePointsOnLevelUp(potential: number): number {
  return Math.floor(potential / 2);
}

/**
 * 处理升级
 * @param data MVU 变量数据
 * @returns 更新后的数据（需要写回MVU）
 */
export function handleLevelUp(data: MvuCombatData): any | null {
  if (!canLevelUp(data.角色基础._等级, data.角色基础.经验值 || 0)) {
    return null;
  }

  const newLevel = data.角色基础._等级 + 1;
  const attributePoints = getAttributePointsOnLevelUp(data.核心状态._潜力);

  return {
    角色基础: {
      _等级: newLevel,
    },
    // 注意：属性点需要玩家手动分配，这里不自动分配
  };
}

// ==================== 经验值获取 ====================

/**
 * 战斗经验值获取
 */
export const EXP_GAINS = {
  /** 每轮对抗经验 */
  PER_ROUND: { min: 10, max: 20 },

  /** 性斗胜利基础经验 */
  VICTORY_BASE: 25,

  /** 性斗胜利等级差加成（每级差5点） */
  VICTORY_LEVEL_BONUS: 5,

  /** 性斗胜利最低经验 */
  VICTORY_MIN: 30,

  /** 性斗失败经验 */
  DEFEAT: { min: 10, max: 25 },

  /** 调教中每次高潮经验 */
  ORGASM: { min: 20, max: 40 },

  /** 探索经验 */
  EXPLORATION: { min: 5, max: 15 },

  /** 观战和练习经验 */
  SPECTATE: { min: 10, max: 30 },
};

/**
 * 计算性斗胜利经验
 * @param userLevel 玩家等级
 * @param enemyLevel 敌人等级
 * @returns 获得的经验值
 */
export function calculateVictoryExp(userLevel: number, enemyLevel: number): number {
  const levelDiff = enemyLevel - userLevel;
  const exp = EXP_GAINS.VICTORY_BASE + levelDiff * EXP_GAINS.VICTORY_LEVEL_BONUS;
  return Math.max(EXP_GAINS.VICTORY_MIN, exp);
}

/**
 * 获取随机经验值（在范围内）
 * @param range 经验值范围 {min, max}
 * @returns 随机经验值
 */
export function getRandomExp(range: { min: number; max: number }): number {
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

// ==================== 辅助函数 ====================

/**
 * 从 MVU 数据中提取战斗相关数据
 * 适配新的变量结构
 * @param mvuData MVU 完整数据
 * @returns 战斗计算所需的数据
 */
export function extractCombatData(mvuData: any): MvuCombatData {
  const statData = mvuData.stat_data || {};

  return {
    角色基础: {
      _等级: statData.角色基础?._等级 || 1,
      经验值: statData.角色基础?.经验值 || 0,
    },
    核心状态: {
      // 潜力现在在核心状态中
      _潜力: statData.核心状态?._潜力 || 5.0,
      // 基础值
      $基础魅力: statData.核心状态?.$基础魅力 || 10,
      $基础幸运: statData.核心状态?.$基础幸运 || 10,
      $基础闪避率: statData.核心状态?.$基础闪避率 || 0,
      $基础暴击率: statData.核心状态?.$基础暴击率 || 0,
      // 最终值
      _魅力: statData.核心状态?._魅力 || 10,
      _幸运: statData.核心状态?._幸运 || 10,
      _闪避率: statData.核心状态?._闪避率 || 0,
      _暴击率: statData.核心状态?._暴击率 || 0,
      // 资源
      $最大耐力: statData.核心状态?.$最大耐力 || 100,
      $最大快感: statData.核心状态?.$最大快感 || 100,
      $快感: statData.核心状态?.$快感 || 0,
      $耐力: statData.核心状态?.$耐力 || 100,
    },
    物品系统: statData.物品系统,
    永久状态: statData.永久状态,
    临时状态: statData.临时状态,
  };
}
