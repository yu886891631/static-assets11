<template>
  <div class="shop-page">
    <!-- 金币显示 -->
    <div class="shop-header">
      <div class="gold-card">
        <i class="fas fa-coins"></i>
        <div class="gold-info">
          <span class="gold-label">学园金币</span>
          <span class="gold-value">{{ goldCoins }}</span>
        </div>
        <button
          v-if="!isSpecialBattleUnlocked"
          class="special-battle-unlock"
          type="button"
          @click="unlockSpecialBattle"
        ></button>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        <i :class="cat.icon"></i>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar" v-if="activeCategory === 'equipment'">
      <div class="filter-group">
        <span class="filter-label">等级:</span>
        <div class="filter-options">
          <button
            v-for="grade in gradeFilters"
            :key="grade"
            class="filter-btn"
            :class="{ active: selectedGrade === grade, ['grade-' + grade.toLowerCase()]: true }"
            @click="selectedGrade = selectedGrade === grade ? '' : grade"
          >
            {{ grade }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">部位:</span>
        <div class="filter-options">
          <button
            v-for="slot in slotFilters"
            :key="slot"
            class="filter-btn slot-btn"
            :class="{ active: selectedSlot === slot }"
            @click="selectedSlot = selectedSlot === slot ? '' : slot"
          >
            {{ slot }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">性别:</span>
        <div class="filter-options">
          <button
            v-for="gender in genderFilters"
            :key="gender"
            class="filter-btn gender-btn"
            :class="{ active: selectedGender === gender }"
            @click="selectedGender = selectedGender === gender ? '' : gender"
          >
            {{ gender }}
          </button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">属性偏好:</span>
        <div class="filter-options">
          <button
            v-for="attr in attrFilters"
            :key="attr"
            class="filter-btn attr-btn"
            :class="{ active: selectedAttr === attr }"
            @click="selectedAttr = selectedAttr === attr ? '' : attr"
          >
            {{ attr }}
          </button>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="shop-content">
      <!-- 装备类 -->
      <div v-if="activeCategory === 'equipment'" class="item-section">
        <div class="item-grid">
          <div
            v-for="item in filteredEquipments"
            :key="item.name"
            class="shop-item"
            :class="'grade-' + item.grade.toLowerCase()"
            @click="selectItem(item)"
          >
            <div class="item-icon">
              <i :class="item.icon"></i>
            </div>
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <div class="item-meta">
                <span class="item-grade" :class="'grade-' + item.grade.toLowerCase()">{{ item.grade }}</span>
                <span class="item-type">{{ item.slot }}</span>
              </div>
            </div>
            <div class="item-price">
              <i class="fas fa-coins"></i>
              <template v-if="getItemDiscount(item) > 0">
                <span class="original-price">{{ item.price }}</span>
                <span class="discounted-price">{{ getDiscountedPrice(item) }}</span>
              </template>
              <template v-else>
                {{ item.price }}
              </template>
            </div>
          </div>
        </div>
        <div v-if="filteredEquipments.length === 0" class="empty-filter">
          <i class="fas fa-filter-circle-xmark"></i>
          <span>没有符合筛选条件的装备</span>
        </div>
      </div>

      <!-- 消耗品 -->
      <div v-if="activeCategory === 'consumables'" class="item-section">
        <div class="sub-category" v-for="subCat in visibleConsumableSubCategories" :key="subCat.type">
          <h4 class="sub-title consumable-title">
            <i :class="subCat.icon"></i>
            {{ subCat.name }}
          </h4>
          <div class="item-grid">
            <div
              v-for="item in subCat.items"
              :key="item.id"
              class="shop-item consumable-item"
              :class="{ 'combat-only': item.combatOnly }"
              @click="selectItem(item)"
            >
              <div class="item-icon">
                <i :class="item.icon"></i>
              </div>
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-effect">{{ item.effectText }}</span>
              </div>
              <div class="item-price">
                <i class="fas fa-coins"></i>
                <template v-if="getItemDiscount(item) > 0">
                  <span class="original-price">{{ item.price }}</span>
                  <span class="discounted-price">{{ getDiscountedPrice(item) }}</span>
                </template>
                <template v-else>
                  {{ item.price }}
                </template>
              </div>
              <span v-if="item.combatOnly" class="combat-tag">战斗用</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购买确认弹窗 -->
    <div v-if="selectedItem" class="purchase-modal" @click.self="selectedItem = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>确认购买</h3>
          <button class="close-btn" @click="selectedItem = null">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="selected-item-preview">
            <div class="preview-icon" :class="getItemGradeClass(selectedItem)">
              <i :class="selectedItem.icon"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ selectedItem.name }}</span>
              <span class="preview-desc">{{ selectedItem.description }}</span>
            </div>
          </div>

          <div class="item-details" v-if="selectedItem.bonuses">
            <div class="detail-title">属性加成</div>
            <div class="bonus-list">
              <div v-for="(value, key) in selectedItem.bonuses" :key="key" class="bonus-item">
                <span class="bonus-name">{{ key }}</span>
                <span class="bonus-value" :class="value > 0 ? 'positive' : 'negative'">
                  {{ value > 0 ? '+' : '' }}{{ value }}
                </span>
              </div>
            </div>
          </div>

          <div class="quantity-selector" v-if="selectedItem.category !== 'equipment'">
            <span>数量:</span>
            <button @click="purchaseQuantity = Math.max(1, purchaseQuantity - 1)">-</button>
            <span class="quantity">{{ purchaseQuantity }}</span>
            <button @click="purchaseQuantity = Math.min(99, purchaseQuantity + 1)">+</button>
          </div>

          <div class="price-summary">
            <span>总价:</span>
            <span class="total-price">
              <i class="fas fa-coins"></i>
              <template v-if="getItemDiscount(selectedItem) > 0">
                <span class="original-price">{{ selectedItem.price * purchaseQuantity }}</span>
                <span class="discounted-price">{{ getDiscountedPrice(selectedItem) * purchaseQuantity }}</span>
                <span class="discount-tag">-{{ getItemDiscount(selectedItem) }}%</span>
              </template>
              <template v-else>
                {{ selectedItem.price * purchaseQuantity }}
              </template>
            </span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="selectedItem = null">取消</button>
          <button
            class="confirm-btn"
            :disabled="goldCoins < getDiscountedPrice(selectedItem) * purchaseQuantity"
            @click="purchaseItem"
          >
            <i class="fas fa-shopping-cart"></i>
            购买
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getDailyTalentEffect } from '../../data/talentDatabase';

const props = defineProps<{
  characterData: any;
}>();

// 获取当前天赋ID
const currentTalentId = computed(() => {
  const talents = props.characterData.技能系统?.$天赋;
  if (!talents || Object.keys(talents).length === 0) return undefined;
  // 返回第一个天赋的ID（玩家只能拥有一个天赋）
  return Object.keys(talents)[0];
});

// 计算商店折扣
function getItemDiscount(item: any): number {
  const talentId = currentTalentId.value;
  if (!talentId) return 0;

  let discount = 0;

  // 全局折扣
  discount += getDailyTalentEffect(talentId, 'shop_discount_all');

  // 回复类折扣
  if (item.category === 'consumable' && (item.effect?.staminaRestore || item.effect?.pleasureReduce)) {
    discount += getDailyTalentEffect(talentId, 'shop_discount_recovery');
  }

  // 装备折扣
  if (item.category === 'equipment') {
    discount += getDailyTalentEffect(talentId, 'shop_discount_equipment');
  }

  // 永久提升类折扣
  if (item.category === 'consumable' && item.effect?.permanent) {
    discount += getDailyTalentEffect(talentId, 'shop_discount_permanent');
  }

  return Math.min(discount, 50); // 最大50%折扣
}

// 获取折扣后价格
function getDiscountedPrice(item: any): number {
  const discount = getItemDiscount(item);
  return Math.floor((item.price * (100 - discount)) / 100);
}

// 金币
const goldCoins = computed(() => {
  return props.characterData.物品系统?.学园金币 || 0;
});

// 当前分类
const activeCategory = ref('equipment');

// 选中的物品
const selectedItem = ref<any>(null);
const purchaseQuantity = ref(1);

const isSpecialBattleUnlocked = ref(false);

onMounted(() => {
  try {
    isSpecialBattleUnlocked.value = localStorage.getItem('shop_unlock_special_battle') === '1';
  } catch {
    isSpecialBattleUnlocked.value = false;
  }
});

function unlockSpecialBattle() {
  isSpecialBattleUnlocked.value = true;
  try {
    localStorage.setItem('shop_unlock_special_battle', '1');
  } catch {
    // ignore
  }
}

