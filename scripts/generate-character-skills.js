/**
 * 从世界书角色条目中提取真实技能并生成数据库
 */

const fs = require('fs');
const path = require('path');

const worldBookPath = 'd:/SillyTavern/角色卡/自己的卡/世界书/性斗学园';

// 读取角色文件并提取技能
function extractSkillsFromCharacter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let characterName = '';
    let level = 50;
    let inSkillSection = false;
    let currentCategory = '';
    const skills = {};
    
    // 提取角色名和等级
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 提取角色名
      if (line.includes('角色名:') || line.includes('姓名:')) {
        characterName = line.split(':')[1]?.trim() || '';
      }
      
      // 提取等级
      if (line.includes('等级:')) {
        const levelMatch = line.match(/等级:\s*(\d+)/);
        if (levelMatch) level = parseInt(levelMatch[1]);
      }
      
      // 检测技能列表开始
      if (line.includes('技能列表:')) {
        inSkillSection = true;
        continue;
      }
      
      // 检测技能列表结束
      if (inSkillSection && (line.includes('语言风格') || line.includes('立绘') || line.includes('===') || i === lines.length - 1)) {
        inSkillSection = false;
        break;
      }
      
      // 在技能区域内提取技能
      if (inSkillSection) {
        // 检测技能分类（如"德军关节技:"）
        if (line.endsWith(':') && !line.startsWith('-')) {
          currentCategory = line.replace(':', '').trim();
          if (!skills[currentCategory]) skills[currentCategory] = [];
        }
        // 提取具体技能（以"-"开头）
        else if (line.startsWith('-')) {
          const skillMatch = line.match(/^-\s*([^:：]+)[：:]\s*(.+)/);
          if (skillMatch && currentCategory) {
            skills[currentCategory].push({
              name: skillMatch[1].trim(),
              description: skillMatch[2].trim()
            });
          }
        }
      }
    }
    
    return { characterName, level, skills };
  } catch (e) {
    console.warn(`读取文件失败: ${filePath}`, e.message);
    return null;
  }
}

