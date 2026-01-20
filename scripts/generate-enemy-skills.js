/**
 * 生成敌人技能数据库
 * 为所有角色创建至少3个技能
 */

const fs = require('fs');
const path = require('path');

// 所有角色列表（从人物列表.txt提取）
const characters = {
  // 教职人员
  teachers: [
    { name: '伊甸阿斯莫德', level: 99, type: 'ultimate' },
    { name: '白石响子', level: 85, type: 'teacher' },
    { name: '绫濑川', level: 82, type: 'teacher' },
    { name: '维纳斯', level: 78, type: 'teacher' },
    { name: '索菲亚', level: 70, type: 'teacher' },
    { name: '莉莉安', level: 68, type: 'teacher' },
    { name: '弗洛拉梅斯梅尔', level: 75, type: 'teacher' },
    { name: '布伦希尔德', level: 80, type: 'teacher' },
    { name: '加藤鹰', level: 99, type: 'legendary' },
    { name: '佐藤健', level: 65, type: 'teacher' },
  ],
  // 学生会
  studentCouncil: [
    { name: '艾琳海德', level: 88, type: 'elite' },
    { name: '神崎凛', level: 72, type: 'elite' },
    { name: '爱丽丝温特', level: 99, type: 'legendary' },
  ],
  // 女权协会
  feminist: [
    { name: '莎拉斯通', level: 75, type: 'elite' },
    { name: '维多利亚戈德温', level: 73, type: 'elite' },
    { name: '艾丽卡施耐德', level: 65, type: 'elite' },
    { name: '雪莉克里姆希尔德', level: 50, type: 'student' },
    { name: '白川千夏', level: 40, type: 'student' },
  ],
  // BF社
  bf: [
    { name: '明日香', level: 74, type: 'elite' },
    { name: '艾米丽威廉姆斯', level: 70, type: 'elite' },
  ],
  // 体育联盟
  sports: [
    { name: '安娜科兹洛娃', level: 68, type: 'elite' },
    { name: '赵婷婷', level: 65, type: 'elite' },
    { name: '李小云', level: 62, type: 'elite' },
  ],
  // 研究会
  research: [
    { name: '克劳迪娅威斯特', level: 80, type: 'elite' },
    { name: '中岛诗织', level: 60, type: 'elite' },
    { name: '月下香', level: 76, type: 'elite' },
    { name: '黑塔小姐', level: 45, type: 'student' },
  ],
  // 地下联盟
  underground: [
    { name: '露娜拉克缇丝', level: 85, type: 'elite' },
    { name: '伊丽莎白夜羽', level: 80, type: 'elite' },
    { name: '樱岛麻衣', level: 75, type: 'elite' },
    { name: '潘多拉小姐', level: 78, type: 'elite' },
  ],
  // 雌堕会
  feminization: [
    { name: '蝶', level: 70, type: 'elite' },
    { name: '雪', level: 60, type: 'elite' },
    { name: '风', level: 50, type: 'student' },
  ],
  // 男性自保联盟
  male: [
    { name: '田中勇', level: 35, type: 'weak' },
    { name: '李强', level: 30, type: 'weak' },
  ],
  // 学生综合服务中心
  service: [
    { name: '如月诗乃', level: 55, type: 'student' },
    { name: '森莉花', level: 52, type: 'student' },
    { name: '阿米莉亚安斯华斯', level: 30, type: 'weak' },
    { name: '樱井结衣', level: 28, type: 'weak' },
  ],
  // 独立势力
  independent: [
    { name: '安琪', level: 69, type: 'elite' },
    { name: '美咲绫', level: 68, type: 'elite' },
    { name: '角楯花凛', level: 66, type: 'elite' },
    { name: '月城遥', level: 55, type: 'student' },
    { name: '零', level: 35, type: 'weak' },
    { name: '桃乃爱', level: 40, type: 'student' },
    { name: '上杉亚衣', level: 32, type: 'weak' },
    { name: '风音', level: 70, type: 'elite' },
    { name: '铃音', level: 70, type: 'elite' },
  ],
  // 一年级S班
  sClass: [
    { name: '天宫院抚子', level: 48, type: 'student' },
    { name: '索亚伊万诺娃', level: 46, type: 'student' },
    { name: '九条凛音', level: 45, type: 'student' },
  ],
  // 一年级A班
  aClass: [
    { name: '凰天羽', level: 42, type: 'student' },
    { name: '赤城朱音', level: 40, type: 'student' },
    { name: '蓝原结衣', level: 38, type: 'student' },
    { name: '橘美玲', level: 35, type: 'weak' },
  ],
  // 一年级B班
  bClass: [
    { name: '克里奥佩特拉七世', level: 37, type: 'student' },
    { name: '星野光', level: 30, type: 'weak' },
    { name: '望月静', level: 28, type: 'weak' },
    { name: '早坂蕾娜', level: 25, type: 'weak' },
  ],
  // 一年级C班
  cClass: [
    { name: '伊尼亚德瓦卢瓦', level: 33, type: 'weak' },
    { name: '娜拉', level: 27, type: 'weak' },
    { name: '小鸟游雏子', level: 22, type: 'weak' },
    { name: '猫宫宁宁', level: 20, type: 'weak' },
    { name: '犬饲真子', level: 18, type: 'weak' },
  ],
  // 一年级D班
  dClass: [
    { name: '娜塔莎斯迈尔', level: 24, type: 'weak' },
    { name: '铃木惠美', level: 15, type: 'weak' },
    { name: '山田花子', level: 12, type: 'special' },
    { name: '佐藤幸子', level: 10, type: 'special' },
  ],
};

