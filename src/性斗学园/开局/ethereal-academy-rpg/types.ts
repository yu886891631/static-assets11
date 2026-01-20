export enum Gender {
  MALE = '男',
  FEMALE = '女',
  OTHER = '非二元',
}

export enum Difficulty {
  STORY = '剧情模式 (简单)',
  NORMAL = '学园生活 (普通)',
  HARDCORE = '地狱开局 (困难)',
  CHEATER = '作弊者',
}

// Strictly matching the user's provided Zod schema keys for stats
export interface GameAttributes {
  // 角色基础
  _等级: number;
  $潜力: number;
  _魅力: number;
  _幸运: number;
  _声望: number;

  // 核心状态
  _最大耐力: number;
  _最大快感: number;
  $基础性斗力: number;
  $基础忍耐力: number;
  $闪避率: number;
  $暴击率: number;
  _堕落度: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'constitution'; // Active = Action, Constitution = Passive Body Trait
  cost?: number; // Point cost if applicable
  icon: string;
  effectDescription?: string; // Short text for UI
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseBonus: Partial<GameAttributes> & { _全属性?: number }; // Modifies the specific variables
  passiveSkill: Skill;
}

export interface CharacterData {
  name: string;
  age: number;
  gender: Gender;
  appearance: string;
  personality: string;
  background: string;
  difficulty: Difficulty;
  archetypeId: string | null;

  // The core stats
  attributes: GameAttributes;

  // Body stats
  height: number;
  weight: number;
  cupSize: string;
  hips: number;
  cockLength: number;
  genitalType: string;

  // Body Configuration (For Non-binary mostly)
  configFeatures: {
    hasBreasts: boolean;
    hasPenis: boolean;
  };

  // Skills
  initialActiveSkills: string[]; // IDs of selected active skills
  initialPassiveSkills: string[]; // IDs of selected constitution skills
}

// Default starting values based on the Zod schema defaults
export const INITIAL_ATTRIBUTES: GameAttributes = {
  _等级: 1,
  $潜力: 5.0,
  _魅力: 10,
  _幸运: 10,
  _声望: 0,
  _最大耐力: 100,
  _最大快感: 100,
  $基础性斗力: 10,
  $基础忍耐力: 10,
  $闪避率: 0,
  $暴击率: 0,
  _堕落度: 0,
};

export const INITIAL_CHARACTER_DATA: CharacterData = {
  name: '',
  age: 18,
  gender: Gender.FEMALE,
  appearance: '',
  personality: '',
  background: '',
  difficulty: Difficulty.NORMAL,
  archetypeId: null,
  attributes: { ...INITIAL_ATTRIBUTES },
  height: 165,
  weight: 50,
  cupSize: 'C',
  hips: 90,
  cockLength: 15,
  genitalType: '标准',
  configFeatures: {
    hasBreasts: true, // Defaults, will be updated by gender logic in UI
    hasPenis: false,
  },
  initialActiveSkills: [],
  initialPassiveSkills: [],
};
