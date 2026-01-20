<template>
  <div class="skill-page">
    <!-- 资源显示 -->
    <div class="resource-header">
      <div class="resource-card skill-points">
        <i class="fas fa-book-sparkles"></i>
        <div class="resource-info">
          <span class="resource-label">技能点</span>
          <span class="resource-value">{{ skillPoints }}</span>
        </div>
      </div>
      <div class="resource-card gold">
        <i class="fas fa-coins"></i>
        <div class="resource-info">
          <span class="resource-label">金币</span>
          <span class="resource-value">{{ goldCoins }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: currentTab === 'skills' }" @click="currentTab = 'skills'">
        <i class="fas fa-hand-fist"></i> 我的技能
      </button>
      <button class="tab-btn" :class="{ active: currentTab === 'gacha' }" @click="currentTab = 'gacha'">
        <i class="fas fa-dice"></i> 技能抽取
      </button>
      <button class="tab-btn" :class="{ active: currentTab === 'exchange' }" @click="currentTab = 'exchange'">
        <i class="fas fa-exchange-alt"></i> 兑换
      </button>
    </div>

    <!-- 技能抽取页面 -->
    <div v-if="currentTab === 'gacha'" class="gacha-section">
      <div class="gacha-info">
        <h3><i class="fas fa-info-circle"></i> 抽取说明</h3>
        <div class="rate-list">
          <span class="rate-item rarity-c">C级 50%</span>
          <span class="rate-item rarity-b">B级 30%</span>
          <span class="rate-item rarity-a">A级 17.5%</span>
          <span class="rate-item rarity-s">S级 2%</span>
          <span class="rate-item rarity-ss">SS级 0.5%</span>
        </div>
        <p class="gacha-note">十连抽保底至少获得一个A级及以上技能</p>
      </div>

      <div class="gacha-buttons">
        <button class="gacha-btn single" :disabled="skillPoints < 2" @click="performGacha(1)">
          <i class="fas fa-dice-one"></i>
          <span class="btn-text">单抽</span>
          <span class="btn-cost">2 技能点</span>
        </button>
        <button class="gacha-btn ten" :disabled="skillPoints < tenPullCost" @click="performGacha(10)">
          <i class="fas fa-dice-d20"></i>
          <span class="btn-text">十连抽</span>
          <span class="btn-cost">
            <span class="discount-price">{{ tenPullCost }} 技能点</span>
            <span class="original-price">20 技能点</span>
          </span>
        </button>
      </div>

      <!-- 天赋抽取区域 -->
      <div class="talent-gacha-section">
        <h3><i class="fas fa-star"></i> 天赋抽取</h3>
        <div class="rate-list">
          <span class="rate-item rarity-c">C级 {{ adjustedRates.C.toFixed(1) }}%</span>
          <span class="rate-item rarity-b">B级 {{ adjustedRates.B.toFixed(1) }}%</span>
          <span class="rate-item rarity-a">A级 {{ adjustedRates.A.toFixed(1) }}%</span>
          <span class="rate-item rarity-s">S级 {{ adjustedRates.S.toFixed(1) }}%</span>
          <span class="rate-item rarity-ss">SS级 {{ adjustedRates.SS.toFixed(1) }}%</span>
          <span v-if="adjustedRates.SIN > 0" class="rate-item rarity-sin"
            >罪与罚 {{ adjustedRates.SIN.toFixed(1) }}%</span
          >
        </div>
        <p class="talent-gacha-note">消耗10技能点抽取一个天赋，天赋仅能拥有一个</p>

        <button class="talent-gacha-btn" :disabled="skillPoints < 10" @click="performTalentGachaAction">
          <i class="fas fa-sparkles"></i>
          <span class="btn-text">抽取天赋</span>
          <span class="btn-cost">10 技能点</span>
        </button>

        <!-- 当前天赋显示 -->
        <div class="current-talent-display">
          <span class="talent-label">当前天赋：</span>
          <div
            v-if="currentTalent"
            class="talent-badge"
            :class="getRarityClass(getTalentRarity(currentTalent.id))"
            @mouseenter="showTalentInfo('current')"
            @mouseleave="hideTalentInfo"
            @touchstart.prevent="onTalentTouchStart('current')"
            @touchend.prevent="onTalentTouchEnd"
          >
            <i class="fas fa-gem"></i>
            <span>{{ currentTalent.name }}</span>
          </div>
          <span v-else class="no-talent">无</span>
        </div>

        <!-- SIN天赋暗黑特效遮罩 -->
        <div v-if="showSinEffect" class="sin-effect-overlay">
          <div class="sin-effect-content">
            <div class="sin-symbol">☠</div>
            <div class="sin-text">七宗罪降临</div>
            <div class="sin-particles"></div>
          </div>
        </div>

        <!-- 抽取结果展示 -->
        <div v-if="drawnTalent" class="talent-result" :class="{ 'sin-glow': drawnTalent.rarity === 'SIN' }">
          <h4><i class="fas fa-gift"></i> 抽取到的天赋</h4>
          <div
            class="talent-card"
            :class="getRarityClass(drawnTalent.rarity)"
            @mouseenter="showTalentInfo('drawn')"
            @mouseleave="hideTalentInfo"
            @touchstart.prevent="onTalentTouchStart('drawn')"
            @touchend.prevent="onTalentTouchEnd"
          >
            <div class="talent-rarity">{{ drawnTalent.rarity }}</div>
            <div class="talent-name">{{ drawnTalent.name }}</div>
            <div class="talent-desc">{{ drawnTalent.description }}</div>
            <div class="talent-bonus">
              <span class="bonus-label">属性加成：</span>
              <span class="bonus-value">{{ formatTalentBonus(drawnTalent.bonus) }}</span>
            </div>
          </div>
          <div class="talent-actions">
            <button class="discard-btn" @click="discardDrawnTalent"><i class="fas fa-times"></i> 舍弃</button>
            <button class="replace-btn" @click="confirmReplaceTalent">
              <i class="fas fa-check"></i> {{ currentTalent ? '替换' : '获得' }}
            </button>
          </div>
        </div>

        <!-- 天赋详情提示框 -->
        <div v-if="showTalentTooltip" class="talent-tooltip">
          <template v-if="talentTooltipTarget === 'current' && currentTalent">
            <div class="tooltip-title">{{ currentTalent.name }}</div>
            <div class="tooltip-desc">{{ currentTalent.description }}</div>
            <div class="tooltip-bonus">属性：{{ formatTalentBonus(currentTalent.bonus) }}</div>
          </template>
          <template v-else-if="talentTooltipTarget === 'drawn' && drawnTalent">
            <div class="tooltip-title">{{ drawnTalent.name }}</div>
            <div class="tooltip-desc">{{ drawnTalent.description }}</div>
            <div class="tooltip-bonus">属性：{{ formatTalentBonus(drawnTalent.bonus) }}</div>
          </template>
        </div>
      </div>

      <!-- 抽取结果展示 -->
      <div v-if="gachaResults.length > 0" class="gacha-results">
        <h3><i class="fas fa-gift"></i> 抽取结果（选择你想要的技能）</h3>
        <div class="result-grid">
          <div
            v-for="(skill, index) in gachaResults"
            :key="index"
            class="result-card"
            :class="[getRarityClass(skill.rarity), { selected: selectedSkills.has(skill.id) }]"
            @click="toggleSkillSelection(skill.id)"
          >
            <div class="result-checkbox">
              <i :class="selectedSkills.has(skill.id) ? 'fas fa-check-square' : 'far fa-square'"></i>
            </div>
            <div class="result-rarity">{{ skill.rarity }}</div>
            <div class="result-name">{{ skill.name }}</div>
            <div class="result-desc">{{ skill.effectDescription }}</div>
          </div>
        </div>
        <div class="result-actions">
          <button class="select-all-btn" @click="selectAllSkills"><i class="fas fa-check-double"></i> 全选</button>
          <button class="deselect-all-btn" @click="deselectAllSkills"><i class="fas fa-times"></i> 全不选</button>
          <button class="confirm-btn" @click="confirmGachaResults" :disabled="selectedSkills.size === 0">
            <i class="fas fa-check"></i> 确认获得 ({{ selectedSkills.size }}/{{ gachaResults.length }})
          </button>
        </div>
      </div>
    </div>

    <!-- 兑换页面 -->
    <div v-if="currentTab === 'exchange'" class="exchange-section">
      <div class="exchange-card">
        <div class="exchange-icon">
          <i class="fas fa-coins"></i>
          <i class="fas fa-arrow-right"></i>
          <i class="fas fa-book-sparkles"></i>
        </div>
        <h3>金币兑换技能点</h3>
        <p class="exchange-rate">3000 金币 = 1 技能点</p>
        <p class="exchange-note">注意：兑换不可逆，请谨慎操作</p>

        <div class="exchange-controls">
          <div class="quantity-control">
            <button class="qty-btn" @click="exchangeAmount = Math.max(1, exchangeAmount - 1)">-</button>
            <input type="number" v-model.number="exchangeAmount" min="1" :max="maxExchangeAmount" />
            <button class="qty-btn" @click="exchangeAmount = Math.min(maxExchangeAmount, exchangeAmount + 1)">+</button>
          </div>
          <div class="exchange-summary">
            <span>消耗: {{ exchangeAmount * 3000 }} 金币</span>
            <span>获得: {{ exchangeAmount }} 技能点</span>
          </div>
          <button class="exchange-btn" :disabled="goldCoins < exchangeAmount * 3000" @click="performExchange">
            <i class="fas fa-exchange-alt"></i> 确认兑换
          </button>
        </div>
      </div>

      <!-- 作者测试区域 -->
      <div class="author-test-section">
        <div class="author-test-header" @click="toggleAuthorTest">
          <i class="fas fa-flask"></i>
          <span>{{ hasMuxinlanAccessCard ? 'GM界面' : 'GM界面（已锁定）' }}</span>
          <i :class="showAuthorTest ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
        </div>
        <div v-if="showAuthorTest" class="author-test-content">
          <div class="talent-select-panel">
            <h4><i class="fas fa-star"></i> 自选天赋</h4>
            <div class="talent-list-scroll">
              <div
                v-for="talent in allTalents"
                :key="talent.id"
                class="talent-select-item"
                :class="getRarityClass(talent.rarity)"
                @click="selectTalentForTest(talent)"
              >
                <span class="talent-name">{{ talent.name }}</span>
                <span class="talent-rarity">{{ talent.rarity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技能列表页面 -->
    <div v-if="currentTab === 'skills'" class="skills-section">
      <h3 class="section-title">
        <i class="fas fa-hand-fist"></i>
        主动技能
        <span class="skill-count">({{ skillCount }} 个)</span>
      </h3>

      <!-- 当前天赋显示（技能页面顶部） -->
      <div class="my-talent-section">
        <div class="talent-header">
          <i class="fas fa-star"></i>
          <span>我的天赋</span>
        </div>
        <div
          v-if="currentTalent"
          class="my-talent-card"
          :class="getRarityClass(getTalentRarity(currentTalent.id))"
          @mouseenter="showTalentInfo('current')"
          @mouseleave="hideTalentInfo"
          @touchstart.prevent="onTalentTouchStart('current')"
          @touchend.prevent="onTalentTouchEnd"
        >
          <div class="talent-icon">
            <i class="fas fa-gem"></i>
          </div>
          <div class="talent-info">
            <div class="talent-name-row">
              <span class="talent-name">{{ currentTalent.name }}</span>
              <span class="talent-rarity-badge" :class="getRarityClass(getTalentRarity(currentTalent.id))">
                {{ getTalentRarity(currentTalent.id) }}
              </span>
            </div>
            <div class="talent-desc">{{ currentTalent.description }}</div>
            <div class="talent-bonus-row">
              <span class="bonus-label">属性：</span>
              <span class="bonus-value">{{ formatTalentBonus(currentTalent.bonus) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-talent-card">
          <i class="fas fa-question-circle"></i>
          <span>暂无天赋，可在「技能抽取」页面获取</span>
        </div>
      </div>

      <div v-if="skillCount === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>暂无已学习的技能</p>
        <span class="empty-hint">在开局时选择技能或通过游戏获得</span>
      </div>

      <div v-else class="skill-list">
        <div
          v-for="(skill, skillId) in activeSkills"
          :key="skillId"
          class="skill-card"
          :class="getRarityClass(skill.基本信息?.稀有度)"
        >
          <!-- 技能头部 -->
          <div class="skill-header-row">
            <div class="skill-name-area">
              <span class="skill-name">{{ skill.基本信息?.技能名称 || '未知技能' }}</span>
              <span class="skill-rarity" :class="getRarityClass(skill.基本信息?.稀有度)">
                {{ skill.基本信息?.稀有度 || 'C' }}
              </span>
            </div>
            <div class="skill-level">Lv.{{ skill.基本信息?.技能等级 || 1 }}</div>
          </div>

          <!-- 技能描述 -->
          <p class="skill-description">{{ skill.基本信息?.技能描述 || '暂无描述' }}</p>

          <!-- 技能属性 -->
          <div class="skill-stats">
            <div class="stat-item cost">
              <i class="fas fa-bolt-lightning"></i>
              <span>{{ skill.冷却与消耗?.耐力消耗 || 0 }} 耐力</span>
            </div>
            <div class="stat-item cooldown" v-if="skill.冷却与消耗?.冷却回合数 > 0">
              <i class="fas fa-clock"></i>
              <span>{{ skill.冷却与消耗?.冷却回合数 || 0 }} 回合</span>
            </div>
            <div class="stat-item accuracy">
              <i class="fas fa-crosshairs"></i>
              <span>{{ skill.伤害与效果?.基础命中率 || 100 }}%</span>
            </div>
          </div>

          <!-- 伤害信息 -->
          <div class="skill-damage">
            <span class="damage-label">伤害来源:</span>
            <span class="damage-source">{{ skill.伤害与效果?.伤害来源 || '性斗力' }}</span>
            <span class="damage-value">×{{ skill.伤害与效果?.系数 || 100 }}%</span>
          </div>

          <!-- 特殊机制 -->
          <div class="skill-mechanics">
            <span v-if="skill.特殊机制?.是否忽视防御" class="mechanic-tag ignore-def">
              <i class="fas fa-shield-slash"></i> 无视防御
            </span>
            <span v-if="(skill.伤害与效果?.连击数 || 1) > 1" class="mechanic-tag hit-count">
              <i class="fas fa-burst"></i> {{ skill.伤害与效果?.连击数 }}连击
            </span>
            <span v-if="skill.伤害与效果?.暴击修正" class="mechanic-tag crit-mod">
              <i class="fas fa-crosshairs"></i> 暴击+{{ skill.伤害与效果?.暴击修正 }}%
            </span>
          </div>

          <!-- 操作按钮 -->
          <div class="skill-actions">
            <button
              v-if="canUpgrade(skill)"
              class="upgrade-btn"
              @click="upgradeSkill(String(skillId), skill)"
              :disabled="skillPoints < getUpgradeCost(skill)"
            >
              <i class="fas fa-arrow-up"></i>
              升级 ({{ getUpgradeCost(skill) }} 点)
            </button>
            <button class="forget-btn" @click="forgetSkill(String(skillId))">
              <i class="fas fa-trash"></i>
              遗忘
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { performSingleGacha, performTenGacha, type GachaSkillData } from '../../data/skillGachaPool';
import {
  getAdjustedGachaRates,
  getDailyTalentEffect,
  getTalentById,
  performTalentGacha,
  TALENT_DATABASE,
  type TalentData,
} from '../../data/talentDatabase';

const props = defineProps<{
  characterData: any;
}>();

// 获取当前天赋ID
const currentTalentId = computed(() => {
  const talents = props.characterData.技能系统?.$天赋;
  if (!talents || Object.keys(talents).length === 0) return undefined;
  return Object.keys(talents)[0];
});

// 计算十连抽折扣价格
const tenPullCost = computed(() => {
  const baseCost = 18;
  const discount = getDailyTalentEffect(currentTalentId.value, 'gacha_discount');
  return Math.max(10, baseCost - discount); // 最低10点
});

// 当前标签页
const currentTab = ref<'skills' | 'gacha' | 'exchange'>('skills');

// 抽取结果
const gachaResults = ref<GachaSkillData[]>([]);

// 选中的技能（用于抽取后选择）
const selectedSkills = ref<Set<string>>(new Set());

// 兑换数量
const exchangeAmount = ref(1);

// 升级锁（防止连点导致并发升级）
const upgradingSkillIds = ref<Set<string>>(new Set());

// 天赋相关状态
const drawnTalent = ref<TalentData | null>(null);
const showTalentTooltip = ref(false);
const talentTooltipTarget = ref<'current' | 'drawn'>('current');
const showSinEffect = ref(false); // SIN天赋抽取时的暗黑特效
let talentTooltipTimer: ReturnType<typeof setTimeout> | null = null;

// 堕落度（用于计算七宗罪概率）
const corruptionLevel = computed(() => {
  return props.characterData.核心状态?.堕落度 || 0;
});

// 动态调整后的抽取概率
const adjustedRates = computed(() => {
  return getAdjustedGachaRates(corruptionLevel.value);
});

// 作者测试功能状态（使用localStorage持久化解锁状态）
const showAuthorTest = ref(false);
const allTalents = TALENT_DATABASE;

const hasMuxinlanAccessCard = computed(() => {
  const backpack = props.characterData?.物品系统?.背包 || {};
  const item = backpack['沐芯兰的权限卡'];
  const qty = Number(item?.数量 || 0);
  return qty > 0;
});

// 技能点
const skillPoints = computed(() => {
  return props.characterData.核心状态?.$技能点 || 0;
});

// 金币
const goldCoins = computed(() => {
  return props.characterData.物品系统?.学园金币 || 0;
});

// 最大可兑换数量
const maxExchangeAmount = computed(() => {
  return Math.floor(goldCoins.value / 3000) || 1;
});

// 主动技能
const activeSkills = computed(() => {
  return props.characterData.技能系统?.主动技能 || {};
});

// 技能数量
const skillCount = computed(() => {
  return Object.keys(activeSkills.value).length;
});

// 当前天赋
const currentTalent = computed(() => {
  const talents = props.characterData.技能系统?.$天赋 || {};
  const talentKeys = Object.keys(talents);
  if (talentKeys.length === 0) return null;
  const talentData = talents[talentKeys[0]];
  const talentId = talentKeys[0];
  const dbTalent = getTalentById(talentId);
  return {
    id: talentId,
    name: dbTalent?.name || talentData?.天赋名称 || '未知天赋',
    description: dbTalent?.description || talentData?.天赋描述 || '',
    bonus: dbTalent?.bonus || talentData?.天赋效果 || {},
  };
});

// 获取稀有度样式类
function getRarityClass(rarity: string): string {
  const rarityMap: Record<string, string> = {
    C: 'rarity-c',
    B: 'rarity-b',
    A: 'rarity-a',
    S: 'rarity-s',
    SS: 'rarity-ss',
    SIN: 'rarity-sin',
  };
  return rarityMap[rarity] || 'rarity-c';
}

// 是否可以升级
function canUpgrade(skill: any): boolean {
  const level = skill?.基本信息?.技能等级 || 1;
  return level < 5;
}

// 获取升级所需点数
function getUpgradeCost(skill: any): number {
  const level = skill?.基本信息?.技能等级 || 1;
  // 升级费用：等级 + 1
  return level + 1;
}

// 生成技能描述（根据当前技能数据）
// 只更新数值部分，保留原有描述格式
function generateSkillDescription(skill: any, originalDesc: string): string {
  const damageInfo = skill.伤害与效果 || {};
  const newCoefficient = damageInfo.系数 || 100;

  // 使用正则表达式只替换描述中的伤害数值部分
  // 匹配 "造成XXX%" 格式
  const updatedDesc = originalDesc.replace(/造成(\d+)%/, `造成${newCoefficient}%`);

  return updatedDesc;
}

// 升级技能
async function upgradeSkill(skillId: string, skill: any) {
  if (upgradingSkillIds.value.has(skillId)) return;
  upgradingSkillIds.value.add(skillId);

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 确保路径存在
    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};
    if (!mvuData.stat_data.技能系统.主动技能) mvuData.stat_data.技能系统.主动技能 = {};
    if (!mvuData.stat_data.技能系统.主动技能[skillId]) {
      mvuData.stat_data.技能系统.主动技能[skillId] = JSON.parse(JSON.stringify(skill));
    }

    const skillData = mvuData.stat_data.技能系统.主动技能[skillId];

    // 确保基本信息存在
    if (!skillData.基本信息) skillData.基本信息 = {};

    // 保存原始描述用于后续更新
    const originalDesc = skillData.基本信息.技能描述 || '';

    // 以 MVU 中的实时等级为准计算本次升级费用（避免连点按旧等级重复计费）
    const currentLevel = skillData.基本信息.技能等级 || 1;
    const cost = currentLevel + 1;

    // 二次校验技能点（以 MVU 实际值为准）
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    const currentSkillPoints = Number(mvuData.stat_data.核心状态.$技能点 || 0);
    if (currentSkillPoints < cost) {
      if (typeof toastr !== 'undefined') {
        toastr.warning('不要点那么快！技能点不足了', '😤', { timeOut: 2000 });
      }
      return;
    }

    // 提升等级
    skillData.基本信息.技能等级 = Math.min(5, currentLevel + 1);

    // 根据等级调整属性
    if (!skillData.冷却与消耗) skillData.冷却与消耗 = {};
    if (!skillData.伤害与效果) skillData.伤害与效果 = {};

    // 每级增加系数：当前值 × 1.05（向下取整）
    const currentCoefficient = skillData.伤害与效果.系数 || 100;
    skillData.伤害与效果.系数 = Math.floor(currentCoefficient * 1.05);

    // 每2级减少消耗1点
    if (currentLevel % 2 === 0) {
      skillData.冷却与消耗.耐力消耗 = Math.max(0, (skillData.冷却与消耗.耐力消耗 || 0) - 1);
    }

    // 更新技能描述（只更新数值，保留原有格式）
    skillData.基本信息.技能描述 = generateSkillDescription(skillData, originalDesc);

    // 减少技能点（夹紧，防负数）
    mvuData.stat_data.核心状态.$技能点 = Math.max(0, currentSkillPoints - cost);

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    // 显示成功提示
    if (typeof toastr !== 'undefined') {
      toastr.success(`技能升级成功！等级 ${currentLevel + 1}`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 升级失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('技能升级失败', '错误', { timeOut: 2000 });
    }
  } finally {
    upgradingSkillIds.value.delete(skillId);
  }
}

// 执行抽取
async function performGacha(count: number) {
  const cost = count === 1 ? 2 : tenPullCost.value;
  if (skillPoints.value < cost) return;

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 扣除技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    const currentSkillPoints = Number(mvuData.stat_data.核心状态.$技能点 || 0);
    if (currentSkillPoints < cost) {
      if (typeof toastr !== 'undefined') {
        toastr.warning('不要点那么快！技能点不足了', '😤', { timeOut: 2000 });
      }
      return;
    }
    mvuData.stat_data.核心状态.$技能点 = Math.max(0, currentSkillPoints - cost);

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    // 执行抽取
    if (count === 1) {
      gachaResults.value = [performSingleGacha()];
    } else {
      gachaResults.value = performTenGacha();
    }

    // 清空之前的选择
    selectedSkills.value.clear();

    if (typeof toastr !== 'undefined') {
      toastr.info(`抽取完成！消耗${cost}技能点`, '抽取', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 抽取失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('抽取失败', '错误', { timeOut: 2000 });
    }
  }
}

// 切换技能选择状态
function toggleSkillSelection(skillId: string) {
  if (selectedSkills.value.has(skillId)) {
    selectedSkills.value.delete(skillId);
  } else {
    selectedSkills.value.add(skillId);
  }
}

// 全选技能
function selectAllSkills() {
  selectedSkills.value.clear();
  gachaResults.value.forEach(skill => {
    selectedSkills.value.add(skill.id);
  });
}

// 全不选
function deselectAllSkills() {
  selectedSkills.value.clear();
}

// 确认抽取结果，将选中的技能添加到玩家技能列表
async function confirmGachaResults() {
  if (selectedSkills.value.size === 0) {
    if (typeof toastr !== 'undefined') {
      toastr.warning('请至少选择一个技能', '提示', { timeOut: 2000 });
    }
    return;
  }

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 确保技能系统存在
    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};
    if (!mvuData.stat_data.技能系统.主动技能) mvuData.stat_data.技能系统.主动技能 = {};

    // 只添加选中的技能
    const selectedSkillsList = gachaResults.value.filter(skill => selectedSkills.value.has(skill.id));
    for (const skill of selectedSkillsList) {
      const skillData = {
        基本信息: {
          技能ID: skill.id,
          技能名称: skill.name,
          技能描述: skill.effectDescription,
          稀有度: skill.rarity,
          技能等级: 1,
          技能类型: skill.type,
        },
        冷却与消耗: {
          耐力消耗: skill.staminaCost,
          冷却回合数: skill.cooldown,
        },
        伤害与效果: {
          伤害来源: skill.damageSource,
          系数: skill.coefficient,
          基础命中率: skill.accuracy,
          暴击修正: skill.critModifier,
          连击数: skill.hitCount,
          效果列表: {},
        },
      };

      // 添加buff效果
      if (skill.buffs && skill.buffs.length > 0) {
        skill.buffs.forEach((buff, index) => {
          (skillData.伤害与效果.效果列表 as any)[`effect_${index}`] = {
            效果类型: buff.type,
            效果值: buff.value,
            是否为百分比: buff.isPercent,
            持续回合数: buff.duration,
            是否作用敌人: buff.isTargetEnemy,
          };
        });
      }

      // 使用技能ID作为键，如果已存在则覆盖
      mvuData.stat_data.技能系统.主动技能[skill.id] = skillData;
    }

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    // 清空结果和选择
    const count = selectedSkills.value.size;
    gachaResults.value = [];
    selectedSkills.value.clear();

    if (typeof toastr !== 'undefined') {
      toastr.success(`成功获得${count}个技能！`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 确认抽取失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('确认失败', '错误', { timeOut: 2000 });
    }
  }
}

// 执行金币兑换技能点
async function performExchange() {
  const goldCost = exchangeAmount.value * 3000;
  if (goldCoins.value < goldCost) return;

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 扣除金币
    if (!mvuData.stat_data.物品系统) mvuData.stat_data.物品系统 = {};
    mvuData.stat_data.物品系统.学园金币 = (mvuData.stat_data.物品系统.学园金币 || 0) - goldCost;

    // 增加技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    mvuData.stat_data.核心状态.$技能点 = (mvuData.stat_data.核心状态.$技能点 || 0) + exchangeAmount.value;

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    if (typeof toastr !== 'undefined') {
      toastr.success(`兑换成功！消耗${goldCost}金币，获得${exchangeAmount.value}技能点`, '成功', { timeOut: 1500 });
    }

    // 重置兑换数量
    exchangeAmount.value = 1;
  } catch (error) {
    console.error('[技能] 兑换失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('兑换失败', '错误', { timeOut: 2000 });
    }
  }
}

// 执行天赋抽取
async function performTalentGachaAction() {
  const cost = 10;
  if (skillPoints.value < cost) {
    if (typeof toastr !== 'undefined') {
      toastr.warning('技能点不足，需要10点', '提示', { timeOut: 2000 });
    }
    return;
  }

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 扣除技能点
    if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
    const currentSkillPoints = Number(mvuData.stat_data.核心状态.$技能点 || 0);
    if (currentSkillPoints < cost) {
      if (typeof toastr !== 'undefined') {
        toastr.warning('技能点不足', '提示', { timeOut: 2000 });
      }
      return;
    }
    mvuData.stat_data.核心状态.$技能点 = Math.max(0, currentSkillPoints - cost);

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    // 执行天赋抽取（传入堕落度）
    const corruption = mvuData.stat_data.核心状态?.堕落度 || 0;
    drawnTalent.value = performTalentGacha(corruption);

    // 如果抽到SIN天赋，显示特殊暗黑效果
    if (drawnTalent.value?.rarity === 'SIN') {
      showSinEffect.value = true;
      setTimeout(() => {
        showSinEffect.value = false;
      }, 3000);
      if (typeof toastr !== 'undefined') {
        toastr.error(`七宗罪降临...「${drawnTalent.value.name}」`, '⚠️ 罪与罚', { timeOut: 4000 });
      }
    } else if (typeof toastr !== 'undefined') {
      toastr.info(`抽取完成！消耗${cost}技能点`, '天赋抽取', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[天赋] 抽取失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('抽取失败', '错误', { timeOut: 2000 });
    }
  }
}

// 确认替换天赋
async function confirmReplaceTalent() {
  if (!drawnTalent.value) return;

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 确保技能系统存在
    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};

    // 清空现有天赋，写入新天赋
    mvuData.stat_data.技能系统.$天赋 = {
      [drawnTalent.value.id]: {
        天赋名称: drawnTalent.value.name,
        天赋描述: drawnTalent.value.description,
        天赋效果: drawnTalent.value.bonus,
      },
    };

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    if (typeof toastr !== 'undefined') {
      toastr.success(`成功获得天赋【${drawnTalent.value.name}】！`, '成功', { timeOut: 2000 });
    }

    // 清空抽取结果
    drawnTalent.value = null;
  } catch (error) {
    console.error('[天赋] 替换失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('替换失败', '错误', { timeOut: 2000 });
    }
  }
}

