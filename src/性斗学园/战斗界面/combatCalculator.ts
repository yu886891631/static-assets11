/**
 * 战斗计算系统
 * 实现伤害计算、闪避暴击判定等核心战斗逻辑
 */

import { BuffType, Character, DamageSource, SkillData, StatusEffect } from './types';

/**
 * 战斗结果
 */
export interface CombatResult {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  actualDamage: number;
  logs: string[];
  hitCount: number; // 实际命中次数
  totalDamage: number; // 连击总伤害
  hits: { damage: number; isCritical: boolean; isDodged: boolean }[]; // 每次攻击的详情
}

/**
 * 计算技能基础伤害
 * @param attacker 攻击者
 * @param skill 技能数据
 * @returns 基础伤害值
 */
export function calculateBaseDamage(attacker: Character, skill: SkillData): number {
  let totalDamage = 0;

  console.info('[战斗计算] 计算基础伤害:');
  console.info('  技能伤害公式组件数量:', skill.damageFormula.length);

  if (skill.damageFormula.length === 0) {
    console.warn('[战斗计算] 技能伤害公式为空，返回0');
    return 0;
  }

  for (const component of skill.damageFormula) {
    let sourceValue = 0;

    switch (component.source) {
      case DamageSource.SEX_POWER:
        sourceValue = attacker.stats.sexPower;
        break;
      case DamageSource.CHARM:
        sourceValue = attacker.stats.charm;
        break;
      case DamageSource.LUCK:
        sourceValue = attacker.stats.luck;
        break;
      case DamageSource.FIXED:
        sourceValue = 1;
        break;
    }

    const componentDamage = sourceValue * component.coefficient + component.baseValue;
    totalDamage += componentDamage;

    console.info(
      `  组件: ${component.source}, 来源值: ${sourceValue}, 系数: ${component.coefficient}, 基础值: ${component.baseValue}, 组件伤害: ${componentDamage}`,
    );
  }

  const finalDamage = Math.max(0, Math.floor(totalDamage));
  console.info(`  总基础伤害: ${finalDamage}`);
  return finalDamage;
}

/**
 * 应用非线性减伤模型（支持等级压制）
 *
 * 玩家攻击敌人时（isPlayerAttacking=true）：
 *   公式: 最终伤害 = 基础伤害 * 40 / (忍耐力 + 100 + 5 * max(0, 对方等级 - 我方等级))
 *   等级压制：敌人等级高于玩家时，额外增加减伤
 *
 * 敌人攻击玩家时（isPlayerAttacking=false）：
 *   公式: 最终伤害 = 基础伤害 * 40 / (忍耐力 + 100)
 *   无等级压制
 *
 * @param baseDamage 基础伤害
 * @param targetEndurance 目标的忍耐力
 * @param isPlayerAttacking 是否是玩家在攻击（true=玩家攻击敌人，false=敌人攻击玩家）
 * @param attackerLevel 攻击者等级
 * @param targetLevel 目标等级
 * @returns 减伤后的伤害
 */
export function applyDefenseReduction(
  baseDamage: number,
  targetEndurance: number,
  isPlayerAttacking: boolean = false,
  attackerLevel: number = 1,
  targetLevel: number = 1,
): number {
  // 计算等级压制加成（仅玩家攻击敌人时生效）
  let levelSuppression = 0;
  if (isPlayerAttacking) {
    levelSuppression = 5 * Math.max(0, targetLevel - attackerLevel);
  }

  // 非线性减伤公式：最终伤害 = 基础伤害 * 40 / (忍耐力 + 100 + 等级压制)
  const denominator = targetEndurance + 100 + levelSuppression;
  const finalDamage = (baseDamage * 40) / denominator;
  const reductionPercent = (((targetEndurance + levelSuppression) / denominator) * 100).toFixed(1);

  console.info(`[防御减伤] 基础伤害: ${baseDamage}, 目标忍耐力: ${targetEndurance}`);
  if (isPlayerAttacking && levelSuppression > 0) {
    console.info(
      `[防御减伤] 等级压制: 攻击者Lv${attackerLevel} vs 目标Lv${targetLevel}, 压制加成: +${levelSuppression}`,
    );
  }
  console.info(
    `[防御减伤] 减伤公式: ${baseDamage} * 40 / (${targetEndurance} + 100${levelSuppression > 0 ? ` + ${levelSuppression}` : ''}) = ${baseDamage} * 40 / ${denominator}`,
  );
  console.info(
    `[防御减伤] 计算过程: ${baseDamage} * 40 = ${baseDamage * 40}, ${baseDamage * 40} / ${denominator} = ${finalDamage}`,
  );
  console.info(`[防御减伤] 减伤比例: ${reductionPercent}%, 最终伤害: ${Math.floor(finalDamage)}`);

  return Math.max(1, Math.floor(finalDamage));
}

