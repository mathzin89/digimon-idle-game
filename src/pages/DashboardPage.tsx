// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore'; 
import { useAuthStore } from '../store/useAuthStore';
import { getDigimonVisuals, MenuSprite } from '../utils/digimonVisuals';
import { GameWorld, ModalType } from '../components/game/GameWorld';
import { GameModals } from '../components/game/GameModals';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { 
    tamerName, bits, gems, ownedDigimons, myDigimons, activeDigimon, items,
    setActiveDigimon, useItem, saveProgress, loadProgress, isDataLoaded, hasCompletedTutorial
  } = useGameStore();
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentZone, setCurrentZone] = useState<'floresta' | 'cidade'>('floresta');

  useEffect(() => {
    if (user && !isDataLoaded) {
      loadProgress(user.uid);
    } else if (isDataLoaded && !hasCompletedTutorial) {
      navigate('/initiation');
    }
  }, [user, isDataLoaded, hasCompletedTutorial, loadProgress, navigate]);

  useEffect(() => {
    if (!user || !isDataLoaded || !hasCompletedTutorial) return;
    const saveInterval = setInterval(() => {
      saveProgress(user.uid);
    }, 30000); 
    return () => clearInterval(saveInterval);
  }, [user, isDataLoaded, hasCompletedTutorial, saveProgress]);

  const handleLogout = async () => {
    if (user && isDataLoaded) await saveProgress(user.uid); 
    await logout();
    navigate('/login');
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-digi-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-digi-cyan font-bold tracking-widest uppercase animate-pulse">Sincronizando Dados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative w-full h-screen overflow-hidden bg-[#4d9262] font-sans selection:bg-digi-cyan/30">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes suckIntoDigivice { 0% { transform: translateY(0) scale(1); filter: brightness(1) drop-shadow(0 0 5px cyan); opacity: 0.9; } 40% { transform: translateY(40px) scale(0.6); filter: brightness(2) drop-shadow(0 0 15px cyan) hue-rotate(45deg); opacity: 0.7; } 100% { transform: translateY(100px) scale(0); filter: brightness(3); opacity: 0; } }
        @keyframes pulseDNA { from { width: 8px; opacity: 0.6; } to { width: 14px; opacity: 1; } }
        @keyframes fadeOut { 0%, 80% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes glowDigivice { 0% { transform: scale(0.5) translateY(10px); filter: drop-shadow(0 0 0px cyan); opacity: 0; } 20% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 10px cyan); opacity: 1; } 50%, 80% { transform: scale(1.05); filter: drop-shadow(0 0 20px cyan); opacity: 1; } 100% { transform: scale(1); filter: drop-shadow(0 0 5px cyan); opacity: 0; } }
        @keyframes floatDamage { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { transform: translateY(-15px) scale(1.2); opacity: 1; } 100% { transform: translateY(-40px) scale(1); opacity: 0; } }
        @keyframes floatCrit { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 15% { transform: translateY(-10px) scale(1.8); opacity: 1; filter: brightness(1.5); } 100% { transform: translateY(-45px) scale(1.2); opacity: 0; } }
        @keyframes floatLoot { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 20% { transform: translateY(-20px) scale(1.1); opacity: 1; } 80% { transform: translateY(-40px) scale(1); opacity: 1; } 100% { transform: translateY(-50px) scale(0.8); opacity: 0; } }
        @keyframes spinPortal { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .aura-elite { filter: drop-shadow(0 0 8px #3b82f6); }
        .aura-chefe { filter: drop-shadow(0 0 12px #ef4444) brightness(1.2); }
        .aura-divino { filter: drop-shadow(0 0 20px #fbbf24) brightness(1.4); }
        @keyframes flashHit { 0%, 100% { filter: brightness(1) sepia(0); } 50% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); } }
        .is-being-hit { animation: flashHit 0.3s ease-out; }
        @keyframes hitSpark { 0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; } 30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
        @keyframes attackThrust { 0%, 100% { transform: translate(-50%, -50%); } 50% { transform: translate(calc(-50% + 4px), -50%); } }
        .attacking-bump { animation: attackThrust 0.3s ease-in-out infinite alternate; }
      `}} />

      <GameWorld currentZone={currentZone} setActiveModal={setActiveModal} setCurrentZone={setCurrentZone} />

      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 border border-slate-700/50 rounded-md p-1.5 flex gap-2 shadow-lg backdrop-blur-sm pointer-events-auto">
        <button onClick={() => setCurrentZone(prev => prev === 'floresta' ? 'cidade' : 'floresta')} className="w-8 h-8 flex items-center justify-center rounded bg-digi-cyan/20 border border-digi-cyan hover:bg-digi-cyan hover:text-slate-900 transition-colors text-sm relative group">
          {currentZone === 'floresta' ? '🏰' : '🌲'}
          <span className="absolute -bottom-8 bg-black text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none border border-slate-700">
            {currentZone === 'floresta' ? 'Ir para a Cidade' : 'Voltar ao Mapa'}
          </span>
        </button>
        <div className="w-px h-8 bg-slate-700 mx-1"></div> 
        <button onClick={() => setActiveModal('profile')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">👤</button>
        <button onClick={() => setActiveModal('inventory')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🎒</button>
        <button onClick={() => setActiveModal('pc')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">💻</button>
        <button onClick={() => setActiveModal('map')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🗺️</button>
        <button onClick={() => setActiveModal('quests')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm relative">📜<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-slate-900"></span></button>
        <button onClick={() => setActiveModal('digipedia')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">📖</button>
        <button onClick={() => setActiveModal('shop')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🛒</button>
        <div className="w-px h-8 bg-slate-700 mx-1"></div> 
        <button onClick={() => setActiveModal('settings')} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 border border-slate-600 hover:border-digi-cyan transition-colors text-sm">⚙️</button>
      </div>

      <div className="absolute top-4 left-4 w-64 z-50 bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden flex flex-col pointer-events-auto">
        <div className="bg-slate-900 border-b border-slate-700 p-2 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-digi-gold text-sm tracking-wider uppercase">{user?.displayName || tamerName}</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest">🪙 {bits.toLocaleString()} | 💎 {gems.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-2 space-y-2">
          {ownedDigimons.map((id) => {
             const stats = myDigimons[id];
             const isActive = activeDigimon === id;
             const expProgress = (stats?.exp / stats?.maxExp) * 100 || 0;
             const hpProgress = (stats?.hp / stats?.maxHp) * 100 || 0;
             const visual = getDigimonVisuals(id, stats?.level || 1, true);
             return (
               <div key={id} onClick={() => setActiveDigimon(id)} className={`bg-slate-900 border ${isActive ? 'border-digi-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'border-slate-800'} rounded p-1.5 flex items-center gap-2 cursor-pointer hover:border-digi-cyan/50 transition-all`}>
                 <MenuSprite visual={visual} className="w-10 h-10 bg-slate-950 rounded border border-slate-700 p-1" />
                 <div className="flex-1">
                   <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                     <span className="flex items-center gap-1">{isActive && <span className="text-[10px]">👑</span>} {visual.name}</span>
                     <span className="text-digi-cyan">Lv.{stats?.level || 1}</span>
                   </div>
                   
                   <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-1 relative">
                     <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${Math.max(0, hpProgress)}%` }}></div>
                     <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-bold text-white leading-none tracking-widest drop-shadow-[0_1px_1px_black]">{stats?.hp}/{stats?.maxHp}</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                     <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${expProgress}%` }}></div>
                   </div>

                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {currentZone === 'floresta' && (
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 w-48 pointer-events-auto">
          <div className="bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden">
            <div className="bg-slate-900 border-b border-slate-700 p-1 text-center">
              <span className="text-[10px] font-bold text-digi-cyan uppercase tracking-widest">Mundo Aberto</span>
            </div>
            <div className="h-32 bg-slate-800 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-pointer" onClick={() => setActiveModal('map')}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-digi-cyan rounded-full border border-white shadow-[0_0_5px_cyan] animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-slate-950/80 p-1.5 rounded-md border border-slate-700/50 backdrop-blur-sm shadow-2xl pointer-events-auto">
        {[ 
          { key: '1', id: 'meat', icon: '🍖', amount: items?.meat || 0 }, 
          { key: '2', id: 'scan', icon: '💾', amount: items?.scan || 0 }, 
          { key: '3', id: 'potion', icon: '💊', amount: items?.potion || 0 }
        ].map((slot) => (
          <div key={slot.key} onClick={() => useItem(slot.id)} className="relative w-10 h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer flex items-center justify-center hover:border-digi-cyan active:scale-95 transition-all group">
            <span className="absolute top-0.5 left-1 text-[8px] font-mono text-slate-500">{slot.key}</span>
            <span className="text-lg">{slot.icon}</span>
            <span className="absolute bottom-0 right-1 text-[9px] font-bold font-mono text-white drop-shadow-md">{slot.amount}</span>
          </div>
        ))}
      </div>

      {activeModal && <GameModals activeModal={activeModal} closeModal={() => setActiveModal(null)} setCurrentZone={setCurrentZone} handleLogout={handleLogout} />}
    </div>
  );
}