// 将技能转换为SkillData格式
function convertToSkillData(characterName, skillName, description, level, index, category) {
  const skillId = `${characterName}_${index + 1}`;
  
  // 根据技能描述判断类型
  let type = 'SkillType.PHYSICAL';
  let staminaCost = 15;
  let cooldown = 3;
  let damageCoeff = 1.2;
  let charmCoeff = 0;
  let buffs = [];
  let hitCount = 1;
  let accuracy = 90;
  let critModifier = 20;
  let castTime = 0;
  
  const desc = description.toLowerCase();
  
  // 判断技能类型和效果（仅使用MVU支持的效果类型）
  if (desc.includes('束缚') || desc.includes('锁定') || desc.includes('固定') || desc.includes('压制')) {
    type = 'SkillType.CONTROL';
    staminaCost = Math.floor(15 + level * 0.15);
    cooldown = 4;
    damageCoeff = 0.8;
    buffs.push({ type: 'BuffType.BIND', value: 0, isPercent: false, duration: Math.min(Math.floor(level / 30) + 1, 3), stackable: false });
  }
  else if (desc.includes('魅惑') || desc.includes('诱惑') || desc.includes('精神') || desc.includes('催眠') || desc.includes('洗脑')) {
    type = 'SkillType.MENTAL';
    staminaCost = Math.floor(12 + level * 0.12);
    cooldown = 3;
    damageCoeff = 0.5;
    charmCoeff = 3.0 + level * 0.02;
    buffs.push({ type: 'BuffType.WILLPOWER_DOWN', value: Math.floor(10 + level * 0.15), isPercent: true, duration: 2, stackable: true, maxStacks: 3 });
  }
  else if (desc.includes('气味') || desc.includes('体香') || desc.includes('香气') || desc.includes('嗅觉')) {
    type = 'SkillType.CHARM';
    staminaCost = Math.floor(10 + level * 0.1);
    cooldown = 2;
    charmCoeff = 2.5 + level * 0.02;
    // 气味攻击降低意志力而非增加敏感度
    buffs.push({ type: 'BuffType.WILLPOWER_DOWN', value: Math.floor(15 + level * 0.15), isPercent: true, duration: 2, stackable: true, maxStacks: 3 });
  }
  else if (desc.includes('恢复') || desc.includes('治疗') || desc.includes('回复')) {
    type = 'SkillType.SUPPORT';
    staminaCost = Math.floor(8 + level * 0.08);
    cooldown = 5;
    damageCoeff = 0;
    // 恢复技能不添加buff，直接在伤害计算中处理
  }
  else if (desc.includes('终极') || desc.includes('必杀') || desc.includes('奥义') || desc.includes('绝技')) {
    type = 'SkillType.ULTIMATE';
    staminaCost = Math.floor(25 + level * 0.25);
    cooldown = 7;
    castTime = 1;
    damageCoeff = 2.0 + level * 0.02;
    charmCoeff = 1.5 + level * 0.01;
    critModifier = 40;
    // 终极技能降低意志力
    buffs.push({ type: 'BuffType.WILLPOWER_DOWN', value: Math.floor(20 + level * 0.2), isPercent: true, duration: 3, stackable: false });
  }
  else {
    // 默认物理攻击
    damageCoeff = 1.0 + level * 0.015;
    staminaCost = Math.floor(12 + level * 0.12);
    
    // 检测特殊效果（仅使用MVU支持的效果）
    if (desc.includes('连击') || desc.includes('连续')) {
      hitCount = 2;
      damageCoeff *= 0.9;
    }
    if (desc.includes('暴击') || desc.includes('致命')) {
      critModifier = 35 + Math.floor(level * 0.2);
    }
    if (desc.includes('意志') || desc.includes('精神')) {
      buffs.push({ type: 'BuffType.WILLPOWER_DOWN', value: Math.floor(10 + level * 0.15), isPercent: true, duration: 2, stackable: true, maxStacks: 3 });
    }
    if (desc.includes('闪避') || desc.includes('躲避')) {
      buffs.push({ type: 'BuffType.DODGE_DOWN', value: Math.floor(15 + level * 0.1), isPercent: true, duration: 2, stackable: false });
    }
  }
  
  // 计算基础伤害
  const baseDamage = Math.floor(level * 0.2);
  
  // 构建伤害公式（生成TypeScript代码字符串）
  const damageFormulaParts = [];
  if (damageCoeff > 0) {
    damageFormulaParts.push(`{ source: DamageSource.SEX_POWER, coefficient: ${damageCoeff.toFixed(2)}, baseValue: ${baseDamage} }`);
  }
  if (charmCoeff > 0) {
    damageFormulaParts.push(`{ source: DamageSource.CHARM, coefficient: ${charmCoeff.toFixed(2)}, baseValue: ${Math.floor(baseDamage * 0.8)} }`);
  }
  const damageFormula = `[${damageFormulaParts.join(', ')}]`;
  
  // 生成效果描述（仅包含MVU支持的效果）
  let effectDesc = '';
  if (damageCoeff > 0) effectDesc += `造成${Math.floor(damageCoeff * 100)}%性斗力伤害`;
  if (charmCoeff > 0) effectDesc += (effectDesc ? '，' : '') + `${Math.floor(charmCoeff * 100)}%魅力伤害`;
  if (buffs.length > 0) {
    buffs.forEach(buff => {
      if (buff.type === 'BuffType.BIND') effectDesc += '，束缚' + buff.duration + '回合';
      else if (buff.type === 'BuffType.WILLPOWER_DOWN') effectDesc += '，意志力-' + buff.value + '%';
      else if (buff.type === 'BuffType.DODGE_DOWN') effectDesc += '，闪避率-' + buff.value + '%';
      else if (buff.type === 'BuffType.CRIT_UP') effectDesc += '，暴击率+' + buff.value + '%';
    });
  }
  
  // 选择图标
  let icon = 'Sword';
  if (type.includes('MENTAL')) icon = 'Brain';
  else if (type.includes('CHARM')) icon = 'Heart';
  else if (type.includes('CONTROL')) icon = 'Lock';
  else if (type.includes('SUPPORT')) icon = 'Shield';
  else if (type.includes('ULTIMATE')) icon = 'Sparkles';
  
  // 构建buffs（生成TypeScript代码字符串）
  let buffsCode = '[]';
  if (buffs.length > 0) {
    const buffParts = buffs.map(buff => {
      return `{ type: ${buff.type}, value: ${buff.value}, isPercent: ${buff.isPercent}, duration: ${buff.duration}, stackable: ${buff.stackable}${buff.maxStacks ? `, maxStacks: ${buff.maxStacks}` : ''} }`;
    });
    buffsCode = `[${buffParts.join(', ')}]`;
  }
  
  return {
    id: skillId,
    name: skillName,
    description: description.substring(0, 100),
    effectDescription: effectDesc || '造成伤害',
    icon,
    type,
    buffsCode, // 新增：TypeScript代码格式的buffs
    staminaCost,
    cooldown,
    castTime,
    damageFormula, // TypeScript代码格式
    accuracy,
    critModifier,
    buffs: buffsCode, // TypeScript代码格式
    canBeReflected: false,
    hitCount
  };
}