// 技能模板生成器
function generateSkills(character) {
  const { name, level, type } = character;
  const skillCount = type === 'legendary' || type === 'ultimate' ? 4 : type === 'elite' ? 4 : 3;
  const skills = [];
  
  // 根据等级计算基础数值
  const baseDamage = Math.floor(level * 0.15);
  const baseStamina = Math.floor(10 + level * 0.1);
  const baseCooldown = type === 'weak' ? 2 : type === 'student' ? 3 : 4;
  
  // 技能1：基础物理攻击
  skills.push({
    id: `${name}_1`,
    name: '强力攻击',
    description: '全力以赴的物理攻击',
    effectDescription: `造成${100 + level}%性斗力伤害`,
    icon: 'Sword',
    type: 'SkillType.PHYSICAL',
    staminaCost: baseStamina,
    cooldown: baseCooldown - 1,
    castTime: 0,
    damageFormula: `[{ source: DamageSource.SEX_POWER, coefficient: ${(1.0 + level * 0.01).toFixed(2)}, baseValue: ${baseDamage} }]`,
    accuracy: 90 + Math.min(level * 0.1, 10),
    critModifier: 15 + Math.min(level * 0.2, 20),
    buffs: '[]',
    canBeReflected: false,
    hitCount: 1,
  });
  
  // 技能2：魅力/精神攻击
  skills.push({
    id: `${name}_2`,
    name: '魅惑诱惑',
    description: '用魅力迷惑对手',
    effectDescription: `造成${250 + level * 2}%魅力伤害，意志力-${10 + Math.floor(level * 0.1)}%`,
    icon: 'Heart',
    type: 'SkillType.CHARM',
    staminaCost: baseStamina + 2,
    cooldown: baseCooldown,
    castTime: 0,
    damageFormula: `[{ source: DamageSource.CHARM, coefficient: ${(2.5 + level * 0.02).toFixed(2)}, baseValue: ${baseDamage + 2} }]`,
    accuracy: 95,
    critModifier: 10 + Math.min(level * 0.15, 15),
    buffs: `[{ type: BuffType.WILLPOWER_DOWN, value: ${10 + Math.floor(level * 0.1)}, isPercent: true, duration: 2, stackable: true, maxStacks: 3 }]`,
    canBeReflected: false,
    hitCount: 1,
  });
  
  // 技能3：控制/支援技能
  if (level >= 40) {
    skills.push({
      id: `${name}_3`,
      name: '束缚控制',
      description: '限制对手的行动',
      effectDescription: `造成${50 + level}%性斗力伤害，束缚${Math.min(Math.floor(level / 30), 2)}回合`,
      icon: 'Chain',
      type: 'SkillType.CONTROL',
      staminaCost: baseStamina + 5,
      cooldown: baseCooldown + 1,
      castTime: 0,
      damageFormula: `[{ source: DamageSource.SEX_POWER, coefficient: ${(0.5 + level * 0.01).toFixed(2)}, baseValue: ${Math.floor(baseDamage * 0.5)} }]`,
      accuracy: 85,
      critModifier: 10,
      buffs: `[{ type: BuffType.BIND, value: 0, isPercent: false, duration: ${Math.min(Math.floor(level / 30), 2)}, stackable: false }]`,
      canBeReflected: false,
      hitCount: 1,
    });
  } else {
    skills.push({
      id: `${name}_3`,
      name: '快速攻击',
      description: '迅速的连续攻击',
      effectDescription: `造成${120 + level}%性斗力伤害，2连击`,
      icon: 'Zap',
      type: 'SkillType.PHYSICAL',
      staminaCost: baseStamina + 3,
      cooldown: baseCooldown,
      castTime: 0,
      damageFormula: `[{ source: DamageSource.SEX_POWER, coefficient: ${(1.2 + level * 0.01).toFixed(2)}, baseValue: ${baseDamage + 1} }]`,
      accuracy: 90,
      critModifier: 20,
      buffs: '[]',
      canBeReflected: false,
      hitCount: 2,
    });
  }
  
  // 技能4：终极技能（仅高级角色）
  if (skillCount >= 4) {
    skills.push({
      id: `${name}_4`,
      name: '终极技',
      description: '全力以赴的终极攻击',
      effectDescription: `造成${180 + level * 2}%性斗力+${150 + level}%魅力伤害`,
      icon: 'Sparkles',
      type: 'SkillType.ULTIMATE',
      staminaCost: baseStamina + 10,
      cooldown: baseCooldown + 3,
      castTime: 1,
      damageFormula: `[{ source: DamageSource.SEX_POWER, coefficient: ${(1.8 + level * 0.02).toFixed(2)}, baseValue: ${baseDamage + 5} }, { source: DamageSource.CHARM, coefficient: ${(1.5 + level * 0.01).toFixed(2)}, baseValue: ${baseDamage + 3} }]`,
      accuracy: 100,
      critModifier: 30 + Math.min(level * 0.2, 20),
      buffs: `[{ type: BuffType.SENSITIVE, value: ${30 + Math.floor(level * 0.2)}, isPercent: true, duration: 3, stackable: false }]`,
      canBeReflected: false,
      hitCount: 1,
    });
  }
  
  return skills;
}

