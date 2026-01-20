/**
 * 性斗学园数值计算脚本
 * 实时更新所有依赖变量的计算值
 *
 * 监听 MVU 变量变化，当基础变量改变时，自动更新依赖的变量：
 * - 魅力、幸运、闪避率、暴击率：基础值 + 永久状态加成 + 装备加成 + 临时状态加成
 * - 性斗力：((等级 x 潜力) + 装备加成 + 状态加成) x (1 + 成算/100)
 * - 忍耐力：((等级 x 潜力) + 装备加成 + 状态加成) x (1 + 成算/100)
 *
 * 计算顺序：先计算基础属性 → 再计算性斗力和忍耐力
 */

import { get, isEqual, set } from '@/util/common';
import { createScriptIdDiv, destroyScriptIdDiv, deteleportStyle, teleportStyle } from '@/util/script';
import { shouldTriggerOrgasm } from '../开局/utils/combat-calculator';
import StatusBarWrapper from './components/StatusBarWrapper.vue';
import { getDailyTalentEffect } from './data/talentDatabase';

// 等待 MVU 初始化（带安全检查和超时）
const globalAny = window as any;
if (typeof globalAny.waitGlobalInitialized === 'function') {
  try {
    // 添加超时保护：最多等待10秒
    const waitPromise = globalAny.waitGlobalInitialized('Mvu');
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('等待MVU初始化超时')), 10000));
    await Promise.race([waitPromise, timeoutPromise]);
  } catch (error) {
    console.warn('[性斗学园脚本] 等待MVU初始化失败，继续执行:', error);
  }
} else {
  console.warn('[性斗学园脚本] waitGlobalInitialized 函数不存在，跳过等待');
  // 等待一小段时间让全局变量初始化
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * 启动校验：数值上限保护
 * - 潜力 > 10 → 警告并修正为 10
 * - 属性点/技能点 > 500 → 警告并清零
 */
async function enforcePotentialCapOnStartup() {
  try {
    // 检查 Mvu 是否存在
    if (typeof Mvu === 'undefined' || !Mvu) {
      console.warn('[性斗学园脚本] Mvu 不存在，跳过启动校验');
      return;
    }
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      console.warn('[性斗学园脚本] 无法获取 MVU 数据，跳过启动校验');
      return;
    }

    let hasChanges = false;
    let hasNegative = false;
    const warnings: string[] = [];

    // 1. 检测潜力上限
    const rawPotential = get(mvuData.stat_data, '核心状态._潜力', 0);
    const potential = Number(rawPotential);

    if (Number.isFinite(potential) && potential > 10) {
      console.warn(`[性斗学园脚本] 检测到潜力异常：${potential} (> 10)。是否偷偷改数值了？将自动修正为 10。`);
      warnings.push(`潜力异常：${potential}（>10）`);
      set(mvuData.stat_data, '核心状态._潜力', 10);
      hasChanges = true;
    }

    // 2. 检测属性点上限
    const rawAttrPoints = get(mvuData.stat_data, '核心状态.$属性点', 0);
    const attrPoints = Number(rawAttrPoints);

    if (Number.isFinite(attrPoints) && attrPoints < 0) {
      console.warn(`[性斗学园脚本] 不要点那么快！检测到属性点为负数：${attrPoints}。已重置为 0。`);
      warnings.push(`属性点为负数：${attrPoints}`);
      set(mvuData.stat_data, '核心状态.$属性点', 0);
      hasChanges = true;
      hasNegative = true;
    }

    if (Number.isFinite(attrPoints) && attrPoints > 500) {
      console.warn(`[性斗学园脚本] 检测到属性点异常：${attrPoints} (> 500)。自动清零。`);
      warnings.push(`属性点异常：${attrPoints}（>500）`);
      set(mvuData.stat_data, '核心状态.$属性点', 0);
      hasChanges = true;
    }

    // 3. 检测技能点上限
    const rawSkillPoints = get(mvuData.stat_data, '核心状态.$技能点', 0);
    const skillPoints = Number(rawSkillPoints);

    if (Number.isFinite(skillPoints) && skillPoints < 0) {
      console.warn(`[性斗学园脚本] 不要点那么快！检测到技能点为负数：${skillPoints}。已重置为 0。`);
      warnings.push(`技能点为负数：${skillPoints}`);
      set(mvuData.stat_data, '核心状态.$技能点', 0);
      hasChanges = true;
      hasNegative = true;
    }

    if (Number.isFinite(skillPoints) && skillPoints > 500) {
      console.warn(`[性斗学园脚本] 检测到技能点异常：${skillPoints} (> 500)。自动清零。`);
      warnings.push(`技能点异常：${skillPoints}（>500）`);
      set(mvuData.stat_data, '核心状态.$技能点', 0);
      hasChanges = true;
    }

    // 统一提示并写回
    if (hasChanges) {
      if (warnings.length > 0 && typeof toastr !== 'undefined') {
        const message = hasNegative
          ? `不要点那么快！\n${warnings.join('\n')}\n已重置为 0。`
          : `你小子，是不是偷偷改我变量了？\n${warnings.join('\n')}\n给你改回去了。`;
        toastr.warning(message, hasNegative ? '😤' : '😈', { timeOut: 8000 });
      }
      await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      console.info('[性斗学园脚本] 启动校验完成，异常数值已修正');
    }
  } catch (error) {
    console.error('[性斗学园脚本] 启动校验时出错:', error);
  }
}

