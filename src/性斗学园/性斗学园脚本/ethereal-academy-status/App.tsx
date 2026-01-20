import React, { useState } from 'react';
import { initialGameState } from './data';
import { GameState, ModalType } from './types';
import { Header } from './components/layout/Header';
import { HomeWidgets } from './components/os/HomeWidgets';
import { AppIcon } from './components/os/AppIcon';
import { AppScreen } from './components/screens/AppScreen';
import { CharacterApp } from './components/apps/CharacterApp';
import { InventoryContent } from './components/modals/InventoryContent';
import { EmptyPlaceholder } from './components/modals/EmptyPlaceholder';

const App: React.FC = () => {
  const [gameState] = useState<GameState>(initialGameState);
  const [activeApp, setActiveApp] = useState<ModalType>(null);

  // App Configuration
  const apps = [
    { id: 'CHARACTER' as ModalType, name: '档案', icon: 'User', color: 'linear-gradient(135deg, #6366f1, #818cf8)' },
    {
      id: 'INVENTORY' as ModalType,
      name: '背包',
      icon: 'Backpack',
      color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    },
    { id: 'QUESTS' as ModalType, name: '任务', icon: 'Quest', color: 'linear-gradient(135deg, #10b981, #34d399)' },
    {
      id: 'RELATIONSHIPS' as ModalType,
      name: '关系',
      icon: 'Relationship',
      color: 'linear-gradient(135deg, #ec4899, #f472b6)',
    },
    { id: 'COMBAT' as ModalType, name: '性斗', icon: 'Swords', color: 'linear-gradient(135deg, #ef4444, #f87171)' },
    { id: 'MAP' as ModalType, name: '地图', icon: 'Map', color: 'linear-gradient(135deg, #06b6d4, #22d3ee)' },
    { id: 'SETTINGS' as ModalType, name: '设置', icon: 'Settings', color: 'linear-gradient(135deg, #64748b, #94a3b8)' },
  ];

  const renderAppContent = () => {
    switch (activeApp) {
      case 'CHARACTER':
        return <CharacterApp state={gameState} />;
      case 'INVENTORY':
        return (
          <div className="mt-4">
            <InventoryContent state={gameState} />
          </div>
        );
      case 'QUESTS':
        return <EmptyPlaceholder text="任务列表" />;
      case 'RELATIONSHIPS':
        return <EmptyPlaceholder text="关系网络" />;
      case 'COMBAT':
        return <EmptyPlaceholder text="战斗系统" />;
      case 'MAP':
        return <EmptyPlaceholder text="校园地图" />;
      case 'SETTINGS':
        return <EmptyPlaceholder text="系统设置" />;
      default:
        return null;
    }
  };

  const getAppName = (id: ModalType) => apps.find(a => a.id === id)?.name || '';

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] p-0 md:p-8">
      {/* Phone Bezel/Frame (Visible on Desktop) */}
      <div
        className="
        relative w-full h-full md:w-[390px] md:h-[844px] 
        bg-[#0f172a] md:rounded-[40px] shadow-2xl overflow-hidden 
        border-[8px] border-[#1e1e1e] ring-1 ring-white/10
        flex flex-col
      "
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[70%] bg-indigo-900/40 blur-[80px] rounded-full opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] bg-purple-900/30 blur-[60px] rounded-full opacity-50" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* Status Bar (Absolute Top) */}
        <Header state={gameState} />

        {/* Screen Viewport - This fixes the scrolling issue */}
        {/* We use overflow-hidden here to contain the specific pages */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* 1. Home Screen Layer */}
          {/* It has its own scrolling (overflow-y-auto) */}
          {/* Removed 'hide-scrollbar' class to make scrolling visible on desktop */}
          <div
            className={`
             absolute inset-0 pt-12 pb-8 overflow-y-auto
             transition-all duration-300 ease-in-out
             ${activeApp ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
           `}
          >
            <div className="px-5 min-h-full flex flex-col">
              {/* Widgets Section */}
              <div className="mb-8">
                <HomeWidgets state={gameState} />
              </div>

              {/* App Grid */}
              <div className="grid grid-cols-4 gap-x-4 gap-y-6 mt-auto pb-8">
                {apps.map(app => (
                  <AppIcon
                    key={app.id}
                    name={app.name}
                    icon={app.icon as any}
                    color={app.color}
                    onClick={() => setActiveApp(app.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 2. Active App Overlay Layer */}
          {/* AppScreen handles its own internal scrolling */}
          {activeApp && (
            <AppScreen title={getAppName(activeApp)} type={activeApp} onBack={() => setActiveApp(null)}>
              {renderAppContent()}
            </AppScreen>
          )}
        </div>

        {/* Bottom Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none" />
      </div>
    </div>
  );
};

export default App;