// 主函数
function main() {
  const characterFiles = fs.readdirSync(worldBookPath)
    .filter(f => f.endsWith('.txt') && !f.startsWith('[') && !f.includes('列表') && !f.includes('教室') && !f.includes('办公室') && !f.includes('广场') && !f.includes('图书馆') && !f.includes('联盟') && !f.includes('入口') && !f.includes('温泉') && !f.includes('商店') && !f.includes('通道') && !f.includes('交易') && !f.includes('黑市') && !f.includes('主线') && !f.includes('COT') && !f.includes('EJS'));
  
  const allCharacterSkills = {};
  const skillMap = {};
  
  console.log(`找到 ${characterFiles.length} 个角色文件`);
  
  characterFiles.forEach(file => {
    const filePath = path.join(worldBookPath, file);
    const result = extractSkillsFromCharacter(filePath);
    
    if (result && result.characterName && Object.keys(result.skills).length > 0) {
      const { characterName, level, skills } = result;
      console.log(`✓ ${characterName} (Lv.${level}) - ${Object.keys(skills).length}个技能分类`);
      
      const characterSkillList = [];
      let skillIndex = 0;
      
      // 遍历所有技能分类
      Object.entries(skills).forEach(([category, skillList]) => {
        skillList.forEach(skill => {
          const skillData = convertToSkillData(
            characterName,
            skill.name,
            skill.description,
            level,
            skillIndex,
            category
          );
          characterSkillList.push(skillData);
          allCharacterSkills[skillData.id] = skillData;
          skillIndex++;
        });
      });
      
      if (characterSkillList.length > 0) {
        skillMap[characterName] = characterSkillList.map(s => s.id);
      }
    }
  });
  
  console.log(`\n总计: ${Object.keys(skillMap).length} 个角色, ${Object.keys(allCharacterSkills).length} 个技能`);
  
  // 生成TypeScript文件
  const tsContent = `/**
 * 敌人技能数据库 - 基于世界书角色条目生成
 * 包含 ${Object.keys(skillMap).length} 个角色的 ${Object.keys(allCharacterSkills).length} 个真实技能
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
${Object.entries(allCharacterSkills).map(([id, skill]) => `  '${id}': {
    id: '${skill.id}',
    name: '${skill.name}',
    description: '${skill.description.replace(/'/g, "\\'")}',
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
  // 映射伤害来源
  const sourceMap: Record<string, '性斗力' | '魅力' | '幸运' | '意志力' | '固定值'> = {
    [DamageSource.SEX_POWER]: '性斗力',
    [DamageSource.CHARM]: '魅力',
    [DamageSource.LUCK]: '幸运',
    [DamageSource.WILLPOWER]: '意志力',
    [DamageSource.FIXED]: '固定值',
  };
  const damageSource = sourceMap[skill.damageFormula[0]?.source] || '性斗力';
  
  // 构建效果列表
  const effectList: Record<string, any> = {};
  if (skill.buffs && skill.buffs.length > 0) {
    skill.buffs.forEach((buff, index) => {
      const buffTypeMap: Record<string, '性斗力' | '忍耐力' | '魅力' | '幸运' | '闪避率' | '暴击率' | '意志力' | '束缚'> = {
        [BuffType.BIND]: '束缚',
        [BuffType.WILLPOWER_DOWN]: '意志力',
        [BuffType.DODGE_DOWN]: '闪避率',
        [BuffType.ATK_UP]: '性斗力',
        [BuffType.ATK_DOWN]: '性斗力',
        [BuffType.CRIT_UP]: '暴击率',
      };
      const effectType = buffTypeMap[buff.type] || '性斗力';
      let effectValue = buff.value;
      
      // 束缚使用持续回合作为效果值，debuff使用负值
      if (buff.type === BuffType.BIND) {
        effectValue = buff.duration;
      } else if (buff.type === BuffType.WILLPOWER_DOWN || buff.type === BuffType.DODGE_DOWN || buff.type === BuffType.ATK_DOWN) {
        effectValue = -Math.abs(buff.value);
      }
      
      effectList[\`效果\${index + 1}_\${effectType}\`] = {
        效果类型: effectType,
        效果值: effectValue,
        是否为百分比: buff.isPercent,
        持续回合数: buff.duration,
      };
    });
  }
  
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
      伤害来源: damageSource,
      系数: Math.round((skill.damageFormula[0]?.coefficient || 1) * 100),
      基础命中率: skill.accuracy,
      效果列表: effectList,
    },
    特殊机制: {
      是否忽视防御: false,
      是否可被闪避: true,
    },
  };
}
`;
  
  const outputPath = path.join(__dirname, '../src/性斗学园/战斗界面/enemySkillDatabase.ts');
  fs.writeFileSync(outputPath, tsContent, 'utf8');
  
  console.log(`\n✅ 已生成技能数据库`);
  console.log(`📁 文件路径: ${outputPath}`);
}

main();
