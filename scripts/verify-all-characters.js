const fs = require('fs');
const path = require('path');

// 从人物列表中提取的角色名称（根据人物列表.txt）
const expectedCharacters = [
  // 教师
  '白石响子',
  '绫濑川',
  '维纳斯',
  '索菲亚',
  '莉莉安',
  '弗洛拉·梅斯梅尔',
  '布伦希尔德',
  '加藤鹰',
  '佐藤健',
  // 学生会
  '艾琳·海德',
  '神崎凛',
  '爱丽丝·温特',
  // 女权协会
  '莎拉·斯通',
  '维多利亚·戈德温',
  '艾丽卡·施耐德',
  '雪莉·克里姆希尔德',
  '白川千夏',
  // BF社
  '明日香',
  '艾米丽·威廉姆斯',
  // 体育联盟
  '安娜·科兹洛娃',
  '赵婷婷',
  '李小云',
  // 研究会
  '克劳迪娅·威斯特',
  '中岛诗织',
  '月下香',
  '黑塔小姐',
  // 地下联盟
  '露娜·拉克缇丝',
  '伊丽莎白·夜羽',
  '樱岛麻衣',
  '潘多拉小姐',
  // 雌堕会
  '蝶',
  '雪',
  '风',
  // 男性自保联盟
  '田中勇',
  '李强',
  // 学生综合服务中心
  '如月诗乃',
  '森莉花',
  '阿米莉亚·安斯华斯',
  '樱井结衣',
  // 独立势力
  '安琪',
  '美咲绫',
  '角楯花凛',
  '月城遥',
  '零',
  '桃乃 爱',
  '上杉 亚衣',
  '风音',
  '铃音',
  // S班
  '天宫院·抚子',
  '索亚·伊万诺娃',
  '九条凛音',
  // A班
  '凰天羽',
  '赤城 朱音',
  '蓝原结衣',
  '橘美玲',
  // B班
  '克里奥佩特拉七世',
  '星野光',
  '望月静',
  '早坂蕾娜',
  // C班
  '伊尼亚·德·瓦卢瓦',
  '娜拉',
  '小鸟游雏子',
  '猫宫宁宁',
  '犬饲真子',
  // D班
  '娜塔莎·斯迈尔',
  '铃木惠美',
  '山田花子',
  '佐藤幸子',
];

const dir = 'D:/SillyTavern/角色卡/自己的卡/世界书/性斗学园';
const dbFile = path.join(__dirname, '../src/性斗学园/战斗界面/enemyDatabase.ts');

// 读取数据库文件
const dbContent = fs.readFileSync(dbFile, 'utf-8');

// 提取数据库中的所有角色名称
const dbMatches = dbContent.match(/(?:^  ['"]([^'"]+)['"]:|^  ([a-zA-Z\u4e00-\u9fa5·\s]+):)/gm) || [];
const dbCharacters = new Set();
dbMatches.forEach(match => {
  const nameMatch = match.match(/(?:['"]([^'"]+)['"]|([a-zA-Z\u4e00-\u9fa5·\s]+)):/);
  if (nameMatch) {
    const name = nameMatch[1] || nameMatch[2];
    dbCharacters.add(name.trim());
  }
});

console.log('=== 角色录入检查 ===\n');
console.log(`数据库中的角色数量: ${dbCharacters.size}`);
console.log(`期望的角色数量: ${expectedCharacters.length}\n`);

// 检查缺失的角色
const missing = expectedCharacters.filter(name => !dbCharacters.has(name));
if (missing.length > 0) {
  console.log('❌ 缺失的角色:');
  missing.forEach(name => console.log(`  - ${name}`));
} else {
  console.log('✅ 所有角色都已录入');
}

// 检查多余的角色
const extra = Array.from(dbCharacters).filter(name => !expectedCharacters.includes(name));
if (extra.length > 0) {
  console.log('\n⚠️  数据库中多余的角色:');
  extra.forEach(name => console.log(`  - ${name}`));
}

// 验证每个角色的数据
console.log('\n=== 数据验证 ===\n');

let allCorrect = true;
const errors = [];