/**
 * 判定是否闪避
 * @param attackerLuck 攻击者幸运
 * @param targetEvasion 目标闪避率
 * @param skillAccuracy 技能命中率
 * @returns 是否闪避成功
 */
export function checkDodge(attackerLuck: number, targetEvasion: number, skillAccuracy: number): boolean {
  // 计算最终命中率 = 技能基础命中率 - 目标闪避率 + (攻击者幸运 / 10)
  const finalAccuracy = skillAccuracy - targetEvasion + attackerLuck / 10;

  // 命中率最低10%,最高95%
  const clampedAccuracy = Math.max(10, Math.min(95, finalAccuracy));

  // 随机判定
  const roll = Math.random() * 100;
  return roll >= clampedAccuracy;
}

/**
 * 判定是否暴击
 * @param attackerCrit 攻击者暴击率
 * @param attackerLuck 攻击者幸运
 * @param skillCritModifier 技能暴击修正
 * @returns 是否暴击
 */
export function checkCritical(attackerCrit: number, attackerLuck: number, skillCritModifier: number): boolean {
  // 计算最终暴击率 = 基础暴击率 + (幸运 / 10) + 技能修正
  const finalCritRate = attackerCrit + attackerLuck / 10 + skillCritModifier;

  // 暴击率最低0%,最高100%
  const clampedCritRate = Math.max(0, Math.min(100, finalCritRate));

  // 随机判定
  const roll = Math.random() * 100;
  return roll < clampedCritRate;
}

/**
 * 应用buff效果到伤害
 * @param damage 原始伤害
 * @param attacker 攻击者
 * @param target 目标
 * @returns 修正后的伤害
 */
export function applyBuffModifiers(damage: number, attacker: Character, target: Character): number {
  let modifier = 1.0;

  // 检查攻击者的攻击力buff
  for (const effect of attacker.statusEffects) {
    if (effect.effect.type === BuffType.ATK_UP && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.ATK_DOWN && effect.effect.isPercent) {
      modifier -= effect.effect.value / 100;
    }
  }

  // 检查目标的防御力buff
  for (const effect of target.statusEffects) {
    if (effect.effect.type === BuffType.DEF_UP && effect.effect.isPercent) {
      modifier -= effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.DEF_DOWN && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    } else if (effect.effect.type === BuffType.SENSITIVE && effect.effect.isPercent) {
      modifier += effect.effect.value / 100;
    }
  }

  return Math.max(1, Math.floor(damage * modifier));
}

/**
 * 执行完整的战斗计算
 * @param attacker 攻击者
 * @param target 目标
 * @param skill 技能数据
 * @param isPlayerAttacking 是否是玩家在攻击（用于等级压制计算）
 * @returns 战斗结果
 */
