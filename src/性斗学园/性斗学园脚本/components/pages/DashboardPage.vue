<template>
  <div class="dashboard-page">
    <!-- 顶部信息栏 -->
    <div class="top-row">
      <!-- 日期卡片 -->
      <div class="date-card">
        <div class="card-icon">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="card-content">
          <div class="card-label">日期</div>
          <div class="card-value">{{ timeData.日期 || '' }}</div>
          <div class="card-sub">{{ weekdayText(timeData.星期) }}</div>
        </div>
      </div>

      <!-- 位置卡片 -->
      <div class="location-card">
        <div class="card-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="card-content">
          <div class="card-label">位置</div>
          <div class="card-value">{{ locationData.地点名称 || '未知地点' }}</div>
          <div class="card-sub">{{ locationData.楼层 || 1 }}F {{ locationData.坐标 || '[?]' }}</div>
        </div>
      </div>

      <!-- 金币卡片 -->
      <div class="coins-card">
        <div class="card-icon">
          <i class="fas fa-coins"></i>
        </div>
        <div class="card-content">
          <div class="card-label">金币</div>
          <div class="card-value gold">{{ formatNumber(characterData.物品系统?.学园金币 || 0) }}</div>
        </div>
      </div>
    </div>

    <!-- 角色状态卡片 -->
    <div class="character-card">
      <div class="character-header">
        <div class="character-info">
          <div class="character-level">Lv.{{ characterData.角色基础?._等级 || 1 }}</div>
          <div class="character-rank">{{ characterData.角色基础?._段位 || '无段位' }}</div>
        </div>
        <div class="combat-stats">
          <div class="stat-item">
            <i class="fas fa-fire"></i>
            <span>{{ characterData.性斗系统?.实时性斗力 || 0 }}</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-shield-halved"></i>
            <span>{{ characterData.性斗系统?.实时忍耐力 || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 状态条 -->
      <div class="status-bars">
        <div class="bar-item">
          <div class="bar-header">
            <i class="fas fa-bolt stamina-icon"></i>
            <span class="bar-label">耐力</span>
            <span class="bar-value"
              >{{ characterData.核心状态?.$耐力 || 0 }}/{{ characterData.核心状态?.$最大耐力 || 100 }}</span
            >
          </div>
          <div class="bar-track">
            <div
              class="bar-fill stamina"
              :style="{
                width: `${getPercentage(characterData.核心状态?.$耐力 || 0, characterData.核心状态?.$最大耐力 || 100)}%`,
              }"
            ></div>
          </div>
        </div>

        <div class="bar-item">
          <div class="bar-header">
            <i class="fas fa-heart-pulse lust-icon"></i>
            <span class="bar-label">快感</span>
            <span class="bar-value"
              >{{ characterData.核心状态?.$快感 || 0 }}/{{ characterData.核心状态?.$最大快感 || 100 }}</span
            >
          </div>
          <div class="bar-track">
            <div
              class="bar-fill lust"
              :style="{
                width: `${getPercentage(characterData.核心状态?.$快感 || 0, characterData.核心状态?.$最大快感 || 100)}%`,
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快捷属性 -->
    <div class="quick-stats">
      <div class="quick-stat">
        <span class="qs-label">魅力</span>
        <span class="qs-value charm">{{ characterData.核心状态?._魅力 || 10 }}</span>
      </div>
      <div class="quick-stat">
        <span class="qs-label">幸运</span>
        <span class="qs-value luck">{{ characterData.核心状态?._幸运 || 10 }}</span>
      </div>
      <div class="quick-stat">
        <span class="qs-label">闪避</span>
        <span class="qs-value dodge">{{ characterData.核心状态?._闪避率 || 0 }}%</span>
      </div>
      <div class="quick-stat">
        <span class="qs-label">暴击</span>
        <span class="qs-value crit">{{ characterData.核心状态?._暴击率 || 0 }}%</span>
      </div>
    </div>

    <!-- 当前任务 -->
    <div class="quest-card" v-if="mainQuest && mainQuest.名称">
      <div class="quest-header">
        <i class="fas fa-scroll"></i>
        <span>当前任务</span>
      </div>
      <div class="quest-content">
        <div class="quest-title">{{ mainQuest.名称 }}</div>
        <div class="quest-desc">{{ mainQuest.描述 || '暂无描述' }}</div>
        <div class="quest-status" :class="mainQuest.状态 === '进行中' ? 'active' : 'done'">
          {{ mainQuest.状态 || '进行中' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  characterData: any;
}>();

const locationData = computed(() => {
  return props.characterData.位置系统 || {};
});

const timeData = computed(() => {
  return props.characterData.时间系统 || {};
});

const mainQuest = computed(() => {
  return props.characterData.任务系统?.主线任务 || {};
});

function weekdayText(day: number): string {
  const map = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const idx = Math.min(7, Math.max(1, Number(day || 1))) - 1;
  return map[idx];
}

function getPercentage(current: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, Math.max(0, (current / max) * 100));
}

function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  flex: 1;
}