// 分类列表（移除礼物）
const categories = [
  { id: 'equipment', name: '装备', icon: 'fas fa-shield-halved' },
  { id: 'consumables', name: '消耗品', icon: 'fas fa-flask' },
];

// 筛选状态
const selectedGrade = ref('');
const selectedSlot = ref('');
const selectedGender = ref('');
const selectedAttr = ref('');
const gradeFilters = ['C', 'B', 'A', 'S', 'SS'];
const slotFilters = ['主装备', '副装备', '饰品', '特殊装备'];
const genderFilters = ['男', '女'];
const attrFilters = ['性斗力', '忍耐力', '魅力', '幸运'];

// 所有装备列表（扁平化，突出性斗主题）
const allEquipments = [
  // C级装备（保持原有+增加一件饰品）
  {
    name: '情趣校服',
    slot: '主装备',
    icon: 'fas fa-shirt',
    price: 500,
    category: 'equipment',
    grade: 'C',
    gender: '女',
    attrFocus: '忍耐力',
    description: '经过特殊改良的校服，增加身体敏感度防护',
    bonuses: { 基础忍耐力加成: 5, 闪避率加成: 2 },
  },
  {
    name: '诱惑香囊',
    slot: '饰品',
    icon: 'fas fa-heart',
    price: 600,
    category: 'equipment',
    grade: 'C',
    gender: '女',
    attrFocus: '魅力',
    description: '散发迷人香气的小香囊',
    bonuses: { 魅力加成: 4, 幸运加成: 2 },
  },
  {
    name: '柔软皮鞭',
    slot: '副装备',
    icon: 'fas fa-fire',
    price: 800,
    category: 'equipment',
    grade: 'C',
    gender: '女',
    attrFocus: '性斗力',
    description: '入门级调教道具',
    bonuses: { 基础性斗力加成: 6, 暴击率加成: 2 },
  },
  {
    name: '丝绸手套',
    slot: '特殊装备',
    icon: 'fas fa-hand',
    price: 550,
    category: 'equipment',
    grade: 'C',
    gender: '女',
    attrFocus: '魅力',
    description: '触感极佳的丝绸手套',
    bonuses: { 基础性斗力加成: 3, 魅力加成: 3 },
  },
  {
    name: '蕾丝眼罩',
    slot: '饰品',
    icon: 'fas fa-eye-slash',
    price: 450,
    category: 'equipment',
    grade: 'C',
    gender: '女',
    attrFocus: '幸运',
    description: '增加神秘感的蕾丝眼罩',
    bonuses: { 闪避率加成: 3, 幸运加成: 2 },
  },
  {
    name: '束缚带',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 700,
    category: 'equipment',
    grade: 'C',
    gender: '男',
    attrFocus: '忍耐力',
    description: '基础束缚道具',
    bonuses: { 基础忍耐力加成: 4, 基础性斗力加成: 3 },
  },
  {
    name: '幸运护符',
    slot: '饰品',
    icon: 'fas fa-clover',
    price: 550,
    category: 'equipment',
    grade: 'C',
    gender: '男',
    attrFocus: '幸运',
    description: '带来好运的护符',
    bonuses: { 幸运加成: 4, 闪避率加成: 2 },
  },

  // B级装备（保持原有+增加一件饰品）
  {
    name: '紧身战斗服',
    slot: '主装备',
    icon: 'fas fa-vest',
    price: 1500,
    category: 'equipment',
    grade: 'B',
    gender: '女',
    attrFocus: '忍耐力',
    description: '凸显身材的紧身战斗服',
    bonuses: { 基础忍耐力加成: 10, 魅力加成: 6, 闪避率加成: 4 },
  },
  {
    name: '魅惑项圈',
    slot: '饰品',
    icon: 'fas fa-ring',
    price: 1800,
    category: 'equipment',
    grade: 'B',
    gender: '女',
    attrFocus: '魅力',
    description: '带有魔力的项圈',
    bonuses: { 魅力加成: 10, 基础性斗力加成: 5, 暴击率加成: 3 },
  },
  {
    name: '电击按摩棒',
    slot: '副装备',
    icon: 'fas fa-bolt',
    price: 2000,
    category: 'equipment',
    grade: 'B',
    gender: '女',
    attrFocus: '性斗力',
    description: '带有微电流的按摩道具',
    bonuses: { 基础性斗力加成: 15, 暴击率加成: 5 },
  },
  {
    name: '情趣内衣套装',
    slot: '主装备',
    icon: 'fas fa-heart',
    price: 1600,
    category: 'equipment',
    grade: 'B',
    gender: '女',
    attrFocus: '魅力',
    description: '精致的情趣内衣',
    bonuses: { 魅力加成: 12, 闪避率加成: 5, 幸运加成: 4 },
  },
  {
    name: '羽毛逗弄器',
    slot: '副装备',
    icon: 'fas fa-feather',
    price: 1400,
    category: 'equipment',
    grade: 'B',
    gender: '男',
    attrFocus: '性斗力',
    description: '柔软的羽毛道具',
    bonuses: { 基础性斗力加成: 10, 魅力加成: 6 },
  },
  {
    name: '震动戒指',
    slot: '饰品',
    icon: 'fas fa-circle',
    price: 1700,
    category: 'equipment',
    grade: 'B',
    gender: '男',
    attrFocus: '幸运',
    description: '带有震动功能的戒指',
    bonuses: { 基础性斗力加成: 8, 暴击率加成: 4, 幸运加成: 3 },
  },
  {
    name: '皮革束缚套装',
    slot: '特殊装备',
    icon: 'fas fa-lock',
    price: 2200,
    category: 'equipment',
    grade: 'B',
    gender: '男',
    attrFocus: '忍耐力',
    description: '高级皮革束缚道具',
    bonuses: { 基础忍耐力加成: 12, 基础性斗力加成: 8 },
  },
  {
    name: '强化护腕',
    slot: '饰品',
    icon: 'fas fa-hand-fist',
    price: 1750,
    category: 'equipment',
    grade: 'B',
    gender: '男',
    attrFocus: '性斗力',
    description: '增强力量的护腕',
    bonuses: { 基础性斗力加成: 12, 暴击率加成: 4 },
  },

  // A级装备 - 女性性斗力系（主副饰品×2特殊）
  {
    name: '女王战甲',
    slot: '主装备',
    icon: 'fas fa-crown',
    price: 4000,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '性斗力',
    description: '彰显支配力的战斗装束',
    bonuses: { 基础性斗力加成: 25, 基础忍耐力加成: 15, 暴击率加成: 8 },
  },
  {
    name: '高级调教鞭',
    slot: '副装备',
    icon: 'fas fa-gavel',
    price: 5000,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '性斗力',
    description: '专业级调教道具',
    bonuses: { 基础性斗力加成: 28, 暴击率加成: 10, 基础性斗力成算: 3 },
  },
  {
    name: '淫纹刺青',
    slot: '饰品',
    icon: 'fas fa-fire-flame-curved',
    price: 4800,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '性斗力',
    description: '增强性斗力的魔法刺青',
    bonuses: { 基础性斗力加成: 22, 基础性斗力成算: 5, 暴击率加成: 6 },
  },
  {
    name: '欲望宝珠',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 4600,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '性斗力',
    description: '蕴含欲望之力的宝珠',
    bonuses: { 基础性斗力加成: 20, 暴击率加成: 8, 基础性斗力成算: 4 },
  },
  {
    name: '触手束缚器',
    slot: '特殊装备',
    icon: 'fas fa-spider',
    price: 6000,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '性斗力',
    description: '活体触手束缚道具',
    bonuses: { 基础性斗力加成: 25, 基础忍耐力加成: 15, 暴击率加成: 8 },
  },

  // A级装备 - 女性忍耐力系
  {
    name: '坚韧战衣',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 4200,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '忍耐力',
    description: '极强防护的战斗服',
    bonuses: { 基础忍耐力加成: 28, 基础性斗力加成: 12, 闪避率加成: 8 },
  },
  {
    name: '防护法杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 4800,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '忍耐力',
    description: '提供防护的魔法杖',
    bonuses: { 基础忍耐力加成: 25, 基础忍耐力成算: 5, 闪避率加成: 6 },
  },
  {
    name: '守护之心',
    slot: '饰品',
    icon: 'fas fa-heart-pulse',
    price: 4500,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '忍耐力',
    description: '守护之力的结晶',
    bonuses: { 基础忍耐力加成: 22, 基础忍耐力成算: 4, 闪避率加成: 5 },
  },
  {
    name: '坚韧护符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 4400,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '忍耐力',
    description: '增强忍耐的护符',
    bonuses: { 基础忍耐力加成: 20, 闪避率加成: 8, 基础忍耐力成算: 3 },
  },
  {
    name: '不屈锁链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 5800,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永不屈服的锁链',
    bonuses: { 基础忍耐力加成: 26, 基础性斗力加成: 10, 基础忍耐力成算: 6 },
  },

  // A级装备 - 女性魅力系
  {
    name: '魅惑女王装',
    slot: '主装备',
    icon: 'fas fa-user-secret',
    price: 4100,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '魅力',
    description: '散发魅力的女王装束',
    bonuses: { 魅力加成: 28, 基础性斗力加成: 12, 暴击率加成: 6 },
  },
  {
    name: '诱惑之鞭',
    slot: '副装备',
    icon: 'fas fa-fire',
    price: 4700,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '魅力',
    description: '充满诱惑力的皮鞭',
    bonuses: { 魅力加成: 25, 基础性斗力加成: 15, 暴击率加成: 5 },
  },
  {
    name: '催情宝石吊坠',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 4500,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '魅力',
    description: '蕴含催情魔力的宝石',
    bonuses: { 魅力加成: 22, 基础性斗力加成: 10, 暴击率加成: 8 },
  },
  {
    name: '魅惑耳环',
    slot: '饰品',
    icon: 'fas fa-circle',
    price: 4300,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '魅力',
    description: '增强魅力的耳环',
    bonuses: { 魅力加成: 20, 幸运加成: 8, 暴击率加成: 6 },
  },
  {
    name: '诱惑丝带',
    slot: '特殊装备',
    icon: 'fas fa-ribbon',
    price: 5600,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '魅力',
    description: '充满诱惑的丝带',
    bonuses: { 魅力加成: 26, 基础性斗力加成: 12, 闪避率加成: 8 },
  },

  // A级装备 - 女性幸运系
  {
    name: '幸运女神装',
    slot: '主装备',
    icon: 'fas fa-clover',
    price: 4000,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运女神的祝福',
    bonuses: { 幸运加成: 25, 闪避率加成: 12, 魅力加成: 10 },
  },
  {
    name: '命运之杖',
    slot: '副装备',
    icon: 'fas fa-wand-sparkles',
    price: 4600,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '幸运',
    description: '操控命运的魔杖',
    bonuses: { 幸运加成: 22, 暴击率加成: 10, 闪避率加成: 8 },
  },
  {
    name: '魅魔之翼',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 5500,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '幸运',
    description: '传说中魅魔的羽翼',
    bonuses: { 幸运加成: 24, 闪避率加成: 12, 魅力加成: 10 },
  },
  {
    name: '幸运星坠',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 4400,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运之星的碎片',
    bonuses: { 幸运加成: 20, 闪避率加成: 10, 暴击率加成: 6 },
  },
  {
    name: '命运之环',
    slot: '饰品',
    icon: 'fas fa-ring',
    price: 4200,
    category: 'equipment',
    grade: 'A',
    gender: '女',
    attrFocus: '幸运',
    description: '改变命运的戒指',
    bonuses: { 幸运加成: 18, 闪避率加成: 8, 暴击率加成: 8 },
  },

  // A级装备 - 男性性斗力系
  {
    name: '征服者战甲',
    slot: '主装备',
    icon: 'fas fa-user-ninja',
    price: 4100,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '性斗力',
    description: '征服者的强力战甲',
    bonuses: { 基础性斗力加成: 26, 基础忍耐力加成: 14, 暴击率加成: 8 },
  },
  {
    name: '支配之鞭',
    slot: '副装备',
    icon: 'fas fa-gavel',
    price: 5100,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '性斗力',
    description: '彰显支配力的皮鞭',
    bonuses: { 基础性斗力加成: 29, 暴击率加成: 11, 基础性斗力成算: 3 },
  },
  {
    name: '力量印记',
    slot: '饰品',
    icon: 'fas fa-fire',
    price: 4700,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '性斗力',
    description: '力量的象征',
    bonuses: { 基础性斗力加成: 23, 基础性斗力成算: 5, 暴击率加成: 7 },
  },
  {
    name: '战斗护腕',
    slot: '饰品',
    icon: 'fas fa-hand-fist',
    price: 4500,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '性斗力',
    description: '增强战斗力的护腕',
    bonuses: { 基础性斗力加成: 21, 暴击率加成: 9, 基础性斗力成算: 4 },
  },
  {
    name: '束缚锁链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 6100,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '性斗力',
    description: '强力的束缚锁链',
    bonuses: { 基础性斗力加成: 26, 基础忍耐力加成: 16, 暴击率加成: 8 },
  },

  // A级装备 - 男性忍耐力系
  {
    name: '不屈战甲',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 4300,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '忍耐力',
    description: '永不屈服的战甲',
    bonuses: { 基础忍耐力加成: 29, 基础性斗力加成: 13, 闪避率加成: 8 },
  },
  {
    name: '守护之盾',
    slot: '副装备',
    icon: 'fas fa-shield-halved',
    price: 4900,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '忍耐力',
    description: '强力的防护盾牌',
    bonuses: { 基础忍耐力加成: 26, 基础忍耐力成算: 5, 闪避率加成: 7 },
  },
  {
    name: '坚韧徽章',
    slot: '饰品',
    icon: 'fas fa-medal',
    price: 4600,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '忍耐力',
    description: '坚韧不拔的徽章',
    bonuses: { 基础忍耐力加成: 23, 基础忍耐力成算: 4, 闪避率加成: 6 },
  },
  {
    name: '防护护符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 4500,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '忍耐力',
    description: '提供防护的护符',
    bonuses: { 基础忍耐力加成: 21, 闪避率加成: 9, 基础忍耐力成算: 3 },
  },
  {
    name: '钢铁意志',
    slot: '特殊装备',
    icon: 'fas fa-dumbbell',
    price: 5900,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '忍耐力',
    description: '钢铁般的意志',
    bonuses: { 基础忍耐力加成: 27, 基础性斗力加成: 11, 基础忍耐力成算: 6 },
  },

  // A级装备 - 男性魅力系
  {
    name: '魅力绅士装',
    slot: '主装备',
    icon: 'fas fa-user-tie',
    price: 4200,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '魅力',
    description: '充满魅力的绅士装',
    bonuses: { 魅力加成: 29, 基础性斗力加成: 13, 暴击率加成: 6 },
  },
  {
    name: '诱惑之杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 4800,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '魅力',
    description: '散发诱惑的魔杖',
    bonuses: { 魅力加成: 26, 基础性斗力加成: 16, 暴击率加成: 5 },
  },
  {
    name: '魅力宝石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 4600,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '魅力',
    description: '增强魅力的宝石',
    bonuses: { 魅力加成: 23, 基础性斗力加成: 11, 暴击率加成: 8 },
  },
  {
    name: '诱惑戒指',
    slot: '饰品',
    icon: 'fas fa-ring',
    price: 4400,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '魅力',
    description: '充满诱惑的戒指',
    bonuses: { 魅力加成: 21, 幸运加成: 9, 暴击率加成: 6 },
  },
  {
    name: '魅惑披风',
    slot: '特殊装备',
    icon: 'fas fa-vest',
    price: 5700,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑众生的披风',
    bonuses: { 魅力加成: 27, 基础性斗力加成: 13, 闪避率加成: 8 },
  },

  // A级装备 - 男性幸运系
  {
    name: '幸运骑士装',
    slot: '主装备',
    icon: 'fas fa-chess-knight',
    price: 4100,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运骑士的装束',
    bonuses: { 幸运加成: 26, 闪避率加成: 13, 魅力加成: 10 },
  },
  {
    name: '幸运之剑',
    slot: '副装备',
    icon: 'fas fa-khanda',
    price: 4700,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '幸运',
    description: '带来好运的宝剑',
    bonuses: { 幸运加成: 23, 暴击率加成: 11, 闪避率加成: 8 },
  },
  {
    name: '幸运徽章',
    slot: '饰品',
    icon: 'fas fa-clover',
    price: 4500,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运的象征',
    bonuses: { 幸运加成: 21, 闪避率加成: 11, 暴击率加成: 6 },
  },
  {
    name: '命运护符',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 4300,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '幸运',
    description: '改变命运的护符',
    bonuses: { 幸运加成: 19, 闪避率加成: 9, 暴击率加成: 8 },
  },
  {
    name: '幸运披风',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 5600,
    category: 'equipment',
    grade: 'A',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运之风的披风',
    bonuses: { 幸运加成: 25, 闪避率加成: 13, 魅力加成: 10 },
  },

  // S级装备 - 女性性斗力系
  {
    name: '淫魔女王套装',
    slot: '主装备',
    icon: 'fas fa-user-secret',
    price: 10000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '性斗力',
    description: '淫魔女王的战斗装束',
    bonuses: { 基础性斗力加成: 45, 基础忍耐力加成: 35, 魅力加成: 25, 基础性斗力成算: 8 },
  },
  {
    name: '快感增幅器',
    slot: '副装备',
    icon: 'fas fa-wave-square',
    price: 11000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '性斗力',
    description: '能够增幅快感的神器',
    bonuses: { 基础性斗力加成: 50, 暴击率加成: 18, 基础性斗力成算: 10 },
  },
  {
    name: '欲望烙印',
    slot: '饰品',
    icon: 'fas fa-fire-flame-curved',
    price: 10500,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '性斗力',
    description: '欲望的永恒烙印',
    bonuses: { 基础性斗力加成: 42, 基础性斗力成算: 9, 暴击率加成: 14 },
  },
  {
    name: '堕落宝珠',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 10200,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '性斗力',
    description: '堕落之力的结晶',
    bonuses: { 基础性斗力加成: 40, 暴击率加成: 16, 基础性斗力成算: 8 },
  },
  {
    name: '淫纹锁链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 12000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '性斗力',
    description: '刻有淫纹的锁链',
    bonuses: { 基础性斗力加成: 48, 基础忍耐力加成: 28, 暴击率加成: 15 },
  },

  // S级装备 - 女性忍耐力系
  {
    name: '不屈圣衣',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 10200,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永不屈服的圣衣',
    bonuses: { 基础忍耐力加成: 48, 基础性斗力加成: 25, 闪避率加成: 15, 基础忍耐力成算: 8 },
  },
  {
    name: '守护圣杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 11200,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '忍耐力',
    description: '守护之力的圣杖',
    bonuses: { 基础忍耐力加成: 45, 基础忍耐力成算: 10, 闪避率加成: 12 },
  },
  {
    name: '永恒守护',
    slot: '特殊装备',
    icon: 'fas fa-shield-heart',
    price: 13000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永恒的守护之力',
    bonuses: { 基础忍耐力加成: 50, 基础性斗力加成: 20, 基础忍耐力成算: 11, 闪避率加成: 12 },
  },
  {
    name: '坚韧之心',
    slot: '饰品',
    icon: 'fas fa-heart-pulse',
    price: 10800,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '忍耐力',
    description: '坚韧不拔之心',
    bonuses: { 基础忍耐力加成: 43, 基础忍耐力成算: 9, 闪避率加成: 10 },
  },
  {
    name: '不灭护符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 10500,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永不熄灭的护符',
    bonuses: { 基础忍耐力加成: 40, 闪避率加成: 14, 基础忍耐力成算: 8 },
  },

  // S级装备 - 女性魅力系
  {
    name: '魅魔圣装',
    slot: '主装备',
    icon: 'fas fa-user-secret',
    price: 10100,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '魅力',
    description: '魅魔的圣洁装束',
    bonuses: { 魅力加成: 48, 基础性斗力加成: 25, 暴击率加成: 12 },
  },
  {
    name: '诱惑圣鞭',
    slot: '副装备',
    icon: 'fas fa-fire',
    price: 11300,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '魅力',
    description: '至高诱惑之鞭',
    bonuses: { 魅力加成: 45, 基础性斗力加成: 28, 暴击率加成: 10 },
  },
  {
    name: '堕落之心',
    slot: '饰品',
    icon: 'fas fa-heart-crack',
    price: 12000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '魅力',
    description: '蕴含堕落力量的心形宝石',
    bonuses: { 魅力加成: 43, 基础性斗力加成: 20, 暴击率加成: 15 },
  },
  {
    name: '魅惑宝石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 10700,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '魅力',
    description: '魅惑众生的宝石',
    bonuses: { 魅力加成: 40, 幸运加成: 15, 暴击率加成: 12 },
  },
  {
    name: '诱惑圣带',
    slot: '特殊装备',
    icon: 'fas fa-ribbon',
    price: 12500,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '魅力',
    description: '至高诱惑的圣带',
    bonuses: { 魅力加成: 46, 基础性斗力加成: 22, 闪避率加成: 14 },
  },

  // S级装备 - 女性幸运系
  {
    name: '命运女神装',
    slot: '主装备',
    icon: 'fas fa-clover',
    price: 10000,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '幸运',
    description: '命运女神的祝福',
    bonuses: { 幸运加成: 45, 闪避率加成: 20, 魅力加成: 18 },
  },
  {
    name: '命运圣杖',
    slot: '副装备',
    icon: 'fas fa-wand-sparkles',
    price: 11100,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '幸运',
    description: '掌控命运的圣杖',
    bonuses: { 幸运加成: 42, 暴击率加成: 18, 闪避率加成: 15 },
  },
  {
    name: '幸运圣翼',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 12800,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运之神的羽翼',
    bonuses: { 幸运加成: 44, 闪避率加成: 22, 魅力加成: 16 },
  },
  {
    name: '命运之星',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 10900,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '幸运',
    description: '命运之星的碎片',
    bonuses: { 幸运加成: 40, 闪避率加成: 18, 暴击率加成: 12 },
  },
  {
    name: '幸运圣环',
    slot: '饰品',
    icon: 'fas fa-ring',
    price: 10600,
    category: 'equipment',
    grade: 'S',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运的圣环',
    bonuses: { 幸运加成: 38, 闪避率加成: 16, 暴击率加成: 14 },
  },

  // S级装备 - 男性性斗力系
  {
    name: '征服者圣铠',
    slot: '主装备',
    icon: 'fas fa-chess-king',
    price: 10500,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '性斗力',
    description: '征服者的至高圣铠',
    bonuses: { 基础性斗力加成: 46, 基础忍耐力加成: 36, 暴击率加成: 12, 基础性斗力成算: 8 },
  },
  {
    name: '支配圣鞭',
    slot: '副装备',
    icon: 'fas fa-gavel',
    price: 11400,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '性斗力',
    description: '绝对支配之鞭',
    bonuses: { 基础性斗力加成: 51, 暴击率加成: 19, 基础性斗力成算: 10 },
  },
  {
    name: '力量圣印',
    slot: '饰品',
    icon: 'fas fa-fire',
    price: 10800,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '性斗力',
    description: '力量的圣印',
    bonuses: { 基础性斗力加成: 44, 基础性斗力成算: 9, 暴击率加成: 15 },
  },
  {
    name: '战神护腕',
    slot: '饰品',
    icon: 'fas fa-hand-fist',
    price: 10600,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '性斗力',
    description: '战神的护腕',
    bonuses: { 基础性斗力加成: 42, 暴击率加成: 17, 基础性斗力成算: 8 },
  },
  {
    name: '支配圣链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 12300,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '性斗力',
    description: '支配一切的圣链',
    bonuses: { 基础性斗力加成: 49, 基础忍耐力加成: 30, 暴击率加成: 16 },
  },

  // S级装备 - 男性忍耐力系
  {
    name: '不灭圣铠',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 10600,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '忍耐力',
    description: '永不破灭的圣铠',
    bonuses: { 基础忍耐力加成: 50, 基础性斗力加成: 26, 闪避率加成: 15, 基础忍耐力成算: 8 },
  },
  {
    name: '守护圣盾',
    slot: '副装备',
    icon: 'fas fa-shield-halved',
    price: 11500,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '忍耐力',
    description: '至高守护之盾',
    bonuses: { 基础忍耐力加成: 47, 基础忍耐力成算: 10, 闪避率加成: 13 },
  },
  {
    name: '坚韧圣章',
    slot: '饰品',
    icon: 'fas fa-medal',
    price: 11000,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '忍耐力',
    description: '坚韧的圣章',
    bonuses: { 基础忍耐力加成: 44, 基础忍耐力成算: 9, 闪避率加成: 11 },
  },
  {
    name: '守护圣符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 10800,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '忍耐力',
    description: '守护的圣符',
    bonuses: { 基础忍耐力加成: 42, 闪避率加成: 15, 基础忍耐力成算: 8 },
  },
  {
    name: '绝对支配锁链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 13000,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '忍耐力',
    description: '无法挣脱的支配锁链',
    bonuses: { 基础忍耐力加成: 52, 基础性斗力加成: 25, 基础忍耐力成算: 11, 暴击率加成: 10 },
  },

  // S级装备 - 男性魅力系
  {
    name: '魅惑帝王装',
    slot: '主装备',
    icon: 'fas fa-user-tie',
    price: 10400,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑帝王的装束',
    bonuses: { 魅力加成: 50, 基础性斗力加成: 26, 暴击率加成: 12 },
  },
  {
    name: '诱惑圣杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 11600,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '魅力',
    description: '至高诱惑的圣杖',
    bonuses: { 魅力加成: 47, 基础性斗力加成: 30, 暴击率加成: 10 },
  },
  {
    name: '魅惑之王冠',
    slot: '饰品',
    icon: 'fas fa-crown',
    price: 12500,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑之王的王冠',
    bonuses: { 魅力加成: 46, 基础性斗力加成: 22, 暴击率加成: 14 },
  },
  {
    name: '魅力圣石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 11100,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '魅力',
    description: '魅力的圣石',
    bonuses: { 魅力加成: 44, 幸运加成: 16, 暴击率加成: 12 },
  },
  {
    name: '魅惑圣袍',
    slot: '特殊装备',
    icon: 'fas fa-vest',
    price: 12800,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑众生的圣袍',
    bonuses: { 魅力加成: 48, 基础性斗力加成: 24, 闪避率加成: 14 },
  },

  // S级装备 - 男性幸运系
  {
    name: '幸运帝王装',
    slot: '主装备',
    icon: 'fas fa-chess-knight',
    price: 10300,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运帝王的装束',
    bonuses: { 幸运加成: 47, 闪避率加成: 21, 魅力加成: 18 },
  },
  {
    name: '命运主宰',
    slot: '副装备',
    icon: 'fas fa-dice',
    price: 11500,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '幸运',
    description: '主宰命运的神器',
    bonuses: { 幸运加成: 44, 暴击率加成: 19, 闪避率加成: 16 },
  },
  {
    name: '幸运圣章',
    slot: '饰品',
    icon: 'fas fa-clover',
    price: 11200,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运的圣章',
    bonuses: { 幸运加成: 42, 闪避率加成: 19, 暴击率加成: 12 },
  },
  {
    name: '命运圣符',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 10900,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '幸运',
    description: '命运的圣符',
    bonuses: { 幸运加成: 40, 闪避率加成: 17, 暴击率加成: 14 },
  },
  {
    name: '幸运圣袍',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 13100,
    category: 'equipment',
    grade: 'S',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运之风的圣袍',
    bonuses: { 幸运加成: 46, 闪避率加成: 23, 魅力加成: 16 },
  },

  // SS级装备 - 女性性斗力系
  {
    name: '魅魔女皇圣衣',
    slot: '主装备',
    icon: 'fas fa-sun',
    price: 30000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '性斗力',
    description: '魅魔女皇的至高圣衣',
    bonuses: { 基础性斗力加成: 70, 基础忍耐力加成: 60, 魅力加成: 50, 基础性斗力成算: 15, 基础忍耐力成算: 12 },
  },
  {
    name: '禁忌快感杖',
    slot: '副装备',
    icon: 'fas fa-wand-sparkles',
    price: 40000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '性斗力',
    description: '禁忌的快感魔杖',
    bonuses: { 基础性斗力加成: 85, 暴击率加成: 28, 基础性斗力成算: 18, 魅力加成: 35 },
  },
  {
    name: '终极欲望印记',
    slot: '饰品',
    icon: 'fas fa-fire-flame-curved',
    price: 32000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '性斗力',
    description: '终极欲望的烙印',
    bonuses: { 基础性斗力加成: 68, 基础性斗力成算: 16, 暴击率加成: 24 },
  },
  {
    name: '堕落神石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 31000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '性斗力',
    description: '堕落神力的结晶',
    bonuses: { 基础性斗力加成: 65, 暴击率加成: 26, 基础性斗力成算: 15 },
  },
  {
    name: '淫纹神链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 38000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '性斗力',
    description: '刻有神级淫纹的锁链',
    bonuses: { 基础性斗力加成: 75, 基础忍耐力加成: 50, 暴击率加成: 22, 基础性斗力成算: 14 },
  },

  // SS级装备 - 女性忍耐力系
  {
    name: '永恒圣衣',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 31000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永恒不灭的圣衣',
    bonuses: { 基础忍耐力加成: 75, 基础性斗力加成: 45, 闪避率加成: 25, 基础忍耐力成算: 15 },
  },
  {
    name: '守护神杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 35000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '忍耐力',
    description: '守护神力的圣杖',
    bonuses: { 基础忍耐力加成: 72, 基础忍耐力成算: 18, 闪避率加成: 22 },
  },
  {
    name: '不灭圣盾',
    slot: '特殊装备',
    icon: 'fas fa-shield-heart',
    price: 38000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永不破灭的圣盾',
    bonuses: { 基础忍耐力加成: 78, 基础性斗力加成: 40, 基础忍耐力成算: 19, 闪避率加成: 20 },
  },
  {
    name: '永恒之心',
    slot: '饰品',
    icon: 'fas fa-heart-pulse',
    price: 33000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永恒不灭之心',
    bonuses: { 基础忍耐力加成: 70, 基础忍耐力成算: 16, 闪避率加成: 18 },
  },
  {
    name: '不灭神符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 32000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '忍耐力',
    description: '永不熄灭的神符',
    bonuses: { 基础忍耐力加成: 68, 闪避率加成: 24, 基础忍耐力成算: 15 },
  },

  // SS级装备 - 女性魅力系
  {
    name: '魅魔神装',
    slot: '主装备',
    icon: 'fas fa-user-secret',
    price: 30500,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '魅力',
    description: '魅魔神级装束',
    bonuses: { 魅力加成: 75, 基础性斗力加成: 45, 暴击率加成: 20 },
  },
  {
    name: '诱惑神鞭',
    slot: '副装备',
    icon: 'fas fa-fire',
    price: 36000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '魅力',
    description: '神级诱惑之鞭',
    bonuses: { 魅力加成: 72, 基础性斗力加成: 50, 暴击率加成: 18 },
  },
  {
    name: '永恒欲望之环',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 35000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '魅力',
    description: '永不熄灭的欲望之环',
    bonuses: { 魅力加成: 70, 幸运加成: 30, 暴击率加成: 25 },
  },
  {
    name: '魅惑神石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 33500,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '魅力',
    description: '魅惑神力的宝石',
    bonuses: { 魅力加成: 68, 幸运加成: 28, 暴击率加成: 22 },
  },
  {
    name: '诱惑神带',
    slot: '特殊装备',
    icon: 'fas fa-ribbon',
    price: 39000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '魅力',
    description: '神级诱惑的圣带',
    bonuses: { 魅力加成: 73, 基础性斗力加成: 42, 闪避率加成: 24 },
  },

  // SS级装备 - 女性幸运系
  {
    name: '命运女神冠',
    slot: '主装备',
    icon: 'fas fa-clover',
    price: 30000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '幸运',
    description: '命运女神的神冠',
    bonuses: { 幸运加成: 72, 闪避率加成: 35, 魅力加成: 30 },
  },
  {
    name: '命运神杖',
    slot: '副装备',
    icon: 'fas fa-wand-sparkles',
    price: 34000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '幸运',
    description: '掌控命运的神杖',
    bonuses: { 幸运加成: 68, 暴击率加成: 30, 闪避率加成: 28 },
  },
  {
    name: '幸运神翼',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 40000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运之神的神翼',
    bonuses: { 幸运加成: 70, 闪避率加成: 38, 魅力加成: 28 },
  },
  {
    name: '命运神星',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 34500,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '幸运',
    description: '命运神星的碎片',
    bonuses: { 幸运加成: 66, 闪避率加成: 32, 暴击率加成: 22 },
  },
  {
    name: '幸运神环',
    slot: '饰品',
    icon: 'fas fa-ring',
    price: 33000,
    category: 'equipment',
    grade: 'SS',
    gender: '女',
    attrFocus: '幸运',
    description: '幸运的神环',
    bonuses: { 幸运加成: 64, 闪避率加成: 30, 暴击率加成: 24 },
  },

  // SS级装备 - 男性性斗力系
  {
    name: '至高征服者',
    slot: '主装备',
    icon: 'fas fa-dragon',
    price: 32000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '性斗力',
    description: '至高征服者的战甲',
    bonuses: { 基础性斗力加成: 72, 基础忍耐力加成: 62, 暴击率加成: 22, 基础性斗力成算: 15, 基础忍耐力成算: 12 },
  },
  {
    name: '支配神鞭',
    slot: '副装备',
    icon: 'fas fa-gavel',
    price: 37000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '性斗力',
    description: '绝对支配的神鞭',
    bonuses: { 基础性斗力加成: 87, 暴击率加成: 30, 基础性斗力成算: 18 },
  },
  {
    name: '力量神印',
    slot: '饰品',
    icon: 'fas fa-fire',
    price: 33500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '性斗力',
    description: '力量神力的圣印',
    bonuses: { 基础性斗力加成: 70, 基础性斗力成算: 16, 暴击率加成: 26 },
  },
  {
    name: '战神圣腕',
    slot: '饰品',
    icon: 'fas fa-hand-fist',
    price: 32500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '性斗力',
    description: '战神的圣腕',
    bonuses: { 基础性斗力加成: 68, 暴击率加成: 28, 基础性斗力成算: 15 },
  },
  {
    name: '支配神链',
    slot: '特殊装备',
    icon: 'fas fa-link',
    price: 39000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '性斗力',
    description: '支配一切的神链',
    bonuses: { 基础性斗力加成: 76, 基础忍耐力加成: 52, 暴击率加成: 24, 基础性斗力成算: 14 },
  },

  // SS级装备 - 男性忍耐力系
  {
    name: '不灭神铠',
    slot: '主装备',
    icon: 'fas fa-shield',
    price: 32500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '忍耐力',
    description: '永不破灭的神铠',
    bonuses: { 基础忍耐力加成: 78, 基础性斗力加成: 48, 闪避率加成: 26, 基础忍耐力成算: 15 },
  },
  {
    name: '守护神盾',
    slot: '副装备',
    icon: 'fas fa-shield-halved',
    price: 36500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '忍耐力',
    description: '至高守护的神盾',
    bonuses: { 基础忍耐力加成: 75, 基础忍耐力成算: 18, 闪避率加成: 24 },
  },
  {
    name: '坚韧神章',
    slot: '饰品',
    icon: 'fas fa-medal',
    price: 34000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '忍耐力',
    description: '坚韧神力的圣章',
    bonuses: { 基础忍耐力加成: 72, 基础忍耐力成算: 16, 闪避率加成: 20 },
  },
  {
    name: '守护神符',
    slot: '饰品',
    icon: 'fas fa-shield-heart',
    price: 33000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '忍耐力',
    description: '守护神力的圣符',
    bonuses: { 基础忍耐力加成: 70, 闪避率加成: 26, 基础忍耐力成算: 15 },
  },
  {
    name: '绝对服从项圈',
    slot: '特殊装备',
    icon: 'fas fa-crown',
    price: 45000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '忍耐力',
    description: '令对手绝对服从的神器',
    bonuses: { 基础忍耐力加成: 80, 基础性斗力加成: 45, 魅力加成: 40, 基础忍耐力成算: 19, 暴击率加成: 20 },
  },

  // SS级装备 - 男性魅力系
  {
    name: '魅惑神皇装',
    slot: '主装备',
    icon: 'fas fa-user-tie',
    price: 31500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑神皇的装束',
    bonuses: { 魅力加成: 78, 基础性斗力加成: 48, 暴击率加成: 20 },
  },
  {
    name: '诱惑神杖',
    slot: '副装备',
    icon: 'fas fa-wand-magic',
    price: 37500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '魅力',
    description: '至高诱惑的神杖',
    bonuses: { 魅力加成: 75, 基础性斗力加成: 52, 暴击率加成: 18 },
  },
  {
    name: '至尊魅力',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 36000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '魅力',
    description: '至高无上的魅力宝石',
    bonuses: { 魅力加成: 73, 基础性斗力加成: 35, 暴击率加成: 24 },
  },
  {
    name: '魅力神石',
    slot: '饰品',
    icon: 'fas fa-gem',
    price: 34500,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '魅力',
    description: '魅力神力的宝石',
    bonuses: { 魅力加成: 70, 幸运加成: 30, 暴击率加成: 22 },
  },
  {
    name: '魅惑神袍',
    slot: '特殊装备',
    icon: 'fas fa-vest',
    price: 40000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '魅力',
    description: '魅惑众生的神袍',
    bonuses: { 魅力加成: 76, 基础性斗力加成: 44, 闪避率加成: 24 },
  },

  // SS级装备 - 男性幸运系
  {
    name: '幸运神皇装',
    slot: '主装备',
    icon: 'fas fa-chess-knight',
    price: 31000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运神皇的装束',
    bonuses: { 幸运加成: 75, 闪避率加成: 36, 魅力加成: 30 },
  },
  {
    name: '命运终结者',
    slot: '副装备',
    icon: 'fas fa-bolt',
    price: 42000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '幸运',
    description: '终结一切的命运之力',
    bonuses: { 幸运加成: 70, 暴击率加成: 32, 闪避率加成: 30 },
  },
  {
    name: '幸运神章',
    slot: '饰品',
    icon: 'fas fa-clover',
    price: 35000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运神力的圣章',
    bonuses: { 幸运加成: 68, 闪避率加成: 34, 暴击率加成: 22 },
  },
  {
    name: '命运神符',
    slot: '饰品',
    icon: 'fas fa-star',
    price: 34000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '幸运',
    description: '命运神力的圣符',
    bonuses: { 幸运加成: 66, 闪避率加成: 32, 暴击率加成: 24 },
  },
  {
    name: '幸运神袍',
    slot: '特殊装备',
    icon: 'fas fa-wind',
    price: 41000,
    category: 'equipment',
    grade: 'SS',
    gender: '男',
    attrFocus: '幸运',
    description: '幸运之风的神袍',
    bonuses: { 幸运加成: 72, 闪避率加成: 40, 魅力加成: 28 },
  },
];