// 脚本启动即执行一次校验（防止历史存档/手改导致潜力越界）
await enforcePotentialCapOnStartup();

// 防止重复更新的标志
let isUpdating = false;

// 状态栏相关
let statusBarApp: any = null;
let statusBarContainer: JQuery<HTMLDivElement> | null = null;
let statusBarVisible = false;

/**
 * 从 MVU 数据中获取变量值（安全获取）
 */
function getValue(data: any, path: string, defaultValue: any = 0): any {
  return get(data, `stat_data.${path}`, defaultValue);
}

/**
 * 根据等级计算段位
 * - 无段位: 0-9
 * - D段: 10-19
 * - C段: 20-29
 * - B段: 30-39
 * - A段: 40-59
 * - S段: 60-79
 * - SS段: 80-99
 * - SSS段: 100
 */
function calculateRank(level: number): string {
  if (level >= 100) return 'SSS';
  if (level >= 80) return 'SS';
  if (level >= 60) return 'S';
  if (level >= 40) return 'A';
  if (level >= 30) return 'B';
  if (level >= 20) return 'C';
  if (level >= 10) return 'D';
  return '无段位';
}

/**
 * 独立更新段位（确保段位始终与等级匹配）
 */
async function updateRank() {
  try {
    // 检查 Mvu 是否存在
    if (typeof Mvu === 'undefined' || !Mvu) {
      return;
    }
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      console.warn('[性斗学园脚本] 无法获取 MVU 数据，跳过段位更新');
      return;
    }

    const level = getValue(mvuData, '角色基础._等级', 1);
    const expectedRank = calculateRank(level);
    const currentRank = get(mvuData.stat_data, '角色基础._段位', '无段位');

    if (expectedRank !== currentRank) {
      set(mvuData.stat_data, '角色基础._段位', expectedRank);
      await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
      console.info(
        `[性斗学园脚本] [独立段位更新] 等级 ${level} → ${expectedRank}段 (从 "${currentRank}" 更新为 "${expectedRank}")`,
      );
    }
  } catch (error) {
    console.error('[性斗学园脚本] 独立段位更新时出错:', error);
  }
}

/**
 * 计算并更新所有依赖变量
 *
 * 计算顺序很重要：
 * 1. 先计算基础属性最终值（魅力、幸运、闪避、暴击）
 * 2. 再计算性斗力（依赖等级和潜力）
 * 3. 最后计算忍耐力（依赖等级和潜力）
 */
