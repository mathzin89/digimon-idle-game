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
    tamerName, bits, gems, avatar, equippedOutfit, captureLog, fragments, 
    ownedDigimons, buyItem, startIncubation, hatchEgg, incubatingEgg, 
    setMapHunt, equipOutfit, soundEnabled, toggleSound, ownedGear, equippedGear, equipGear, sellFragmentForGems, myDigimons
  } = useGameStore();

  const [profileTab, setProfileTab] = useState<'main' | 'gear' | 'outfits' | 'logs'>('main');
  const [shopTab, setShopTab] = useState<'local' | 'online'>('local');
  const tamerGender = (avatar === 'sora' || avatar === 'mimi') ? 'female' : 'male';
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (activeModal === 'pc' && incubatingEgg) {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [activeModal, incubatingEgg]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="bg-slate-950 border border-slate-700 w-[600px] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-slate-900 border-b border-slate-800 p-3 flex justify-between items-center">
          <h3 className="text-digi-gold font-bold tracking-widest uppercase flex items-center gap-2">
            {activeModal === 'inventory' && '🎒 Mochila de Itens'}
            {activeModal === 'shop' && '🛒 Comércio Global'}
            {activeModal === 'map' && '🗺️ Mapa Global'}
            {activeModal === 'pc' && '💻 Incubadora de Ovos'}
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
                <button onClick={() => setProfileTab('gear')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'gear' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>⚔️ Equipamentos</button>
                <button onClick={() => setProfileTab('outfits')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'outfits' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>👕 Outfits</button>
                <button onClick={() => setProfileTab('logs')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${profileTab === 'logs' ? 'bg-digi-cyan text-slate-950 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white'}`}>📜 Log de Caça</button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {profileTab === 'main' && (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-24 h-24 bg-slate-950 rounded-full border-4 border-digi-cyan shadow-[0_0_20px_rgba(0,229,255,0.2)] overflow-hidden flex items-center justify-center relative"><TamerPortrait gender={tamerGender} /></div>
                    <div className="text-center space-y-1 w-full">
                      <div className="flex items-center justify-center gap-2">
                        <span className="bg-blue-600/30 border border-blue-500 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">VIP Ativo</span>
                        <h2 className="text-xl font-bold text-slate-200 uppercase tracking-widest">{user?.displayName || tamerName}</h2>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Nível 397 • Desde 01/08/2026</p>
                      <p className="text-xs text-red-400 font-mono mt-2">Multiplicador de Dano: {equippedGear ? '+50%' : 'Nenhum'}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full bg-red-950/40 border border-red-900 text-red-400 font-bold py-2.5 rounded uppercase tracking-widest hover:bg-red-900 hover:text-white transition-colors">Sair do Jogo</button>
                  </div>
                )}
                {profileTab === 'gear' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-digi-gold uppercase tracking-widest mb-2">Seus Equipamentos (Drops de Chefes)</h4>
                    {ownedGear.length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs">Nenhum equipamento raro dropado ainda.</div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {ownedGear.includes('garra_combate') && (
                          <div onClick={() => equipGear('garra_combate')} className={`bg-slate-900 border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all ${equippedGear === 'garra_combate' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}>
                            <span className="text-4xl mb-2 drop-shadow-md">🩸</span>
                            <span className="font-bold text-xs text-slate-200 uppercase text-center">Garra de Combate</span>
                            <span className="text-[10px] text-red-400 mt-1 font-black">+50% DANO</span>
                            {equippedGear === 'garra_combate' && <span className="text-[10px] text-emerald-400 mt-1">Equipada ✓</span>}
                          </div>
                        )}
                      </div>
                    )}
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
                      <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs font-mono">Ainda nenhum registo de caça gravado.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModal === 'inventory' && (
            <div className="text-center text-slate-500">Mochila acessível apenas pela Hotbar no momento.</div>
          )}

          {activeModal === 'shop' && (
             <div className="flex flex-col h-full">
               <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 gap-2 mb-4">
                 <button onClick={() => setShopTab('local')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${shopTab === 'local' ? 'bg-digi-cyan text-slate-950' : 'text-slate-400 hover:text-white'}`}>🛒 NPC Local</button>
                 <button onClick={() => setShopTab('online')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${shopTab === 'online' ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'}`}>🤝 Mercado Aberto</button>
               </div>
               {shopTab === 'local' ? (
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => buyItem('meat', 1000, 'bits', 10)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all"><div className="flex items-center gap-2"><span className="text-xl">🍖</span> <span className="text-xs font-bold text-slate-300">Carne x10</span></div><span className="text-digi-gold text-xs font-mono">1.000 Bits</span></button>
                    <button onClick={() => buyItem('potion', 2500, 'bits', 5)} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center hover:border-digi-cyan active:scale-95 transition-all"><div className="flex items-center gap-2"><span className="text-xl">💊</span> <span className="text-xs font-bold text-slate-300">Poção x5</span></div><span className="text-digi-gold text-xs font-mono">2.500 Bits</span></button>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="bg-emerald-950/30 border border-emerald-900 p-3 rounded text-center">
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Venda de Fragmentos (Player Trade)</p>
                      <p className="text-slate-400 text-[10px] mt-1">Troque seus dados repetidos por Gemas Premium.</p>
                    </div>
                    {Object.entries(fragments).filter(([_, amt]) => amt >= 10).length === 0 ? (
                      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs">Você precisa de pelo menos 10 fragmentos de um mesmo Digimon para anunciar no Mercado.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(fragments).filter(([_, amt]) => amt >= 10).map(([id, amount]) => {
                          const data = digimonDict[id] || { name: '???', menuImg: '' };
                          return (
                            <div key={id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <MenuSprite visual={data} className="w-10 h-10 bg-slate-950 rounded border border-slate-700 p-1" />
                                <div><h4 className="text-slate-200 font-bold uppercase text-xs">{data.name} Data</h4><span className="text-[10px] text-slate-400 font-mono">Você tem: {amount}</span></div>
                              </div>
                              <button onClick={() => sellFragmentForGems(id, 10)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-1 shadow-lg">Vender 10x <span className="text-cyan-200">💎 20</span></button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                 </div>
               )}
             </div>
          )}

          {activeModal === 'pc' && (
            <div className="space-y-6">
              <div className="bg-blue-950/20 border-2 border-blue-900 rounded-xl p-4 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase">Incubadora Premium</div>
                {incubatingEgg ? (
                  <div className="flex flex-col items-center text-center z-10 w-full">
                    <div className="text-6xl mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">🥚</div>
                    {now < incubatingEgg.hatchTime ? (
                       <>
                         <h4 className="text-blue-400 font-black tracking-widest uppercase mb-1">Chocando Ovo de Dados</h4>
                         <p className="text-white font-mono text-xl bg-black/50 px-4 py-1 rounded border border-blue-800">
                           {Math.ceil((incubatingEgg.hatchTime - now) / 1000)}s
                         </p>
                       </>
                    ) : (
                       <button onClick={hatchEgg} className="bg-blue-500 hover:bg-blue-400 text-white font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-bounce mt-2">
                         Abrir Ovo Agora!
                       </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500 py-4 opacity-50">
                    <span className="text-4xl mb-2 grayscale">🥚</span>
                    <p className="text-xs uppercase font-bold">Incubadora Vazia</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.keys(fragments).length === 0 ? (
                  <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-slate-500">Nenhum fragmento coletado ainda.</div>
                ) : (
                  Object.entries(fragments).map(([id, amount]) => {
                    const progress = Math.min((amount / 50) * 100, 100);
                    const isReady = amount >= 50 && !ownedDigimons.includes(id);
                    const data = digimonDict[id] || { name: '???', menuImg: '' };
                    if (ownedDigimons.includes(id)) return null; 

                    return (
                      <div key={id} className={`bg-slate-900 border ${isReady ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-slate-800'} p-3 rounded-lg flex items-center gap-4`}>
                        <MenuSprite visual={data} className={`w-12 h-12 bg-slate-950 rounded border ${isReady ? 'border-blue-400' : 'border-slate-700 grayscale'}`} />
                        <div className="flex-1">
                          <h4 className="text-slate-200 font-bold uppercase tracking-wider mb-2">{data.name}</h4>
                          <div className="w-full h-3 bg-slate-950 border border-slate-700 rounded-full overflow-hidden relative">
                            <div className={`h-full transition-all ${isReady ? 'bg-blue-500' : 'bg-purple-600'}`} style={{ width: `${progress}%` }}></div>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white">{amount} / 50 Data</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => startIncubation(id)} 
                          disabled={!isReady || incubatingEgg !== null} 
                          className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${(isReady && !incubatingEgg) ? 'bg-blue-500 text-white hover:bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'}`}
                        >
                          Incubar
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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
                    <MenuSprite visual={data} className={`w-12 h-12 p-1 ${hasDigimon ? '' : 'brightness-0 opacity-30'}`} />
                    <span className={`text-[10px] font-bold uppercase ${hasDigimon ? 'text-slate-200' : 'text-slate-600'}`}>{hasDigimon ? data.name : '???'}</span>
                  </div>
                )
              })}
            </div>
          )}

          {activeModal === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-sm font-bold text-slate-200 block uppercase">Efeitos Sonoros (SFX)</span>
                    <span className="text-[10px] text-slate-500">Sons de combate e coleta de itens.</span>
                  </div>
                  <button onClick={toggleSound} className={`text-xs font-bold px-4 py-2 rounded uppercase transition-all ${soundEnabled ? 'bg-digi-cyan text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                    {soundEnabled ? 'Ligado' : 'Desligado'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NOVIDADE: Menu de Mapa com ícones independentes usando os rostinhos "init" */}
          {activeModal === 'map' && (
            <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900/50 rounded-lg">
              
              <div className="flex gap-16 absolute top-1/2 -translate-y-1/2">
                <button onClick={() => { setMapHunt('koromon', 'Koromon', 1, '/koromon-esq.png', 'Normal'); closeModal(); setCurrentZone('floresta'); }} className="group flex flex-col items-center transition-transform hover:-translate-y-2">
                  <MenuSprite visual={{ menuImg: '/koromon-init.png', isSprite: true, menuFrames: 2 }} className="w-16 h-16 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] z-10" />
                  <div className="bg-slate-950/90 border border-slate-700 px-3 py-1 rounded mt-2 text-center group-hover:border-digi-cyan transition-colors">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Pradaria Koromon</p>
                  </div>
                </button>

                <button onClick={() => { setMapHunt('agumon', 'Agumon', 20, '/agu-anima.png', 'Normal'); closeModal(); setCurrentZone('floresta'); }} className="group flex flex-col items-center transition-transform hover:-translate-y-2">
                  <MenuSprite visual={{ menuImg: '/agumon-init.png', isSprite: true, menuFrames: 2 }} className="w-16 h-16 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] z-10" />
                  <div className="bg-slate-950/90 border border-slate-700 px-3 py-1 rounded mt-2 text-center group-hover:border-digi-cyan transition-colors">
                    <p className="text-[10px] font-bold text-white uppercase tracking-widest">Ninho Agumon</p>
                  </div>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}