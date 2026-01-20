<template>
  <div class="stats-panel" :class="{ 'stats-compact': compact }">
    <div class="stat-item">
      <div class="stat-info text-pink-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span class="stat-label">性斗力</span>
      </div>
      <span class="stat-value">{{ stats.sexPower }}</span>
    </div>
    <div class="stat-item">
      <div class="stat-info text-green-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span class="stat-label">忍耐力</span>
      </div>
      <span class="stat-value">{{ stats.baseEndurance }}</span>
    </div>
    <div class="stat-item">
      <div class="stat-info text-cyan-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
          <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
          <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
        </svg>
        <span class="stat-label">闪避率</span>
      </div>
      <span class="stat-value">{{ stats.evasion }}%</span>
    </div>
    <div class="stat-item">
      <div class="stat-info text-orange-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
        <span class="stat-label">暴击率</span>
      </div>
      <span class="stat-value">{{ stats.crit }}%</span>
    </div>
    <div class="stat-item">
      <div class="stat-info text-rose-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
          />
        </svg>
        <span class="stat-label">魅力</span>
      </div>
      <span class="stat-value">{{ stats.charm }}</span>
    </div>
    <div class="stat-item">
      <div class="stat-info text-yellow-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
          />
        </svg>
        <span class="stat-label">幸运</span>
      </div>
      <span class="stat-value">{{ stats.luck }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CombatStats } from '../types';

withDefaults(
  defineProps<{
    stats: CombatStats;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);
</script>

<style lang="scss" scoped>
.stats-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.25rem 0.5rem;
  width: 100%;
  max-width: 20rem;
  animation: fadeIn 0.3s ease;
}

.stats-compact {
  max-width: 180px;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);

  .stats-compact & {
    padding: 0.25rem;
    background: transparent;
    border: none;
  }
}

.stat-full {
  grid-column: span 2;
}

.stat-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: #94a3b8;

  .stats-compact & {
    font-size: 0.625rem;
  }
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: white;

  .stats-compact & {
    font-size: 0.75rem;
  }
}

.text-pink-400 {
  color: #f472b6;
}
.text-green-400 {
  color: #4ade80;
}
.text-cyan-400 {
  color: #22d3ee;
}
.text-orange-400 {
  color: #fb923c;
}
.text-rose-400 {
  color: #fb7185;
}
.text-yellow-400 {
  color: #facc15;
}
.text-purple-400 {
  color: #c084fc;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