// 筛选后的装备列表
const filteredEquipments = computed(() => {
  return allEquipments.filter(item => {
    if (selectedGrade.value && item.grade !== selectedGrade.value) return false;
    if (selectedSlot.value && item.slot !== selectedSlot.value) return false;
    if (selectedGender.value && item.gender !== selectedGender.value) return false;
    if (selectedAttr.value && item.attrFocus !== selectedAttr.value) return false;
    return true;
  });
});

// 消耗品子分类
const consumableSubCategories = [
  {
    type: 'recovery',
    name: '恢复类用品',
    icon: 'fas fa-heart-pulse',
    items: [
      {
        id: 'con_r_1',
        name: '耐力药剂',
        icon: 'fas fa-flask',
        price: 200,
        category: 'consumable',
        combatOnly: true,
        effectText: '耐力+30',
        effect: { staminaRestore: 30 },
        description: '恢复30点耐力',
      },
      {
        id: 'con_r_2',
        name: '高级耐力药剂',
        icon: 'fas fa-flask-vial',
        price: 380,
        category: 'consumable',
        combatOnly: true,
        effectText: '耐力+60',
        effect: { staminaRestore: 60 },
        description: '恢复60点耐力',
      },
      {
        id: 'con_r_3',
        name: '冷静剂',
        icon: 'fas fa-snowflake',
        price: 300,
        category: 'consumable',
        combatOnly: true,
        effectText: '快感-25',
        effect: { pleasureReduce: 25 },
        description: '降低25点快感',
      },
      {
        id: 'con_r_4',
        name: '高级冷静剂',
        icon: 'fas fa-temperature-low',
        price: 550,
        category: 'consumable',
        combatOnly: true,
        effectText: '快感-50',
        effect: { pleasureReduce: 50 },
        description: '降低50点快感',
      },
      {
        id: 'con_r_5',
        name: '全恢复药剂',
        icon: 'fas fa-prescription-bottle-medical',
        price: 888,
        category: 'consumable',
        combatOnly: true,
        effectText: '耐力+100 快感-50',
        effect: { staminaRestore: 100, pleasureReduce: 50 },
        description: '恢复100耐力并降低50快感',
      },
      {
        id: 'con_s_1',
        name: '意志奇点',
        icon: 'fas fa-infinity',
        price: 2000,
        category: 'consumable',
        combatOnly: true,
        effectText: '清除自身所有状态并回复行动',
        effect: {},
        description: '立即清除自己身上的所有buff与debuff并在当前回合回复行动',
      },

      {
        id: 'con_neg_1',
        name: '中枢神经兴奋剂',
        icon: 'fas fa-vial',
        price: 100,
        category: 'consumable',
        combatOnly: true,
        effectText: '快感+80',
        effect: { pleasureReduce: -80 },
        description: '直接增加玩家80的快感',
      },
      {
        id: 'con_neg_2',
        name: '强力媚药',
        icon: 'fas fa-droplet',
        price: 100,
        category: 'consumable',
        combatOnly: true,
        effectText: '忍耐力成算-80 (3回合)',
        effect: { buff: { 基础忍耐力成算: -80 }, duration: 3 },
        description: '直接减少玩家80的忍耐力成算（持续3回合）',
      },
      {
        id: 'con_neg_3',
        name: '致幻剂',
        icon: 'fas fa-smog',
        price: 100,
        category: 'consumable',
        combatOnly: true,
        effectText: '全属性-90 (3回合)',
        effect: {
          buff: {
            魅力加成: -90,
            幸运加成: -90,
            基础性斗力成算: -90,
            基础忍耐力成算: -90,
            闪避率加成: -90,
            暴击率加成: -90,
          },
          duration: 3,
        },
        description: '直接减少玩家全属性90（持续3回合）',
      },
    ],
  },
  {
    type: 'temp_buff',
    name: '临时状态提升',
    icon: 'fas fa-arrow-trend-up',
    items: [
      {
        id: 'con_t_3',
        name: '魅惑香水',
        icon: 'fas fa-spray-can',
        price: 400,
        category: 'consumable',
        combatOnly: true,
        effectText: '魅力+20 (3回合)',
        effect: { buff: { 魅力加成: 20 }, duration: 3 },
        description: '临时提升20点魅力，持续3回合',
      },
      {
        id: 'con_t_4',
        name: '幸运符',
        icon: 'fas fa-clover',
        price: 300,
        category: 'consumable',
        combatOnly: true,
        effectText: '幸运+15 (3回合)',
        effect: { buff: { 幸运加成: 15 }, duration: 3 },
        description: '临时提升15点幸运，持续3回合',
      },
      {
        id: 'con_t_5',
        name: '疾风药剂',
        icon: 'fas fa-wind',
        price: 450,
        category: 'consumable',
        combatOnly: true,
        effectText: '闪避+10% (3回合)',
        effect: { buff: { 闪避率加成: 10 }, duration: 3 },
        description: '临时提升10%闪避率，持续3回合',
      },
      {
        id: 'con_t_6',
        name: '精准药剂',
        icon: 'fas fa-bullseye',
        price: 450,
        category: 'consumable',
        combatOnly: true,
        effectText: '暴击+12% (3回合)',
        effect: { buff: { 暴击率加成: 12 }, duration: 3 },
        description: '临时提升12%暴击率，持续3回合',
      },
      {
        id: 'con_t_7',
        name: '全能强化剂',
        icon: 'fas fa-bolt-lightning',
        price: 800,
        category: 'consumable',
        combatOnly: true,
        effectText: '魅力+8 幸运+8 (3回合)',
        effect: { buff: { 魅力加成: 8, 幸运加成: 8 }, duration: 3 },
        description: '临时提升魅力和幸运，持续3回合',
      },
    ],
  },
  {
    type: 'permanent',
    name: '永久提升用品（购买后自动使用）',
    icon: 'fas fa-infinity',
    items: [
      {
        id: 'con_p_3',
        name: '魅力精华',
        icon: 'fas fa-heart',
        price: 1500,
        category: 'consumable',
        combatOnly: false,
        effectText: '基础魅力+2',
        effect: { permanent: { $基础魅力: 2 } },
        description: '永久提升2点基础魅力',
      },
      {
        id: 'con_p_4',
        name: '幸运草精华',
        icon: 'fas fa-clover',
        price: 1500,
        category: 'consumable',
        combatOnly: false,
        effectText: '基础幸运+2',
        effect: { permanent: { $基础幸运: 2 } },
        description: '永久提升2点基础幸运',
      },
      {
        id: 'con_p_5',
        name: '潜力觉醒药',
        icon: 'fas fa-star',
        price: 8000,
        category: 'consumable',
        combatOnly: false,
        effectText: '潜力+0.1',
        effect: { permanent: { _潜力: 0.1 } },
        description: '永久提升0.1点潜力值（极其珍贵）',
      },
      {
        id: 'con_p_6',
        name: '高级潜力觉醒药',
        icon: 'fas fa-sun',
        price: 22000,
        category: 'consumable',
        combatOnly: false,
        effectText: '潜力+0.3',
        effect: { permanent: { _潜力: 0.3 } },
        description: '永久提升0.3点潜力值（传说级）',
      },
    ],
  },
  {
    type: 'special_battle',
    name: '特殊战斗道具',
    icon: 'fas fa-medal',
    items: [
      {
        id: 'con_s_medal_muxinlan',
        name: '刻有沐芯兰名字的三好学生荣誉勋章',
        icon: 'fas fa-medal',
        price: 99999999999999,
        category: 'consumable',
        combatOnly: true,
        effectText: '跳过沐芯兰第二阶段',
        effect: {},
        description: '仅在与沐芯兰的战斗中可用：第一阶段使用后，将在阶段转换时跳过第二阶段，直接进入第三阶段。',
      },
    ],
  },
];