// 舍弃抽取的天赋
function discardDrawnTalent() {
  drawnTalent.value = null;
  if (typeof toastr !== 'undefined') {
    toastr.info('已舍弃抽取的天赋', '提示', { timeOut: 1500 });
  }
}

// 显示天赋提示（用于长按/悬浮）
function showTalentInfo(target: 'current' | 'drawn') {
  talentTooltipTarget.value = target;
  showTalentTooltip.value = true;
}

// 隐藏天赋提示
function hideTalentInfo() {
  showTalentTooltip.value = false;
}

// 长按开始
function onTalentTouchStart(target: 'current' | 'drawn') {
  talentTooltipTimer = setTimeout(() => {
    showTalentInfo(target);
  }, 500);
}

// 长按结束
function onTalentTouchEnd() {
  if (talentTooltipTimer) {
    clearTimeout(talentTooltipTimer);
    talentTooltipTimer = null;
  }
  hideTalentInfo();
}

// 格式化天赋属性加成
function formatTalentBonus(bonus: Record<string, number>): string {
  if (!bonus || Object.keys(bonus).length === 0) return '无';
  return Object.entries(bonus)
    .filter(([_, v]) => v !== 0)
    .map(([k, v]) => `${k}${v > 0 ? '+' : ''}${v}`)
    .join('、');
}