async function updateDependentVariables() {
  // 防止重复更新
  if (isUpdating) {
    return;
  }

  try {
    isUpdating = true;

    // 检查 Mvu 是否存在
    if (typeof Mvu === 'undefined' || !Mvu) {
      return;
    }

    // 获取当前消息楼层的 MVU 数据
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      console.warn('[性斗学园脚本] 无法获取 MVU 数据，跳过更新');
      return;
    }

    const statData = mvuData.stat_data;
    const updates: Record<string, any> = {};
    let hasUpdates = false;

    // ==================== 步骤1: 获取所有加成源 ====================

    // 永久状态加成
    const permanentBonuses = statData.永久状态?.加成统计 || {};

    // 装备加成
    const equipmentBonuses = statData.物品系统?.装备总加成 || {};

    // 临时状态加成
    const tempBonuses = statData.临时状态?.加成统计 || {};

    // 天赋加成
    const talents = statData.技能系统?.$天赋 || {};
    const talentIds = Object.keys(talents);
    const currentTalentId = talentIds.length > 0 ? talentIds[0] : undefined;
    let talentBonuses: Record<string, number> = {};
    if (talentIds.length > 0) {
      const talentData = talents[talentIds[0]];
      talentBonuses = talentData?.天赋效果 || {};
    }

    // ==================== 步骤2: 计算基础属性最终值 ====================
    // 公式: 最终值 = 基础值 + 永久状态加成 + 装备加成 + 临时状态加成

    // 获取基础值
    const baseCharm = getValue(mvuData, '核心状态.$基础魅力', 10);
    const baseLuck = getValue(mvuData, '核心状态.$基础幸运', 10);
    const baseDodge = getValue(mvuData, '核心状态.$基础闪避率', 0);
    const baseCrit = getValue(mvuData, '核心状态.$基础暴击率', 0);
    // 已移除意志力相关字段

    // 获取各项加成（根据 initvar.yaml，加成统计内的键名无前缀）+ 天赋加成
    const charmBonus =
      (permanentBonuses.魅力加成 || 0) +
      (equipmentBonuses.魅力加成 || 0) +
      (tempBonuses.魅力加成 || 0) +
      (talentBonuses.魅力加成 || 0);
    const luckBonus =
      (permanentBonuses.幸运加成 || 0) +
      (equipmentBonuses.幸运加成 || 0) +
      (tempBonuses.幸运加成 || 0) +
      (talentBonuses.幸运加成 || 0);
    const dodgeBonus =
      (permanentBonuses.闪避率加成 || 0) +
      (equipmentBonuses.闪避率加成 || 0) +
      (tempBonuses.闪避率加成 || 0) +
      (talentBonuses.闪避率加成 || 0);
    const critBonus =
      (permanentBonuses.暴击率加成 || 0) +
      (equipmentBonuses.暴击率加成 || 0) +
      (tempBonuses.暴击率加成 || 0) +
      (talentBonuses.暴击率加成 || 0);
    // 已移除意志力加成

    // 计算最终值（带上下限限制）
    const finalCharm = Math.max(0, baseCharm + charmBonus);
    const finalLuck = Math.max(0, baseLuck + luckBonus);
    const finalDodge = Math.min(60, Math.max(0, baseDodge + dodgeBonus)); // 闪避率上陘60%
    const finalCrit = Math.min(100, Math.max(0, baseCrit + critBonus)); // 暴击率上限100%
    // 已移除意志力计算

    // 更新最终值到核心状态（如果发生变化）
    const currentFinalCharm = getValue(mvuData, '核心状态._魅力', 10);
    const currentFinalLuck = getValue(mvuData, '核心状态._幸运', 10);
    const currentFinalDodge = getValue(mvuData, '核心状态._闪避率', 0);
    const currentFinalCrit = getValue(mvuData, '核心状态._暴击率', 0);
    // 已移除意志力相关字段

    if (finalCharm !== currentFinalCharm) {
      updates['核心状态._魅力'] = finalCharm;
      hasUpdates = true;
    }
    if (finalLuck !== currentFinalLuck) {
      updates['核心状态._幸运'] = finalLuck;
      hasUpdates = true;
    }
    if (finalDodge !== currentFinalDodge) {
      updates['核心状态._闪避率'] = finalDodge;
      hasUpdates = true;
    }
    if (finalCrit !== currentFinalCrit) {
      updates['核心状态._暴击率'] = finalCrit;
      hasUpdates = true;
    }
    // 已移除意志力更新逻辑

    // ==================== 步骤3.5: 更新基础性斗力和基础忍耐力 ====================
    // 基础性斗力 = 等级 × 潜力
    // 基础忍耐力 = 等级 × 潜力（与性斗力公式一致）

    // 提前获取等级和潜力（用于基础值计算）
    const level = getValue(mvuData, '角色基础._等级', 1);
    const potential = getValue(mvuData, '核心状态._潜力', 5.0);

    const baseSexPowerValue = level * potential;
    const baseEnduranceValue = level * potential; // 更新：使用潜力而非意志力

    const currentBaseSexPower = getValue(mvuData, '核心状态.$基础性斗力', 10);
    const currentBaseEndurance = getValue(mvuData, '核心状态.$基础忍耐力', 10);

    if (baseSexPowerValue !== currentBaseSexPower) {
      updates['核心状态.$基础性斗力'] = baseSexPowerValue;
      hasUpdates = true;
    }

    if (baseEnduranceValue !== currentBaseEndurance) {
      updates['核心状态.$基础忍耐力'] = baseEnduranceValue;
      hasUpdates = true;
    }

    // ==================== 步骤3: 计算性斗力 ====================
    // 公式: ((等级 x 潜力) + 装备加成 + 状态加成) x (1 + 成算/100)

    // 检查是否处于贤者时间
    const tempStates = statData.临时状态?.状态列表 || {};
    const isPostOrgasm = '贤者时间' in tempStates;

    // 性斗力加成和成算（包含天赋加成）
    const sexPowerBonus =
      (permanentBonuses.基础性斗力加成 || 0) +
      (equipmentBonuses.基础性斗力加成 || 0) +
      (tempBonuses.基础性斗力加成 || 0) +
      (talentBonuses.基础性斗力加成 || 0);
    const sexPowerMulti =
      (permanentBonuses.基础性斗力成算 || 0) +
      (equipmentBonuses.基础性斗力成算 || 0) +
      (tempBonuses.基础性斗力成算 || 0) +
      (talentBonuses.基础性斗力成算 || 0);

    // 计算性斗力
    const baseSexPower = level * potential;
    let sexPower = (baseSexPower + sexPowerBonus) * (1 + sexPowerMulti / 100);

    // 贤者时间减益 -20%
    if (isPostOrgasm) {
      sexPower *= 0.8;
    }

    sexPower = Math.max(0, Math.floor(sexPower));

    const currentSexPower = getValue(mvuData, '性斗系统.实时性斗力', 0);

    if (sexPower !== currentSexPower) {
      updates['性斗系统.实时性斗力'] = sexPower;
      hasUpdates = true;
    }

    // ==================== 步骤4: 计算忍耐力 ====================
    // 公式: ((等级 x 潜力) + 装备加成 + 状态加成) x (1 + 成算/100)
    // 更新：使用潜力而非意志力，与性斗力公式一致

    // 忍耐力加成和成算（包含天赋加成）
    const enduranceBonus =
      (permanentBonuses.基础忍耐力加成 || 0) +
      (equipmentBonuses.基础忍耐力加成 || 0) +
      (tempBonuses.基础忍耐力加成 || 0) +
      (talentBonuses.基础忍耐力加成 || 0);
    const enduranceMulti =
      (permanentBonuses.基础忍耐力成算 || 0) +
      (equipmentBonuses.基础忍耐力成算 || 0) +
      (tempBonuses.基础忍耐力成算 || 0) +
      (talentBonuses.基础忍耐力成算 || 0);

    // 检查是否虚脱
    const orgasmCount = getValue(mvuData, '性斗系统.高潮次数', 0);
    const maxOrgasmCount = getValue(mvuData, '性斗系统.胜负规则.高潮次数上限', 0);
    const isExhausted = maxOrgasmCount > 0 && orgasmCount >= maxOrgasmCount;

    // 计算忍耐力（使用潜力，与性斗力公式一致）
    const baseEndurance = level * potential;
    let endurance = (baseEndurance + enduranceBonus) * (1 + enduranceMulti / 100);

    // 贤者时间增益 +10%
    if (isPostOrgasm) {
      endurance *= 1.1;
    }

    // 虚脱减益 -30%
    if (isExhausted) {
      endurance *= 0.7;
    }

    endurance = Math.max(0, Math.floor(endurance));

    const currentEndurance = getValue(mvuData, '性斗系统.实时忍耐力', 0);

    if (endurance !== currentEndurance) {
      updates['性斗系统.实时忍耐力'] = endurance;
      hasUpdates = true;
    }

    // ==================== 步骤5: 检查快感是否达到上限（触发高潮）====================
    const currentLust = getValue(mvuData, '核心状态.$快感', 0);
    const maxLust = getValue(mvuData, '核心状态.$最大快感', 100);

    if (shouldTriggerOrgasm(currentLust, maxLust)) {
      // 清空快感值
      updates['核心状态.$快感'] = 0;

      // 添加贤者时间状态
      const currentTempStates = statData.临时状态?.状态列表 || {};
      const currentTempBonuses = statData.临时状态?.加成统计 || {};

      updates['临时状态.状态列表'] = {
        ...currentTempStates,
        贤者时间: 3, // 持续3回合
      };

      updates['临时状态.加成统计'] = {
        ...currentTempBonuses,
        基础性斗力成算: (currentTempBonuses.基础性斗力成算 || 0) - 20,
        基础忍耐力成算: (currentTempBonuses.基础忍耐力成算 || 0) + 10,
      };

      // 增加高潮次数
      updates['性斗系统.高潮次数'] = orgasmCount + 1;
      hasUpdates = true;
    }

    // ==================== 步骤6: 检查是否可以升级 ====================
    const currentLevel = Number(getValue(mvuData, '角色基础._等级', 1) as any);
    const currentExp = Number(getValue(mvuData, '角色基础.经验值', 0) as any);
    const difficulty = String(getValue(mvuData, '角色基础.难度', '普通') as any);

    // 检查天赋：经验降低效果
    const expReduction = getDailyTalentEffect(currentTalentId, 'exp_reduce'); // 百分比

    let finalLevel = currentLevel; // 用于后续段位计算
    let finalExp = currentExp;
    const baseExpNeededPerLevel = (() => {
      switch (difficulty) {
        case '简单':
          return 100;
        case '普通':
          return 125;
        case '困难':
          return 150;
        case '抖M':
          return 200;
        case '作弊':
          return 100;
        default:
          return 125;
      }
    })();

    // 应用经验降低天赋效果
    const expNeededPerLevel = Math.max(50, Math.floor((baseExpNeededPerLevel * (100 - expReduction)) / 100));

    if (finalLevel < 100 && finalExp >= expNeededPerLevel) {
      const levelsGained = Math.min(100 - finalLevel, Math.floor(finalExp / expNeededPerLevel));
      if (levelsGained > 0) {
        const newLevel = finalLevel + levelsGained;
        const remainingExp = finalExp - levelsGained * expNeededPerLevel;

        // 计算升级奖励：属性点每级 floor(潜力/2)，技能点每级 floor(潜力)
        const attributePointsPerLevel = Math.floor(potential / 2);
        const skillPointsPerLevel = Math.floor(potential);
        const currentAttributePoints = getValue(mvuData, '核心状态.$属性点', 0);
        const currentSkillPoints = getValue(mvuData, '核心状态.$技能点', 0);
        const attributePointsGained = levelsGained * attributePointsPerLevel;
        const skillPointsGained = levelsGained * skillPointsPerLevel;

        updates['角色基础._等级'] = newLevel;
        updates['角色基础.经验值'] = remainingExp;
        updates['核心状态.$属性点'] = currentAttributePoints + attributePointsGained;
        updates['核心状态.$技能点'] = currentSkillPoints + skillPointsGained;
        hasUpdates = true;

        finalLevel = newLevel;
        finalExp = remainingExp;
      }
    }

    // ==================== 步骤6.5: 根据等级自动更新段位 ====================
    const expectedRank = calculateRank(finalLevel);
    const currentRank = get(mvuData.stat_data, '角色基础._段位', '无段位');

    if (expectedRank !== currentRank) {
      updates['角色基础._段位'] = expectedRank;
      hasUpdates = true;
    } else {
    }

    // ==================== 步骤7: 应用所有更新 ====================
    if (hasUpdates) {
      // 直接使用 set 更新数据，然后一次性写回
      for (const [path, value] of Object.entries(updates)) {
        set(mvuData.stat_data, path, value);
      }

      // 写回 MVU 数据
      await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
    }
  } catch (error) {
    console.error('[性斗学园脚本] 更新依赖变量时出错:', error);
    toastr.error('数值计算出错，请查看控制台', '脚本错误', { timeOut: 5000 });
  } finally {
    isUpdating = false;
  }
}