const visibleConsumableSubCategories = computed(() => {
  if (isSpecialBattleUnlocked.value) return consumableSubCategories;
  return consumableSubCategories.filter(sc => sc.type !== 'special_battle');
});

// 选择物品
function selectItem(item: any) {
  selectedItem.value = item;
  purchaseQuantity.value = 1;
}

// 获取物品等级样式
function getItemGradeClass(item: any) {
  if (item.grade) return 'grade-' + item.grade.toLowerCase();
  if (item.tier) return 'tier-' + item.tier;
  return '';
}

// 购买物品
async function purchaseItem() {
  if (!selectedItem.value) return;

  try {
    const globalAny = window as any;
    if (!globalAny.Mvu) return;

    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData || !mvuData.stat_data) return;

    // 确保物品系统存在
    if (!mvuData.stat_data.物品系统) mvuData.stat_data.物品系统 = {};
    if (!mvuData.stat_data.物品系统.背包) mvuData.stat_data.物品系统.背包 = {};

    const item = selectedItem.value;
    let quantity = purchaseQuantity.value;

    // 永久提升类购买保护（潜力上限、禁购阈值、批量购买不浪费）
    if (
      item.category === 'consumable' &&
      item.effect?.permanent &&
      Object.prototype.hasOwnProperty.call(item.effect.permanent, '_潜力')
    ) {
      if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
      const currentPotentialRaw = mvuData.stat_data.核心状态._潜力 ?? 0;
      const currentPotential = Number(currentPotentialRaw) || 0;
      const delta = Number(item.effect.permanent._潜力) || 0;

      if (item.id === 'con_p_6' && currentPotential >= 9.8) {
        if (typeof toastr !== 'undefined') {
          toastr.warning('潜力已接近上限（>=9.8），无法购买高级潜力觉醒药', '购买限制');
        }
        return;
      }
      if (item.id === 'con_p_5' && currentPotential >= 10) {
        if (typeof toastr !== 'undefined') {
          toastr.warning('潜力已达上限（10），无法购买潜力觉醒药', '购买限制');
        }
        return;
      }

      const remaining = Math.max(0, 10 - currentPotential);
      const maxUsable = delta > 0 ? Math.floor((remaining + 1e-9) / delta) : 0;

      if (maxUsable <= 0) {
        if (typeof toastr !== 'undefined') {
          toastr.warning('潜力提升空间不足，本次购买不会产生收益', '购买限制');
        }
        return;
      }

      if (quantity > maxUsable) {
        quantity = maxUsable;
        if (typeof toastr !== 'undefined') {
          toastr.info(`潜力最高为10，已自动将购买数量调整为 ${quantity}`, '数量调整');
        }
      }
    }

    const discountedUnitPrice = getDiscountedPrice(item);
    const totalPrice = discountedUnitPrice * quantity;
    if (goldCoins.value < totalPrice) {
      if (typeof toastr !== 'undefined') {
        toastr.error('金币不足！', '购买失败');
      }
      return;
    }

    // 扣除金币（按折扣后价格扣费）
    mvuData.stat_data.物品系统.学园金币 = (mvuData.stat_data.物品系统.学园金币 || 0) - totalPrice;

    // 根据物品类型处理
    if (item.category === 'equipment') {
      // 装备类：添加到背包（使用name作为key）
      const itemKey = item.name;
      mvuData.stat_data.物品系统.背包[itemKey] = {
        类型: '装备',
        等级: item.grade,
        描述: item.description,
        加成属性: item.bonuses || {},
        部位: getSlotType(item.slot),
        数量: 1,
      };
    } else if (item.category === 'gift') {
      // 礼物类：添加到背包（使用name作为key）
      const itemKey = item.name;
      const existing = mvuData.stat_data.物品系统.背包[itemKey];
      if (existing) {
        existing.数量 = (existing.数量 || 0) + quantity;
      } else {
        mvuData.stat_data.物品系统.背包[itemKey] = {
          类型: '其他',
          等级: 'C',
          描述: item.description,
          数量: quantity,
        };
      }
    } else if (item.category === 'consumable') {
      // 消耗品类（使用name作为key）
      const itemKey = item.id === 'con_s_medal_muxinlan' ? 'honor_medal_muxinlan' : item.name;
      const existing = mvuData.stat_data.物品系统.背包[itemKey];

      if (existing) {
        existing.数量 = (existing.数量 || 0) + quantity;
      } else {
        const consumableData: any = {
          类型: '消耗品',
          等级: 'C',
          描述: item.id === 'con_s_medal_muxinlan' ? '刻有沐芯兰名字的三好学生荣誉勋章' : item.description,
          战斗用品: item.combatOnly || false,
          数量: quantity,
        };

        // 添加效果
        if (item.effect) {
          if (item.effect.staminaRestore) consumableData.耐力增加 = item.effect.staminaRestore;
          if (item.effect.pleasureReduce) consumableData.快感降低 = item.effect.pleasureReduce;
          if (item.effect.pleasureIncrease) consumableData.快感增加 = item.effect.pleasureIncrease;
          // 临时buff：存入背包的加成属性，在战斗中使用时才写入临时状态
          if (item.effect.buff) consumableData.加成属性 = item.effect.buff;

          if (item.effect.permanent) {
            // 永久提升类：直接应用效果
            if (!mvuData.stat_data.核心状态) mvuData.stat_data.核心状态 = {};
            for (const [key, value] of Object.entries(item.effect.permanent)) {
              if (key === '_潜力') {
                const currentPotentialRaw = mvuData.stat_data.核心状态._潜力 ?? 0;
                const currentPotential = Number(currentPotentialRaw) || 0;
                const nextPotential = Math.min(10, currentPotential + (Number(value) || 0) * quantity);
                mvuData.stat_data.核心状态._潜力 = nextPotential;
              } else {
                mvuData.stat_data.核心状态[key] = (mvuData.stat_data.核心状态[key] || 0) + (value as number) * quantity;
              }
            }
            // 永久提升不存入背包，直接生效
            await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

            if (typeof toastr !== 'undefined') {
              toastr.success(`永久属性提升成功！`, '购买成功');
            }
            selectedItem.value = null;
            return;
          }
        }

        mvuData.stat_data.物品系统.背包[itemKey] = consumableData;
      }
    }

    // 写回MVU
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });

    if (typeof toastr !== 'undefined') {
      toastr.success(`成功购买 ${item.name} x${quantity}`, '购买成功');
    }

    selectedItem.value = null;
  } catch (error) {
    console.error('[商店] 购买失败:', error);
    if (typeof toastr !== 'undefined') {
      toastr.error('购买失败，请重试', '错误');
    }
  }
}