// 切换作者测试面板（已锁定）
function toggleAuthorTest() {
  if (!hasMuxinlanAccessCard.value) {
    showAuthorTest.value = false;
    if (typeof toastr !== 'undefined') {
      toastr.warning('需要持有「▓▒░█▇」才能解锁GM界面', '▒▓░');
    }
    return;
  }
  showAuthorTest.value = !showAuthorTest.value;
}

// 选择天赋进行测试
async function selectTalentForTest(talent: TalentData) {
  try {
    const globalAny = window as any;
    if (typeof globalAny.Mvu === 'undefined') {
      console.error('[作者测试] Mvu未定义');
      return;
    }

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData?.stat_data) return;

    if (!mvuData.stat_data.技能系统) mvuData.stat_data.技能系统 = {};

    // 写入选择的天赋
    mvuData.stat_data.技能系统.$天赋 = {
      [talent.id]: {
        天赋名称: talent.name,
        天赋描述: talent.description,
        天赋效果: talent.bonus,
      },
    };

    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    if (typeof toastr !== 'undefined') {
      toastr.success(`已设置天赋【${talent.name}】`, '成功', { timeOut: 2000 });
    }
  } catch (error) {
    console.error('[作者测试] 设置天赋失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('设置失败', '错误', { timeOut: 2000 });
    }
  }
}