/**
 * 注册 MVU 事件监听器（需要在 MVU 初始化后调用）
 */
function registerMvuEventListeners() {
  if (typeof Mvu === 'undefined' || !Mvu) {
    console.warn('[性斗学园脚本] Mvu 不存在，无法注册事件监听器');
    return false;
  }

  try {
    /**
     * 监听 MVU 变量更新事件
     * 在变量更新结束后，重新计算所有依赖的变量
     */
    eventOn(Mvu.events.VARIABLE_UPDATE_ENDED, async (variables, variables_before_update) => {
      console.info('[性斗学园脚本] 检测到 MVU 变量更新事件');

      // 检查是否有基础变量发生变化（这些变量的变化会影响计算值）
      const basePaths = [
        '角色基础._等级',
        '角色基础.经验值',
        '角色基础._段位', // 段位变化时也需要重新检查并更新
        // 核心状态基础值
        '核心状态._潜力',
        '核心状态.$基础魅力',
        '核心状态.$基础幸运',
        '核心状态.$基础闪避率',
        '核心状态.$基础暴击率',
        // 已移除意志力相关路径
        // 核心状态资源
        '核心状态.$最大快感',
        '核心状态.$快感',
        '核心状态.$最大耐力',
        '核心状态.$耐力',
        // 装备和状态
        '物品系统.装备总加成',
        '永久状态.加成统计',
        '永久状态.状态列表',
        '临时状态.状态列表',
        '临时状态.加成统计',
        '性斗系统.高潮次数',
      ];

      let hasBaseChange = false;
      const changedPaths: string[] = [];

      for (const path of basePaths) {
        const oldValue = get(variables_before_update, `stat_data.${path}`);
        const newValue = get(variables, `stat_data.${path}`);

        // 使用深度比较，因为可能是对象
        if (!isEqual(oldValue, newValue)) {
          hasBaseChange = true;
          changedPaths.push(path);
          console.info(`[性斗学园脚本] 检测到变量变化: ${path}`, { oldValue, newValue });
        }
      }

      // 如果有基础变量变化，更新依赖变量
      if (hasBaseChange) {
        console.info(`[性斗学园脚本] 检测到 ${changedPaths.length} 个变量变化，开始更新依赖变量`);
        // 使用 setTimeout 避免在事件处理中直接更新导致的问题
        setTimeout(async () => {
          await updateDependentVariables();
        }, 100); // 稍微延迟确保数据已完全写入
      }
    });

    /**
     * 监听变量初始化事件
     * 在变量初始化后，计算初始的依赖变量值
     */
    eventOn(Mvu.events.VARIABLE_INITIALIZED, async () => {
      await enforcePotentialCapOnStartup();
      await updateDependentVariables();
    });

    console.info('[性斗学园脚本] MVU 事件监听器注册成功');
    return true;
  } catch (error) {
    console.error('[性斗学园脚本] 注册 MVU 事件监听器失败:', error);
    return false;
  }
}

