<template>
  <div class="map-page">
    <!-- 地图控制栏 -->
    <div class="map-controls">
      <div class="control-item">
        <label>楼层:</label>
        <select v-model="currentFloor" class="floor-select">
          <option v-for="floor in availableFloors" :key="floor" :value="floor">
            {{ formatFloor(floor) }}
          </option>
        </select>
      </div>
      <div class="control-item">
        <button class="zoom-btn" @click="zoomOut" :disabled="zoomLevel <= 0.5">
          <i class="fas fa-search-minus"></i>
        </button>
        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        <button class="zoom-btn" @click="zoomIn" :disabled="zoomLevel >= 2">
          <i class="fas fa-search-plus"></i>
        </button>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container" ref="mapContainerRef">
      <div class="map-grid" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }">
        <!-- 绘制地图网格 -->
        <div v-for="(row, y) in gridRows" :key="`row-${y}`" class="map-row">
          <div
            v-for="(cell, x) in row"
            :key="`cell-${cell.x}-${cell.y}`"
            class="map-cell"
            :class="getCellClass(cell)"
            @click="selectLocation(cell.x, cell.y)"
          >
            <!-- 显示地点 -->
            <div
              v-if="cell.location && !cell.isEmpty"
              class="location-marker"
              :class="getLocationClass(cell.location)"
              :title="getLocationTooltip(cell.location)"
            >
              <i :class="getLocationIcon(cell.location)"></i>
              <div class="location-label">{{ cell.location.伪装 || cell.location.真实 }}</div>
            </div>

            <!-- 显示坐标（仅当是玩家位置但没有地点时） -->
            <div class="cell-coord" v-if="!cell.location && cell.isPlayerPosition && !cell.isEmpty">
              [{{ cell.x }}-{{ cell.y }}]
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地点详情面板 -->
    <div class="location-detail" v-if="selectedLocation">
      <div class="detail-header">
        <h3>{{ selectedLocation.伪装 || selectedLocation.真实 }}</h3>
        <button class="close-detail" @click="selectedLocation = null">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="detail-content">
        <div class="detail-item" v-if="selectedLocation.真实">
          <span class="detail-label">真实名称:</span>
          <span class="detail-value">{{ selectedLocation.真实 }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">坐标:</span>
          <span class="detail-value">{{ selectedLocation.坐标 }}</span>
        </div>
        <div class="detail-item" v-if="selectedLocation.所属势力">
          <span class="detail-label">所属势力:</span>
          <span class="detail-value">{{ selectedLocation.所属势力 }}</span>
        </div>
      </div>
    </div>

    <!-- 当前位置标记 -->
    <div class="current-location" v-if="currentLocation">
      <i class="fas fa-map-marker-alt"></i>
      <span>当前位置: {{ currentLocation.地点名称 || '未知' }} {{ currentLocation.坐标 || '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = defineProps<{
  characterData: any;
}>();

// 地图数据
const mapLocations = [
  { 坐标: '[0-0]', 伪装: '第七教学楼', 真实: 'D/C班基础教室', 所属势力: '学园公共' },
  { 坐标: '[0-0](2F)', 伪装: '第七教学楼二层', 真实: 'A/B班进阶教室', 所属势力: '学园公共' },
  { 坐标: '[0-1]', 伪装: '园艺社活动室', 真实: '研究会-特殊植物栽培区', 所属势力: '研究会' },
  { 坐标: '[0-2]', 伪装: '废弃仓库', 真实: '男性自保联盟秘密集会点', 所属势力: '男性自保联盟' },
  { 坐标: '[0-3]', 伪装: '第一体育馆', 真实: '体育联盟-综合训练场', 所属势力: '体育联盟' },
  { 坐标: '[0-4]', 伪装: '室内游泳馆', 真实: '体育联盟-游泳部', 所属势力: '体育联盟' },
  { 坐标: '[0-4](2F)', 伪装: '体育馆天台', 真实: '天台训练场', 所属势力: '体育联盟' },
  { 坐标: '[0-5]', 伪装: '国际交流会馆A栋', 真实: '外校临时居住地A', 所属势力: '学园公共' },
  { 坐标: '[1-0]', 伪装: '钟楼', 真实: '权力之塔-瞭望塔', 所属势力: '学生会' },
  { 坐标: '[1-1]', 伪装: '中央行政楼', 真实: '权力之塔-学生会总部', 所属势力: '学生会' },
  { 坐标: '[1-1](3F)', 伪装: '院长办公室', 真实: '伊甸阿斯莫德的办公室', 所属势力: '学院高层' },
  { 坐标: '[1-1](4F)', 伪装: '天文台', 真实: '学生会最高监控中心', 所属势力: '学生会' },
  { 坐标: '[1-2]', 伪装: '中央广场', 真实: '中心广场', 所属势力: '学园公共' },
  { 坐标: '[1-3]', 伪装: '商业街', 真实: '综合商业街', 所属势力: '学园公共' },
  { 坐标: '[1-4]', 伪装: '健身中心', 真实: '体育联盟-器械训练部', 所属势力: '体育联盟' },
  { 坐标: '[1-5]', 伪装: '武道馆', 真实: '体育联盟-武术部', 所属势力: '体育联盟' },
  { 坐标: '[2-0]', 伪装: '空置社团活动室', 真实: '未分配的社团房间', 所属势力: '无' },
  { 坐标: '[2-1](2F)', 伪装: 'S班特别教室', 真实: '爱丽丝温特的特别辅导室', 所属势力: '学生会' },
  { 坐标: '[2-2]', 伪装: '知识圣殿-研究会总部', 真实: '博览图书馆', 所属势力: '研究会' },
  { 坐标: '[2-3]', 伪装: '高级茶道俱乐部', 真实: '静心茶室 (美咲绫的私人领地)', 所属势力: '独立势力' },
  { 坐标: '[2-4](-1F)', 伪装: '地下管网维护通道', 真实: '地下联盟-秘密通道', 所属势力: '地下联盟' },
  { 坐标: '[2-5](-1F)', 伪装: '地下锅炉房', 真实: '地下联盟黑市入口', 所属势力: '地下联盟' },
  { 坐标: '[3-0]', 伪装: '学院正门', 真实: '学院正门', 所属势力: '学园公共' },
  { 坐标: '[3-1]', 伪装: '学生宿舍A栋 (女生)', 真实: '学生宿舍A栋', 所属势力: '学园公共' },
  { 坐标: '[3-2]', 伪装: '中央食堂', 真实: '餐厅', 所属势力: '学园公共' },
  { 坐标: '[3-3]', 伪装: '艺术与设计中心', 真实: '蝶变之所-雌堕会总部', 所属势力: '雌堕会' },
  { 坐标: '[3-4]', 伪装: '高级家政实习教室', 真实: '女王宫殿-女权协会总部', 所属势力: '女权协会' },
  { 坐标: '[3-5]', 伪装: '女生会馆', 真实: '女王宫殿-女权协会生活区', 所属势力: '女权协会' },
  { 坐标: '[4-0]', 伪装: '国际交流会馆B栋', 真实: '外校临时居住地B', 所属势力: '学园公共' },
  { 坐标: '[4-1]', 伪装: '学生宿舍B栋 (男女混住)', 真实: '学生宿舍B栋', 所属势力: '学园公共' },
  { 坐标: '[4-2](-1F)', 伪装: '宿舍地下洗衣房', 真实: '快感研究所-BF社总部', 所属势力: 'BF社' },
  { 坐标: '[4-2](-2F)', 伪装: '废弃储藏室', 真实: '快感研究所-BF社高危实验区', 所属势力: 'BF社' },
  { 坐标: '[4-3](-1F)', 伪装: '废弃防空洞', 真实: '蝶变之所-雌堕会改造实验室', 所属势力: '雌堕会' },
  { 坐标: '[4-4]', 伪装: '学院大礼堂', 真实: '欲望竞技场', 所属势力: '学园公共' },
  { 坐标: '[4-5]', 伪装: '后台准备区', 真实: '欲望竞技场', 所属势力: '学园公共' },
  { 坐标: '[5-0]', 伪装: '学院后山小径', 真实: '学院后山', 所属势力: '学园公共' },
  { 坐标: '[5-1]', 伪装: '湖边凉亭', 真实: '中心湖', 所属势力: '学园公共' },
  { 坐标: '[5-2](1F)', 真实: '综合服务大厅', 所属势力: '学园公共' },
  { 坐标: '[5-2](3F)', 伪装: '学院医务室', 真实: '学校医院', 所属势力: '学园公共' },
  { 坐标: '[5-2](2F)', 伪装: '特殊心理咨询室', 真实: '学生综合服务中心', 所属势力: '学园公共' },
  { 坐标: '[5-3]', 伪装: '教职工宿舍', 真实: '教职工宿舍', 所属势力: '学园公共' },
  { 坐标: '[5-3](2F)', 真实: 'S/A班教师办公室', 所属势力: '学园公共' },
  { 坐标: '[5-3](3F)', 真实: 'B/C/D班教师办公室', 所属势力: '学园公共' },
  { 坐标: '[5-4]', 伪装: '停车场', 真实: '地下黑市-跳蚤市场', 所属势力: '学园公共' },
  { 坐标: '[5-5]', 伪装: '空置社团活动室', 真实: '未分配的社团房间', 所属势力: '无' },
  { 坐标: '[-1-2]', 真实: '后山入口', 所属势力: '学园公共' },
  { 坐标: '[-1-3]', 伪装: '废弃神社', 真实: '风音与铃音的神社', 所属势力: '独立势力' },
  { 坐标: '[-2-1]', 真实: '后山温泉', 所属势力: '体育联盟' },
  { 坐标: '[-2-4]', 伪装: '秘密训练场', 真实: '地下联盟的野外交易点', 所属势力: '地下联盟' },
  { 坐标: '[6-3]', 伪装: '海滩入口', 真实: '私人海滩', 所属势力: '学园公共' },
  { 坐标: '[6-2]', 伪装: '沙滩排球场 (可进行特殊规则比赛)', 真实: '沙滩排球场', 所属势力: '体育联盟' },
  { 坐标: '[6-4]', 伪装: '海之家 (海边小屋)', 真实: '泳装与道具租赁店', 所属势力: '学园公共' },
];

// 解析坐标
function parseCoordinate(coord: string): { x: number; y: number; floor: number } | null {
  // 匹配格式: [X-Y] 或 [X-Y](楼层F) 或 [X-Y](-楼层F)
  // 先匹配坐标部分
  const coordMatch = coord.match(/\[(-?\d+)-(-?\d+)\]/);
  if (!coordMatch) return null;

  const x = parseInt(coordMatch[1]);
  const y = parseInt(coordMatch[2]);

  // 再匹配楼层部分（支持正负楼层）
  let floor = 1; // 默认1楼
  const floorMatch = coord.match(/\((-?\d+)F\)/);
  if (floorMatch) {
    floor = parseInt(floorMatch[1]);
  }

  return { x, y, floor };
}

// 地图范围
const minX = -2;
const maxX = 6;
const minY = -1;
const maxY = 5;

const currentFloor = ref(1);
const zoomLevel = ref(1);
const selectedLocation = ref<any>(null);
const mapContainerRef = ref<HTMLElement | null>(null);

// 当前玩家位置
const currentLocation = computed(() => {
  return props.characterData.位置系统 || null;
});

// 可用楼层列表
const availableFloors = computed(() => {
  const floors = new Set<number>();
  floors.add(1); // 默认1楼

  mapLocations.forEach(loc => {
    const parsed = parseCoordinate(loc.坐标);
    if (parsed) {
      floors.add(parsed.floor);
    }
  });

  return Array.from(floors).sort((a, b) => a - b);
});

// 格式化楼层显示
function formatFloor(floor: number): string {
  if (floor === 1) return '1F';
  if (floor > 1) return `${floor}F`;
  if (floor === -1) return 'B1F';
  if (floor === -2) return 'B2F';
  return `${floor}F`;
}

// 获取当前楼层的地点
const currentFloorLocations = computed(() => {
  return mapLocations.filter(loc => {
    const parsed = parseCoordinate(loc.坐标);
    return parsed && parsed.floor === currentFloor.value;
  });
});

// 创建网格 - 保持完整网格结构，但空单元格不显示边框
const gridRows = computed(() => {
  // 先收集所有有地点的坐标
  const locationMap = new Map<string, any>();

  currentFloorLocations.value.forEach(loc => {
    const parsed = parseCoordinate(loc.坐标);
    if (parsed) {
      const key = `${parsed.x},${parsed.y}`;
      locationMap.set(key, loc);
    }
  });

  // 检查玩家当前位置
  let playerCoord: { x: number; y: number } | null = null;
  if (currentLocation.value) {
    const currentCoord = parseCoordinate(currentLocation.value.坐标 || '');
    if (currentCoord && currentCoord.floor === currentFloor.value) {
      playerCoord = { x: currentCoord.x, y: currentCoord.y };
      const key = `${currentCoord.x},${currentCoord.y}`;
      // 如果当前位置没有地点，也标记出来
      if (!locationMap.has(key)) {
        locationMap.set(key, null);
      }
    }
  }

  // 创建完整网格，保持所有位置
  const rows: any[][] = [];

  for (let y = maxY; y >= minY; y--) {
    const row: any[] = [];
    for (let x = minX; x <= maxX; x++) {
      const key = `${x},${y}`;
      const location = locationMap.get(key);
      const isPlayerPosition = playerCoord && playerCoord.x === x && playerCoord.y === y;

      // 所有单元格都添加，但空单元格会有特殊标记
      row.push({
        x,
        y,
        location: location || null,
        isPlayerPosition: isPlayerPosition || false,
        isEmpty: location === undefined && !isPlayerPosition,
      });
    }
    rows.push(row);
  }

  return rows;
});

// 获取单元格样式类（现在通过 cell 对象传递）
function getCellClass(cell: any): string {
  const classes: string[] = [];

  // 如果是空单元格，添加特殊标记
  if (cell.isEmpty) {
    classes.push('empty-cell');
    return classes.join(' ');
  }

  // 检查是否是当前玩家位置
  if (cell.isPlayerPosition) {
    classes.push('current-position');
  }

  // 检查是否有地点
  if (cell.location) {
    classes.push('has-location');
  }

  return classes.join(' ');
}

// 获取地点图标
function getLocationIcon(location: any): string {
  const faction = location.所属势力 || '';
  const iconMap: Record<string, string> = {
    学生会: 'fas fa-crown',
    女权协会: 'fas fa-venus',
    BF社: 'fas fa-flask',
    体育联盟: 'fas fa-dumbbell',
    研究会: 'fas fa-book',
    地下联盟: 'fas fa-mask',
    男性自保联盟: 'fas fa-shield-alt',
    雌堕会: 'fas fa-feather', // 使用羽毛图标
    学园公共: 'fas fa-building',
    独立势力: 'fas fa-star',
    学院高层: 'fas fa-gem',
    无: 'fas fa-question',
  };
  return iconMap[faction] || 'fas fa-map-marker-alt';
}

// 获取地点样式类
function getLocationClass(location: any): string {
  const faction = location.所属势力 || '';
  const classMap: Record<string, string> = {
    学生会: 'faction-student-council',
    女权协会: 'faction-feminist',
    BF社: 'faction-bf',
    体育联盟: 'faction-sports',
    研究会: 'faction-research',
    地下联盟: 'faction-underground',
    男性自保联盟: 'faction-male-alliance',
    雌堕会: 'faction-femdom',
    学园公共: 'faction-public',
    独立势力: 'faction-independent',
    学院高层: 'faction-admin',
    无: 'faction-none',
  };
  return classMap[faction] || 'faction-default';
}

// 获取地点提示
function getLocationTooltip(location: any): string {
  const parts: string[] = [];
  if (location.伪装) parts.push(`伪装: ${location.伪装}`);
  if (location.真实) parts.push(`真实: ${location.真实}`);
  if (location.所属势力) parts.push(`势力: ${location.所属势力}`);
  return parts.join('\n');
}

// 选择地点
function selectLocation(x: number, y: number) {
  const location = currentFloorLocations.value.find(loc => {
    const parsed = parseCoordinate(loc.坐标);
    return parsed && parsed.x === x && parsed.y === y;
  });

  selectedLocation.value = location || null;
}

// 缩放控制
function zoomIn() {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.1);
  }
}

