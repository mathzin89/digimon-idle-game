// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore'; 
import { useAuthStore } from '../store/useAuthStore';
import { TamerPortrait } from '../components/ui/TamerPortrait';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { 
    tamerName, bits, gems, mapTargets, scanningTarget, fragments, 
    ownedDigimons, myDigimons, activeDigimon, items, isDataLoaded,
    hasCompletedTutorial, avatar, equippedOutfit, ownedOutfits, captureLog,
    setMapHunt, attackMapTarget, finishDNAScan, synthesizeDigimon, setActiveDigimon, 
    buyItem, useItem, equipOutfit, buyOutfit, loadProgress, saveProgress
  } = useGameStore();
  
  const [activeModal, setActiveModal] = useState<'inventory' | 'shop' | 'settings' | 'map' | 'pc' | 'quests' | 'profile' | 'digipedia' | null>(null);
  const [profileTab, setProfileTab] = useState<'main' | 'outfits' | 'logs'>('main');

  const [tamerPos, setTamerPos] = useState({ x: 50, y: 50 });
  const [directionImg, setDirectionImg] = useState('/andar-baixo.png');
  const [frameStep, setFrameStep] = useState(0);

  const closeModal = () => setActiveModal(null);
  const tamerGender = (avatar === 'sora' || avatar === 'mimi') ? 'female' : 'male';

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
    if (isDataLoaded && hasCompletedTutorial && (!mapTargets || mapTargets.length === 0) && !scanningTarget) {
      setMapHunt('koromon', 'Koromon', 5, '/koromon.gif', 'Normal');
    }
  }, [isDataLoaded, hasCompletedTutorial, mapTargets?.length, scanningTarget, setMapHunt]);

  const walkSequence = [0, 1, 2, 1];

  useEffect(() => {
    const frameTimer = setInterval(() => {
      setFrameStep((prev) => (prev + 1) % walkSequence.length);
    }, 280); 
    return () => clearInterval(frameTimer);
  }, []);

  const tamerFrame = walkSequence[frameStep];

  // Motor de Roaming no Mapa
  useEffect(() => {
    if (scanningTarget || !mapTargets || mapTargets.length === 0 || !isDataLoaded || !hasCompletedTutorial) return;

    const roamInterval = setInterval(() => {
      setTamerPos((prev) => {
        const target = mapTargets[0];
        if (!target) return prev;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > Math.abs(dy)) {
          setDirectionImg(dx > 0 ? '/andar-dir.png' : '/andar-esq.png');
        } else {
          setDirectionImg(dy > 0 ? '/andar-baixo.png' : '/andar-cima.png');
        }

        if (dist < 4) {
          const balancedDamage = 4 + ((myDigimons[activeDigimon]?.level || 1) * 2);
          attackMapTarget(target.instanceId, balancedDamage);
          return prev;
        }

        const speed = 0.08; 
        const stepX = (dx / dist) * speed;
        const stepY = (dy / dist) * speed;

        return {
          x: prev.x + stepX,
          y: prev.y + stepY,
        };
      });
    }, 30);

    return () => clearInterval(roamInterval);
  }, [mapTargets, scanningTarget, activeDigimon, myDigimons, attackMapTarget, isDataLoaded, hasCompletedTutorial]);

  // Cronômetro da Cinemática CSS de Scan de DNA
  useEffect(() => {
    if (scanningTarget) {
      // 2800ms é o tempo exato para a animação CSS completar o "suck-in" antes de voltar ao mapa
      const scanTimer = setTimeout(() => {
        finishDNAScan(scanningTarget);
      }, 2800);
      return () => clearTimeout(scanTimer);
    }
  }, [scanningTarget, finishDNAScan]);

  const digimonDict: Record<string, { name: string, img: string }> = {
    'koromon': { name: 'Koromon', img: '/koromon.gif' }, 
    'agumon': { name: 'Agumon', img: '/agumon.gif' }, 
    'gabumon': { name: 'Gabumon', img: '/gabumon.gif' }, 
    'palmon': { name: 'Palmon', img: '/palmon.gif' } 
  };

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

  if (!hasCompletedTutorial) return null;

  const positions = ['0%', '50%', '100%'];

  return (
    <div className="min-h-screen relative w-full h-screen overflow-hidden bg-emerald-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] font-sans selection:bg-digi-cyan/30">
      
      {/* ESTILOS CSS INJETADOS PARA A CINEMÁTICA DO DNA SCAN */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in-scanner {
          0% { transform: translateX(-150px); opacity: 0; }
          10% { transform: translateX(0); opacity: 1; }
          90% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-150px); opacity: 0; }
        }
        @keyframes beam-shoot {
          0% { clip-path: polygon(0 50%, 0 50%, 0 50%, 0 50%); opacity: 0; }
          15% { clip-path: polygon(0 45%, 100% 0, 100% 100%, 0 55%); opacity: 0.8; }
          80% { clip-path: polygon(0 45%, 100% 0, 100% 100%, 0 55%); opacity: 0.6; }
          100% { clip-path: polygon(0 50%, 0 50%, 0 50%, 0 50%); opacity: 0; }
        }
        @keyframes digimon-absorb {
          0% { transform: scale(1) translateX(0); filter: brightness(1) drop-shadow(0 0 10px #00e5ff); opacity: 0; }
          10% { transform: scale(1) translateX(0); filter: brightness(1.2) drop-shadow(0 0 20px #00e5ff); opacity: 1; }
          50% { transform: scale(1.1) translateX(0); filter: brightness(2) drop-shadow(0 0 30px #00e5ff) hue-rotate(45deg); opacity: 1; }
          85% { transform: scale(0.3) translateX(-350px) skewX(20deg); filter: brightness(3) blur(2px); opacity: 0.8; }
          100% { transform: scale(0) translateX(-450px); filter: brightness(5) blur(10px); opacity: 0; }
        }
        @keyframes progress-fill {
          0% { width: 0%; }
          70% { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes particle-suck {
          0% { transform: translateX(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateX(-250px) scale(0); opacity: 0; }
        }
      `}} />

      {/* MENU SUPERIOR */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 border border-slate-700/50 rounded-md p-1.5 flex gap-2 shadow-lg backdrop-blur-sm">
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

      {/* PAINEL DO JOGADOR E TIME */}
      <div className="absolute top-4 left-4 w-64 z-40 bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden flex flex-col">
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
             return (
               <div key={id} onClick={() => setActiveDigimon(id)} className={`bg-slate-900 border ${isActive ? 'border-digi-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'border-slate-800'} rounded p-1.5 flex items-center gap-2 cursor-pointer hover:border-digi-cyan/50 transition-all`}>
                 <img 
                   src={digimonDict[id]?.img} 
                   className="w-10 h-10 object-contain bg-slate-950 rounded border border-slate-700 p-1 pixelated" 
                   alt={digimonDict[id]?.name}
                   onError={(e) => { e.currentTarget.style.display = 'none'; }}
                 />
                 <div className="flex-1">
                   <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                     <span className="flex items-center gap-1">{isActive && <span className="text-[10px]">👑</span>} {digimonDict[id]?.name}</span>
                     <span className="text-digi-cyan">Lv.{stats?.level || 1}</span>
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

      {/* MINIMAPA */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-3 w-48">
        <div className="bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-700 p-1 text-center">
            <span className="text-[10px] font-bold text-digi-cyan uppercase tracking-widest">Mundo Aberto</span>
          </div>
          <div className="h-32 bg-slate-800 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-pointer" onClick={() => setActiveModal('map')}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-digi-cyan rounded-full border border-white shadow-[0_0_5px_cyan] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* HOTKEYS (ITENS) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1 bg-slate-950/80 p-1.5 rounded-md border border-slate-700/50 backdrop-blur-sm shadow-2xl">
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

      {/* === MAPA ABERTO E NOVA CUTSCENE DE ABSORÇÃO (100% CÓDIGO/DOM) === */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {scanningTarget ? (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50">
            <div className="relative w-[800px] h-[400px] flex items-center justify-center">
              
              {/* Arma do Scanner (Entra da esquerda e fica) */}
              <img 
                src="/scanner.png" 
                alt="DNA Scanner" 
                className="absolute left-[50px] z-30 w-72 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                style={{ animation: 'slide-in-scanner 2.8s ease-in-out forwards' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              {/* Feixe de Luz Holográfica (Abre como um cone) */}
              <div 
                className="absolute left-[280px] w-[300px] h-[200px] bg-gradient-to-r from-cyan-400/80 via-cyan-400/30 to-transparent z-10 filter blur-sm"
                style={{ animation: 'beam-shoot 2.8s ease-in-out forwards' }}
              />

              {/* Partículas voando para dentro da arma */}
              <div className="absolute left-[300px] w-[250px] h-[150px] z-20 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-2 h-2 bg-cyan-300 shadow-[0_0_5px_white]"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: '100%',
                      animation: `particle-suck 0.6s linear infinite ${Math.random() * 1.5}s`
                    }}
                  />
                ))}
              </div>

              {/* O Digimon (Do lado direito, encolhendo e sendo sugado para a esquerda) */}
              <div 
                className="absolute right-[100px] z-20 flex flex-col items-center"
                style={{ animation: 'digimon-absorb 2.8s ease-in-out forwards' }}
              >
                <img 
                  src={scanningTarget.image} 
                  alt={scanningTarget.name} 
                  className="w-32 h-32 object-contain pixelated"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>

              {/* HUD / Barrinha Embaixo do Scanner */}
              <div className="absolute bottom-[20px] left-[50px] bg-slate-900 border border-cyan-500/50 p-3 rounded text-center w-72 shadow-[0_0_20px_rgba(0,229,255,0.2)] animate-[slide-in-scanner_2.8s_ease-in-out_forwards]">
                <h2 className="text-digi-cyan font-black text-sm tracking-widest uppercase mb-1">SCAN V1.1</h2>
                <p className="text-slate-400 font-mono text-[10px] mb-2 uppercase tracking-wider text-left">Extraindo: {scanningTarget.name}</p>
                <div className="w-full h-2 bg-slate-950 border border-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full shadow-[0_0_10px_#00e5ff]" style={{ animation: 'progress-fill 2.8s linear forwards' }}></div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            
            {/* O SEU TAMER COM CAMINHADA FLUIDA */}
            <div 
              className="absolute flex items-center gap-3 z-20 pointer-events-none transition-all duration-100 ease-linear"
              style={{ top: `${tamerPos.y}%`, left: `${tamerPos.x}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div 
                className="pixelated drop-shadow-[0_6px_6px_rgba(0,0,0,0.7)]" 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  backgroundImage: `url('${directionImg}')`,
                  backgroundSize: '300% 100%',
                  backgroundPosition: `${positions[tamerFrame]} 0%`,
                  imageRendering: 'pixelated'
                }} 
              />
              {activeDigimon && (
                <img 
                  src={digimonDict[activeDigimon]?.img} 
                  alt="Seu Digimon" 
                  className="w-14 h-14 object-contain pixelated drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] scale-x-[-1] animate-bounce"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>

            {/* MONSTROS ERRANTES ESPALHADOS PELO MAPA */}
            {mapTargets && mapTargets.map((target) => (
              <div 
                key={target.instanceId}
                className="absolute flex flex-col items-center cursor-pointer group transition-all z-30"
                style={{ top: `${target.y}%`, left: `${target.x}%`, transform: 'translate(-50%, -50%)' }}
              >
                <img 
                  src={target.image} 
                  alt={target.name} 
                  className="w-20 h-20 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] pixelated animate-bounce"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="bg-black/90 px-2 py-0.5 rounded border border-slate-700 text-center mt-1 w-24 shadow-lg">
                  <span className="text-slate-200 text-[10px] font-bold truncate block">{target.name}</span>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-0.5">
                    <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.max(0, (target.hp / target.maxHp) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === MODAIS COMPLETOS === */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-700 w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden">
            
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
              <h3 className="text-digi-gold font-bold tracking-widest uppercase flex items-center gap-2">
                {activeModal === 'inventory' && '🎒 Mochila de Itens'}
                {activeModal === 'shop' && '🛒 Mercado Central'}
                {activeModal === 'map' && '🗺️ Mapa Global'}
                {activeModal === 'pc' && '💻 Digi-Bank (Incubadora)'}
                {activeModal === 'quests' && '📜 Central de Missões'}
                {activeModal === 'profile' && '👤 Perfil do Tamer'}
                {activeModal === 'digipedia' && '📖 Digipedia (Enciclopédia)'}
                {activeModal === 'settings' && '⚙️ Configurações do Jogo'}
              </h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-red-500 transition-colors font-bold text-lg">×</button>
            </div>
            
            <div className="p-4 h-[400px] overflow-y-auto">
              {activeModal === 'profile' && (
                <div className="flex flex-col h-full">
                  <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2 mb-4">
                    <button onClick={() => setProfileTab('main')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'main' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>👤 Dados</button>
                    <button onClick={() => setProfileTab('outfits')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'outfits' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>👕 Outfits</button>
                    <button onClick={() => setProfileTab('logs')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'logs' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>📜 Log de Caça</button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {profileTab === 'main' && (
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 bg-slate-950 rounded-full border-4 border-digi-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)] overflow-hidden flex items-center justify-center relative">
                          <TamerPortrait gender={tamerGender} />
                        </div>
                        <div className="text-center space-y-1 w-full">
                          <div className="flex items-center justify-center gap-2">
                            <span className="bg-blue-600/30 border border-blue-500 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">VIP Ativo</span>
                            <h2 className="text-xl font-bold text-slate-200 uppercase tracking-widest">{user?.displayName || tamerName}</h2>
                          </div>
                          <p className="text-xs text-slate-500 font-mono">Nível 397 • Desde 01/08/2026</p>
                        </div>
                        <button onClick={handleLogout} className="w-full bg-red-950/40 border border-red-900 text-red-400 font-bold py-2.5 rounded uppercase tracking-widest hover:bg-red-900 hover:text-white transition-colors">
                          Sair do Jogo (Logout)
                        </button>
                      </div>
                    )}

                    {profileTab === 'outfits' && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-digi-gold uppercase tracking-widest mb-2">Escolhe a tua Aparência</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div onClick={() => equipOutfit('default')} className={`bg-slate-900 border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${equippedOutfit === 'default' ? 'border-digi-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}>
                            <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center mb-2 overflow-hidden border border-slate-700">
                              <TamerPortrait gender={tamerGender} />
                            </div>
                            <span className="font-bold text-xs text-slate-200 uppercase">Treinador Clássico</span>
                            <span className="text-[10px] text-emerald-400 mt-1">Equipada ✓</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {profileTab === 'logs' && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-digi-cyan uppercase tracking-widest mb-2">Registo de Inimigos e Capturas</h4>
                        {captureLog && captureLog.length > 0 ? (
                          <div className="space-y-2">
                            {captureLog.map((log, index) => (
                              <div key={index} className="bg-slate-900 border border-slate-800 p-2.5 rounded flex justify-between items-center text-xs font-mono">
                                <span className="text-slate-200">⚔️ Derrotaste <strong className="text-digi-gold">{log.name}</strong> (Nível {log.level})</span>
                                <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">
                            Ainda nenhum registo de caça gravado.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeModal === 'inventory' && (
                <div className="grid grid-cols-4 gap-3">
                  {[ 
                    { id: 'meat', name: 'Pedaço de Carne', icon: '🍖', desc: 'Restaura a vida do Digimon.' },
                    { id: 'scan', name: 'Data Scan', icon: '💾', desc: 'Aumenta a chance de captura.' },
                    { id: 'potion', name: 'Poção HP', icon: '💊', desc: 'Cura ferimentos.' }
                  ].map((item) => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 rounded p-3 flex flex-col items-center gap-2 relative group hover:border-digi-cyan transition-colors cursor-pointer">
                      <span className="absolute top-1 right-2 text-[10px] font-mono text-digi-gold font-bold">x{items[item.id] || 0}</span>
                      <span className="text-3xl mt-2">{item.icon}</span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 text-center leading-tight">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'shop' && (
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => buyItem('meat', 1000, 'bits', 10)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all">
                      <div className="flex items-center gap-2"><span className="text-xl">🍖</span> <span className="text-xs font-bold text-slate-300">Carne x10</span></div>
                      <span className="text-digi-gold text-xs font-mono">1.000 Bits</span>
                    </button>
                    <button onClick={() => buyItem('potion', 2500, 'bits', 5)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all">
                      <div className="flex items-center gap-2"><span className="text-xl">💊</span> <span className="text-xs font-bold text-slate-300">Poção x5</span></div>
                      <span className="text-digi-gold text-xs font-mono">2.500 Bits</span>
                    </button>
                 </div>
              )}

              {activeModal === 'pc' && (
                <div className="space-y-4">
                  {Object.keys(fragments).length === 0 ? (
                    <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500">Nenhum fragmento coletado ainda.</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(fragments).map(([id, amount]) => {
                        const progress = Math.min((amount / 50) * 100, 100);
                        const isReady = amount >= 50 && !ownedDigimons.includes(id);
                        const data = digimonDict[id] || { name: 'Desconhecido', img: '' };
                        return (
                          <div key={id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center gap-4">
                            <img src={data.img} className={`w-12 h-12 object-contain bg-slate-950 rounded border ${isReady ? 'border-digi-cyan' : 'border-slate-700 grayscale'} pixelated`} />
                            <div className="flex-1">
                              <h4 className="text-slate-200 font-bold uppercase tracking-wider mb-2">{data.name}</h4>
                              <div className="w-full h-3 bg-slate-950 border border-slate-700 rounded-full overflow-hidden relative">
                                <div className={`h-full transition-all ${isReady ? 'bg-digi-cyan' : 'bg-purple-600'}`} style={{ width: `${progress}%` }}></div>
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">{amount} / 50 Data</span>
                              </div>
                            </div>
                            <button onClick={() => synthesizeDigimon(id)} disabled={!isReady} className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${isReady ? 'bg-digi-cyan text-slate-900 hover:bg-cyan-400' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}>Sintetizar</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'quests' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-digi-gold uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Missões Diárias</h4>
                    <div className="bg-slate-900 border border-digi-cyan/30 p-3 rounded flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-200">Bater Cartão</p>
                        <p className="text-[10px] text-slate-400">Faça login no jogo hoje.</p>
                      </div>
                      <button className="bg-digi-cyan text-slate-900 px-3 py-1 rounded text-[10px] font-bold uppercase">Resgatar</button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'digipedia' && (
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(digimonDict).map(([id, data]) => {
                    const hasDigimon = ownedDigimons.includes(id);
                    return (
                      <div key={id} className={`bg-slate-900 border ${hasDigimon ? 'border-digi-cyan/50' : 'border-slate-800'} rounded p-2 flex flex-col items-center justify-center gap-2 aspect-square`}>
                        <img src={data.img} alt={data.name} className={`w-12 h-12 object-contain p-1 ${hasDigimon ? '' : 'brightness-0 opacity-30'} pixelated`} />
                        <span className={`text-[10px] font-bold uppercase ${hasDigimon ? 'text-slate-200' : 'text-slate-600'}`}>{hasDigimon ? data.name : '???'}</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeModal === 'settings' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300">Música de Fundo</span>
                      <button className="bg-digi-cyan text-slate-900 text-xs font-bold px-3 py-1 rounded uppercase">Ligado</button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'map' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-blue-950/30 border border-slate-700 rounded-lg relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    <button onClick={() => { setMapHunt('koromon', 'Koromon', 5, '/koromon.gif', 'Normal'); closeModal(); }} className="absolute top-1/4 left-1/4 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-digi-gold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="/koromon.gif" className="w-10 h-10 object-contain pixelated" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Koromon</p></div>
                    </button>
                    <button onClick={() => { setMapHunt('agumon', 'Agumon', 20, '/agumon.gif', 'Normal'); closeModal(); }} className="absolute top-1/2 left-2/3 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-slate-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="/agumon.gif" className="w-10 h-10 object-contain pixelated" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Agumon</p></div>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}