// 尝试注册 MVU 事件监听器
registerMvuEventListeners();

/**
 * 处理对话后的耐力和快感更新
 * 每次对话后：恢复10%最大耐力，降低10%最大快感（向下取整）
 */
async function handleConversationUpdate() {
  try {
    // 检查 Mvu 是否存在
    if (typeof Mvu === 'undefined' || !Mvu) {
      console.warn('[性斗学园脚本] Mvu 不存在，跳过对话更新');
      return;
    }
    // 获取当前消息楼层的 MVU 数据
    const mvuData = Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) {
      console.warn('[性斗学园脚本] 无法获取 MVU 数据，跳过对话更新');
      return;
    }

    const statData = mvuData.stat_data;

    // 获取当前天赋ID
    const talents = statData.技能系统?.$天赋;
    const currentTalentId = talents && Object.keys(talents).length > 0 ? Object.keys(talents)[0] : undefined;

    // 获取天赋效果倍率
    const staminaMultiplier = getDailyTalentEffect(currentTalentId, 'stamina_recovery_double') || 1;
    const pleasureMultiplier = getDailyTalentEffect(currentTalentId, 'pleasure_reduce_double') || 1;

    // 获取当前耐力和快感值
    const currentStamina = getValue(mvuData, '核心状态.$耐力', 0);
    const maxStamina = getValue(mvuData, '核心状态.$最大耐力', 100);
    const currentLust = getValue(mvuData, '核心状态.$快感', 0);
    const maxLust = getValue(mvuData, '核心状态.$最大快感', 100);

    // 计算恢复/降低量（10%最大值，向下取整，应用天赋倍率）
    const staminaRecover = Math.floor(maxStamina * 0.1 * staminaMultiplier);
    const lustReduce = Math.floor(maxLust * 0.1 * pleasureMultiplier);

    // 计算新值（带上下限限制）
    const newStamina = Math.min(maxStamina, Math.max(0, currentStamina + staminaRecover));
    const newLust = Math.max(0, currentLust - lustReduce);

    // 更新值
    set(statData, '核心状态.$耐力', newStamina);
    set(statData, '核心状态.$快感', newLust);

    // 写回 MVU 数据
    await Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    console.info(
      `[性斗学园脚本] 对话后更新：耐力 ${currentStamina} → ${newStamina} (+${staminaRecover}), 快感 ${currentLust} → ${newLust} (-${lustReduce})`,
    );
  } catch (error) {
    console.error('[性斗学园脚本] 对话更新时出错:', error);
  }
}