.top-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.date-card,
.location-card,
.coins-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.date-card {
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.1));

  .card-icon {
    color: #60a5fa;
  }
}

.location-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.1));

  .card-icon {
    color: #818cf8;
  }
}

.coins-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1));

  .card-icon {
    color: #fbbf24;
  }

  .card-value.gold {
    color: #fcd34d;
  }
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 16px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'JetBrains Mono', monospace;
}

.character-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.1));
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.character-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.character-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.character-level {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.character-rank {
  padding: 4px 10px;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: #fcd34d;
}

.combat-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 20px;

  i {
    font-size: 12px;

    &.fa-fire {
      color: #f87171;
    }

    &.fa-shield-halved {
      color: #34d399;
    }
  }

  span {
    font-size: 14px;
    font-weight: 600;
    color: white;
    font-family: 'JetBrains Mono', monospace;
  }
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;

  i {
    font-size: 12px;
    width: 16px;
    text-align: center;
  }

  .stamina-icon {
    color: #34d399;
  }
  .lust-icon {
    color: #f472b6;
  }
  .willpower-icon {
    color: #60a5fa;
  }

  .bar-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .bar-value {
    margin-left: auto;
    color: rgba(255, 255, 255, 0.5);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
}

.bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;

  &.stamina {
    background: linear-gradient(90deg, #34d399, #10b981);
  }

  &.lust {
    background: linear-gradient(90deg, #f472b6, #ec4899);
  }

  &.willpower {
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
  }
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .qs-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.4);
    margin-bottom: 4px;
  }

  .qs-value {
    font-size: 16px;
    font-weight: 700;
    font-family: 'JetBrains Mono', monospace;

    &.charm {
      color: #f472b6;
    }
    &.luck {
      color: #fbbf24;
    }
    &.dodge {
      color: #60a5fa;
    }
    &.crit {
      color: #f87171;
    }
  }
}

.quest-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);

  i {
    color: #667eea;
  }
}

.quest-content {
  padding: 14px;
}

.quest-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
}

.quest-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin-bottom: 10px;
}

.quest-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;

  &.active {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
  }

  &.done {
    background: rgba(52, 211, 153, 0.2);
    color: #6ee7b7;
  }
}

.time-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.time-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 18px;
    color: #60a5fa;
  }
}

.time-info {
  flex: 1;
}

.game-time {
  font-size: 20px;
  font-weight: 700;
  color: white;
  font-family: 'JetBrains Mono', monospace;
}

.game-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.feed-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 14px;
}

.feed-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;

  i {
    color: #667eea;
  }
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 5px;
  flex-shrink: 0;

  &.info {
    background: #60a5fa;
  }
  &.warning {
    background: #fbbf24;
  }
  &.success {
    background: #34d399;
  }
  &.error {
    background: #f87171;
  }
}

.feed-content {
  flex: 1;
}

.feed-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.feed-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}
</style>