// 生成所有角色的技能
const allCharacters = [];
Object.values(characters).forEach(group => {
  allCharacters.push(...group);
});

const skillMap = {};
const allSkills = {};

allCharacters.forEach(char => {
  const skills = generateSkills(char);
  skillMap[char.name] = skills.map(s => s.id);
  skills.forEach(skill => {
    allSkills[skill.id] = skill;
  });
});

// 生成TypeScript文件内容
const tsContent = `/**
 * 敌人技能数据库 - 自动生成
 * 包含所有${allCharacters.length}个角色的技能信息
 */

import { BuffType, DamageSource, SkillData, SkillType } from './types';

/**
 * 敌人技能映射表
 */
export const ENEMY_SKILL_MAP: Record<string, string[]> = ${JSON.stringify(skillMap, null, 2)};

/**
 * 所有敌人技能数据
 */
export const ENEMY_SKILLS: Record<string, SkillData> = {
${Object.entries(allSkills).map(([id, skill]) => `  '${id}': {
    id: '${skill.id}',
    name: '${skill.name}',
    description: '${skill.description}',
    effectDescription: '${skill.effectDescription}',
    icon: '${skill.icon}',
    type: ${skill.type},
    staminaCost: ${skill.staminaCost},
    cooldown: ${skill.cooldown},
    castTime: ${skill.castTime},
    damageFormula: ${skill.damageFormula},
    accuracy: ${skill.accuracy},
    critModifier: ${skill.critModifier},
    buffs: ${skill.buffs},
    canBeReflected: ${skill.canBeReflected},
    hitCount: ${skill.hitCount},
  }`).join(',\n')}
};

/**
 * 根据角色名称获取技能列表
 */
export function getEnemySkills(enemyName: string): SkillData[] {
  const skillIds = ENEMY_SKILL_MAP[enemyName] || [];
  return skillIds.map(id => ENEMY_SKILLS[id]).filter(Boolean);
}

/**
 * 将技能数据转换为MVU Schema格式
 */
export function convertToMvuSkillFormat(skill: SkillData) {
  return {
    基本信息: {
      技能名称: skill.name,
      技能描述: skill.description,
      技能等级: 1,
      稀有度: 'B' as const,
    },
    冷却与消耗: {
      耐力消耗: skill.staminaCost,
      冷却回合数: skill.cooldown,
    },
    伤害与效果: {
      伤害来源: skill.damageFormula[0]?.source === DamageSource.SEX_POWER ? '性斗力' as const :
                 skill.damageFormula[0]?.source === DamageSource.CHARM ? '魅力' as const :
                 skill.damageFormula[0]?.source === DamageSource.LUCK ? '幸运' as const :
                 skill.damageFormula[0]?.source === DamageSource.WILLPOWER ? '意志力' as const : '固定值' as const,
      系数: (skill.damageFormula[0]?.coefficient || 1) * 100,
      基础命中率: skill.accuracy,
      效果列表: {},
    },
    特殊机制: {
      是否忽视防御: false,
      是否可被闪避: skill.canBeReflected,
    },
  };
}
`;

// 写入文件
const outputPath = path.join(__dirname, '../src/性斗学园/战斗界面/enemySkillDatabase.ts');
fs.writeFileSync(outputPath, tsContent, 'utf8');

console.log(`✅ 已生成 ${allCharacters.length} 个角色的技能数据库`);
console.log(`📁 文件路径: ${outputPath}`);
console.log(`📊 总技能数: ${Object.keys(allSkills).length}`);
