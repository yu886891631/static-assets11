const fs = require('fs');
const path = require('path');

const dir = 'D:/SillyTavern/角色卡/自己的卡/世界书/性斗学园';
const outputFile = path.join(__dirname, '../src/性斗学园/战斗界面/enemyDatabase.ts');

// 读取现有数据库
const existingContent = fs.readFileSync(outputFile, 'utf-8');
const existingMatches = existingContent.match(/'([^']+)':\s*\{/g) || [];
const existing = new Set(existingMatches.map(m => m.match(/'([^']+)'/)[1]));

// 获取所有人物文件
const files = fs.readdirSync(dir).filter(f => 
  f.endsWith('.txt') && 
  !f.startsWith('_') && 
  !f.startsWith('[') &&
  !f.includes('人物列表') &&
  !f.includes('模板') &&
  !f.includes('地图') &&
  !f.includes('战斗系统') &&
  !f.includes('主线') &&
  !f.includes('随机事件') &&
  !f.includes('文风') &&
  !f.includes('数值') &&
  !f.includes('注意事项') &&
  !f.includes('商店') &&
  !f.includes('地点') &&
  !f.includes('神社') &&
  !f.includes('竞技场')
);

const newEntries = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const nameMatch = content.match(/姓名:\s*([^\n]+)/);
    if (!nameMatch) return;
    
    const name = nameMatch[1].trim();
    if (existing.has(name)) {
      console.log(`已存在: ${name}`);
      return;
    }
    
    // 提取MVU变量数据
    const mvuSection = content.match(/## MVU变量数据.*?### 对手基础属性\n([\s\S]*?)(?=\n\n|\n  外貌|$)/);
    if (!mvuSection) {
      console.log(`未找到MVU数据: ${name} (${file})`);
      return;
    }
    
    const mvuText = mvuSection[1];
    
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
    
    // 检查是否有有效数据
    const hasData = mvuData.对手性斗力 > 0 || mvuData.对手最大耐力 > 0 || mvuData.对手魅力 > 0;
    
    if (hasData) {
      newEntries.push({ name, data: mvuData, file });
      console.log(`提取成功: ${name}`);
    } else {
      console.log(`数据无效: ${name} (${file})`);
    }
  } catch (e) {
    console.error(`处理文件 ${file} 时出错:`, e.message);
  }
});

// 生成新的数据库条目代码
let newCode = '';
newEntries.forEach(({ name, data }) => {
  newCode += `  '${name}': {\n`;
  newCode += `    对手魅力: ${data.对手魅力},\n`;
  newCode += `    对手幸运: ${data.对手幸运},\n`;
  newCode += `    对手闪避率: ${data.对手闪避率},\n`;
  newCode += `    对手暴击率: ${data.对手暴击率},\n`;
  newCode += `    对手意志力: ${data.对手意志力},\n`;
  newCode += `    对手耐力: ${data.对手耐力},\n`;
  newCode += `    对手最大耐力: ${data.对手最大耐力},\n`;
  newCode += `    对手快感: ${data.对手快感},\n`;
  newCode += `    对手最大快感: ${data.对手最大快感},\n`;
  newCode += `    对手高潮次数: ${data.对手高潮次数},\n`;
  newCode += `    对手性斗力: ${data.对手性斗力},\n`;
  newCode += `    对手忍耐力: ${data.对手忍耐力},\n`;
  newCode += `    对手临时状态: {},\n`;
  newCode += `    对手技能冷却: {},\n`;
  newCode += `  },\n`;
});

console.log(`\n找到 ${newEntries.length} 个新角色`);
console.log('\n新条目代码:');
console.log(newCode);

// 将新条目追加到文件
if (newEntries.length > 0) {
  const content = fs.readFileSync(outputFile, 'utf-8');
  const insertPos = content.lastIndexOf('  // 注意：如需添加更多人物');
  if (insertPos > 0) {
    const newContent = content.slice(0, insertPos) + newCode + '\n' + content.slice(insertPos);
    fs.writeFileSync(outputFile, newContent, 'utf-8');
    console.log(`\n已更新 ${outputFile}`);
  }
}