// 根据天赋ID获取稀有度
function getTalentRarity(talentId: string): string {
  const talent = getTalentById(talentId);
  return talent?.rarity || 'C';
}

// 遗忘技能（带确认对话框）
async function forgetSkill(skillId: string) {
  const skill = activeSkills.value[skillId];
  const skillName = skill?.基本信息?.技能名称 || '未知技能';

  // 使用原生confirm对话框进行确认
  const confirmed = confirm(`确定要遗忘技能「${skillName}」吗？\n\n此操作不可逆！`);

  if (!confirmed) {
    return;
  }

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 删除技能
    if (mvuData.stat_data.技能系统?.主动技能?.[skillId]) {
      delete mvuData.stat_data.技能系统.主动技能[skillId];
    }

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    if (typeof toastr !== 'undefined') {
      toastr.success(`技能「${skillName}」已遗忘`, '成功', { timeOut: 1500 });
    }
  } catch (error) {
    console.error('[技能] 遗忘失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('遗忘失败', '错误', { timeOut: 2000 });
    }
  }
}
</script>

<style scoped lang="scss">
.skill-page {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.skill-header {
  margin-bottom: 20px;
}

.skill-points-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.08));
  border: 1px solid rgba(139, 92, 246, 0.4);
  border-radius: 16px;
  backdrop-filter: blur(10px);

  > i {
    font-size: 28px;
    color: #a78bfa;
  }

  .points-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .points-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .points-value {
    font-size: 28px;
    font-weight: 700;
    color: #c4b5fd;
  }
}

