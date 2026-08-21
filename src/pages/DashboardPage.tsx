// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore'; 
import { useAuthStore } from '../store/useAuthStore';
import { getDigimonVisuals } from '../utils/digimonVisuals';
import { GameWorld, ModalType } from '../components/game/GameWorld';
import { GameModals } from '../components/game/GameModals';
import { IncubatorModal } from '../components/game/IncubatorModal'; // 🔥 IMPORTADO AQUI
import { TamerPortrait } from '../components/ui/TamerPortrait';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { 
    tamerName, bits, gems, bpp, avatar, ownedDigimons, myDigimons, activeDigimon, items,
    setActiveDigimon, useItem, saveProgress, loadProgress, isDataLoaded, hasCompletedTutorial, evolveDigimon,
    huntSession, role, serverDigimons
  } = useGameStore();
  
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentZone, setCurrentZone] = useState<'floresta' | 'cidade'>('cidade');

  // CHAT FUNCIONAL
  const [activeChatTab, setActiveChatTab] = useState<'mundo' | 'comercio' | 'duvidas'>('mundo');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const initialMessages = [
    { time: '13:30', author: 'Dr_XDSF', level: 771, role: 'player', text: 'Golem lendario, 1.8, 131, 100KK listado' },
    { time: '13:30', author: 'SebaSeeds', level: 805, role: 'player', text: 'Hola, como se llega a Outlands chicos ??' },
    { time: '13:30', author: 'Chufli', level: 216, role: 'player', text: 'debes subir al nivel 150' },
  ];
  const [chatMessages, setChatMessages] = useState(initialMessages);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: user?.displayName || tamerName,
      level: Math.floor((bpp || 0) / 100) + 1,
      role: role,
      text: chatInput
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatTab]);

  const handleLogout = async () => {
    if (user && isDataLoaded) await saveProgress(user.uid); 
    await logout();
    navigate('/login');
  };

  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando...</p>
      </div>
    );
  }

  const huntTimeMinutes = Math.floor((Date.now() - huntSession.timeStart) / 60000);
  const huntTimeHours = Math.floor(huntTimeMinutes / 60);
  
  const tamerLevel = Math.floor((bpp || 0) / 100) + 1;

  const getChatTag = (tagRole?: string) => {
    switch (tagRole) {
      case 'owner': return <span className="text-red-500 font-black mr-1 drop-shadow-md">[OWNER]</span>;
      case 'admin': return <span className="text-cyan-400 font-black mr-1 drop-shadow-md">[ADM]</span>;
      case 'mod': return <span className="text-emerald-400 font-black mr-1 drop-shadow-md">[MOD]</span>;
      case 'vip': return <span className="text-purple-400 font-black mr-1 drop-shadow-md">[VIP]</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative w-full h-screen overflow-hidden bg-[#000] font-sans selection:bg-cyan-500/30">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes monsterHit { 0%, 100% { filter: brightness(1) sepia(0); transform: translateX(0); } 25% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); transform: translateX(-3px); } 75% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); transform: translateX(3px); } }
        .hit-anim { animation: monsterHit 0.3s ease-out; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />

      <GameWorld currentZone={currentZone} setActiveModal={setActiveModal} setCurrentZone={setCurrentZone} />

      <div className="absolute top-4 right-4 z-50 flex items-center gap-3 pointer-events-auto">
        <div className="bg-[#0f121a]/90 backdrop-blur-md border border-yellow-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform" title="Bits">
          <span className="text-yellow-500 text-sm drop-shadow-md leading-none">🪙</span>
          <span className="text-yellow-400 font-mono font-black text-[11px] mt-0.5">{bits?.toLocaleString() || 0}</span>
        </div>
        <div className="bg-[#0f121a]/90 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform" title="Gemas">
          <span className="text-cyan-400 text-sm drop-shadow-md leading-none">💎</span>
          <span className="text-cyan-300 font-mono font-black text-[11px] mt-0.5">{gems?.toLocaleString() || 0}</span>
        </div>
        <div className="bg-[#0f121a]/90 backdrop-blur-md border border-purple-500/30 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform" title="Battle Pass Points (Estrelas)">
          <span className="text-purple-400 text-sm drop-shadow-md leading-none">⭐</span>
          <span className="text-purple-300 font-mono font-black text-[11px] mt-0.5">{bpp?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#0f121a]/95 border border-[#1e293b] rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_4px_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
        
        <div className="flex items-center gap-4 px-1">
          <button onClick={() => setActiveModal('profile')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Perfil">👤</button>
          <button onClick={() => setActiveModal('inventory')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Mochila">🎒</button>
          <button onClick={() => setActiveModal('pc')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Digi-Bank">💻</button>
          <button onClick={() => setActiveModal('map')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Mapa">🗺️</button>
          
          {currentZone !== 'cidade' && (
            <button 
              onClick={() => setCurrentZone('cidade')} 
              className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black] ml-1 border-l border-[#2d3748] pl-5" 
              title="Voltar para a Base"
            >
              🏠
            </button>
          )}
        </div>
        
        <div className="w-px h-5 bg-[#2d3748] mx-1"></div>

        <div className="flex items-center gap-4 px-1">
          <button onClick={() => setActiveModal('quests')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Analyzer">📊</button>
          {currentZone === 'cidade' && (
            <button onClick={() => setActiveModal('shop')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Mercado">🛒</button>
          )}
          <button onClick={() => setActiveModal('gamepass')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Game Pass">🏅</button>
          <button onClick={() => setActiveModal('settings')} className="text-sm hover:scale-125 transition-transform drop-shadow-[0_1px_2px_black]" title="Auto-Helper">⚙️</button>
        </div>
      </div>

      <div className="absolute top-[60px] left-4 w-[240px] z-40 bg-[#0f121a] border border-[#1e293b] rounded-lg shadow-2xl flex flex-col pointer-events-auto">
        
        <div className="p-3 border-b border-[#1e293b] flex items-center gap-3">
          <div className="w-[38px] h-[38px] bg-[#000] rounded-full border border-yellow-500 flex items-center justify-center overflow-hidden shadow-inner relative">
             <TamerPortrait gender={avatar} />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="font-bold text-[#facc15] text-[12px] tracking-wider uppercase leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{user?.displayName || tamerName}</h2>
            <p className="text-[9px] text-slate-400 mt-1">Tamer Nv. {tamerLevel} • {getDigimonVisuals(activeDigimon, myDigimons[activeDigimon]?.level || 1, true).name}</p>
          </div>
        </div>

        <div className="p-2.5 space-y-2.5">
          {ownedDigimons.map((id) => {
             const stats = myDigimons[id];
             const isActive = activeDigimon === id;
             const expProgress = (stats?.exp / stats?.maxExp) * 100 || 0;
             const hpProgress = (stats?.hp / stats?.maxHp) * 100 || 0;
             const visual = getDigimonVisuals(id, stats?.level || 1, true);

             // LÓGICA DE EVOLUÇÃO
             const sDigi = serverDigimons[id];
             const canEvolve = sDigi && sDigi.evolvesTo && stats?.level >= sDigi.evolveLevel;

             return (
               <div key={id} onClick={() => setActiveDigimon(id)} className={`bg-[#141824] rounded-lg p-2.5 flex gap-3 cursor-pointer transition-all border shadow-md ${isActive ? 'border-[#facc15]' : 'border-[#2d3748]'}`}>
                 
                 <div className={`w-[42px] h-[42px] bg-[#000] rounded-full border-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden ${isActive ? 'border-[#facc15]' : 'border-[#2d3748]'}`}>
                    <div 
                      className="pixelated absolute inset-0"
                      style={{
                        backgroundImage: `url('${visual.menuImg}')`,
                        backgroundSize: '300% 100%', 
                        backgroundPosition: '0% 0%', 
                        imageRendering: 'pixelated'
                      }}
                    />
                 </div>

                 <div className="flex-1 flex flex-col justify-center mt-[-1px]">
                   
                   <div className="flex justify-between items-center mb-1.5">
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">{visual.name}</span>
                     <div className="flex items-center gap-2">
                       {canEvolve && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); evolveDigimon(id); }} 
                           className="bg-yellow-500 hover:bg-yellow-400 text-black text-[8px] px-1.5 py-0.5 rounded font-black uppercase shadow-[0_0_8px_rgba(234,179,8,0.5)] animate-pulse"
                         >
                           Evoluir!
                         </button>
                       )}
                       <span className="text-[#38bdf8] text-[10px] font-bold">Lv.{stats?.level || 1}</span>
                     </div>
                   </div>
                   
                   <div className="w-full h-[8px] bg-[#000] overflow-hidden mb-1.5 relative rounded-[2px]">
                     <div className="h-full bg-[#4ade80]" style={{ width: `${Math.max(0, hpProgress)}%` }}></div>
                     <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)] pt-[1px]">{Math.floor(stats?.hp || 0)}/{stats?.maxHp}</span>
                   </div>

                   <div className="flex items-center gap-2">
                     <div className="flex-1 h-[3px] bg-[#000] overflow-hidden rounded-[2px]">
                       <div className="h-full bg-[#facc15]" style={{ width: `${expProgress}%` }}></div>
                     </div>
                     <span className="text-[8px] font-bold text-slate-300 leading-none">{Math.floor(expProgress)}%</span>
                   </div>

                 </div>
               </div>
             )
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 w-[240px] h-[180px] z-40 bg-[#0f121a] border border-[#1e293b] rounded-lg shadow-2xl flex flex-col pointer-events-auto overflow-hidden">
        <div className="flex bg-[#0a0f1a] border-b border-[#1e293b]">
          <button onClick={() => setActiveChatTab('mundo')} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${activeChatTab === 'mundo' ? 'text-[#facc15] border-b-2 border-[#facc15] bg-[#141824]' : 'text-slate-400 hover:text-white hover:bg-[#141824]'}`}>Mundo</button>
          <button onClick={() => setActiveChatTab('comercio')} className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${activeChatTab === 'comercio' ? 'text-[#facc15] border-b-2 border-[#facc15] bg-[#141824]' : 'text-slate-400 hover:text-white hover:bg-[#141824]'}`}>Comércio</button>
          <div className="w-4 flex items-center justify-center border-l border-[#1e293b]">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex-1 p-2 overflow-y-auto space-y-1.5 bg-[#0f121a] custom-scrollbar">
          {chatMessages.map((msg, i) => (
            <div key={i} className="text-[10px] leading-tight">
              <span className="text-[#a38035] text-[9px] mr-1">{msg.time}</span>
              <span className="text-[#38bdf8] font-bold mr-1">
                {getChatTag(msg.role)}[{msg.level}] {msg.author}:
              </span>
              <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-1.5 bg-[#0a0f1a] border-t border-[#1e293b] flex gap-1.5 items-center relative">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Falar no Mundo..." 
            className="flex-1 bg-[#050811] border border-[#2d3748] rounded px-2 h-7 text-[10px] text-white outline-none focus:border-[#facc15]" 
          />
          <button type="submit" className="bg-[#141824] border border-[#2d3748] text-slate-300 text-[9px] font-bold h-7 px-2 rounded hover:bg-[#1e293b] hover:text-white transition-colors">Enviar</button>
        </form>
      </div>

      {activeModal === 'quests' && (
        <div className="absolute top-[60px] right-4 bottom-4 w-[280px] bg-[#0f121a] border border-[#1e293b] rounded-lg shadow-2xl flex flex-col pointer-events-auto z-40 overflow-hidden animate-in slide-in-from-right duration-300">
           
           <div className="bg-[#141824] border-b border-[#1e293b] p-3 flex justify-between items-center">
              <h3 className="text-cyan-400 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2">
                📊 Hunt Analyzer
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-white transition-colors">✖</button>
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4">
              <div className="text-center"><span className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">- SESSÃO ATUAL -</span></div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-md flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xl grayscale opacity-30 drop-shadow-md mb-1">⚔️</span>
                  <p className="text-white font-bold text-sm leading-tight">{huntSession.defeated}</p>
                  <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-0.5">Derrotados</p>
                </div>
                <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-md flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xl grayscale opacity-30 drop-shadow-md mb-1">⏱️</span>
                  <p className="text-white font-bold text-sm leading-tight">{huntTimeHours}h {huntTimeMinutes % 60}m</p>
                  <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-0.5">Tempo</p>
                </div>
                <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-md flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xl opacity-80 text-yellow-500 drop-shadow-md mb-1">✨</span>
                  <p className="text-white font-bold text-sm leading-tight">{huntSession.expGained.toLocaleString()}</p>
                  <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-0.5">XP Ganha</p>
                </div>
                <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-md flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xl opacity-80 text-red-500 drop-shadow-md mb-1">🛒</span>
                  <p className="text-red-400 font-bold text-sm leading-tight">-{huntSession.potionsUsed * 100}</p>
                  <p className="text-slate-500 text-[8px] uppercase font-bold tracking-widest mt-0.5">Supply</p>
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-md flex justify-between items-center mt-4">
                <span className="text-slate-300 font-bold text-[9px] uppercase tracking-widest">Saldo (Loot)</span>
                <span className="text-yellow-400 font-black text-sm drop-shadow-[0_0_10px_rgba(250,204,21,0.2)]">+{huntSession.bitsGained.toLocaleString()}</span>
              </div>
           </div>
           
           <div className="p-3 bg-[#0a0f1a] border-t border-[#1e293b]">
              <button 
                onClick={() => setActiveModal('digipedia')} 
                className="w-full bg-[#141824] border border-[#2d3748] hover:border-yellow-500/50 hover:text-yellow-400 text-slate-300 font-bold py-2.5 rounded-md text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>📖</span> Abrir Digipédia
              </button>
           </div>
        </div>
      )}

      {/* 🔥 INJEÇÃO DA INCUBADORA AQUI */}
      {activeModal === 'incubator' && (
        <IncubatorModal onClose={() => setActiveModal(null)} />
      )}

      {/* 🔥 PROTEÇÃO PARA NÃO DUPLICAR MODAIS */}
      {activeModal && activeModal !== 'quests' && activeModal !== 'incubator' && (
        <GameModals 
          activeModal={activeModal} 
          closeModal={() => setActiveModal(null)} 
          setCurrentZone={setCurrentZone} 
          handleLogout={handleLogout} 
        />
      )}
    </div>
  );
}