// 获取装备槽位类型
function getSlotType(slot: string): '主装备' | '副装备' | '饰品' | '特殊装备' {
  const slotMap: Record<string, '主装备' | '副装备' | '饰品' | '特殊装备'> = {
    主装备: '主装备',
    副装备: '副装备',
    饰品: '饰品',
    特殊装备: '特殊装备',
  };
  return slotMap[slot] || '饰品';
}
</script>

<style scoped lang="scss">
.shop-page {
  position: relative;
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.shop-header {
  margin-bottom: 16px;
  position: relative;
}

.special-battle-unlock {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  opacity: 0.08;
  cursor: pointer;
  transition: opacity 0.2s;
}

.special-battle-unlock:hover {
  opacity: 0.2;
}

.gold-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.08));
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 16px;
  position: relative;
  backdrop-filter: blur(10px);

  > i {
    font-size: 28px;
    color: #fbbf24;
  }

  .gold-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .gold-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .gold-value {
    font-size: 26px;
    font-weight: 700;
    color: #fcd34d;
  }
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    height: 3px;
  }
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  i {
    font-size: 14px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  &.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: transparent;
    color: white;
  }
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 36px;
}

.filter-options {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.active {
    color: white;

    &.grade-c {
      background: rgba(156, 163, 175, 0.4);
      border-color: #9ca3af;
    }
    &.grade-b {
      background: rgba(96, 165, 250, 0.4);
      border-color: #60a5fa;
    }
    &.grade-a {
      background: rgba(167, 139, 250, 0.4);
      border-color: #a78bfa;
    }
    &.grade-s {
      background: rgba(251, 191, 36, 0.4);
      border-color: #fbbf24;
    }
    &.grade-ss {
      background: rgba(244, 114, 182, 0.4);
      border-color: #f472b6;
    }
  }

  &.slot-btn.active {
    background: rgba(102, 126, 234, 0.4);
    border-color: #667eea;
  }
}

