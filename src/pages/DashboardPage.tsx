// src/pages/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore'; 

export function DashboardPage() {
  const { 
    tamerName, bits, gems, currentEnemy, fragments, 
    ownedDigimons, myDigimons, activeDigimon, items,
    setHunt, dealDamage, synthesizeDigimon, setActiveDigimon, buyItem, useItem 
  } = useGameStore();
  
  const [activeModal, setActiveModal] = useState<'inventory' | 'shop' | 'settings' | 'map' | 'pc' | 'quests' | null>(null);
  const closeModal = () => setActiveModal(null);

  // O Dano agora escala com o Nível do Digimon Ativo!
  useEffect(() => {
    const dpsInterval = setInterval(() => {
      if (currentEnemy) {
        const activeLevel = myDigimons[activeDigimon]?.level || 1;
        dealDamage(10 + (activeLevel * 5)); // Dano Base + Bônus de Nível
      }
    }, 1000);
    return () => clearInterval(dpsInterval);
  }, [currentEnemy, activeDigimon, myDigimons, dealDamage]);

  const handleTamerClick = () => {
    if (currentEnemy) {
      const activeLevel = myDigimons[activeDigimon]?.level || 1;
      dealDamage(20 + (activeLevel * 10)); 
    }
  };

  const getEnemyStyle = () => {
    if (!currentEnemy) return '';
    if (currentEnemy.rarity === 'Chefe') return 'drop-shadow-[0_0_25px_rgba(255,215,0,0.8)] scale-125';
    if (currentEnemy.rarity === 'Elite') return 'drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-110';
    return 'drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]';
  };

  const digimonDict: Record<string, { name: string, img: string }> = {
    'koromon': { name: 'Koromon', img: 'https://wikimon.net/images/thumb/9/9f/Koromon.png/200px-Koromon.png' },
    'agumon': { name: 'Agumon', img: 'https://wikimon.net/images/6/6f/Agumon_%28Digimon_World%29.png' }
  };

  return (
    <div className="min-h-screen relative w-full h-screen overflow-hidden bg-emerald-950 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] font-sans selection:bg-digi-cyan/30">
      
      {/* MENU SUPERIOR CENTRAL */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-slate-950/90 border border-slate-700/50 rounded-md p-1.5 flex gap-2 shadow-lg backdrop-blur-sm">
        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">👤</button>
        <button onClick={() => setActiveModal('inventory')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🎒</button>
        <button onClick={() => setActiveModal('pc')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">💻</button>
        <button onClick={() => setActiveModal('map')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🗺️</button>
        <button onClick={() => setActiveModal('quests')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm relative">📜<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-slate-900"></span></button>
        <button onClick={() => setActiveModal('shop')} className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-800 transition-colors text-sm">🛒</button>
        <div className="w-px h-8 bg-slate-700 mx-1"></div> 
        <button onClick={() => setActiveModal('settings')} className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 border border-slate-600 hover:border-digi-cyan transition-colors text-sm">⚙️</button>
      </div>

      {/* PAINEL DO JOGADOR E TIME */}
      <div className="absolute top-4 left-4 w-64 z-40 bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-900 border-b border-slate-700 p-2 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-digi-gold text-sm tracking-wider uppercase">{tamerName}</h2>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest">🪙 {bits.toLocaleString()} | 💎 {gems.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-2 space-y-2">
          {ownedDigimons.map((id) => {
             const stats = myDigimons[id];
             const isActive = activeDigimon === id;
             const expProgress = (stats.exp / stats.maxExp) * 100;

             return (
               <div 
                 key={id} 
                 onClick={() => setActiveDigimon(id)}
                 className={`bg-slate-900 border ${isActive ? 'border-digi-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'border-slate-800'} rounded p-1.5 flex items-center gap-2 cursor-pointer hover:border-digi-cyan/50 transition-all`}
               >
                 <img src={digimonDict[id]?.img} className="w-10 h-10 object-contain bg-slate-950 rounded border border-slate-700" alt={digimonDict[id]?.name}/>
                 <div className="flex-1">
                   <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                     <span className="flex items-center gap-1">{isActive && <span className="text-[10px]">👑</span>} {digimonDict[id]?.name}</span>
                     <span className="text-digi-cyan">Lv.{stats.level}</span>
                   </div>
                   {/* BARRA DE EXP VIVA */}
                   <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                     <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${expProgress}%` }}></div>
                   </div>
                 </div>
               </div>
             )
          })}
        </div>
      </div>

      {/* CHAT GERAL */}
      <div className="absolute bottom-4 left-4 w-80 h-48 z-40 bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl flex flex-col overflow-hidden">
        <div className="flex bg-slate-900 border-b border-slate-700 text-[10px] font-bold tracking-widest uppercase">
          <button className="flex-1 py-1.5 border-b-2 border-digi-cyan text-digi-cyan">Mundo</button>
          <button className="flex-1 py-1.5 text-slate-500">Comércio</button>
        </div>
        <div className="flex-1 p-2 overflow-y-auto text-xs space-y-1 font-mono">
          <p><span className="text-slate-500">09:41</span> <span className="text-blue-400 font-bold">xpocho:</span> Bora farmar Koromon!</p>
        </div>
        <div className="bg-slate-900 p-1.5 border-t border-slate-700 flex gap-2">
          <input type="text" placeholder="Falar em Mundo..." className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 text-xs text-slate-200 focus:outline-none focus:border-digi-cyan" />
        </div>
      </div>

      {/* MINIMAPA */}
      <div className="absolute top-4 right-4 z-40 flex flex-col gap-3 w-48">
        <div className="bg-slate-950/95 border border-slate-700 rounded-md shadow-2xl overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-700 p-1 text-center">
            <span className="text-[10px] font-bold text-digi-cyan uppercase tracking-widest">{currentEnemy ? `Hunt: ${currentEnemy.name}` : 'Mundo Aberto'}</span>
          </div>
          <div className="h-32 bg-slate-800 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] cursor-pointer" onClick={() => setActiveModal('map')}>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-digi-cyan rounded-full border border-white shadow-[0_0_5px_cyan] animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* HOTKEYS INTEGRADAS COM A MOCHILA */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex gap-1 bg-slate-950/80 p-1.5 rounded-md border border-slate-700/50 backdrop-blur-sm shadow-2xl">
        {[ 
          { key: '1', id: 'meat', icon: '🍖', amount: items.meat || 0 }, 
          { key: '2', id: 'scan', icon: '💾', amount: items.scan || 0 }, 
          { key: '3', id: 'potion', icon: '💊', amount: items.potion || 0 }
        ].map((slot) => (
          <div key={slot.key} onClick={() => useItem(slot.id)} className="relative w-10 h-10 bg-slate-900 border border-slate-700 rounded cursor-pointer flex items-center justify-center hover:border-digi-cyan active:scale-95 transition-all">
            <span className="absolute top-0.5 left-1 text-[8px] font-mono text-slate-500">{slot.key}</span>
            <span className="text-lg">{slot.icon}</span>
            <span className="absolute bottom-0 right-1 text-[9px] font-bold font-mono text-white drop-shadow-md">{slot.amount}</span>
          </div>
        ))}
      </div>

      {/* AÇÃO PRINCIPAL */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {currentEnemy ? (
          <div className="text-center flex flex-col items-center cursor-crosshair active:scale-95 transition-transform" onClick={handleTamerClick}>
             <img src={currentEnemy.image} alt={currentEnemy.name} className={`w-32 h-32 object-contain pointer-events-none transition-all duration-300 ${getEnemyStyle()}`} />
             <div className="bg-black/70 px-4 py-1 rounded mt-4 border border-slate-700 text-center pointer-events-none">
               <div className="flex items-center gap-2 justify-center mb-1">
                 {currentEnemy.rarity !== 'Normal' && <span className={`text-[10px] font-black uppercase tracking-widest ${currentEnemy.rarity === 'Chefe' ? 'text-digi-gold' : 'text-red-400'}`}>[{currentEnemy.rarity}]</span>}
                 <span className="text-slate-200 text-sm font-bold">{currentEnemy.name}</span>
                 <span className="text-digi-cyan text-[10px] font-mono font-bold">Nv {currentEnemy.level}</span>
               </div>
               <div className="w-48 h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden relative">
                 <div className="h-full bg-red-500 transition-all duration-100 ease-out" style={{ width: `${Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100)}%` }}></div>
               </div>
             </div>
          </div>
        ) : (
          <div className="text-center bg-black/60 p-6 rounded-lg border border-slate-700 backdrop-blur-sm">
            <h2 className="text-digi-cyan font-bold tracking-widest uppercase mb-2">Você está na Zona Segura</h2>
            <button onClick={() => setActiveModal('map')} className="bg-slate-800 border border-slate-600 px-6 py-2 rounded font-bold text-xs uppercase hover:bg-slate-700 hover:border-digi-cyan transition-colors">🗺️ Abrir Mapa Mundi</button>
          </div>
        )}
      </div>

      {/* MODAIS */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-950 border border-slate-700 w-[600px] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
              <h3 className="text-digi-gold font-bold tracking-widest uppercase">
                {activeModal === 'inventory' && '🎒 Sua Mochila'}
                {activeModal === 'shop' && '🛒 Mercado Central'}
                {activeModal === 'settings' && '⚙️ Painel do Sistema'}
                {activeModal === 'map' && '🗺️ Mapa Global'}
                {activeModal === 'pc' && '💻 Digi-Bank (Incubadora)'}
                {activeModal === 'quests' && '📜 Central de Missões'}
              </h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-red-500 transition-colors font-bold text-lg">×</button>
            </div>
            <div className="p-4 h-[400px] overflow-y-auto custom-scrollbar">
              
              {/* O MAPA MUNDI */}
              {activeModal === 'map' && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 bg-blue-950/30 border border-slate-700 rounded-lg relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    <button onClick={() => { setHunt('koromon', 'Koromon', 5, 'https://wikimon.net/images/thumb/9/9f/Koromon.png/200px-Koromon.png'); closeModal(); }} className="absolute top-1/4 left-1/4 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-digi-gold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="https://wikimon.net/images/thumb/9/9f/Koromon.png/200px-Koromon.png" className="w-10 h-10 object-contain" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Koromon</p></div>
                    </button>
                    <button onClick={() => { setHunt('agumon', 'Agumon', 20, 'https://wikimon.net/images/6/6f/Agumon_%28Digimon_World%29.png'); closeModal(); }} className="absolute top-1/2 left-2/3 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-slate-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="https://wikimon.net/images/6/6f/Agumon_%28Digimon_World%29.png" className="w-10 h-10 object-contain" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Agumon</p></div>
                    </button>
                  </div>
                </div>
              )}

              {/* LOJA INTEGRADA AO ZUSTAND */}
              {activeModal === 'shop' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Comprar com Bits</span>
                      <span className="text-digi-gold font-mono">Saldo: {bits}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => buyItem('meat', 1000, 'bits', 10)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all group">
                        <div className="flex items-center gap-2"><span className="text-xl">🍖</span> <span className="text-xs font-bold text-slate-300">Carne x10</span></div>
                        <span className="text-digi-gold text-xs font-mono">1.000 Bits</span>
                      </button>
                      <button onClick={() => buyItem('potion', 2500, 'bits', 5)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all group">
                        <div className="flex items-center gap-2"><span className="text-xl">💊</span> <span className="text-xs font-bold text-slate-300">Poção x5</span></div>
                        <span className="text-digi-gold text-xs font-mono">2.500 Bits</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PC / DIGI-BANK INTEGRADO */}
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
                            <img src={data.img} className={`w-16 h-16 object-contain bg-slate-950 rounded border ${isReady ? 'border-digi-cyan' : 'border-slate-700 grayscale'}`} />
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}