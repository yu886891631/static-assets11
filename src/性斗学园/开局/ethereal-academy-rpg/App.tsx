import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Terminal, Sparkles, User, Settings, Dice5, Sword } from 'lucide-react';
import FloatingShapes from './components/FloatingShapes';
import Step1_Identity from './components/Step1_Identity';
import Step2_Archetype from './components/Step2_Archetype';
import Step3_Attributes from './components/Step3_Attributes';
import Step4_Skills from './components/Step4_Skills';
import { CharacterData, INITIAL_CHARACTER_DATA } from './types';

function App() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterData>(INITIAL_CHARACTER_DATA);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const MAX_STEPS = 4;

  const updateCharacterData = (fields: Partial<CharacterData>) => {
    setCharacterData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (step < MAX_STEPS) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStartGame = () => {
    setLoading(true);
    // Simulate LLM initialization
    setTimeout(() => {
      setLoading(false);
      openModal('系统连接中...');
    }, 2000);
  };

  const openModal = (title: string) => {
    setModalTitle(title);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // Progress Bar Width
  const progress = (step / MAX_STEPS) * 100;

  return (
    <div className="min-h-screen relative font-sans text-gray-100 flex items-center justify-center p-4 py-8 md:py-12">
      <FloatingShapes />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-4xl bg-glass border border-glassBorder backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto min-h-[600px]">
        {/* Sidebar / Header */}
        <div className="w-full md:w-64 bg-black/20 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Terminal size={20} className="text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                性斗学园
              </h1>
            </div>

            <nav className="space-y-2">
              {[
                { id: 1, label: '身份档案', icon: User },
                { id: 2, label: '角色类型', icon: Sparkles },
                { id: 3, label: '天赋分配', icon: Dice5 },
                { id: 4, label: '初始技能', icon: Sword },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id < step) setStep(item.id);
                    // Prevent jumping forward without validation logic if this was a real app
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    step === item.id
                      ? 'bg-white/10 text-white shadow-inner border border-white/5'
                      : step > item.id
                        ? 'text-green-400'
                        : 'text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <item.icon size={16} className={step === item.id ? 'text-secondary' : ''} />
                  {item.label}
                  {step > item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Removed Settings Button as requested */}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Progress Bar Line */}
          <div className="h-1 w-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex-1 p-6 md:p-10">
            {/* Step Content */}
            <div className="max-w-2xl mx-auto min-h-[400px]">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {step === 1 && '创建你的学籍档案'}
                  {step === 2 && '选择你的校园定位'}
                  {step === 3 && '激活你的天赋潜能'}
                  {step === 4 && '选择初始技能'}
                </h2>
                <p className="text-gray-400">
                  {step === 1 && '请输入基础信息以办理入学手续。'}
                  {step === 2 && '不同的身份将决定你在学园中的社交圈层与初始加成。'}
                  {step === 3 && '根据游戏难度，你需要合理分配有限的天赋点数。'}
                  {step === 4 && '选择适合你战术风格的初始技能。'}
                </p>
              </div>

              {step === 1 && <Step1_Identity data={characterData} updateData={updateCharacterData} />}
              {step === 2 && <Step2_Archetype data={characterData} updateData={updateCharacterData} />}
              {step === 3 && <Step3_Attributes data={characterData} updateData={updateCharacterData} />}
              {step === 4 && <Step4_Skills data={characterData} updateData={updateCharacterData} />}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-white/5 bg-black/10 backdrop-blur-md flex justify-between items-center z-20">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${
                step === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChevronLeft size={18} /> 上一步
            </button>

            {step < MAX_STEPS ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && !characterData.name}
                className="group relative flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-black font-bold shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                下一步 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                disabled={characterData.initialActiveSkills.length === 0}
                className="group relative flex items-center gap-2 px-10 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    加载世界...
                  </span>
                ) : (
                  <>
                    <Sparkles size={18} /> 开始学园生活
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generic Modal for Placeholder Interactions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#1e293b] w-full max-w-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in transform transition-all scale-100">
            <h3 className="text-xl font-bold text-white mb-4">{modalTitle}</h3>
            <div className="h-32 bg-black/20 rounded-xl flex items-center justify-center border border-white/5 border-dashed">
              <p className="text-gray-500 text-sm">此功能模块已就绪，等待内容注入。</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
