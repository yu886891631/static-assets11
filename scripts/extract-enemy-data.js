const fs = require('fs');
const path = require('path');

const dir = 'D:/SillyTavern/角色卡/自己的卡/世界书/性斗学园';
const files = fs.readdirSync(dir).filter(f => 
  f.endsWith('.txt') && 
  !f.startsWith('_') && 
  !f.startsWith('[') &&
  !f.includes('人物列表') &&
  !f.includes('模板')
);

const data = {};

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    
    // 提取姓名
    const nameMatch = content.match(/姓名:\s*([^\n]+)/);
    if (!nameMatch) return;
    const name = nameMatch[1].trim();
    
    // 提取MVU变量数据部分
    const mvuSection = content.match(/## MVU变量数据.*?### 对手基础属性\n([\s\S]*?)(?=\n\n|\n  外貌|$)/);
    if (!mvuSection) return;
    
    const mvuText = mvuSection[1];
    
    // 解析函数
    const parseValue = (text, key) => {
      const match = text.match(new RegExp(`- ${key}:\\s*([^\\n]+)`));
      return match ? match[1].trim() : null;
    };
    
    const parseNumber = (text, key, defaultValue = 0) => {
      const val = parseValue(text, key);
      if (!val) return defaultValue;
      const num = parseFloat(val);
      return isNaN(num) ? defaultValue : num;
    };
    
    const parseObject = (text, key) => {
      const val = parseValue(text, key);
      if (!val || val === '{}') return {};
      try {
        return JSON.parse(val);
      } catch {
        return {};
      }
    };
    
    // 提取所有属性
    const mvuData = {
      对手魅力: parseNumber(mvuText, '对手魅力'),
      对手幸运: parseNumber(mvuText, '对手幸运'),
      对手闪避率: parseNumber(mvuText, '对手闪避率'),
      对手暴击率: parseNumber(mvuText, '对手暴击率'),
      对手意志力: parseNumber(mvuText, '对手意志力', 100),
      对手耐力: parseNumber(mvuText, '对手耐力'),
      对手最大耐力: parseNumber(mvuText, '对手最大耐力'),
      对手快感: parseNumber(mvuText, '对手快感', 0),
      对手最大快感: parseNumber(mvuText, '对手最大快感'),
      对手高潮次数: parseNumber(mvuText, '对手高潮次数', 0),
      对手性斗力: parseNumber(mvuText, '对手性斗力'),
      对手忍耐力: parseNumber(mvuText, '对手忍耐力'),
      对手临时状态: parseObject(mvuText, '对手临时状态'),
      对手技能冷却: parseObject(mvuText, '对手技能冷却'),
    };
    
    // 检查是否有有效数据（至少有一个非默认值）
    const hasData = Object.values(mvuData).some((v, i) => {
      if (i >= 12) return false; // 跳过对象类型
      return v !== 0 && v !== 100;
    });
    
    if (hasData) {
      data[name] = mvuData;
      console.log(`已提取: ${name}`);
    }
  } catch (e) {
    console.error(`处理文件 ${file} 时出错:`, e.message);
  }
});

// 生成TypeScript代码
const tsCode = `/**
 * 敌人数据库 - 从世界书文件中提取的MVU变量数据
 * 此文件由脚本自动生成，请勿手动编辑
 * 生成时间: ${new Date().toISOString()}
 */

export interface EnemyMvuData {
  对手魅力: number;
  对手幸运: number;
  对手闪避率: number;
  对手暴击率: number;
  对手意志力: number;
  对手耐力: number;
  对手最大耐力: number;
  对手快感: number;
  对手最大快感: number;
  对手高潮次数: number;
  对手性斗力: number;
  对手忍耐力: number;
  对手临时状态: Record<string, any>;
  对手技能冷却: Record<string, number>;
}

/**
 * 敌人数据库 - 根据姓名查找MVU变量数据
 */
export const ENEMY_DATABASE: Record<string, EnemyMvuData> = ${JSON.stringify(data, null, 2)};

/**
 * 根据对手名称获取MVU变量数据
 * @param enemyName 对手名称
 * @returns MVU变量数据，如果不存在则返回null
 */
export function getEnemyMvuData(enemyName: string): EnemyMvuData | null {
  return ENEMY_DATABASE[enemyName] || null;
}

/**
 * 检查是否存在指定名称的敌人数据
 * @param enemyName 对手名称
 * @returns 是否存在
 */
export function hasEnemyData(enemyName: string): boolean {
  return enemyName in ENEMY_DATABASE;
}
`;

// 写入文件
const outputPath = path.join(__dirname, '../src/性斗学园/战斗界面/enemyDatabase.ts');
fs.writeFileSync(outputPath, tsCode, 'utf-8');

console.log(`\n已生成 ${Object.keys(data).length} 个敌人数据`);
console.log(`输出文件: ${outputPath}`);