.empty-filter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px;
  color: rgba(255, 255, 255, 0.4);

  i {
    font-size: 24px;
  }
  span {
    font-size: 13px;
  }
}

.shop-content {
  min-height: 200px;
}

.item-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-category {
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-grade {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 600;

  &.grade-c {
    background: rgba(156, 163, 175, 0.3);
    color: #d1d5db;
  }
  &.grade-b {
    background: rgba(96, 165, 250, 0.3);
    color: #93c5fd;
  }
  &.grade-a {
    background: rgba(167, 139, 250, 0.3);
    color: #c4b5fd;
  }
  &.grade-s {
    background: rgba(251, 191, 36, 0.3);
    color: #fcd34d;
  }
  &.grade-ss {
    background: rgba(244, 114, 182, 0.3);
    color: #f9a8d4;
  }
}

.sub-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 12px;

  i {
    font-size: 14px;
  }
}

.grade-badge,
.tier-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.grade-c .grade-badge {
  background: rgba(156, 163, 175, 0.3);
  color: #d1d5db;
}
.grade-b .grade-badge {
  background: rgba(96, 165, 250, 0.3);
  color: #93c5fd;
}
.grade-a .grade-badge {
  background: rgba(167, 139, 250, 0.3);
  color: #c4b5fd;
}
.grade-s .grade-badge {
  background: rgba(251, 191, 36, 0.3);
  color: #fcd34d;
}
.grade-ss .grade-badge {
  background: rgba(244, 114, 182, 0.3);
  color: #f9a8d4;
}