.skills-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16px;

  i {
    color: #667eea;
  }

  .skill-count {
    font-size: 12px;
    font-weight: normal;
    color: rgba(255, 255, 255, 0.4);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);

  i {
    font-size: 36px;
    color: rgba(255, 255, 255, 0.2);
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.25);
    margin-top: 6px;
  }
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.skill-card {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }

  &.rarity-c {
    border-left: 3px solid #9ca3af;
  }
  &.rarity-b {
    border-left: 3px solid #60a5fa;
  }
  &.rarity-a {
    border-left: 3px solid #a78bfa;
  }
  &.rarity-s {
    border-left: 3px solid #fbbf24;
  }
  &.rarity-ss {
    border-left: 3px solid #f472b6;
  }
}

.skill-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.skill-name-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-name {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.skill-rarity {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;

  &.rarity-c {
    background: rgba(156, 163, 175, 0.3);
    color: #d1d5db;
  }
  &.rarity-b {
    background: rgba(96, 165, 250, 0.3);
    color: #93c5fd;
  }
  &.rarity-a {
    background: rgba(167, 139, 250, 0.3);
    color: #c4b5fd;
  }
  &.rarity-s {
    background: rgba(251, 191, 36, 0.3);
    color: #fcd34d;
  }
  &.rarity-ss {
    background: rgba(244, 114, 182, 0.3);
    color: #f9a8d4;
  }
}

.skill-level {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  background: rgba(102, 126, 234, 0.2);
  padding: 4px 10px;
  border-radius: 8px;
}

.skill-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
  margin: 0 0 12px 0;
}

