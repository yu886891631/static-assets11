/**
 * BOSS战斗系统
 *
 * 沐芯兰是一个三阶段BOSS：
 * 1. 代行机体·茉莉（伪装形态）- 50级，高闪避，嚣张雌小鬼
 * 2. 完全同步·祸星茉莉（暴力女王形态）- 88级，高攻击，压倒性力量
 * 3. 真身露出·沐芯兰（羸弱的傲娇女王）- 11级，极度虚弱
 */

import { reactive, ref } from 'vue';

// ==================== 类型定义 ====================
export interface BossState {
  isBossFight: boolean;
  bossId: string;
  currentPhase: 1 | 2 | 3;
  phaseTransitioning: boolean;
  dialogueIndex: number;
  buttonsDisabled: boolean;
  hasUsedMedal: boolean; // 是否使用了三好学生勋章
  // Eden专属状态（懒惰天赋）
  edenSleeping: boolean; // 是否处于沉睡状态
  edenCountdown: number; // 8回合倒计时
  edenAwakened: boolean; // 是否已被唤醒过（用于判断高潮次数调整）
  edenCritDebuffApplied: boolean; // 是否已应用暴击debuff
}

export interface BossDialogue {
  speaker: string;
  text: string;
  emotion?: 'arrogant' | 'angry' | 'weak' | 'tsundere';
}