export function executeAttack(
  attacker: Character,
  target: Character,
  skill: SkillData,
  isPlayerAttacking: boolean = false,
  talentModifiers?: {
    guaranteedHit?: boolean;
    guaranteedCrit?: boolean;
    damageMultiplier?: number;
    critDamageBoost?: number;
    extraHitCount?: number;
  },
): CombatResult {
  const logs: string[] = [];
  const hits: { damage: number; isCritical: boolean; isDodged: boolean }[] = [];

  // 获取连击次数，默认为1，加上天赋额外连击
  const baseHitCount = skill.hitCount || 1;
  const extraHits = talentModifiers?.extraHitCount || 0;
  const hitCount = baseHitCount + extraHits;

  if (extraHits > 0) {
    logs.push(`【天赋效果】连击+${extraHits}`);
  }
  let totalActualDamage = 0;
  let anyHit = false;
  let anyCrit = false;

  // 1. 计算基础伤害（每次攻击相同）
  const baseDamage = calculateBaseDamage(attacker, skill);

  if (hitCount > 1) {
    logs.push(`【${hitCount}连击技能】`);
  }
  logs.push(`单次基础伤害: ${baseDamage}`);

  // 对每次攻击进行独立判定
  for (let i = 0; i < hitCount; i++) {
    const hitLog: string[] = [];
    if (hitCount > 1) {
      hitLog.push(`--- 第${i + 1}击 ---`);
    }

    // 2. 判定闪避（每次攻击独立判定，天赋可保证命中）
    const dodged = talentModifiers?.guaranteedHit
      ? false
      : checkDodge(attacker.stats.luck, target.stats.evasion, skill.accuracy);
    if (dodged) {
      hits.push({ damage: 0, isCritical: false, isDodged: true });
      hitLog.push(`${target.name} 闪避了攻击!`);
      if (hitCount > 1) {
        hitLog.push(`本次伤害: 0 (被闪避)`);
      }
      logs.push(...hitLog);
      continue;
    }

    anyHit = true;

    // 3. 判定暴击（每次攻击独立判定，天赋可保证暴击）
    const critical = talentModifiers?.guaranteedCrit
      ? true
      : checkCritical(attacker.stats.crit, attacker.stats.luck, skill.critModifier);
    if (critical) anyCrit = true;

    let finalDamage = baseDamage;
    let damageBeforeCap = baseDamage;

    if (critical) {
      // 基础暴击倍率1.5，天赋可额外增加
      const critMultiplier = 1.5 + (talentModifiers?.critDamageBoost || 0) / 100;
      finalDamage = Math.floor(baseDamage * critMultiplier);
      damageBeforeCap = finalDamage;
      if (talentModifiers?.critDamageBoost) {
        hitLog.push(`暴击! 伤害提升${Math.floor(critMultiplier * 100)}%（含天赋加成）`);
      } else {
        hitLog.push(`暴击! 伤害提升50%`);
      }
    } else {
      hitLog.push(`普通命中`);
    }

    // 应用天赋伤害倍率（如先发制人）
    if (talentModifiers?.damageMultiplier && talentModifiers.damageMultiplier > 1) {
      finalDamage = Math.floor(finalDamage * talentModifiers.damageMultiplier);
      hitLog.push(`天赋伤害倍率: x${talentModifiers.damageMultiplier}`);
    }

    // 4. 应用防御减伤（玩家攻击时应用等级压制）
    const targetEndurance = target.stats.baseEndurance;
    const damageAfterDefense = applyDefenseReduction(
      finalDamage,
      targetEndurance,
      isPlayerAttacking,
      attacker.stats.level,
      target.stats.level,
    );
    finalDamage = damageAfterDefense;

    // 5. 应用buff修正
    finalDamage = applyBuffModifiers(finalDamage, attacker, target);
    damageBeforeCap = finalDamage;

    // 6. 应用快感上限限制（每次攻击独立计算，最多造成目标最大快感的40%）
    const maxPleasureCap = Math.floor(target.stats.maxPleasure * 0.4);
    let cappedByLimit = false;
    if (finalDamage > maxPleasureCap) {
      finalDamage = maxPleasureCap;
      cappedByLimit = true;
    }

    hits.push({ damage: finalDamage, isCritical: critical, isDodged: false });
    totalActualDamage += finalDamage;

    // 详细的伤害日志
    if (cappedByLimit) {
      hitLog.push(`伤害计算: ${damageBeforeCap} → ${finalDamage} (受40%上限限制)`);
    } else {
      hitLog.push(`本次伤害: ${finalDamage}`);
    }
    logs.push(...hitLog);
  }

  // 汇总日志
  if (hitCount > 1) {
    const hitSuccessCount = hits.filter(h => !h.isDodged).length;
    const critCount = hits.filter(h => h.isCritical).length;
    logs.push(`--- 连击汇总 ---`);
    logs.push(`命中: ${hitSuccessCount}/${hitCount}次`);
    if (critCount > 0) {
      logs.push(`暴击: ${critCount}次`);
    }
    logs.push(`总伤害: ${totalActualDamage}`);
  }

  const result: CombatResult = {
    damage: baseDamage,
    isCritical: anyCrit,
    isDodged: !anyHit,
    actualDamage: totalActualDamage,
    logs: logs,
    hitCount: hits.filter(h => !h.isDodged).length,
    totalDamage: totalActualDamage,
    hits: hits,
  };

  return result;
}

/**
 * 应用技能的buff效果
 * @param target 目标角色
 * @param skill 技能数据
 */
