import * as Icons from 'lucide-react';
import { Check, Shield, Sword } from 'lucide-react';
import React from 'react';
import { ACTIVE_SKILLS, PASSIVE_SKILLS } from '../constants';
import { CharacterData, Skill } from '../types';

interface Props {
  data: CharacterData;
  updateData: (fields: Partial<CharacterData>) => void;
}

// Safely retrieve icon component to prevent crashes
const getIcon = (iconName: string) => {
  try {
    // Cast Icons to any to bypass strict type checking on dynamic keys
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent size={24} />;
    }
  } catch (e) {
    console.warn(`Icon ${iconName} not found`, e);
  }
  return <Sword size={24} />;
};

interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected, isDisabled, onToggle }) => (
  <button
    onClick={onToggle}
    disabled={isDisabled}
    className={`relative group p-3 rounded-xl border transition-all duration-300 text-left flex items-start gap-3 h-full ${
      isSelected
        ? 'bg-secondary/20 border-secondary ring-1 ring-secondary'
        : isDisabled
          ? 'bg-white/5 border-white/5 opacity-50 cursor-not-allowed'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
    }`}
  >
    <div
      className={`p-2.5 rounded-lg transition-colors shrink-0 ${
        isSelected ? 'bg-secondary text-white' : 'bg-black/30 text-gray-400 group-hover:text-gray-200'
      }`}
    >
      {getIcon(skill.icon)}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h4
          className={`font-bold text-sm truncate pr-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}
        >
          {skill.name}
        </h4>
        {isSelected && <Check size={14} className="text-secondary shrink-0" />}
      </div>
      <p className="text-xs text-gray-500 mt-1 mb-1 font-medium">{skill.effectDescription}</p>
      <p className="text-xs text-gray-400 leading-snug line-clamp-2">{skill.description}</p>
    </div>
  </button>
);

const Step4_Skills: React.FC<Props> = ({ data, updateData }) => {
  const MAX_ACTIVE_SKILLS = 5;
  const MAX_PASSIVE_SKILLS = 2;

  // Select passive skills based on gender
  const currentPassiveSkills = PASSIVE_SKILLS[data.gender] || PASSIVE_SKILLS['非二元'];

  const toggleActiveSkill = (skillId: string) => {
    const current = [...data.initialActiveSkills];
    const index = current.indexOf(skillId);
    if (index >= 0) current.splice(index, 1);
    else if (current.length < MAX_ACTIVE_SKILLS) current.push(skillId);
    updateData({ initialActiveSkills: current });
  };

  const togglePassiveSkill = (skillId: string) => {
    const current = [...data.initialPassiveSkills];
    const index = current.indexOf(skillId);
    if (index >= 0) current.splice(index, 1);
    else if (current.length < MAX_PASSIVE_SKILLS) current.push(skillId);
    updateData({ initialPassiveSkills: current });
  };

  return (
    <div className="animate-slide-up space-y-8 pb-4">
      {/* Active Skills Section */}
      <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
        {/* Header - No sticky to prevent clipping issues, just a solid header block */}
        <div className="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/20 rounded text-red-400">
              <Sword size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">主动技能</h3>
              <p className="text-xs text-gray-400">选择 {MAX_ACTIVE_SKILLS} 个性斗手段</p>
            </div>
          </div>
          <div className="text-right bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <span
              className={`font-bold ${data.initialActiveSkills.length === MAX_ACTIVE_SKILLS ? 'text-secondary' : 'text-white'}`}
            >
              {data.initialActiveSkills.length}
            </span>
            <span className="text-gray-500 text-sm">/{MAX_ACTIVE_SKILLS}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 h-[300px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACTIVE_SKILLS.map(skill => {
              const isSelected = data.initialActiveSkills.includes(skill.id);
              const isDisabled = !isSelected && data.initialActiveSkills.length >= MAX_ACTIVE_SKILLS;
              return (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onToggle={() => toggleActiveSkill(skill.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Constitution Skills Section */}
      <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
        <div className="bg-white/5 border-b border-white/5 p-4 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded text-blue-400">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">特殊体质</h3>
              <p className="text-xs text-gray-400">选择 {MAX_PASSIVE_SKILLS} 个被动特性</p>
            </div>
          </div>
          <div className="text-right bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <span
              className={`font-bold ${data.initialPassiveSkills.length === MAX_PASSIVE_SKILLS ? 'text-secondary' : 'text-white'}`}
            >
              {data.initialPassiveSkills.length}
            </span>
            <span className="text-gray-500 text-sm">/{MAX_PASSIVE_SKILLS}</span>
          </div>
        </div>

        <div className="p-4 h-[300px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentPassiveSkills.map(skill => {
              const isSelected = data.initialPassiveSkills.includes(skill.id);
              const isDisabled = !isSelected && data.initialPassiveSkills.length >= MAX_PASSIVE_SKILLS;
              return (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onToggle={() => togglePassiveSkill(skill.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4_Skills;
