import React from 'react';
import { CharacterData, Gender, Difficulty } from '../types';
import { User, AlignLeft, Smile, GraduationCap, AlertCircle } from 'lucide-react';

interface Props {
  data: CharacterData;
  updateData: (fields: Partial<CharacterData>) => void;
}

const Step1_Identity: React.FC<Props> = ({ data, updateData }) => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Input */}
        <div className="group relative">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <User size={16} className="text-secondary" /> 姓名
          </label>
          <input
            type="text"
            value={data.name}
            onChange={e => updateData({ name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
            placeholder="输入你的角色名..."
          />
        </div>

        {/* Age Input */}
        <div className="group relative">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <GraduationCap size={16} className="text-secondary" /> 年龄
          </label>
          <input
            type="number"
            min={15}
            max={25}
            value={data.age}
            onChange={e => updateData({ age: parseInt(e.target.value) || 16 })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">性别</label>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-sm">
            {Object.values(Gender).map(g => (
              <button
                key={g}
                onClick={() => updateData({ gender: g, archetypeId: null })} // Reset archetype on gender change
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  data.gender === g
                    ? 'bg-secondary text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" /> 游戏难度
          </label>
          <select
            value={data.difficulty}
            onChange={e => updateData({ difficulty: e.target.value as Difficulty })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 appearance-none cursor-pointer backdrop-blur-sm"
          >
            {Object.values(Difficulty).map(d => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appearance Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <Smile size={16} className="text-secondary" /> 外貌描述
        </label>
        <textarea
          rows={2}
          value={data.appearance}
          onChange={e => updateData({ appearance: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm resize-none"
          placeholder="例如：银色长发，红瞳，身材娇小，常年围着一条红色围巾..."
        />
      </div>

      {/* Personality Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <AlignLeft size={16} className="text-secondary" /> 性格与背景
        </label>
        <textarea
          rows={3}
          value={data.personality}
          onChange={e => updateData({ personality: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all backdrop-blur-sm resize-none"
          placeholder="你的性格特点，以及你是如何进入这所学院的..."
        />
      </div>
    </div>
  );
};

export default Step1_Identity;