export function applySkillBuffs(target: Character, skill: SkillData): string[] {
  const logs: string[] = [];

  for (const buff of skill.buffs) {
    // 检查是否已有相同类型的buff
    const existingBuffIndex = target.statusEffects.findIndex(effect => effect.effect.type === buff.type);

    if (existingBuffIndex >= 0 && !buff.stackable) {
      // 不可叠加,刷新持续时间
      target.statusEffects[existingBuffIndex].duration = buff.duration;
      logs.push(`刷新了 ${target.statusEffects[existingBuffIndex].name} 的持续时间`);
    } else if (existingBuffIndex >= 0 && buff.stackable) {
      // 可叠加,检查层数限制
      const currentStacks = target.statusEffects.filter(effect => effect.effect.type === buff.type).length;
      if (!buff.maxStacks || currentStacks < buff.maxStacks) {
        // 添加新层
        const newEffect: StatusEffect = {
          id: `${buff.type}_${Date.now()}`,
          name: getBuffName(buff.type),
          duration: buff.duration,
          icon: '🎭',
          effect: buff,
          type: isDebuff(buff.type) ? 'debuff' : 'buff',
        };
        target.statusEffects.push(newEffect);
        logs.push(`添加了 ${newEffect.name} (${currentStacks + 1}层)`);
      } else {
        logs.push(`${getBuffName(buff.type)} 已达最大层数`);
      }
    } else {
      // 添加新buff
      const newEffect: StatusEffect = {
        id: `${buff.type}_${Date.now()}`,
        name: getBuffName(buff.type),
        duration: buff.duration,
        icon: '🎭',
        effect: buff,
        type: isDebuff(buff.type) ? 'debuff' : 'buff',
      };
      target.statusEffects.push(newEffect);
      logs.push(`添加了 ${newEffect.name}`);
    }
  }

  return logs;
}

/**
 * 更新所有状态效果的持续时间
 * @param character 角色
 */
export function updateStatusEffects(character: Character): string[] {
  const logs: string[] = [];

  // 减少持续时间并移除过期的效果
  character.statusEffects = character.statusEffects.filter(effect => {
    effect.duration--;
    if (effect.duration <= 0) {
      logs.push(`${character.name} 的 ${effect.name} 效果消失了`);
      return false;
    }
    return true;
  });

  // 处理持续伤害/回复效果
  for (const effect of character.statusEffects) {
    if (effect.effect.type === BuffType.DOT_LUST) {
      const lustChange = effect.effect.value;
      character.stats.currentPleasure += lustChange;
      logs.push(`${character.name} 受到持续快感影响 (${lustChange > 0 ? '+' : ''}${lustChange})`);
    } else if (effect.effect.type === BuffType.REGEN) {
      const regenValue = effect.effect.isPercent
        ? Math.floor((character.stats.maxEndurance * effect.effect.value) / 100)
        : effect.effect.value;
      character.stats.currentEndurance = Math.min(
        character.stats.maxEndurance,
        character.stats.currentEndurance + regenValue,
      );
      logs.push(`${character.name} 回复了 ${regenValue} 点耐力`);
    }
  }

  return logs;
}

/**
 * 获取buff的中文名称
 */
function getBuffName(type: BuffType): string {
  const names: Record<BuffType, string> = {
    [BuffType.ATK_UP]: '攻击提升',
    [BuffType.DEF_UP]: '防御提升',
    [BuffType.ATK_DOWN]: '攻击下降',
    [BuffType.DEF_DOWN]: '防御下降',
    [BuffType.SENSITIVE]: '敏感',
    [BuffType.SILENCE]: '沉默',
    [BuffType.BIND]: '束缚',
    [BuffType.DODGE_UP]: '闪避提升',
    [BuffType.DODGE_DOWN]: '闪避下降',
    [BuffType.CRIT_UP]: '暴击提升',
    [BuffType.LUCK_DOWN]: '幸运下降',
    [BuffType.CHARM_DOWN]: '魅力下降',
    [BuffType.FOCUS]: '集中',
    [BuffType.SHAME]: '羞耻',
    [BuffType.HEAT]: '发情',
    [BuffType.FEAR]: '恐惧',
    [BuffType.DOT_LUST]: '持续快感',
    [BuffType.REGEN]: '持续回复',
  };
  return names[type] || '未知效果';
}

/**
 * 判断是否为debuff
 */
function isDebuff(type: BuffType): boolean {
  const debuffs = [
    BuffType.ATK_DOWN,
    BuffType.DEF_DOWN,
    BuffType.SENSITIVE,
    BuffType.SILENCE,
    BuffType.BIND,
    BuffType.DODGE_DOWN,
    BuffType.LUCK_DOWN,
    BuffType.CHARM_DOWN,
    BuffType.SHAME,
    BuffType.HEAT,
    BuffType.FEAR,
    BuffType.DOT_LUST,
  ];
  return debuffs.includes(type);
}