// ==================== 沐芯兰对话库 ====================
export const MUXINLAN_DIALOGUES = {
  // 第一阶段入场
  phase1_entry: [
    { speaker: '茉莉(?)', text: '"哎呀呀~是哪位不自量力的垃圾呢？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"让我猜猜...又是一个想挑战女王大人的蠢货吧？"', emotion: 'arrogant' as const },
    {
      speaker: '茉莉(?)',
      text: '"好吧好吧~既然你这么想被玩弄，那我就勉为其难地陪你玩玩吧♡"',
      emotion: 'arrogant' as const,
    },
  ],

  // 第一阶段战斗中（随机）
  phase1_battle: [
    {
      speaker: '茉莉(?)',
      text: '"哎呀呀，小垃圾的攻击是开了自动避让模式吗？真是让人发笑呢~♡"',
      emotion: 'arrogant' as const,
    },
    {
      speaker: '茉莉(?)',
      text: '"就这？就这点程度？杂鱼就是杂鱼呢~多练几年再来挑战本小姐吧"',
      emotion: 'arrogant' as const,
    },
    { speaker: '茉莉(?)', text: '"再努力一点嘛~不然我都要睡着了呢~"', emotion: 'arrogant' as const },
    {
      speaker: '茉莉(?)',
      text: '"小东西你真的有在认真吗？还是说...这就是你的全力了？噗~"',
      emotion: 'arrogant' as const,
    },
    { speaker: '茉莉(?)', text: '"被我的丝线缠住了呢~接下来要怎么玩弄你好呢？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"哟~小可怜还在挣扎呢？真是可爱到让人想欺负呢♡"', emotion: 'arrogant' as const },
    {
      speaker: '茉莉(?)',
      text: '"要不要姐姐我稍微放点水呀？啊，不用了，反正你也赢不了~"',
      emotion: 'arrogant' as const,
    },
    {
      speaker: '茉莉(?)',
      text: '"看你这么努力的样子，本小姐都有点不忍心了呢~骗你的啦♡"',
      emotion: 'arrogant' as const,
    },
    { speaker: '茉莉(?)', text: '"杂鱼杂鱼~♡ 要不要我教教你怎么打架呀？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"哎呀，这么弱还敢来挑战我？是谁给你的勇气呢~"', emotion: 'arrogant' as const },
    {
      speaker: '茉莉(?)',
      text: '"哎呀呀~小垃圾的体力快不行了吗？要不要姐姐我帮你一把呀~♡"',
      emotion: 'arrogant' as const,
    },
    { speaker: '茉莉(?)', text: '"你的攻击...是在给我挠痒痒吗？噗~真是太好笑了呢~"', emotion: 'arrogant' as const },
    {
      speaker: '茉莉(?)',
      text: '"要不要我让你一只手呀？啊，不行不行，那样太欺负你了呢~♡"',
      emotion: 'arrogant' as const,
    },
    {
      speaker: '茉莉(?)',
      text: '"小可怜~♡ 看你这么努力的样子，我都快要感动了呢~骗你的啦！"',
      emotion: 'arrogant' as const,
    },
  ],

  // 第一阶段锁血时
  phase1_lockHp: [
    { speaker: '茉莉(?)', text: '"呜...！（身体微微颤抖）"', emotion: 'angry' as const },
    { speaker: '茉莉(?)', text: '"哼...没想到你还有两下子嘛..."', emotion: 'angry' as const },
    { speaker: '茉莉(?)', text: '"不过...这种程度就想让我认输？"', emotion: 'angry' as const },
  ],

  // 第一阶段到第二阶段转换
  phase1_to_2: [
    { speaker: '祸星茉莉', text: '"那么...就让你见识一下真正的力量吧。"', emotion: 'angry' as const },
    {
      speaker: '꧁༺茉莉༻꧂',
      text: '"利息已经滚到你付不起的程度了。现在，把你的胜算全部清零吧。"',
      emotion: 'angry' as const,
    },
  ],

  // 第二阶段战斗中（随机）
  phase2_battle: [
    { speaker: '꧁༺茉莉༻꧂', text: '"感受到了吗？这就是被完全支配的感觉。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的意识...现在归我所有了。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"让我...将你撕碎吧！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"在女王面前...跪下吧，杂鱼。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"这就是与女王为敌的下场。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"挣扎吧，反抗吧...然后绝望吧。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的抵抗...只会让我更加兴奋！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"碾碎你...是我此刻唯一的念头。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"我的茉莉...会让你体验真正的恐惧！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的灵魂...将成为我的收藏品。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"反抗？可笑...你已经是我的玩偶了。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的意志...在我面前一文不值！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"这就是反抗女王的代价！好好享受吧！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"你的绝望...是我最美妙的食粮！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"跪下！然后向我忏悔你的愚蠢！"', emotion: 'angry' as const },
  ],

  // 第二阶段锁血时
  phase2_lockHp: [
    { speaker: '꧁༺茉莉༻꧂', text: '"不...不可能...！"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"我的茉莉...竟然...！"', emotion: 'angry' as const },
  ],

  // 第二阶段到第三阶段转换
  phase2_to_3: [
    { speaker: '꧁༺茉莉༻꧂', text: '"不...不要...！（茉莉跪倒在地，不再行动）"', emotion: 'weak' as const },
    { speaker: '系统', text: '【"茉莉"已被击败，意识强制弹回本体】', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"咳...咳咳...（瘫坐在地，浑身颤抖）"', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"茉莉...竟然被你这种杂鱼...（咬牙）"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"...杂鱼！维修费要从你的校园金币里扣！"', emotion: 'tsundere' as const },
  ],

  // 第三阶段战斗中（顺序播放，有连续性）
  phase3_battle: [
    { speaker: '沐芯兰（真身）', text: '"别、别过来！我警告你...（声音颤抖）"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"看什么看！没见过真正的女王吗？"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"扶、扶我一下...这是命令！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"...你还在等什么？快点啊笨蛋！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（小声）...为什么不直接结束呢..."', emotion: 'weak' as const },
  ],

  // 使用三好学生勋章时（跳过第二阶段）
  medal_trigger: [
    { speaker: '茉莉(?)', text: '"那、那个是...！"', emotion: 'weak' as const },
    { speaker: '茉莉(?)', text: '"为什么你会有那个东西...！"', emotion: 'weak' as const },
    { speaker: '???', text: '"（茉莉突然停止动作）"', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"...你是从哪里得到那个勋章的？"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（声音颤抖）那是...那是我以前..."', emotion: 'weak' as const },
    { speaker: '沐芯兰（真身）', text: '"...既...既然你有那个东西..."', emotion: 'tsundere' as const },
  ],

  // 免疫束缚时的嘲笑（第一阶段）
  bind_immune_phase1: [
    { speaker: '茉莉(?)', text: '"哎呀呀~想用丝线束缚本小姐？你是不是搞错了什么？"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"束缚？噗~这种小把戏对我可没用哦~♡"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"就凭这点程度就想困住我？真是天真的小垃圾呢~"', emotion: 'arrogant' as const },
    { speaker: '茉莉(?)', text: '"我可是操纵丝线的专家，你这是班门弄斧呢~"', emotion: 'arrogant' as const },
  ],

  // 免疫束缚时的嘲笑（第二阶段）
  bind_immune_phase2: [
    { speaker: '꧁༺茉莉༻꧂', text: '"束缚？你在开玩笑吗？"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"想困住女王？你配吗？"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"这种低级手段...简直是侮辱。"', emotion: 'angry' as const },
    { speaker: '꧁༺茉莉༻꧂', text: '"我的技术可不是你这种杂鱼能理解的。"', emotion: 'angry' as const },
  ],

  // 免疫束缚时的嘲笑（第三阶段）
  bind_immune_phase3: [
    { speaker: '沐芯兰（真身）', text: '"哼...别、别想用这种手段...（轻松挣脱）"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"就算是真身...我也不会被这种东西困住的！"', emotion: 'tsundere' as const },
    { speaker: '沐芯兰（真身）', text: '"（小声）...虽然很虚弱，但束缚还是免疫的..."', emotion: 'weak' as const },
  ],
};

// ==================== BOSS状态管理 ====================
export const bossState = reactive<BossState>({
  isBossFight: false,
  bossId: '',
  currentPhase: 1,
  phaseTransitioning: false,
  dialogueIndex: 0,
  buttonsDisabled: false,
  hasUsedMedal: false,
  // Eden专属状态
  edenSleeping: false,
  edenCountdown: 8,
  edenAwakened: false,
  edenCritDebuffApplied: false,
});

// 当前显示的对话
export const currentDialogue = ref<BossDialogue | null>(null);
export const dialogueQueue = ref<BossDialogue[]>([]);
export const isShowingDialogue = ref(false);

// 对话自动播放定时器
let dialogueAutoPlayTimer: number | null = null;
const DIALOGUE_DISPLAY_DURATION = 2500; // 每句对话显示2.5秒

// ==================== BOSS检测函数 ====================
/**
 * 检测是否是沐芯兰BOSS战
 */
export function isMuxinlanBoss(enemyName: string): boolean {
  if (!enemyName) return false;
  const name = enemyName.toLowerCase();
  return name.includes('茉莉') || name.includes('沐芯兰') || name.includes('muxinlan');
}

/**
 * 初始化沐芯兰BOSS战
 */
export function initMuxinlanBoss(): void {
  bossState.isBossFight = true;
  bossState.bossId = 'muxinlan';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;

  // 播放入场对话
  queueDialogues(MUXINLAN_DIALOGUES.phase1_entry);
}

/**
 * 重置BOSS状态
 */
export function resetBossState(): void {
  bossState.isBossFight = false;
  bossState.bossId = '';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;
  // Eden专属状态重置
  bossState.edenSleeping = false;
  bossState.edenCountdown = 8;
  bossState.edenAwakened = false;
  bossState.edenCritDebuffApplied = false;
  currentDialogue.value = null;
  dialogueQueue.value = [];
  isShowingDialogue.value = false;
}

// ==================== 对话系统 ====================
/**
 * 清空对话队列并停止自动播放
 */
export function clearDialogueQueue(): void {
  if (dialogueAutoPlayTimer !== null) {
    window.clearTimeout(dialogueAutoPlayTimer);
    dialogueAutoPlayTimer = null;
  }
  dialogueQueue.value = [];
  isShowingDialogue.value = false;
  currentDialogue.value = null;
}

/**
 * 将对话加入队列（可选择是否打断当前对话）
 * @param dialogues 对话数组
 * @param interrupt 是否打断当前对话（默认true，清空队列后显示新对话）
 */
export function queueDialogues(dialogues: BossDialogue[], interrupt: boolean = true): void {
  if (interrupt) {
    // 打断模式：清空队列，立即显示新对话
    clearDialogueQueue();
  }

  dialogueQueue.value.push(...dialogues);

  if (!isShowingDialogue.value) {
    showNextDialogue();
  }
}

/**
 * 显示下一条对话（并启动自动播放定时器）
 */
export function showNextDialogue(): void {
  // 清除之前的定时器
  if (dialogueAutoPlayTimer !== null) {
    window.clearTimeout(dialogueAutoPlayTimer);
    dialogueAutoPlayTimer = null;
  }

  if (dialogueQueue.value.length === 0) {
    isShowingDialogue.value = false;
    currentDialogue.value = null;
    return;
  }

  isShowingDialogue.value = true;
  currentDialogue.value = dialogueQueue.value.shift() || null;

  // 启动自动播放定时器：3秒后自动显示下一条
  dialogueAutoPlayTimer = window.setTimeout(() => {
    showNextDialogue();
  }, DIALOGUE_DISPLAY_DURATION);
}

/**
 * 跳过当前对话（立即显示下一条）
 */
export function skipDialogue(): void {
  showNextDialogue();
}

/**
 * 获取指定阶段的对话数组
 * @param phase 当前阶段
 * @param type 对话类型：'lockHp' 锁血对话, 'transition' 转阶段对话, 'entry' 入场对话, 'battle' 战斗对话
 */
export function getPhaseDialogues(
  phase: 1 | 2 | 3,
  type: 'lockHp' | 'transition' | 'entry' | 'battle',
): BossDialogue[] | null {
  switch (type) {
    case 'lockHp':
      if (phase === 1) return MUXINLAN_DIALOGUES.phase1_lockHp;
      if (phase === 2) return MUXINLAN_DIALOGUES.phase2_lockHp;
      return null;
    case 'transition':
      if (phase === 1) return MUXINLAN_DIALOGUES.phase1_to_2;
      if (phase === 2) return MUXINLAN_DIALOGUES.phase2_to_3;
      return null;
    case 'entry':
      if (phase === 1) return MUXINLAN_DIALOGUES.phase1_entry;
      return null;
    case 'battle':
      if (phase === 1) return MUXINLAN_DIALOGUES.phase1_battle;
      if (phase === 2) return MUXINLAN_DIALOGUES.phase2_battle;
      if (phase === 3) return MUXINLAN_DIALOGUES.phase3_battle;
      return null;
    default:
      return null;
  }
}

/**
 * 获取随机锁血对话
 */
export function getLockHpDialogue(phase: 1 | 2 | 3): BossDialogue | null {
  let dialogues: BossDialogue[];

  switch (phase) {
    case 1:
      dialogues = MUXINLAN_DIALOGUES.phase1_lockHp;
      break;
    case 2:
      dialogues = MUXINLAN_DIALOGUES.phase2_lockHp;
      break;
    case 3:
      // 第三阶段没有锁血对话
      return null;
    default:
      return null;
  }

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 获取随机束缚免疫嘲笑对话
 */
export function getBindImmuneDialogue(phase: 1 | 2 | 3): BossDialogue | null {
  let dialogues: BossDialogue[];

  switch (phase) {
    case 1:
      dialogues = MUXINLAN_DIALOGUES.bind_immune_phase1;
      break;
    case 2:
      dialogues = MUXINLAN_DIALOGUES.bind_immune_phase2;
      break;
    case 3:
      dialogues = MUXINLAN_DIALOGUES.bind_immune_phase3;
      break;
    default:
      return null;
  }

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 获取随机战斗对话
 */
export function getRandomBattleDialogue(phase: 1 | 2 | 3): BossDialogue | null {
  let dialogues: BossDialogue[];

  switch (phase) {
    case 1:
      dialogues = MUXINLAN_DIALOGUES.phase1_battle;
      break;
    case 2:
      dialogues = MUXINLAN_DIALOGUES.phase2_battle;
      break;
    case 3:
      // 第三阶段使用顺序对话
      const idx = bossState.dialogueIndex;
      if (idx < MUXINLAN_DIALOGUES.phase3_battle.length) {
        bossState.dialogueIndex++;
        return MUXINLAN_DIALOGUES.phase3_battle[idx];
      }
      // 循环最后几条
      return MUXINLAN_DIALOGUES.phase3_battle[MUXINLAN_DIALOGUES.phase3_battle.length - 1];
    default:
      return null;
  }

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// ==================== 阶段切换 ====================
/**
 * 获取当前阶段的敌人数据键名
 */
export function getMuxinlanDataKey(phase: 1 | 2 | 3): string {
  return `沐芯兰_${phase}`;
}

/**
 * 获取当前阶段的显示名称
 */
export function getMuxinlanDisplayName(phase: 1 | 2 | 3): string {
  switch (phase) {
    case 1:
      return '茉莉(?)';
    case 2:
      return '꧁༺茉莉༻꧂';
    case 3:
      return '沐芯兰（真身）';
    default:
      return '茉莉';
  }
}

/**
 * 获取当前阶段的立绘
 */
export function getMuxinlanAvatarUrl(phase: 1 | 2 | 3): string {
  return `https://raw.githubusercontent.com/vincentrong2005/Fatria/main/图片素材/性斗学园/立绘/沐芯兰_${phase}.png`;
}

/**
 * 检查是否应该锁血（阻止高潮）
 */
export function shouldLockPleasure(
  currentPleasure: number,
  maxPleasure: number,
  currentClimaxCount: number,
  phase: 1 | 2 | 3,
): boolean {
  if (!bossState.isBossFight || bossState.bossId !== 'muxinlan') {
    return false;
  }

  // 第一阶段：快感达到最大快感-1时锁血
  if (phase === 1 && currentPleasure >= maxPleasure - 1) {
    return true;
  }

  // 第二阶段：高潮次数达到4次且快感即将满时锁血
  if (phase === 2 && currentClimaxCount >= 4 && currentPleasure >= maxPleasure - 1) {
    return true;
  }

  return false;
}

/**
 * 检查是否应该触发阶段转换
 */
export function shouldTransitionPhase(
  currentPleasure: number,
  maxPleasure: number,
  currentClimaxCount: number,
  phase: 1 | 2 | 3,
): { shouldTransition: boolean; nextPhase: 1 | 2 | 3 } {
  if (!bossState.isBossFight || bossState.bossId !== 'muxinlan') {
    return { shouldTransition: false, nextPhase: phase };
  }

  // 获取当前阶段的高潮次数上限
  const climaxLimit = BOSS_CONFIG.muxinlan.climaxLimits[phase - 1];

  // 第一阶段：快感达到最大值时，转换到第二阶段
  if (phase === 1 && currentPleasure >= maxPleasure) {
    // 如果使用了勋章，跳过第二阶段直接到第三阶段
    if (bossState.hasUsedMedal) {
      return { shouldTransition: true, nextPhase: 3 };
    }
    return { shouldTransition: true, nextPhase: 2 };
  }

  // 第二阶段：高潮次数达到上限-1且快感达到最大值时，转换到第三阶段
  // 例如：climaxLimit=3时，高潮2次后快感满就转换
  if (phase === 2 && currentClimaxCount >= climaxLimit - 1 && currentPleasure >= maxPleasure) {
    return { shouldTransition: true, nextPhase: 3 };
  }

  return { shouldTransition: false, nextPhase: phase };
}

/**
 * 执行阶段转换
 * 注意：转换对话已在app.vue的handleBossPhaseTransition中统一处理，这里不再重复播放
 */
export function executePhaseTransition(nextPhase: 1 | 2 | 3): void {
  bossState.phaseTransitioning = true;

  // 转换对话已在app.vue中播放，这里只处理状态更新
  // 更新阶段
  bossState.currentPhase = nextPhase;
  bossState.dialogueIndex = 0; // 重置第三阶段对话索引

  // 第二阶段禁用按钮
  if (nextPhase === 2) {
    bossState.buttonsDisabled = true;
  }

  // 第三阶段解除按钮禁用
  if (nextPhase === 3) {
    bossState.buttonsDisabled = false;
  }
}

/**
 * 完成阶段转换
 */
export function completePhaseTransition(): void {
  bossState.phaseTransitioning = false;
}

// ==================== 特殊道具检测 ====================
/**
 * 检查是否拥有三好学生勋章
 */
export function hasHonorMedal(items: any[]): boolean {
  if (!items || !Array.isArray(items)) return false;
  return items.some(
    item =>
      item &&
      (item.name?.includes('三好学生') ||
        item.name?.includes('荣誉勋章') ||
        item.name?.includes('沐芯兰') ||
        item.id === 'honor_medal_muxinlan'),
  );
}

/**
 * 使用三好学生勋章
 */
export function useHonorMedal(): boolean {
  if (bossState.currentPhase !== 1) {
    return false; // 只能在第一阶段使用
  }

  bossState.hasUsedMedal = true;
  queueDialogues(MUXINLAN_DIALOGUES.medal_trigger);
  return true;
}

// ==================== 克莉丝汀 BOSS 对话库 ====================
export const CHRISTINE_DIALOGUES = {
  // 第一阶段入场（表人格/弱气）
  phase1_entry: [
    { speaker: '克莉丝汀(?)', text: '"那个...这、这位同学...请不要这样盯着我看..."', emotion: 'weak' as const },
    { speaker: '克莉丝汀(?)', text: '"性、性斗什么的...我真的不擅长...能不能放过我...?"', emotion: 'weak' as const },
  ],

  // 第一阶段战斗中（随机）
  phase1_battle: [
    { speaker: '克莉丝汀(?)', text: '"对、对不起!我不是故意挡路的...请不要打我..."', emotion: 'weak' as const },
    {
      speaker: '克莉丝汀(?)',
      text: '"呜呜...文件撒了一地...如果不快点收拾好,会被会长骂的..."',
      emotion: 'weak' as const,
    },
    { speaker: '克莉丝汀(?)', text: '"请、请不要这样...我真的很害怕..."', emotion: 'weak' as const },
    { speaker: '克莉丝汀(?)', text: '"能不能...温柔一点..."', emotion: 'weak' as const },
  ],

  // 第一阶段锁血时
  phase1_lockHp: [
    { speaker: '克莉丝汀(?)', text: '"呜...！（身体微微颤抖）"', emotion: 'weak' as const },
    { speaker: '克莉丝汀(?)', text: '"不...不要再欺负我了..."', emotion: 'weak' as const },
  ],

  // 第一阶段到第二阶段转换（人格切换）
  phase1_to_2: [
    { speaker: '克莉丝汀(?)', text: '"......"', emotion: 'weak' as const },
    { speaker: '???', text: '"（眼神突然变得冰冷锐利）"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"...呵。"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"刚才不是很嚣张吗? 怎么现在像条死狗一样趴在地上?"', emotion: 'angry' as const },
    {
      speaker: '꧁༺克莉丝汀༻꧂',
      text: '"既然你这么喜欢欺负弱小...那就让你体验一下被绝对力量碾碎的感觉。"',
      emotion: 'angry' as const,
    },
  ],

  // 第二阶段战斗中（随机）
  phase2_battle: [
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"闭嘴,垃圾。我允许你射了吗?"', emotion: 'angry' as const },
    {
      speaker: '꧁༺克莉丝汀༻꧂',
      text: '"这双丝袜的味道如何? 是不是比你那贫瘠的人生还要丰富?"',
      emotion: 'angry' as const,
    },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"给我想着我的脚去死吧。"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"木马,最大功率。"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"跪下！然后向我忏悔你的愚蠢！"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"挣扎吧...反抗吧...然后绝望吧。"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"不榨干最后一滴精液...我是不会停止的。"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"这就是欺负弱小的代价。好好享受吧。"', emotion: 'angry' as const },
  ],

  // 战后（恢复/慌乱）- 战斗结束后触发
  post_battle: [
    { speaker: '克莉丝汀', text: '"啊!!! 对、对不起!! 我、我又失控了...呜呜呜..."', emotion: 'tsundere' as const },
    {
      speaker: '克莉丝汀',
      text: '"同、同学你没事吧?! 流了好多白色的东西...我、我这就帮你擦干净!"',
      emotion: 'tsundere' as const,
    },
    { speaker: '克莉丝汀', text: '"请、请不要讨厌克莉丝汀...我真的不是故意的..."', emotion: 'weak' as const },
  ],

  // 免疫束缚时的嘲笑（第一阶段）
  bind_immune_phase1: [
    { speaker: '克莉丝汀(?)', text: '"呜...虽、虽然很害怕，但是这种程度的束缚..."', emotion: 'weak' as const },
  ],

  // 免疫束缚时的嘲笑（第二阶段）
  bind_immune_phase2: [
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"想困住女王？你配吗？"', emotion: 'angry' as const },
    { speaker: '꧁༺克莉丝汀༻꧂', text: '"这种低级手段...简直是侮辱。"', emotion: 'angry' as const },
  ],
};

// ==================== 克莉丝汀 BOSS 检测函数 ====================
/**
 * 检测是否是克莉丝汀BOSS战
 */
export function isChristineBoss(enemyName: string): boolean {
  if (!enemyName) return false;
  const name = enemyName.toLowerCase();
  return name.includes('克莉丝汀') || name.includes('christine') || name.includes('书记');
}

/**
 * 初始化克莉丝汀BOSS战
 */
export function initChristineBoss(): void {
  bossState.isBossFight = true;
  bossState.bossId = 'christine';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;

  // 播放入场对话
  queueDialogues(CHRISTINE_DIALOGUES.phase1_entry);
}

/**
 * 获取克莉丝汀当前阶段的敌人数据键名
 */
export function getChristineDataKey(phase: 1 | 2): string {
  return `克莉丝汀_${phase}`;
}

/**
 * 获取克莉丝汀当前阶段的显示名称
 */
export function getChristineDisplayName(phase: 1 | 2): string {
  switch (phase) {
    case 1:
      return '克莉丝汀(?)';
    case 2:
      return '꧁༺克莉丝汀༻꧂';
    default:
      return '克莉丝汀';
  }
}

/**
 * 获取克莉丝汀当前阶段的立绘
 */
export function getChristineAvatarUrl(phase: 1 | 2): string {
  // 克莉丝汀分阶段立绘：克莉丝汀_1、克莉丝汀_2
  return `https://raw.githubusercontent.com/vincentrong2005/Fatria/main/图片素材/性斗学园/立绘/克莉丝汀_${phase}.png`;
}

/**
 * 获取克莉丝汀随机战斗对话
 */
export function getChristineRandomBattleDialogue(phase: 1 | 2): BossDialogue | null {
  let dialogues: BossDialogue[];

  switch (phase) {
    case 1:
      dialogues = CHRISTINE_DIALOGUES.phase1_battle;
      break;
    case 2:
      dialogues = CHRISTINE_DIALOGUES.phase2_battle;
      break;
    default:
      return null;
  }

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 获取克莉丝汀锁血对话
 */
export function getChristineLockHpDialogue(phase: 1 | 2): BossDialogue | null {
  if (phase === 1) {
    const dialogues = CHRISTINE_DIALOGUES.phase1_lockHp;
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }
  return null; // 第二阶段没有锁血
}

/**
 * 获取克莉丝汀束缚免疫对话
 */
export function getChristineBindImmuneDialogue(phase: 1 | 2): BossDialogue | null {
  let dialogues: BossDialogue[];

  switch (phase) {
    case 1:
      dialogues = CHRISTINE_DIALOGUES.bind_immune_phase1;
      break;
    case 2:
      dialogues = CHRISTINE_DIALOGUES.bind_immune_phase2;
      break;
    default:
      return null;
  }

  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 检查克莉丝汀是否应该锁血
 */
export function shouldChristineLockPleasure(currentPleasure: number, maxPleasure: number, phase: 1 | 2): boolean {
  if (!bossState.isBossFight || bossState.bossId !== 'christine') {
    return false;
  }

  // 第一阶段：快感达到最大快感-1时锁血
  if (phase === 1 && currentPleasure >= maxPleasure - 1) {
    return true;
  }

  return false;
}

/**
 * 检查克莉丝汀是否应该触发阶段转换
 */
export function shouldChristineTransitionPhase(
  currentPleasure: number,
  maxPleasure: number,
  _currentClimaxCount: number,
  phase: 1 | 2,
): { shouldTransition: boolean; nextPhase: 1 | 2 } {
  if (!bossState.isBossFight || bossState.bossId !== 'christine') {
    return { shouldTransition: false, nextPhase: phase };
  }

  // 第一阶段：快感达到最大值时，转换到第二阶段
  if (phase === 1 && currentPleasure >= maxPleasure) {
    return { shouldTransition: true, nextPhase: 2 };
  }

  return { shouldTransition: false, nextPhase: phase };
}

// ==================== 导出BOSS系统配置 ====================
export const BOSS_CONFIG = {
  muxinlan: {
    id: 'muxinlan',
    phases: 3,
    dataKeys: ['沐芯兰_1', '沐芯兰_2', '沐芯兰_3'],
    displayNames: ['茉莉(?)', '꧁༺茉莉༻꧂', '沐芯兰（真身）'],
    levels: [50, 88, 11],
    climaxLimits: [1, 3, 1], // 各阶段的高潮次数上限（胜负规则.高潮次数上限）
    specialItem: '刻有沐芯兰名字的三好学生荣誉勋章',
  },
  christine: {
    id: 'christine',
    phases: 2,
    dataKeys: ['克莉丝汀_1', '克莉丝汀_2'],
    displayNames: ['克莉丝汀(?)', '꧁༺克莉丝汀༻꧂'],
    levels: [55, 88],
    climaxLimits: [1, 3], // 第一阶段高潮1次转阶段，第二阶段高潮3次结束
  },
  eden: {
    id: 'eden',
    phases: 1, // 只有一个阶段
    dataKeys: ['伊甸芙宁'],
    displayNames: ['伊甸芙宁'],
    levels: [99],
    climaxLimits: [1], // 初始为1，苏醒后可能变为3
    sinType: 'sloth' as const, // 七宗罪类型：懒惰
    gameOverSkillId: '伊甸芙宁_16', // Game Over技能ID
  },
};

// ==================== 伊甸芙宁 BOSS 对话库 ====================
export const EDEN_DIALOGUES = {
  // 入场对话
  entry: [
    { speaker: '伊甸芙宁', text: '"锵锵! 芙宁登场，全体目光向我看齐!"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"喂，杂鱼。你玩《Genshin Impact》吗?"', emotion: 'arrogant' as const },
  ],

  // 沉睡状态对话（开局进入沉睡）
  sleeping_start: [
    { speaker: '伊甸芙宁', text: '"哈~好困喵...算了，先睡一会儿吧~"', emotion: 'weak' as const },
    { speaker: '伊甸芙宁', text: '"杂鱼你自己玩，别吵醒人家..."', emotion: 'weak' as const },
    { speaker: '系统', text: '【懒惰天赋】伊甸芙宁陷入了沉睡...水之结界包裹着她', emotion: 'weak' as const },
  ],

  // 沉睡中被攻击的反应
  sleeping_attacked: [
    { speaker: '伊甸芙宁', text: '"嗯...（翻了个身）...五分钟后再来..."', emotion: 'weak' as const },
    { speaker: '伊甸芙宁', text: '"别闹...人家还没抽到芙宁娜呢..."', emotion: 'weak' as const },
    { speaker: '伊甸芙宁', text: '"呼呼...（睡得很香的样子）"', emotion: 'weak' as const },
  ],

  // 沉睡期间快感达到上限被唤醒
  awakening_pleasure: [
    { speaker: '伊甸芙宁', text: '"...！（猛然睁眼）"', emotion: 'angry' as const },
    { speaker: '伊甸芙宁', text: '"谁?!谁敢趁我睡觉偷袭?!"', emotion: 'angry' as const },
    { speaker: '伊甸芙宁', text: '"杂鱼...你可真有胆量啊...让我好好教训你！"', emotion: 'angry' as const },
  ],

  // 倒计时归零使用Game Over
  countdown_zero: [
    { speaker: '伊甸芙宁', text: '"好无聊啊...这样下去要睡过头了..."', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"时间到了哦~ 杂鱼连这点小游戏都赢不了呢~"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"好了好了，让芙宁大人亲自来终结这无聊的对局吧！"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"啪！Game Over~ 别浪费人家时间了！"', emotion: 'arrogant' as const },
  ],

  // 苏醒后战斗中对话
  battle: [
    {
      speaker: '伊甸芙宁',
      text: '"杂鱼~ 杂鱼~❤️ 不会吧不会吧? 不会真的有人连我召唤的一只史莱姆都打不过吧?"',
      emotion: 'arrogant' as const,
    },
    { speaker: '伊甸芙宁', text: '"好弱哎~ 这是什么杂鱼? 我都快睡着了~"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"麻烦快点投降好吗? 我还要回去抽卡呢!"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"芙宁大人的脚好香吧? 承认吧杂鱼~❤️"', emotion: 'arrogant' as const },
    {
      speaker: '伊甸芙宁',
      text: '"起舞吧~ 哒、哒、哒~ 你的叫声比音游的打击音效难听多了。"',
      emotion: 'arrogant' as const,
    },
    { speaker: '伊甸芙宁', text: '"这身装备太丑了，辣眼睛。变！给你换套更适合的~"', emotion: 'arrogant' as const },
  ],

  // 被暴击时的反应
  crit_reaction: [
    { speaker: '伊甸芙宁', text: '"啊?! 你竟然敢打人家?!"', emotion: 'angry' as const },
    {
      speaker: '伊甸芙宁',
      text: '"你知不知道我老妈是谁? 信不信我号召全校集火把你号封了?!"',
      emotion: 'angry' as const,
    },
    { speaker: '伊甸芙宁', text: '"好痛...（揉了揉被打的地方）...算你走运！"', emotion: 'tsundere' as const },
  ],

  // 束缚免疫对话
  bind_immune: [
    { speaker: '伊甸芙宁', text: '"想束缚人家? 你是不是搞错了什么? 我可是GM权限哦~"', emotion: 'arrogant' as const },
  ],

  // 战胜玩家后
  victory: [
    { speaker: '伊甸芙宁', text: '"游戏结束~ 杂鱼果然是杂鱼呢~"', emotion: 'arrogant' as const },
    { speaker: '伊甸芙宁', text: '"算了算了，看在你这么配合的份上，赏你点金币吧~"', emotion: 'arrogant' as const },
  ],

  // 战败（极其罕见）
  defeat: [
    { speaker: '伊甸芙宁', text: '"呜哇哇!! 你作弊! 你开挂!"', emotion: 'weak' as const },
    { speaker: '伊甸芙宁', text: '"难道你的圣遗物全是双爆40分吗?! 这不科学!"', emotion: 'weak' as const },
    {
      speaker: '伊甸芙宁',
      text: '"我要告诉妈妈(院长)! 你欺负人! 呜呜呜...赔钱! 把我的精神损失费赔给我!"',
      emotion: 'tsundere' as const,
    },
  ],
};

// ==================== 伊甸芙宁 BOSS 检测与初始化 ====================
/**
 * 检测是否是伊甸芙宁BOSS战
 */
export function isEdenBoss(enemyName: string): boolean {
  if (!enemyName) return false;
  const name = enemyName.toLowerCase();
  return name.includes('伊甸芙宁') || name.includes('eden') || name.includes('funin') || name.includes('芙宁');
}

/**
 * 初始化伊甸芙宁BOSS战
 */
export function initEdenBoss(): void {
  bossState.isBossFight = true;
  bossState.bossId = 'eden';
  bossState.currentPhase = 1;
  bossState.phaseTransitioning = false;
  bossState.dialogueIndex = 0;
  bossState.buttonsDisabled = false;
  bossState.hasUsedMedal = false;
  // Eden专属状态初始化
  bossState.edenSleeping = true; // 开局进入沉睡
  bossState.edenCountdown = 6; // 6回合倒计时（上限6）
  bossState.edenAwakened = false;
  bossState.edenCritDebuffApplied = false;

  // 播放入场对话，然后进入沉睡
  queueDialogues([...EDEN_DIALOGUES.entry, ...EDEN_DIALOGUES.sleeping_start]);
}

/**
 * 获取伊甸芙宁显示名称
 */
export function getEdenDisplayName(): string {
  return '伊甸芙宁';
}

/**
 * 获取伊甸芙宁立绘URL
 */
export function getEdenAvatarUrl(sleeping: boolean = false): string {
  // 沉睡状态和苏醒状态使用同一张立绘，通过CSS特效区分
  return 'https://raw.githubusercontent.com/vincentrong2005/Fatria/main/图片素材/性斗学园/立绘/伊甸芙宁.png';
}

/**
 * 获取伊甸芙宁随机战斗对话
 */
export function getEdenRandomBattleDialogue(): BossDialogue | null {
  if (bossState.edenSleeping) {
    // 沉睡中被攻击
    const dialogues = EDEN_DIALOGUES.sleeping_attacked;
    return dialogues[Math.floor(Math.random() * dialogues.length)];
  }
  const dialogues = EDEN_DIALOGUES.battle;
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 获取伊甸芙宁被暴击对话
 */
export function getEdenCritReactionDialogue(): BossDialogue | null {
  const dialogues = EDEN_DIALOGUES.crit_reaction;
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

/**
 * 获取伊甸芙宁束缚免疫对话
 */
export function getEdenBindImmuneDialogue(): BossDialogue | null {
  const dialogues = EDEN_DIALOGUES.bind_immune;
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// ==================== 伊甸芙宁 懒惰天赋机制 ====================
/**
 * 处理伊甸芙宁回合开始（倒计时处理）
 * @param enemyBoundTurns 敌人被束缚的回合数
 * @returns 是否应该触发Game Over技能
 */
export function processEdenTurnStart(enemyBoundTurns: number = 0): { triggerSkill16: boolean; countdownValue: number } {
  if (!bossState.isBossFight || bossState.bossId !== 'eden') {
    return { triggerSkill16: false, countdownValue: 6 };
  }

  // 倒计时-1
  bossState.edenCountdown--;

  // 如果被束缚，额外-1
  if (enemyBoundTurns > 0) {
    bossState.edenCountdown--;
  }

  // 检查是否归零
  if (bossState.edenCountdown <= 0) {
    // 重置倒计时
    bossState.edenCountdown = 6;
    // 如果沉睡中，苏醒
    if (bossState.edenSleeping) {
      bossState.edenSleeping = false;
    }
    // 触发Game Over技能
    return { triggerSkill16: true, countdownValue: bossState.edenCountdown };
  }

  return { triggerSkill16: false, countdownValue: bossState.edenCountdown };
}

/**
 * 检查伊甸芙宁是否应该苏醒（沉睡期间快感达到上限）
 */
export function shouldEdenAwaken(currentPleasure: number, maxPleasure: number): boolean {
  if (!bossState.isBossFight || bossState.bossId !== 'eden') {
    return false;
  }

  // 必须是沉睡状态且未被唤醒过
  if (!bossState.edenSleeping) {
    return false;
  }

  // 快感达到上限时触发苏醒
  return currentPleasure >= maxPleasure;
}

/**
 * 执行伊甸芙宁苏醒流程
 * @returns 新的高潮次数上限（3）
 */
export function processEdenAwakening(): { newClimaxLimit: number } {
  bossState.edenSleeping = false;
  bossState.edenAwakened = true;
  bossState.edenCountdown = 6; // 重置倒计时（上限6）

  // 播放苏醒对话
  queueDialogues(EDEN_DIALOGUES.awakening_pleasure);

  // 返回新的高潮次数上限
  return { newClimaxLimit: 3 };
}

/**
 * 处理伊甸芙宁被暴击
 * @returns debuff信息 (闪避率-8, 暴击率-8)
 */
export function processEdenCritReceived(): {
  countdownIncrease: number;
  evasionDebuff: number;
  critDebuff: number;
  critDamageMultiplier: number;
} {
  if (!bossState.isBossFight || bossState.bossId !== 'eden') {
    return { countdownIncrease: 0, evasionDebuff: 0, critDebuff: 0, critDamageMultiplier: 1 };
  }

  // 倒计时+4（不超过6）
  bossState.edenCountdown = Math.min(6, bossState.edenCountdown + 4);

  // 标记已应用暴击debuff（闪避率-8，暴击率-8）
  bossState.edenCritDebuffApplied = true;

  return {
    countdownIncrease: 4,
    evasionDebuff: -8, // 闪避率-8（减少值）
    critDebuff: -8, // 暴击率-8（减少值）
    critDamageMultiplier: 3.0, // 暴击伤害固定为300%
  };
}

/**
 * 获取懒惰天赋对玩家的debuff效果（增强版）
 * @returns 玩家debuff参数
 */
export function getEdenSlothEffects(): {
  cooldownIncrease: number;
  staminaCostMultiplier: number;
  sleepingEnduranceDebuff: number; // 沉睡状态下伊甸芙宁自己的忍耐力成算debuff
} {
  if (!bossState.isBossFight || bossState.bossId !== 'eden') {
    return { cooldownIncrease: 0, staminaCostMultiplier: 1, sleepingEnduranceDebuff: 0 };
  }

  return {
    cooldownIncrease: 3, // 技能冷却+3（增强）
    staminaCostMultiplier: 2.0, // 耐力消耗×2（增强）
    sleepingEnduranceDebuff: bossState.edenSleeping ? -70 : 0, // 沉睡时-70%忍耐力成算
  };
}

/**
 * 检查伊甸芙宁是否应该锁血（沉睡期间快感将达到上限时）
 */
export function shouldEdenLockPleasure(currentPleasure: number, maxPleasure: number): boolean {
  if (!bossState.isBossFight || bossState.bossId !== 'eden') {
    return false;
  }

  // 沉睡期间快感即将达到上限时锁血
  if (bossState.edenSleeping && currentPleasure >= maxPleasure - 1) {
    return true;
  }

  return false;
}

/**
 * 获取伊甸芙宁懒惰天赋描述信息（用于UI显示）
 */
export function getEdenSlothDescription(): string {
  const effects = [
    '【七宗罪·懒惰】',
    '• 开局进入沉睡状态，不使用任何技能',
    '• 8回合倒计时，归零时使用Game Over并重置',
    '• 被束缚时倒计时额外-1',
    '• 沉睡期间被打至高潮将苏醒，高潮次数上限变为3',
    '• 玩家技能冷却+2，耐力消耗×1.5',
    '• 被暴击后：倒计时+4，闪避-30%，忍耐力成算-30%',
    '• 受到暴击时伤害固定为300%',
  ];
  return effects.join('\n');
}