for (const charName of expectedCharacters) {
  if (!dbCharacters.has(charName)) {
    continue; // 跳过缺失的角色
  }

  // 查找角色文件
  let charFile = null;
  const possibleFiles = [
    `${charName}.txt`,
    `_${charName}.txt`,
    charName.replace(/\s+/g, '·') + '.txt',
    charName.replace(/·/g, ' ') + '.txt',
  ];

  for (const fileName of possibleFiles) {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      charFile = filePath;
      break;
    }
  }

  if (!charFile) {
    // 尝试模糊匹配
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.txt') && !f.startsWith('['));
    const matched = files.find(f => {
      const baseName = f.replace('.txt', '').replace(/^_/, '');
      return baseName === charName || baseName.includes(charName) || charName.includes(baseName);
    });
    if (matched) {
      charFile = path.join(dir, matched);
    }
  }

  if (!charFile) {
    errors.push(`${charName}: 找不到角色文件`);
    allCorrect = false;
    continue;
  }

  try {
    const content = fs.readFileSync(charFile, 'utf-8');
    const mvuSection = content.match(/## MVU变量数据.*?### 对手基础属性\n([\s\S]*?)(?=\n\n|\n  外貌|$)/);

    if (!mvuSection) {
      errors.push(`${charName}: 文件中没有MVU变量数据`);
      allCorrect = false;
      continue;
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

    const fileData = {
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
    };

    // 从数据库文件中提取该角色的数据
    const dbEntryMatch = dbContent.match(
      new RegExp(
        `(?:['"]${charName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]|${charName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}):\\s*\\{[\\s\\S]*?对手魅力:\\s*(\\d+)[\\s\\S]*?对手幸运:\\s*(\\d+)[\\s\\S]*?对手闪避率:\\s*(\\d+)[\\s\\S]*?对手暴击率:\\s*(\\d+)[\\s\\S]*?对手意志力:\\s*(\\d+)[\\s\\S]*?对手耐力:\\s*(\\d+)[\\s\\S]*?对手最大耐力:\\s*(\\d+)[\\s\\S]*?对手快感:\\s*(\\d+)[\\s\\S]*?对手最大快感:\\s*(\\d+)[\\s\\S]*?对手高潮次数:\\s*(\\d+)[\\s\\S]*?对手性斗力:\\s*(\\d+)[\\s\\S]*?对手忍耐力:\\s*(\\d+)`,
      ),
    );

    if (!dbEntryMatch) {
      errors.push(`${charName}: 无法从数据库文件中提取数据`);
      allCorrect = false;
      continue;
    }

    const dbData = {
      对手魅力: parseInt(dbEntryMatch[1]),
      对手幸运: parseInt(dbEntryMatch[2]),
      对手闪避率: parseInt(dbEntryMatch[3]),
      对手暴击率: parseInt(dbEntryMatch[4]),
      对手意志力: parseInt(dbEntryMatch[5]),
      对手耐力: parseInt(dbEntryMatch[6]),
      对手最大耐力: parseInt(dbEntryMatch[7]),
      对手快感: parseInt(dbEntryMatch[8]),
      对手最大快感: parseInt(dbEntryMatch[9]),
      对手高潮次数: parseInt(dbEntryMatch[10]),
      对手性斗力: parseInt(dbEntryMatch[11]),
      对手忍耐力: parseInt(dbEntryMatch[12]),
    };

    // 比较数据
    const mismatches = [];
    for (const key of Object.keys(fileData)) {
      if (fileData[key] !== dbData[key]) {
        mismatches.push(`${key}: 文件=${fileData[key]}, 数据库=${dbData[key]}`);
      }
    }

    if (mismatches.length > 0) {
      errors.push(`${charName}:`);
      mismatches.forEach(m => errors.push(`  - ${m}`));
      allCorrect = false;
    }
  } catch (e) {
    errors.push(`${charName}: 读取文件时出错 - ${e.message}`);
    allCorrect = false;
  }
}

if (errors.length > 0) {
  console.log('❌ 发现错误:');
  errors.forEach(e => console.log(e));
} else {
  console.log('✅ 所有角色数据验证通过！');
}

console.log(`\n总计检查: ${expectedCharacters.length} 个角色`);
console.log(`验证通过: ${expectedCharacters.length - errors.length} 个角色`);
console.log(`发现错误: ${errors.length} 个`);

process.exit(allCorrect ? 0 : 1);
