const fs = require('fs');
const path = require('path');

const dir = 'D:/SillyTavern/角色卡/自己的卡/世界书/性斗学园';
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
  !f.includes('注意事项')
);

const existing = [
  '爱丽丝·温特',
  '上杉 亚衣',
  '九条凛音',
  '白石响子',
  '神崎凛',
  '月下香',
  '天宫院·抚子',
  '维多利亚·戈德温',
  '艾丽卡·施耐德'
];

const all = [];
const fileMap = {};

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const nameMatch = content.match(/姓名:\s*([^\n]+)/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      all.push(name);
      fileMap[name] = file;
    }
  } catch (e) {
    console.error(`Error reading ${file}:`, e.message);
  }
});

const missing = all.filter(name => !existing.includes(name));

console.log('Total characters found:', all.length);
console.log('Existing in DB:', existing.length);
console.log('Missing:', missing.length);
console.log('\nMissing characters:');
missing.forEach(name => {
  console.log(`  - ${name} (${fileMap[name]})`);
});