function zoomOut() {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1);
  }
}

// 初始化：根据玩家当前位置设置楼层
onMounted(() => {
  if (currentLocation.value) {
    const parsed = parseCoordinate(currentLocation.value.坐标 || '');
    if (parsed) {
      currentFloor.value = parsed.floor;
    }
  }
});
</script>

<style scoped lang="scss">
.map-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  position: relative;
}

.map-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;

  label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.floor-select {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.zoom-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  i {
    font-size: 12px;
  }
}

.zoom-level {
  min-width: 50px;
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.map-container {
  position: relative;
  overflow: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  min-height: 400px;
}

.map-grid {
  display: inline-block;
  transition: transform 0.2s ease;
}

.map-row {
  display: flex;
}

.map-cell {
  width: 80px;
  height: 80px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(102, 126, 234, 0.5);
  }

  &.has-location {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
  }

  &.current-position {
    background: rgba(34, 211, 238, 0.2);
    border-color: rgba(34, 211, 238, 0.5);
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }

  // 空单元格：不显示边框和背景，但保持位置
  &.empty-cell {
    border: none;
    background: transparent;
    cursor: default;

    &:hover {
      background: transparent;
      border: none;
    }
  }
}

.cell-coord {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 8px;
  color: rgba(255, 255, 255, 0.3);
  font-family: 'JetBrains Mono', monospace;
}

.location-marker {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;

  i {
    font-size: 20px;
    color: #a5b4fc;
  }

  .location-label {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.faction-student-council i {
    color: #fbbf24;
  }
  &.faction-feminist i {
    color: #ec4899;
  }
  &.faction-bf i {
    color: #8b5cf6;
  }
  &.faction-sports i {
    color: #10b981;
  }
  &.faction-research i {
    color: #3b82f6;
  }
  &.faction-underground i {
    color: #6b7280;
  }
  &.faction-male-alliance i {
    color: #60a5fa;
  }
  &.faction-femdom i {
    color: #f472b6;
  }
  &.faction-public i {
    color: #a5b4fc;
  }
  &.faction-independent i {
    color: #fcd34d;
  }
  &.faction-admin i {
    color: #f59e0b;
  }
  &.faction-none i {
    color: rgba(255, 255, 255, 0.3);
  }
}

.location-detail {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 280px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0;
  }
}

.close-detail {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  i {
    font-size: 12px;
  }
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.detail-value {
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.current-location {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background: rgba(34, 211, 238, 0.2);
  border: 1px solid rgba(34, 211, 238, 0.5);
  border-radius: 20px;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  z-index: 100;

  i {
    color: #22d3ee;
  }
}
</style>
