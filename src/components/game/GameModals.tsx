// src/components/game/GameModals.tsx
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TamerPortrait } from '../ui/TamerPortrait';
import { MenuSprite, getDigimonVisuals, digimonDict } from '../../utils/digimonVisuals';
import { ModalType } from './GameWorld';

interface GameModalsProps { activeModal: ModalType; closeModal: () => void; setCurrentZone: (zone: 'floresta' | 'cidade') => void; handleLogout: () => void; }

export function GameModals({ activeModal, closeModal, setCurrentZone, handleLogout }: GameModalsProps) {
  const { user } = useAuthStore();
  const { 
    tamerName, bits, gems, avatar, equippedOutfit, captureLog, fragments, items,
    ownedDigimons, buyItem, startIncubation, hatchEgg, incubatingEgg, 
    setMapHunt, equipOutfit, soundEnabled, toggleSound, ownedGear, equippedGear, equipGear, sellFragmentForGems, myDigimons, useItem,
    autoHelper, updateAutoHelper, huntSession,
    bpp, isPremium, gamePassMissions, buyPremium, claimMission,
    activeDigimon, serverMaps, changeMap, storeItems // <- LENDO DO CMS
  } = useGameStore();

  const [profileTab, setProfileTab] = useState<'main' | 'gear' | 'outfits'>('main');
  const [shopTab, setShopTab] = useState<'local' | 'online'>('local');
  const tamerGender = (avatar === 'sora' || avatar === 'mimi') ? 'female' : 'male';
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (activeModal === 'pc' && incubatingEgg) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [activeModal, incubatingEgg]);

  if (activeModal === 'map') {
    const mapsList = Object.values(serverMaps || {});
    const myLevel = myDigimons[activeDigimon]?.level || 1;

    return (
      <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
        <div className="bg-[#0a0f1a] border border-[#1e293b] w-[90vw] h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden font-sans">
           <div className="bg-[#111827] border-b border-[#1e293b] p-3 flex justify-between items-center">
              <h3 className="text-[#e2c779] font-bold tracking-widest uppercase flex items-center gap-2 text-xs">🗺️ Seleção de Zona</h3>
              <div className="flex gap-2">
                <button onClick={closeModal} className="text-slate-400 hover:text-white px-2 py-0.5 border border-[#1e293b] rounded bg-[#0a0f1a] ml-2 font-bold">✖</button>
              </div>
           </div>
           
           <div className="flex-1 p-6 bg-[#050811] overflow-y-auto custom-scrollbar">
             {mapsList.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full opacity-50">
                 <span className="text-4xl mb-4 grayscale">🗺️</span>
                 <p className="text-white font-bold uppercase tracking-widest text-sm">Nenhuma zona mapeada</p>
                 <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Crie um mapa no Admin.Sys</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {mapsList.map(map => {
                   const canEnter = myLevel >= map.minLevel;
                   return (
                     <div 
                       key={map.id} 
                       onClick={() => {
                         if (canEnter) {
                           changeMap(map.id);
                           closeModal();
                           setCurrentZone('floresta'); 
                         }
                       }}
                       className={`relative rounded-xl border overflow-hidden group transition-all ${canEnter ? 'border-[#1e293b] hover:border-cyan-400 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-[#1e293b] opacity-50 cursor-not-allowed'}`}
                     >
                       <div className="h-32 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${map.bgImg || '/map-bg.png'}')` }} />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/90 to-[#0a0f1a]/20" />
                       
                       <div className="absolute bottom-0 left-0 right-0 p-4">
                         <h4 className="text-white font-black uppercase tracking-widest text-sm drop-shadow-md mb-3">{map.name}</h4>
                         <div className="flex flex-col gap-2">
                           <div className="flex items-center justify-between">
                             <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest ${canEnter ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                               {canEnter ? 'Acesso Liberado' : `Requer Nv. ${map.minLevel}`}
                             </span>
                           </div>
                           <div className="flex flex-wrap gap-1.5 mt-1">
                             <span className="text-[8px] text-slate-500 uppercase tracking-widest w-full mb-0.5">Habitantes:</span>
                             {map.spawns.split(',').map((s, i) => s.trim() && (
                               <span key={i} className="bg-[#111827] border border-[#1e293b] text-cyan-400 text-[8px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                                  {s.trim()}
                               </span>
                             ))}
                           </div>
                         </div>
                       </div>

                       {!canEnter && (
                         <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                           <span className="text-red-500 text-4xl drop-shadow-[0_0_15px_black]">🔒</span>
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (activeModal === 'gamepass') {
    return (
      <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-auto">
        <div className="bg-[#0a0f1a] border border-[#1e293b] w-[600px] max-h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden font-sans">
          <div className="flex justify-between items-center px-4 py-3 bg-[#111827] border-b border-[#1e293b]">
             <h3 className="text-white font-bold tracking-widest uppercase flex items-center gap-2 text-[12px]">🏅 Game Pass</h3>
             <div className="flex items-center gap-4">
               <div className="bg-[#eab308]/20 border border-[#eab308]/50 text-[#facc15] px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-[inset_0_0_10px_rgba(234,179,8,0.2)]">⭐ {bpp} BPP</div>
               <button onClick={closeModal} className="text-slate-500 hover:text-red-500 transition-colors font-bold text-lg leading-none">✖</button>
             </div>
          </div>
          <div className="px-4 py-4 border-b border-[#1e293b]">
             <button onClick={buyPremium} disabled={isPremium} className={`w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-[11px] shadow-lg transition-colors uppercase tracking-widest ${isPremium ? 'bg-green-600/20 text-green-400 border border-green-500/50 cursor-not-allowed' : 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white'}`}>
                {isPremium ? '👑 Premium Desbloqueado' : '👑 Desbloquear o Premium - 💎 15'}
             </button>
          </div>
          <div className="px-4 py-3 border-b border-[#1e293b]">
             <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Trilha de Recompensas</h4>
             <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
               {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => (
                  <div key={tier} className="flex flex-col gap-1.5 min-w-[55px]">
                     <div className="text-center text-[10px] font-bold text-slate-300">T{tier}</div>
                     <div className={`border rounded p-1.5 flex flex-col items-center justify-center relative h-[55px] ${bpp >= tier * 10 ? 'bg-green-900/20 border-green-500/30' : 'bg-[#111827] border-[#1e293b]'}`}>
                        <span className="text-lg drop-shadow-md">🍖</span>
                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">x{tier * 10}</span>
                        {bpp >= tier * 10 && <span className="absolute top-0.5 right-0.5 text-green-400 text-[10px] drop-shadow-[0_0_2px_black]">✓</span>}
                     </div>
                     <div className={`border rounded p-1.5 flex flex-col items-center justify-center relative h-[55px] ${isPremium && bpp >= tier * 10 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-[#111827] border-[#1e293b]'}`}>
                        <span className="text-lg drop-shadow-md">💎</span>
                        <span className="text-[8px] font-bold text-slate-400 mt-0.5">x{tier * 2}</span>
                        {!isPremium && <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-sm backdrop-blur-[1px] rounded">🔒</span>}
                        {isPremium && bpp >= tier * 10 && <span className="absolute top-0.5 right-0.5 text-green-400 text-[10px] drop-shadow-[0_0_2px_black]">✓</span>}
                     </div>
                  </div>
               ))}
             </div>
          </div>
          <div className="px-4 py-3 flex-1 overflow-y-auto custom-scrollbar">
             <h4 className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-3">Missões (Ganhe BPP)</h4>
             <div className="space-y-2">
               {gamePassMissions.map(m => {
                 const visual = digimonDict[m.targetId] || { menuImg: '' };
                 return (
                   <div key={m.id} className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 flex items-center gap-3 hover:border-[#334155] transition-colors">
                      <div className="w-10 h-10 bg-[#0a0f1a] border border-[#1e293b] rounded-full flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                         <img src={visual.menuImg} className="w-7 h-7 object-contain" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-[11px] font-bold text-white mb-1.5 uppercase tracking-wide">{m.desc}</h5>
                        <div className="w-full h-1.5 bg-[#0a0f1a] rounded-full overflow-hidden border border-[#1e293b]">
                          <div className="h-full bg-[#2563eb]" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}></div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 font-mono">{m.current}/{m.target} • +{m.reward} BPP</p>
                      </div>
                      <button 
                        onClick={() => claimMission(m.id)}
                        disabled={m.current < m.target || m.claimed}
                        className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors ${m.claimed ? 'bg-green-500/10 text-green-400 border border-green-500/30' : m.current >= m.target ? 'bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-[#1e293b] text-slate-500 cursor-not-allowed'}`}
                      >
                        {m.claimed ? 'Concluído' : 'Resgatar'}
                      </button>
                   </div>
                 )
               })}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0a0f1a] border border-[#1e293b] w-[600px] max-h-[85vh] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden font-sans relative">
        
        <div className="p-4 flex justify-between items-center border-b border-[#1e293b] relative bg-[#0a0f1a]">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
          <h3 className="text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-2 text-[11px] ml-2">
            {activeModal === 'inventory' && '🎒 Mochila de Itens'}
            {activeModal === 'shop' && '🛒 Mercado'}
            {activeModal === 'pc' && '💻 Digi-Bank'}
            {activeModal === 'profile' && '👤 Perfil'}
            {activeModal === 'digipedia' && '📖 Digipedia'}
            {activeModal === 'settings' && '⚙️ Auto-Helper'}
          </h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-cyan-400 transition-colors font-bold text-lg leading-none">✖</button>
        </div>
        
        <div className="p-5 overflow-y-auto custom-scrollbar">

          {/* MOCHILA (INVENTORY) */}
          {activeModal === 'inventory' && (
            <div className="space-y-4">
               <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-lg text-center shadow-sm mb-4">
                  <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-widest">Suprimentos de Caça</p>
                  <p className="text-slate-500 text-[9px] mt-1 tracking-widest uppercase">Use seus itens para manter seu Digimon em combate.</p>
               </div>
               
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg flex flex-col items-center hover:border-[#334155] transition-colors">
                     <span className="text-4xl mb-2 drop-shadow-md">🍖</span>
                     <span className="text-white text-[11px] font-bold uppercase tracking-widest">Carne</span>
                     <span className="text-slate-400 text-[9px] mb-3 font-mono">Qtd: {items.meat || 0}</span>
                     <button onClick={() => useItem('meat')} className="bg-[#1e293b] hover:bg-[#334155] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-md w-full transition-colors">Usar (Cura 30)</button>
                  </div>
                  <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg flex flex-col items-center hover:border-[#334155] transition-colors">
                     <span className="text-4xl mb-2 drop-shadow-md">💊</span>
                     <span className="text-white text-[11px] font-bold uppercase tracking-widest">Poção</span>
                     <span className="text-slate-400 text-[9px] mb-3 font-mono">Qtd: {items.potion || 0}</span>
                     <button onClick={() => useItem('potion')} className="bg-[#1e293b] hover:bg-[#334155] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-md w-full transition-colors">Usar (Cura 100)</button>
                  </div>
                  <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg flex flex-col items-center hover:border-[#334155] transition-colors">
                     <span className="text-4xl mb-2 drop-shadow-md">💾</span>
                     <span className="text-white text-[11px] font-bold uppercase tracking-widest">Data Scan</span>
                     <span className="text-slate-400 text-[9px] mb-3 font-mono">Qtd: {items.scan || 0}</span>
                     <button className="bg-[#0a0f1a] border border-[#1e293b] text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-md w-full cursor-not-allowed">Automático</button>
                  </div>
               </div>
            </div>
          )}
          
          {/* PROFILE */}
          {activeModal === 'profile' && (
            <div className="flex flex-col h-full">
              <div className="flex border-b border-[#1e293b] pb-3 gap-3 mb-5">
                <button onClick={() => setProfileTab('main')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${profileTab === 'main' ? 'bg-[#111827] border border-[#1e293b] text-cyan-400' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}>👤 Dados</button>
                <button onClick={() => setProfileTab('gear')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${profileTab === 'gear' ? 'bg-[#111827] border border-[#1e293b] text-cyan-400' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}>⚔️ Gear</button>
                <button onClick={() => setProfileTab('outfits')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${profileTab === 'outfits' ? 'bg-[#111827] border border-[#1e293b] text-cyan-400' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}>👕 Outfits</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {profileTab === 'main' && (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-24 h-24 bg-[#111827] rounded-full border-2 border-cyan-400 overflow-hidden flex items-center justify-center relative shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      <TamerPortrait gender={tamerGender} />
                    </div>
                    <div className="text-center space-y-1 w-full">
                      <h2 className="text-xl font-bold text-white uppercase tracking-widest drop-shadow-md">{user?.displayName || tamerName}</h2>
                      <p className="text-[10px] text-yellow-400 font-bold tracking-widest uppercase">VIP Status: Ativo</p>
                      <p className="text-[10px] text-cyan-400 font-mono mt-2 tracking-widest">Dano Bônus: {equippedGear ? '+50%' : '0%'}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full bg-[#3f1922] border border-[#7f1d1d] text-[#fca5a5] font-bold py-2.5 rounded-md uppercase tracking-widest hover:bg-[#7f1d1d] hover:text-white transition-colors text-[10px]">Logout</button>
                  </div>
                )}
                {profileTab === 'gear' && (
                  <div className="space-y-4">
                    {ownedGear.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-[#1e293b] rounded-lg text-slate-500 text-[10px] tracking-widest uppercase">Sem gear raro.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {ownedGear.includes('garra_combate') && (
                          <div onClick={() => equipGear('garra_combate')} className={`bg-[#111827] border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${equippedGear === 'garra_combate' ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'border-[#1e293b] hover:border-[#334155]'}`}>
                            <span className="text-4xl mb-2 drop-shadow-[0_0_10px_red]">🩸</span>
                            <span className="font-bold text-[10px] text-slate-200 uppercase tracking-widest text-center">Garra de Combate</span>
                            <span className="text-[10px] text-red-400 mt-1 font-black">+50% DANO</span>
                            {equippedGear === 'garra_combate' && <span className="text-[9px] text-cyan-400 mt-1 font-bold tracking-widest uppercase">Equipada</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {profileTab === 'outfits' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div onClick={() => equipOutfit('default')} className={`bg-[#111827] border rounded-lg p-4 flex flex-col items-center cursor-pointer transition-all ${equippedOutfit === 'default' ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'border-[#1e293b] hover:border-[#334155]'}`}>
                        <div className="w-16 h-16 bg-[#000] rounded-full flex items-center justify-center mb-2 overflow-hidden border border-[#1e293b]">
                          <TamerPortrait gender={tamerGender} />
                        </div>
                        <span className="font-bold text-[10px] text-slate-200 uppercase tracking-widest">Clássico</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUTO-HELPER (Combinado Potion e Scan) */}
          {activeModal === 'settings' && (
            <div className="space-y-4">
              <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg flex items-center justify-between">
                 <div>
                   <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-widest">Música e Efeitos (SFX)</span>
                 </div>
                 <button onClick={toggleSound} className={`text-[10px] font-bold px-4 py-2 rounded-md uppercase tracking-widest transition-colors border ${soundEnabled ? 'bg-[#0f2933] border-[#22d3ee] text-cyan-400' : 'bg-transparent border-[#334155] text-slate-500 hover:border-slate-400'}`}>
                   {soundEnabled ? 'ON' : 'OFF'}
                 </button>
              </div>

              <div className="bg-[#111827] border border-[#1e293b] rounded-lg overflow-hidden p-4 space-y-6">
                <div className="border-b border-[#1e293b] pb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <input type="checkbox" checked={autoHelper.autoPotion} onChange={(e) => updateAutoHelper({ autoPotion: e.target.checked })} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
                    <span className="font-bold text-[12px] text-white flex items-center gap-2 uppercase tracking-widest">💊 Auto-Potion</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#0a0f1a] border border-[#1e293b] p-3 rounded-md">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Curar com HP ≤</span>
                     <select value={autoHelper.potionThreshold} onChange={(e) => updateAutoHelper({ potionThreshold: Number(e.target.value) })} className="bg-[#111827] border border-[#1e293b] text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded-md outline-none cursor-pointer tracking-widest">
                       <option value={90}>90%</option>
                       <option value={75}>75%</option>
                       <option value={50}>50%</option>
                       <option value={25}>25%</option>
                     </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <input type="checkbox" checked={autoHelper.autoScan} onChange={(e) => updateAutoHelper({ autoScan: e.target.checked })} className="w-4 h-4 accent-cyan-400 cursor-pointer" />
                    <span className="font-bold text-[12px] text-white flex items-center gap-2 uppercase tracking-widest">💾 Auto-Scan (Catch)</span>
                  </div>
                  <div className="bg-[#0a0f1a] border border-[#1e293b] p-3 rounded-md flex justify-between items-center">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Scans Disponíveis:</span>
                     <div className="bg-[#111827] border border-[#1e293b] px-3 py-1.5 rounded-md flex items-center gap-2 shadow-inner">
                       <span className="text-cyan-400 text-[11px] font-bold tracking-widest">{items.scan || 0}</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOG DE CAPTURAS (DIGIPEDIA) */}
          {activeModal === 'digipedia' && (
            <div className="flex flex-col h-full space-y-3">
              <div className="flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-[#1e293b]">
                 <span className="text-[10px] text-white font-bold uppercase tracking-widest">Total Capturado: <span className="text-cyan-400">{captureLog.length}</span></span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                 {captureLog.length === 0 ? <p className="text-center text-slate-500 text-[10px] uppercase tracking-widest py-8">Nenhum registro.</p> : captureLog.map((log, i) => (
                   <div key={i} className="bg-[#111827] border border-[#1e293b] p-3 rounded-lg flex justify-between items-center hover:border-[#334155] transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-full p-1.5 shadow-inner">
                          <img src={digimonDict[log.name.toLowerCase()]?.menuImg || '/koromon-init.png'} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]" />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-200 font-bold tracking-widest uppercase">{log.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] text-cyan-400 font-bold font-mono">Lv.{log.level}</span>
                             <span className={`text-[9px] font-bold uppercase tracking-widest ${log.rarity === 'Divino' ? 'text-yellow-400' : log.rarity === 'Chefe' ? 'text-red-400' : log.rarity === 'Elite' ? 'text-blue-400' : 'text-slate-400'}`}>{log.rarity}</span>
                          </div>
                        </div>
                     </div>
                     <div className="text-right">
                       <span className="text-[9px] text-slate-500 font-mono tracking-wider">{log.timestamp}</span>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* SHOP */}
          {activeModal === 'shop' && (
             <div className="flex flex-col h-full">
               <div className="flex border-b border-[#1e293b] pb-3 gap-3 mb-5">
                 <button onClick={() => setShopTab('local')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${shopTab === 'local' ? 'bg-[#111827] border border-[#1e293b] text-cyan-400' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}>🛒 NPC Local</button>
                 <button onClick={() => setShopTab('online')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${shopTab === 'online' ? 'bg-[#111827] border border-[#1e293b] text-cyan-400' : 'border border-transparent text-slate-500 hover:text-slate-300'}`}>🤝 Player Trade</button>
               </div>
               
               {/* INTEGRAÇÃO DA LOJA LOCAL COM O CMS */}
               {shopTab === 'local' ? (
                 <div className="grid grid-cols-2 gap-4">
                    {storeItems?.length === 0 ? (
                      <div className="col-span-2 text-center p-8 border border-dashed border-[#1e293b] rounded-lg text-slate-500 text-[10px] uppercase tracking-widest">Mercado vazio.</div>
                    ) : (
                      storeItems?.map(item => (
                        <button key={item.id} onClick={() => buyItem(item.id, item.price, item.currency, 1)} className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg flex justify-between items-center hover:border-[#334155] transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.2)] text-left">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl drop-shadow-md">{item.icon}</span> 
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{item.name}</span>
                              <span className="text-[8px] text-green-400 font-mono mt-0.5">+{item.effectValue} {item.type}</span>
                            </div>
                          </div>
                          <span className="text-yellow-400 text-[10px] font-bold font-mono tracking-widest">{item.price} {item.currency === 'bits' ? '🪙' : '💎'}</span>
                        </button>
                      ))
                    )}
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="bg-[#111827] border border-[#1e293b] p-3 rounded-lg text-center shadow-sm">
                      <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-widest">Trade Global</p>
                      <p className="text-slate-500 text-[9px] mt-1 tracking-widest uppercase">Venda fragmentos repetidos por Gemas.</p>
                    </div>
                    {Object.entries(fragments).filter(([_, amt]) => amt >= 10).length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-[#1e293b] rounded-lg text-slate-500 text-[10px] uppercase tracking-widest">Mínimo de 10 fragmentos necessários.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(fragments).filter(([_, amt]) => amt >= 10).map(([id, amount]) => {
                          const data = digimonDict[id] || { name: '???', menuImg: '' };
                          return (
                            <div key={id} className="bg-[#111827] border border-[#1e293b] p-3 rounded-lg flex items-center justify-between hover:border-[#334155] transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="bg-[#0a0f1a] rounded-full border border-[#1e293b] p-1.5 flex items-center justify-center shadow-inner">
                                  <img src={data.menuImg} className="w-8 h-8 object-contain" />
                                </div>
                                <div><h4 className="text-slate-200 font-bold uppercase text-[10px] tracking-widest">{data.name} Data</h4><span className="text-[9px] text-cyan-500 font-mono tracking-widest">Possui: <span className="text-cyan-400 font-bold">{amount}</span></span></div>
                              </div>
                              <button onClick={() => sellFragmentForGems(id, 10)} className="bg-[#162a1c] border border-yellow-500/30 hover:bg-[#203c27] text-yellow-400 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">Vender 10 <span className="text-white drop-shadow-md">💎 20</span></button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                 </div>
               )}
             </div>
          )}

          {/* INCUBADORA */}
          {activeModal === 'pc' && (
            <div className="space-y-6">
              <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg p-6 flex flex-col items-center relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 bg-[#111827] border-l border-b border-[#1e293b] text-cyan-400 text-[8px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest">Incubadora Premium</div>
                {incubatingEgg ? (
                  <div className="flex flex-col items-center text-center z-10 w-full">
                    <div className="text-6xl mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">🥚</div>
                    {now < incubatingEgg.hatchTime ? (
                       <>
                         <h4 className="text-cyan-400 font-bold tracking-widest uppercase mb-2 text-[11px]">Chocando Ovo de Dados</h4>
                         <p className="text-cyan-100 font-mono text-xl bg-[#111827] px-6 py-2 rounded-md border border-[#1e293b] shadow-inner">{Math.ceil((incubatingEgg.hatchTime - now) / 1000)}s</p>
                       </>
                    ) : (
                       <button onClick={hatchEgg} className="bg-[#0f2933] border border-[#22d3ee] hover:bg-[#164e63] text-cyan-100 font-bold px-8 py-3 rounded-md uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse mt-2 transition-colors text-[10px]">Extrair Digimon!</button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-600 py-4 opacity-50"><span className="text-5xl mb-2 grayscale">🥚</span><p className="text-[10px] uppercase font-bold tracking-widest">Slot Vazio</p></div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.keys(fragments).length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-[#1e293b] rounded-lg text-slate-500 text-[10px] uppercase tracking-widest">Nenhum fragmento extraído.</div>
                ) : (
                  Object.entries(fragments).map(([id, amount]) => {
                    const progress = Math.min((amount / 50) * 100, 100);
                    const isReady = amount >= 50 && !ownedDigimons.includes(id);
                    const data = digimonDict[id] || { name: '???', menuImg: '' };
                    if (ownedDigimons.includes(id)) return null; 

                    return (
                      <div key={id} className={`bg-[#111827] border ${isReady ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'border-[#1e293b]'} p-3 rounded-lg flex items-center gap-4 transition-colors`}>
                        <div className={`w-12 h-12 bg-[#0a0f1a] rounded-full border flex items-center justify-center flex-shrink-0 shadow-inner ${isReady ? 'border-cyan-400' : 'border-[#1e293b] grayscale opacity-40'}`}>
                           <img src={data.menuImg} className="w-8 h-8 object-contain" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-slate-200 font-bold uppercase tracking-widest mb-2 text-[11px]">{data.name}</h4>
                          <div className="w-full h-3 bg-[#0a0f1a] border border-[#1e293b] rounded-full overflow-hidden relative shadow-inner">
                            <div className={`h-full transition-all duration-300 ${isReady ? 'bg-cyan-500' : 'bg-slate-600'}`} style={{ width: `${progress}%` }}></div>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono text-white drop-shadow-[0_1px_1px_black]">{amount}/50</span>
                          </div>
                        </div>
                        <button onClick={() => startIncubation(id)} disabled={!isReady || incubatingEgg !== null} className={`px-4 py-2 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all border ${isReady && !incubatingEgg ? 'bg-[#0f2933] border-[#22d3ee] text-cyan-100 hover:bg-[#164e63] shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'bg-transparent border-[#334155] text-slate-600 cursor-not-allowed'}`}>Incubar</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}