/**
 * 监听消息接收事件（AI回复后触发）
 * 每次对话后更新耐力和快感
 */
// tavern_events 在脚本环境中是全局可用的
if (typeof tavern_events !== 'undefined' && tavern_events.MESSAGE_RECEIVED) {
  eventOn(tavern_events.MESSAGE_RECEIVED, async () => {
    console.info('[性斗学园脚本] 检测到消息接收事件，开始更新对话后的状态');
    // 延迟一点执行，确保消息已完全更新
    setTimeout(async () => {
      await handleConversationUpdate();
      // 对话后也需要重新计算依赖变量
      await updateDependentVariables();
    }, 200);
  });
  console.info('[性斗学园脚本] 已注册对话后状态更新监听器');
} else {
  console.warn('[性斗学园脚本] tavern_events.MESSAGE_RECEIVED 不可用，无法监听对话事件');
}

/**
 * 等待 MVU 初始化完成（带重试机制）
 */
async function waitForMvuReady(maxRetries = 20, interval = 500): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    if (typeof Mvu !== 'undefined' && Mvu) {
      console.info(`[性斗学园脚本] MVU 已就绪 (第 ${i + 1} 次检查)`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  console.error('[性斗学园脚本] 等待 MVU 初始化超时');
  return false;
}

/**
 * 初始化时执行一次计算
 */
$(() => {
  // 显示加载提示
  toastr.success('性斗学园数值计算脚本已启动', '脚本加载成功', {
    timeOut: 3000,
    progressBar: true,
  });

  errorCatched(async () => {
    // 等待 MVU 初始化完成
    const mvuReady = await waitForMvuReady();
    if (!mvuReady) {
      toastr.error('MVU 初始化超时，脚本功能可能受限', '初始化警告', { timeOut: 5000 });
      return;
    }

    // MVU 就绪后，重新注册事件监听器（如果之前注册失败）
    registerMvuEventListeners();

    console.info('[性斗学园脚本] 初始化：开始首次计算');
    await updateDependentVariables();
    // 初始化时也更新段位
    await updateRank();
  })();

  // 添加定时检查机制（每10秒检查一次，确保实时更新）
  setInterval(async () => {
    if (!isUpdating) {
      await updateDependentVariables();
    }
    // 独立更新段位，确保段位始终与等级匹配
    await updateRank();
  }, 10000);

  // 初始化状态栏
  initStatusBar();

  // 注册按钮事件（按钮名：打开状态栏）
  eventOn(getButtonEvent('打开状态栏'), () => {
    console.info('[性斗学园脚本] 按钮被点击！');
    toggleStatusBar();
  });
});

/**
 * 初始化状态栏
 */
function initStatusBar() {
  if (statusBarApp) return;

  try {
    statusBarContainer = createScriptIdDiv();
    statusBarContainer.css({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100%',
      height: '100%',
      zIndex: '99999', // 提高 z-index 确保在最上层
      pointerEvents: 'none', // 容器本身不拦截事件，但内部元素可以
      // 移动端适配
      touchAction: 'none', // 防止移动端手势冲突
      WebkitOverflowScrolling: 'touch', // iOS 平滑滚动
      margin: '0',
      padding: '0',
      overflow: 'visible', // 确保内容可见
    });

    // 确保添加到 body 的最上层
    $('body').append(statusBarContainer);

    const app = createApp(StatusBarWrapper);

    teleportStyle();
    statusBarApp = app;
    app.mount(statusBarContainer[0]);

    console.info('[性斗学园脚本] 状态栏已初始化');
  } catch (error) {
    console.error('[性斗学园脚本] 初始化状态栏失败:', error);
  }
}

/**
 * 切换状态栏显示
 */
function toggleStatusBar() {
  console.info('[性斗学园脚本] 切换状态栏，当前状态:', statusBarVisible);

  if (!statusBarApp) {
    console.info('[性斗学园脚本] 状态栏未初始化，开始初始化...');
    initStatusBar();
    // 等待初始化完成后再切换
    setTimeout(() => {
      const state = (window as any).__statusBarState;
      if (state && state.toggle) {
        state.toggle();
        statusBarVisible = state.isVisible.value;
      } else {
        statusBarVisible = !statusBarVisible;
      }
      console.info('[性斗学园脚本] 状态栏已切换为:', statusBarVisible);
    }, 300);
    return;
  }

  // 通过全局状态切换
  const state = (window as any).__statusBarState;
  if (state && state.toggle) {
    state.toggle();
    statusBarVisible = state.isVisible.value;
  } else {
    statusBarVisible = !statusBarVisible;
  }
  console.info('[性斗学园脚本] 状态栏已切换为:', statusBarVisible);
}

/**
 * 脚本卸载时显示提示
 */
$(window).on('pagehide', () => {
  toastr.info('性斗学园数值计算脚本已关闭', '脚本卸载', {
    timeOut: 2000,
    progressBar: true,
  });

  // 清理状态栏
  if (statusBarApp) {
    statusBarApp.unmount();
    statusBarApp = null;
  }
  if (statusBarContainer) {
    statusBarContainer.remove();
    statusBarContainer = null;
  }
  destroyScriptIdDiv();
  deteleportStyle();
});

console.info('性斗学园数值计算脚本已加载');