.tier-basic .tier-badge {
  background: rgba(156, 163, 175, 0.3);
  color: #d1d5db;
}
.tier-fine .tier-badge {
  background: rgba(96, 165, 250, 0.3);
  color: #93c5fd;
}
.tier-precious .tier-badge {
  background: rgba(167, 139, 250, 0.3);
  color: #c4b5fd;
}
.tier-special .tier-badge {
  background: rgba(251, 191, 36, 0.3);
  color: #fcd34d;
}

.item-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(4px);
  }

  &.grade-c {
    border-left: 3px solid #9ca3af;
  }
  &.grade-b {
    border-left: 3px solid #60a5fa;
  }
  &.grade-a {
    border-left: 3px solid #a78bfa;
  }
  &.grade-s {
    border-left: 3px solid #fbbf24;
  }
  &.grade-ss {
    border-left: 3px solid #f472b6;
  }

  &.tier-basic {
    border-left: 3px solid #9ca3af;
  }
  &.tier-fine {
    border-left: 3px solid #60a5fa;
  }
  &.tier-precious {
    border-left: 3px solid #a78bfa;
  }
  &.tier-special {
    border-left: 3px solid #fbbf24;
  }
}

.item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;

  i {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type,
.item-effect {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #fcd34d;

  i {
    font-size: 11px;
  }

  .original-price {
    text-decoration: line-through;
    opacity: 0.5;
    font-size: 11px;
    color: #9ca3af;
  }

  .discounted-price {
    color: #4ade80;
    font-weight: 700;
  }

  .discount-tag {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    font-size: 9px;
    padding: 2px 5px;
    border-radius: 4px;
    font-weight: 700;
    margin-left: 4px;
  }
}

.combat-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 9px;
  padding: 2px 6px;
  background: rgba(239, 68, 68, 0.3);
  color: #f87171;
  border-radius: 4px;
}

