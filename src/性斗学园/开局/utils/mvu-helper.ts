// MVU 变量操作辅助函数

/**
 * 原生实现的 get 函数
 */
function get<T = any>(obj: any, path: string, defaultValue?: T): T {
  if (!obj || !path) return defaultValue as T;
  const keys = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  let result: any = obj;
  for (const key of keys) {
    if (result == null) return defaultValue as T;
    result = result[key];
  }
  return result === undefined ? (defaultValue as T) : result;
}

/**
 * 原生实现的 set 函数
 */
function set<T extends object>(obj: T, path: string, value: any): T {
  if (!obj || !path) return obj;
  const keys = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  let current: any = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    if (current[key] == null) {
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}

/**
 * 等待 MVU 初始化并获取 MVU 数据
 */
export async function getMvuData(): Promise<any> {
  const globalAny = window as any;
  if (globalAny.waitGlobalInitialized) {
    await globalAny.waitGlobalInitialized('Mvu');
  }
  if (!globalAny.Mvu) {
    console.warn('MVU 变量框架未初始化');
    return null;
  }
  return globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
}

/**
 * 更新 MVU 变量
 * @param path 变量路径，如 '角色基础._等级'
 * @param value 新值
 * @param reason 更新原因（可选）
 */
export async function updateMvuVariable(path: string, value: any, reason?: string): Promise<void> {
  const globalAny = window as any;
  if (!globalAny.Mvu) {
    await getMvuData(); // 确保初始化
  }
  if (!globalAny.Mvu) {
    console.error('MVU 变量框架不可用');
    return;
  }

  try {
    // 获取当前 MVU 数据
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) {
      console.error('无法获取 MVU 数据');
      return;
    }

    // 确保 stat_data 存在
    if (!mvuData.stat_data) {
      mvuData.stat_data = {};
    }

    // 使用原生 set 函数设置值
    set(mvuData.stat_data, path, value);

    // 写回 MVU 数据
    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  } catch (error) {
    console.error('更新 MVU 变量失败:', error);
  }
}

/**
 * 批量更新 MVU 变量
 * @param updates 要更新的变量路径和值的映射
 */
export async function updateMvuVariables(updates: Record<string, any>): Promise<void> {
  const globalAny = window as any;
  if (!globalAny.Mvu) {
    await getMvuData(); // 确保初始化
  }
  if (!globalAny.Mvu) {
    console.error('MVU 变量框架不可用');
    return;
  }

  try {
    const mvuData = globalAny.Mvu.getMvuData({ type: 'message', message_id: 'latest' });
    if (!mvuData) {
      console.error('无法获取 MVU 数据');
      return;
    }

    if (!mvuData.stat_data) {
      mvuData.stat_data = {};
    }

    // 批量设置值
    for (const [path, value] of Object.entries(updates)) {
      set(mvuData.stat_data, path, value);
    }

    await globalAny.Mvu.replaceMvuData(mvuData, { type: 'message', message_id: 'latest' });
  } catch (error) {
    console.error('批量更新 MVU 变量失败:', error);
  }
}

/**
 * 从 MVU 数据同步到本地状态
 */
export function syncFromMvu(mvuData: any): any {
  if (!mvuData || !mvuData.stat_data) {
    return null;
  }

  return {
    角色基础: {
      _等级: get(mvuData.stat_data, '角色基础._等级', 1),
      经验值: get(mvuData.stat_data, '角色基础.经验值', 0),
      声望: get(mvuData.stat_data, '角色基础.声望', 0),
      _段位: get(mvuData.stat_data, '角色基础._段位', '无段位'),
      段位积分: get(mvuData.stat_data, '角色基础.段位积分', 0),
      难度: get(mvuData.stat_data, '角色基础.难度', '普通'),
      性别: get(mvuData.stat_data, '角色基础.性别', '女'),
    },
    核心状态: {
      $属性点: get(mvuData.stat_data, '核心状态.$属性点', 0),
      $技能点: get(mvuData.stat_data, '核心状态.$技能点', 0),
      _潜力: get(mvuData.stat_data, '核心状态._潜力', 5.0),
      _魅力: get(mvuData.stat_data, '核心状态._魅力', 10),
      $基础魅力: get(mvuData.stat_data, '核心状态.$基础魅力', 10),
      _幸运: get(mvuData.stat_data, '核心状态._幸运', 10),
      $基础幸运: get(mvuData.stat_data, '核心状态.$基础幸运', 10),
      $最大耐力: get(mvuData.stat_data, '核心状态.$最大耐力', 100),
      $耐力: get(mvuData.stat_data, '核心状态.$耐力', 100),
      $最大快感: get(mvuData.stat_data, '核心状态.$最大快感', 100),
      $快感: get(mvuData.stat_data, '核心状态.$快感', 0),
      堕落度: get(mvuData.stat_data, '核心状态.堕落度', 0),
      $基础性斗力: get(mvuData.stat_data, '核心状态.$基础性斗力', 10),
      $基础忍耐力: get(mvuData.stat_data, '核心状态.$基础忍耐力', 10),
      _闪避率: get(mvuData.stat_data, '核心状态._闪避率', 0),
      $基础闪避率: get(mvuData.stat_data, '核心状态.$基础闪避率', 0),
      _暴击率: get(mvuData.stat_data, '核心状态._暴击率', 0),
      $基础暴击率: get(mvuData.stat_data, '核心状态.$基础暴击率', 0),
    },
  };
}
