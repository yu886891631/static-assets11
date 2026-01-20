import * as Icons from 'lucide-react';
import { Circle, Heart, LucideIcon, Ruler, Settings2, Sparkles, User, Zap } from 'lucide-react';
import React from 'react';
import { ARCHETYPES, CUP_SIZES, GENITAL_TYPES } from '../constants';
import { Archetype, CharacterData, Gender } from '../types';

interface Props {
  data: CharacterData;
  updateData: (fields: Partial<CharacterData>) => void;
}

const Step2_Archetype: React.FC<Props> = ({ data, updateData }) => {
  const currentArchetypes = ARCHETYPES[data.gender] || ARCHETYPES['非二元'];
  const currentGenitalOptions = GENITAL_TYPES[data.gender] || GENITAL_TYPES['非二元'];

  const getIcon = (iconName: string) => {
    // @ts-ignore
    const Icon = Icons[iconName] as LucideIcon;
    return Icon ? <Icon size={24} /> : <Icons.User size={24} />;
  };

  const isMale = data.gender === Gender.MALE;
  const isFemale = data.gender === Gender.FEMALE;
  const isOther = data.gender === Gender.OTHER;

  const showBreasts = isFemale || (isOther && data.configFeatures.hasBreasts);
  const showPenis = isMale || (isOther && data.configFeatures.hasPenis);

  const toggleFeature = (feature: 'hasBreasts' | 'hasPenis') => {
    updateData({
      configFeatures: {
        ...data.configFeatures,
        [feature]: !data.configFeatures[feature],
      },
    });
  };

  const selectedArchetype = currentArchetypes.find(a => a.id === data.archetypeId);

  // Helper to translate variable names to display text
  const getStatLabel = (key: string) => {
    const map: Record<string, string> = {
      _等级: '等级',
      $潜力: '潜力',
      _魅力: '魅力',
      _幸运: '幸运',
      _声望: '声望',
      _最大耐力: '耐力',
      _最大快感: '耐性',
      $基础性斗力: '性斗',
      $基础忍耐力: '忍耐',
      $闪避率: '闪避',
      $暴击率: '暴击',
      _堕落度: '堕落',
      _全属性: '全属性',
    };
    return map[key] || key;
  };

  return (
    <div className="animate-slide-up space-y-8">
      {/* Archetype Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Header Panel */}
          <div className="bg-black/20 border border-white/5 rounded-t-2xl p-4 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary/20 rounded text-secondary">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">校园身份</h3>
                <p className="text-xs text-gray-400">选择 1 个核心身份</p>
              </div>
            </div>
          </div>

          {/* Scrollable List */}
          <div className="bg-black/20 border-x border-b border-white/5 rounded-b-2xl p-4 h-[350px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentArchetypes.map((archetype: Archetype) => {
                const isSelected = data.archetypeId === archetype.id;
                return (
                  <button
                    key={archetype.id}
                    onClick={() => updateData({ archetypeId: archetype.id })}
                    className={`relative group p-3 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 ${
                      isSelected
                        ? 'bg-secondary/20 border-secondary ring-1 ring-secondary'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                        isSelected ? 'bg-secondary text-white' : 'bg-black/30 text-gray-400 group-hover:text-gray-200'
                      }`}
                    >
                      {getIcon(archetype.icon)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`font-bold text-sm truncate transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}
                        >
                          {archetype.name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">{archetype.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Archetype Detail Panel */}
        <div className="lg:col-span-1">
          <div
            className={`h-full rounded-2xl border border-white/10 p-6 flex flex-col items-center text-center transition-all duration-500 ${selectedArchetype ? 'bg-gradient-to-b from-secondary/10 to-transparent' : 'bg-white/5 grayscale opacity-50'}`}
          >
            {selectedArchetype ? (
              <>
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 text-secondary shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  {getIcon(selectedArchetype.passiveSkill.icon)}
                </div>
                <h4 className="text-sm uppercase tracking-widest text-secondary font-bold mb-1">专属被动</h4>
                <h3 className="text-xl font-bold text-white mb-2">{selectedArchetype.passiveSkill.name}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedArchetype.passiveSkill.description}</p>

                <div className="mt-6 w-full pt-6 border-t border-white/10">
                  <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-3">初始加成</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(selectedArchetype.baseBonus).map(([key, value]) => {
                      const numVal = value as number;
                      const isPositive = numVal > 0;
                      return (
                        <span
                          key={key}
                          className="text-xs px-2 py-1 rounded-md bg-black/40 text-gray-200 border border-white/10"
                        >
                          {getStatLabel(key)}{' '}
                          <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                            {isPositive ? '+' : ''}
                            {numVal}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p>请选择一个身份以查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Stats Customization */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg text-white font-medium mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Activity size={20} className="text-secondary" />
            身体数据定制
          </div>
          {isOther && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Settings2 size={12} /> 非二元自由配置
            </span>
          )}
        </h3>

        {/* Non-binary Config Toggles */}
        {isOther && (
          <div className="mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">生理构造设置</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${data.configFeatures.hasBreasts ? 'bg-secondary border-secondary' : 'border-gray-500 bg-transparent'}`}
                >
                  {data.configFeatures.hasBreasts && <Icons.Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={data.configFeatures.hasBreasts}
                  onChange={() => toggleFeature('hasBreasts')}
                />
                <span
                  className={`text-sm group-hover:text-white transition-colors ${data.configFeatures.hasBreasts ? 'text-white' : 'text-gray-400'}`}
                >
                  女性性征 (乳房/臀部)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${data.configFeatures.hasPenis ? 'bg-secondary border-secondary' : 'border-gray-500 bg-transparent'}`}
                >
                  {data.configFeatures.hasPenis && <Icons.Check size={14} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={data.configFeatures.hasPenis}
                  onChange={() => toggleFeature('hasPenis')}
                />
                <span
                  className={`text-sm group-hover:text-white transition-colors ${data.configFeatures.hasPenis ? 'text-white' : 'text-gray-400'}`}
                >
                  男性性征 (阴茎)
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Height Slider */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-300 mb-4">
              <span className="flex items-center gap-2">
                <Ruler size={16} /> 身高 (Height)
              </span>
              <span className="text-secondary font-bold">{data.height} cm</span>
            </label>
            <div className="relative flex items-center h-6">
              <input
                type="range"
                min="135"
                max="195"
                step="1"
                value={data.height}
                onChange={e => updateData({ height: parseInt(e.target.value) })}
                className="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
              />
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
                  style={{ width: `${((data.height - 135) / (195 - 135)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>135cm</span>
              <span>165cm</span>
              <span>195cm</span>
            </div>
          </div>

          {/* Hips Slider */}
          {showBreasts && (
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-300 mb-4">
                <span className="flex items-center gap-2">
                  <Circle size={16} /> 臀围 (Hips)
                </span>
                <span className="text-secondary font-bold">{data.hips} cm</span>
              </label>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="75"
                  max="120"
                  step="1"
                  value={data.hips}
                  onChange={e => updateData({ hips: parseInt(e.target.value) })}
                  className="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
                />
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                    style={{ width: `${((data.hips - 75) / (120 - 75)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>75cm (骨感)</span>
                <span>95cm (丰满)</span>
                <span>120cm (安产)</span>
              </div>
            </div>
          )}

          {/* Cock Length Slider */}
          {showPenis && (
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-300 mb-4">
                <span className="flex items-center gap-2">
                  <Zap size={16} /> 阴茎长度 (Length)
                </span>
                <span className="text-secondary font-bold">{data.cockLength} cm</span>
              </label>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={data.cockLength}
                  onChange={e => updateData({ cockLength: parseInt(e.target.value) })}
                  className="absolute w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer focus:outline-none accent-secondary z-20 opacity-0 hover:opacity-100"
                />
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden absolute z-10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${((data.cockLength - 5) / (30 - 5)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5cm</span>
                <span>15cm (平均)</span>
                <span>30cm (巨根)</span>
              </div>
            </div>
          )}

          {/* Cup Size Selector */}
          {showBreasts && (
            <div className="col-span-1 md:col-span-2">
              <label className="flex text-sm font-medium text-gray-300 mb-4 items-center gap-2">
                <Heart size={16} /> 罩杯 (Cup Size)
              </label>
              <div className="flex flex-wrap gap-2">
                {CUP_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => updateData({ cupSize: size })}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                      data.cupSize === size
                        ? 'bg-secondary text-white shadow-lg scale-110 border-transparent'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Genital Type Selector (All) */}
          <div className="col-span-1 md:col-span-2">
            <label className="flex text-sm font-medium text-gray-300 mb-4 items-center gap-2">
              <Icons.Dna size={16} /> 性器特征 (Genitals)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentGenitalOptions.map((type: string) => (
                <button
                  key={type}
                  onClick={() => updateData({ genitalType: type })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    data.genitalType === type
                      ? 'bg-secondary/20 border-secondary text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2_Archetype;