.skill-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 6px;

  i {
    font-size: 10px;
  }

  &.cost {
    background: rgba(52, 211, 153, 0.2);
    color: #6ee7b7;
    border: 1px solid rgba(52, 211, 153, 0.3);
  }

  &.cooldown {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
    border: 1px solid rgba(96, 165, 250, 0.3);
  }

  &.accuracy {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
}

.skill-damage {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;

  .damage-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .damage-source {
    color: #f87171;
    font-weight: 500;
  }

  .damage-value {
    color: #fcd34d;
    font-weight: 600;
  }
}

.skill-mechanics {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.mechanic-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;

  i {
    font-size: 9px;
  }

  &.ignore-def {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  &.hit-count {
    background: rgba(251, 146, 60, 0.2);
    color: #fdba74;
    border: 1px solid rgba(251, 146, 60, 0.3);
  }

  &.crit-mod {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
    border: 1px solid rgba(167, 139, 250, 0.3);
  }
}

.skill-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.upgrade-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.forget-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.05);
  }
}

// 资源头部
.resource-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.resource-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  backdrop-filter: blur(10px);

  > i {
    font-size: 20px;
  }

  .resource-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .resource-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .resource-value {
    font-size: 18px;
    font-weight: 700;
  }

  &.skill-points {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(139, 92, 246, 0.3);

    > i {
      color: #a78bfa;
    }
    .resource-value {
      color: #c4b5fd;
    }
  }

  &.gold {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.08));
    border: 1px solid rgba(251, 191, 36, 0.3);

    > i {
      color: #fbbf24;
    }
    .resource-value {
      color: #fcd34d;
    }
  }
}

// 标签页
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 12px;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  &.active {
    color: white;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(139, 92, 246, 0.2));
  }
}

// 抽取页面
.gacha-section {
  padding: 16px 0;
}

.gacha-info {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;

    i {
      margin-right: 6px;
      color: #60a5fa;
    }
  }
}

.rate-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.rate-item {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;

  &.rarity-c {
    background: rgba(156, 163, 175, 0.2);
    color: #d1d5db;
  }
  &.rarity-b {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
  }
  &.rarity-a {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
  }
  &.rarity-s {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
  }
  &.rarity-ss {
    background: rgba(244, 114, 182, 0.2);
    color: #f9a8d4;
  }
  &.rarity-sin {
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.9), rgba(60, 20, 40, 0.8));
    color: #dc2626;
    border: 1px solid rgba(139, 0, 0, 0.5);
    text-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
    animation: sin-rate-pulse 2s ease-in-out infinite;
  }
}

@keyframes sin-rate-pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(139, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 15px rgba(139, 0, 0, 0.6);
  }
}

.gacha-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.gacha-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.gacha-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 16px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 28px;
  }

  .btn-text {
    font-size: 14px;
    font-weight: 600;
  }

  .btn-cost {
    font-size: 11px;
    opacity: 0.7;
    display: flex;
    gap: 4px;
    align-items: center;

    .discount-price {
      color: #fbbf24;
      font-weight: 600;
      font-size: 12px;
    }

    .original-price {
      text-decoration: line-through;
      opacity: 0.5;
      font-size: 10px;
    }
  }

  &.single {
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(96, 165, 250, 0.1));
    border: 1px solid rgba(96, 165, 250, 0.4);
    color: #93c5fd;
  }

  &.ten {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.1));
    border: 1px solid rgba(251, 191, 36, 0.4);
    color: #fcd34d;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.gacha-results {
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 16px 0;

    i {
      margin-right: 6px;
      color: #34d399;
    }
  }
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.result-card {
  position: relative;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }

  &.selected {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
  }

  .result-checkbox {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
    color: #a78bfa;
  }

  .result-rarity {
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .result-name {
    font-size: 13px;
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
    padding-right: 24px;
  }

  .result-desc {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  &.rarity-c {
    border-left: 3px solid #9ca3af;
    .result-rarity {
      color: #d1d5db;
    }
  }
  &.rarity-b {
    border-left: 3px solid #60a5fa;
    .result-rarity {
      color: #93c5fd;
    }
  }
  &.rarity-a {
    border-left: 3px solid #a78bfa;
    .result-rarity {
      color: #c4b5fd;
    }
  }
  &.rarity-s {
    border-left: 3px solid #fbbf24;
    .result-rarity {
      color: #fcd34d;
    }
  }
  &.rarity-ss {
    border-left: 3px solid #f472b6;
    .result-rarity {
      color: #f9a8d4;
    }
  }
}

.result-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.select-all-btn,
.deselect-all-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.select-all-btn {
  background: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.4);
  color: #93c5fd;

  &:hover {
    background: rgba(96, 165, 250, 0.3);
    transform: scale(1.02);
  }
}

