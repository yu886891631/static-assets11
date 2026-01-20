import React, { useEffect, useState } from 'react';

const BackgroundAmbience = () => {
  const [dustParticles, setDustParticles] = useState<{ id: number; left: number; delay: number; duration: number }[]>(
    [],
  );
  const [leaves, setLeaves] = useState<{ id: number; left: number; delay: number; duration: number; scale: number }[]>(
    [],
  );

  useEffect(() => {
    // Generate Dust Motes (Rising)
    const dust = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * -20, // Negative delay for instant start
      duration: 15 + Math.random() * 20,
    }));
    setDustParticles(dust);

    // Generate Petals/Leaves (Falling)
    const petals = Array.from({ length: 8 }).map((_, i) => ({
      id: i + 100,
      left: Math.random() * 100,
      delay: Math.random() * -20,
      duration: 10 + Math.random() * 15,
      scale: 0.5 + Math.random() * 0.5,
    }));
    setLeaves(petals);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#020617]">
      {/* Base Gradient - Midnight Campus */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#050510] to-black opacity-90"></div>

      {/* Texture Overlay (Grain/Paper) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

      {/* Dynamic Lighting / Glows */}
      {/* Cool moon glow top left */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
      {/* Warm candlelight glow bottom right/center */}
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-900/10 rounded-full blur-[100px] animate-pulse-slow"
        style={{ animationDelay: '2s' }}
      ></div>

      {/* Floating Dust Motes */}
      {dustParticles.map(p => (
        <div
          key={p.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full blur-[1px] animate-float-up"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Falling Petals (Dark Academia - Dried Rose Petals?) */}
      {leaves.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 bg-red-900/40 rounded-tl-xl rounded-br-xl animate-fall-rotate shadow-lg"
          style={{
            left: `${p.left}%`,
            transform: `scale(${p.scale})`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Flickering Shadow Overlay for "Candlelight" feel */}
      <div className="absolute inset-0 bg-black animate-flicker mix-blend-overlay pointer-events-none"></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default BackgroundAmbience;