/* 购买弹窗 */
.purchase-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  width: 100%;
  max-width: 340px;
  background: linear-gradient(180deg, #1e1e2e, #151520);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
}

.modal-body {
  padding: 20px;
}

.selected-item-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
}

.preview-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;

  i {
    font-size: 22px;
    color: rgba(255, 255, 255, 0.8);
  }

  &.grade-c {
    border: 2px solid #9ca3af;
  }
  &.grade-b {
    border: 2px solid #60a5fa;
  }
  &.grade-a {
    border: 2px solid #a78bfa;
  }
  &.grade-s {
    border: 2px solid #fbbf24;
  }
  &.grade-ss {
    border: 2px solid #f472b6;
  }
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
}

.preview-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

.item-details {
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}

.detail-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
}

.bonus-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.bonus-name {
  color: rgba(255, 255, 255, 0.6);
}

.bonus-value {
  font-weight: 600;

  &.positive {
    color: #34d399;
  }
  &.negative {
    color: #f87171;
  }
}

.quantity-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
  }

  button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 16px;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
    }
  }

  .quantity {
    font-size: 18px;
    font-weight: 600;
    color: white;
    min-width: 40px;
    text-align: center;
  }
}

.price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 10px;

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  .total-price {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 20px;
    font-weight: 700;
    color: #fcd34d;

    i {
      font-size: 16px;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }
}

.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;

  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.consumable-title {
  color: #34d399;

  i {
    color: #34d399;
  }
}
</style>