.deselect-all-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #f87171;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.02);
  }
}

.confirm-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(52, 211, 153, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 兑换页面
.exchange-section {
  padding: 16px 0;
}

.exchange-card {
  padding: 24px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  text-align: center;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 16px 0 8px 0;
  }
}

.exchange-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 28px;

  .fa-coins {
    color: #fbbf24;
  }
  .fa-arrow-right {
    color: rgba(255, 255, 255, 0.3);
    font-size: 20px;
  }
  .fa-book-sparkles {
    color: #a78bfa;
  }
}

.exchange-rate {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 4px 0;
}

.exchange-note {
  font-size: 11px;
  color: rgba(239, 68, 68, 0.8);
  margin: 0 0 20px 0;
}

.exchange-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  input {
    width: 80px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    text-align: center;

    &:focus {
      outline: none;
      border-color: rgba(139, 92, 246, 0.5);
    }
  }
}

.qty-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.exchange-summary {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.exchange-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// 天赋抽取区域
.talent-gacha-section {
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 8px 0;

    i {
      margin-right: 6px;
      color: #fbbf24;
    }
  }
}

.talent-gacha-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 12px 0;
}

.talent-gacha-btn {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.1));
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 12px;
  color: #fcd34d;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 24px;
  }

  .btn-text {
    font-size: 14px;
    font-weight: 600;
  }

  .btn-cost {
    font-size: 11px;
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(251, 191, 36, 0.3);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.current-talent-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;

  .talent-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .no-talent {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
  }
}

.talent-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  i {
    font-size: 10px;
  }

  &.rarity-c {
    background: rgba(156, 163, 175, 0.2);
    color: #d1d5db;
    border: 1px solid rgba(156, 163, 175, 0.3);
  }
  &.rarity-b {
    background: rgba(96, 165, 250, 0.2);
    color: #93c5fd;
    border: 1px solid rgba(96, 165, 250, 0.3);
  }
  &.rarity-a {
    background: rgba(167, 139, 250, 0.2);
    color: #c4b5fd;
    border: 1px solid rgba(167, 139, 250, 0.3);
  }
  &.rarity-s {
    background: rgba(251, 191, 36, 0.2);
    color: #fcd34d;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }
  &.rarity-ss {
    background: rgba(244, 114, 182, 0.2);
    color: #f9a8d4;
    border: 1px solid rgba(244, 114, 182, 0.3);
  }
  &.rarity-sin {
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.9), rgba(60, 20, 40, 0.8));
    color: #dc2626;
    border: 1px solid rgba(139, 0, 0, 0.6);
    box-shadow:
      0 0 12px rgba(139, 0, 0, 0.4),
      inset 0 0 8px rgba(0, 0, 0, 0.5);
    text-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
    animation: sin-pulse 2s ease-in-out infinite;
  }

  &:hover {
    transform: scale(1.05);
  }
}

@keyframes sin-pulse {
  0%,
  100% {
    box-shadow:
      0 0 12px rgba(139, 0, 0, 0.4),
      inset 0 0 8px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow:
      0 0 20px rgba(139, 0, 0, 0.7),
      inset 0 0 12px rgba(0, 0, 0, 0.6);
  }
}

.talent-result {
  margin-top: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;

  h4 {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 10px 0;

    i {
      margin-right: 6px;
      color: #34d399;
    }
  }
}

.talent-card {
  padding: 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  &.rarity-c {
    border-left: 3px solid #9ca3af;
  }
  &.rarity-b {
    border-left: 3px solid #60a5fa;
  }
  &.rarity-a {
    border-left: 3px solid #a78bfa;
  }
  &.rarity-s {
    border-left: 3px solid #fbbf24;
  }
  &.rarity-ss {
    border-left: 3px solid #f472b6;
  }

  .talent-rarity {
    font-size: 10px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .talent-name {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin-bottom: 6px;
  }

  .talent-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .talent-bonus {
    display: flex;
    gap: 6px;
    font-size: 10px;

    .bonus-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .bonus-value {
      color: #6ee7b7;
    }
  }

  &.rarity-c .talent-rarity {
    color: #d1d5db;
  }
  &.rarity-b .talent-rarity {
    color: #93c5fd;
  }
  &.rarity-a .talent-rarity {
    color: #c4b5fd;
  }
  &.rarity-s .talent-rarity {
    color: #fcd34d;
  }
  &.rarity-ss .talent-rarity {
    color: #f9a8d4;
  }

  &.rarity-sin {
    border-left: 3px solid #8b0000;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(60, 20, 40, 0.9));
    box-shadow:
      0 0 15px rgba(139, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.4);
    animation: sin-card-pulse 3s ease-in-out infinite;

    .talent-rarity {
      color: #dc2626;
      text-shadow: 0 0 8px rgba(220, 38, 38, 0.8);
    }
    .talent-name {
      color: #ef4444;
      text-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
    }
    .talent-desc {
      color: rgba(255, 200, 200, 0.8);
    }
  }
}

@keyframes sin-card-pulse {
  0%,
  100% {
    box-shadow:
      0 0 15px rgba(139, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 25px rgba(139, 0, 0, 0.5),
      inset 0 0 25px rgba(0, 0, 0, 0.5);
  }
}

// SIN天赋暗黑特效
.sin-effect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(60, 0, 0, 0.9), rgba(0, 0, 0, 0.95));
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: sin-overlay-fade 3s ease-out forwards;
  pointer-events: none;
}

.sin-effect-content {
  text-align: center;
  animation: sin-content-appear 0.5s ease-out;
}

.sin-symbol {
  font-size: 80px;
  color: #dc2626;
  text-shadow:
    0 0 30px rgba(220, 38, 38, 0.8),
    0 0 60px rgba(139, 0, 0, 0.6);
  animation: sin-symbol-pulse 1s ease-in-out infinite;
}

.sin-text {
  font-size: 28px;
  font-weight: bold;
  color: #ef4444;
  text-shadow:
    0 0 20px rgba(239, 68, 68, 0.8),
    0 0 40px rgba(139, 0, 0, 0.5);
  margin-top: 20px;
  letter-spacing: 8px;
  animation: sin-text-glow 2s ease-in-out infinite;
}

.sin-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(220, 38, 38, 0.8), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(139, 0, 0, 0.6), transparent),
    radial-gradient(2px 2px at 60% 20%, rgba(220, 38, 38, 0.7), transparent),
    radial-gradient(2px 2px at 80% 60%, rgba(139, 0, 0, 0.5), transparent);
  animation: sin-particles-float 3s linear infinite;
}

.sin-glow {
  animation: sin-result-glow 2s ease-in-out infinite;
}

@keyframes sin-overlay-fade {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes sin-content-appear {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes sin-symbol-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes sin-text-glow {
  0%,
  100% {
    text-shadow:
      0 0 20px rgba(239, 68, 68, 0.8),
      0 0 40px rgba(139, 0, 0, 0.5);
  }
  50% {
    text-shadow:
      0 0 30px rgba(239, 68, 68, 1),
      0 0 60px rgba(139, 0, 0, 0.8);
  }
}

@keyframes sin-particles-float {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-20px);
  }
}

@keyframes sin-result-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);
  }
  50% {
    box-shadow:
      0 0 25px rgba(139, 0, 0, 0.6),
      0 0 40px rgba(220, 38, 38, 0.3);
  }
}

.talent-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.discard-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 8px;
  color: #f87171;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.02);
  }
}

.replace-btn {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: linear-gradient(135deg, #34d399, #10b981);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(52, 211, 153, 0.4);
  }
}

.talent-tooltip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 16px;
  background: rgba(30, 30, 40, 0.98);
  border: 1px solid rgba(139, 92, 246, 0.5);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  max-width: 300px;

  .tooltip-title {
    font-size: 14px;
    font-weight: 600;
    color: white;
    margin-bottom: 8px;
  }

  .tooltip-desc {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .tooltip-bonus {
    font-size: 11px;
    color: #6ee7b7;
  }
}

// 我的天赋区域（技能页面）
.my-talent-section {
  margin-bottom: 20px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.15);

  .talent-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 12px;

    i {
      color: #fbbf24;
    }
  }
}

.my-talent-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }

  &.rarity-c {
    border-left: 3px solid #9ca3af;
  }
  &.rarity-b {
    border-left: 3px solid #60a5fa;
  }
  &.rarity-a {
    border-left: 3px solid #a78bfa;
  }
  &.rarity-s {
    border-left: 3px solid #fbbf24;
  }
  &.rarity-ss {
    border-left: 3px solid #f472b6;
  }
  &.rarity-sin {
    border-left: 3px solid #8b0000;
    background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(60, 20, 40, 0.9));
    box-shadow:
      0 0 15px rgba(139, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.4);

    .talent-name {
      color: #ef4444;
      text-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
    }
    .talent-desc {
      color: rgba(255, 200, 200, 0.7);
    }
    .talent-icon {
      background: rgba(139, 0, 0, 0.3);
      i {
        color: #dc2626;
      }
    }
  }

  .talent-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(139, 92, 246, 0.2);

    i {
      font-size: 18px;
      color: #a78bfa;
    }
  }

  .talent-info {
    flex: 1;
    min-width: 0;
  }

  .talent-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .talent-name {
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  .talent-rarity-badge {
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;

    &.rarity-c {
      background: rgba(156, 163, 175, 0.3);
      color: #d1d5db;
    }
    &.rarity-b {
      background: rgba(96, 165, 250, 0.3);
      color: #93c5fd;
    }
    &.rarity-a {
      background: rgba(167, 139, 250, 0.3);
      color: #c4b5fd;
    }
    &.rarity-s {
      background: rgba(251, 191, 36, 0.3);
      color: #fcd34d;
    }
    &.rarity-ss {
      background: rgba(244, 114, 182, 0.3);
      color: #f9a8d4;
    }
    &.rarity-sin {
      background: rgba(139, 0, 0, 0.4);
      color: #dc2626;
      text-shadow: 0 0 6px rgba(220, 38, 38, 0.6);
    }
  }

  .talent-desc {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .talent-bonus-row {
    display: flex;
    gap: 4px;
    font-size: 10px;

    .bonus-label {
      color: rgba(255, 255, 255, 0.4);
    }
    .bonus-value {
      color: #6ee7b7;
    }
  }
}

.no-talent-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.1);

  i {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.2);
  }

  span {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }
}

// 作者测试区域
.author-test-section {
  margin-top: 20px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 100, 100, 0.15);
  overflow: hidden;

  .author-test-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    i:first-child {
      color: #f87171;
      margin-right: 8px;
    }

    span {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .author-test-content {
    padding: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .password-input {
    display: flex;
    gap: 10px;

    input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-size: 13px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }

      &:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.5);
      }
    }

    .unlock-btn {
      padding: 10px 16px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #f87171, #ef4444);
      color: white;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
      }
    }
  }

  .talent-select-panel {
    h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 12px;

      i {
        color: #fbbf24;
      }
    }
  }

  .talent-list-scroll {
    max-height: 300px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  }

  .talent-select-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(4px);
    }

    .talent-name {
      font-size: 12px;
      color: white;
    }

    .talent-rarity {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
    }

    &.rarity-c .talent-rarity {
      color: #9ca3af;
    }
    &.rarity-b .talent-rarity {
      color: #60a5fa;
    }
    &.rarity-a .talent-rarity {
      color: #a78bfa;
    }
    &.rarity-s .talent-rarity {
      color: #fbbf24;
    }
    &.rarity-ss .talent-rarity {
      color: #f87171;
    }

    &.rarity-sin {
      background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(60, 20, 40, 0.9));
      border: 1px solid rgba(139, 0, 0, 0.6);
      box-shadow: 0 0 10px rgba(139, 0, 0, 0.3);

      .talent-name {
        color: #ef4444;
        text-shadow: 0 0 6px rgba(239, 68, 68, 0.5);
      }
      .talent-rarity {
        color: #dc2626;
        background: rgba(139, 0, 0, 0.3);
        text-shadow: 0 0 8px rgba(220, 38, 38, 0.8);
      }

      &:hover {
        box-shadow: 0 0 15px rgba(139, 0, 0, 0.5);
      }
    }
  }
}
</style>
