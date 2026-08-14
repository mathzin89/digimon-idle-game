// src/components/game/GameWorld.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getDigimonVisuals, digimonDict } from '../../utils/digimonVisuals';
import { playSound } from '../../utils/audioManager';

export type ModalType = 'inventory' | 'shop' | 'settings' | 'map' | 'pc' | 'quests' | 'profile' | 'digipedia' | null;

interface GameWorldProps { currentZone: 'floresta' | 'cidade'; setActiveModal: (modal: ModalType) => void; setCurrentZone: (zone: 'floresta' | 'cidade') => void; }

export function GameWorld({ currentZone, setActiveModal, setCurrentZone }: GameWorldProps) {
  const { 
    mapTargets, scanningTarget, activeDigimon, myDigimons, equippedGear, soundEnabled,
    attackMapTarget, takeDamage, finishDNAScan, setMapHunt, isDataLoaded, hasCompletedTutorial, currentHuntType
  } = useGameStore();

  const [tamerPos, setTamerPos] = useState({ x: 50, y: 50 });
  const [directionImg, setDirectionImg] = useState('/andar-baixo.png');
  const [frameStep, setFrameStep] = useState(0);
  
  const isMovingRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);

  const [damageNumbers, setDamageNumbers] = useState<{ id: number, instanceId?: string, damage: number, x: number, y: number, isCrit: boolean, target: 'enemy' | 'player' }[]>([]);
  const [lootPopups, setLootPopups] = useState<{ id: number, x: number, y: number, exp: number, bits: number, item: string | null }[]>([]);

  useEffect(() => {
    if (isDataLoaded && hasCompletedTutorial && !currentHuntType && currentZone === 'floresta') {
      setMapHunt('koromon', 'Koromon', 1, digimonDict['koromon'].img, 'Normal');
    }
  }, [isDataLoaded, hasCompletedTutorial, currentHuntType, currentZone, setMapHunt]);

  const walkSequence = [0, 1, 2, 1];

  useEffect(() => {
    const frameTimer = setInterval(() => {
      if (isMovingRef.current) setFrameStep((prev) => (prev + 1) % walkSequence.length);
      else setFrameStep(0); 
    }, 280); 
    return () => clearInterval(frameTimer);
  }, []);

  const tamerFrame = walkSequence[frameStep];

  useEffect(() => {
    if (currentZone === 'cidade' || scanningTarget || !mapTargets || mapTargets.length === 0 || !isDataLoaded || !hasCompletedTutorial) {
      isMovingRef.current = false;
      return;
    }

    const roamInterval = setInterval(() => {
      setTamerPos((prev) => {
        const target = mapTargets[0];
        if (!target) return prev;

        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > Math.abs(dy)) setDirectionImg(dx > 0 ? '/andar-dir.png' : '/andar-esq.png');
        else setDirectionImg(dy > 0 ? '/andar-baixo.png' : '/andar-cima.png');

        if (dist < 4) {
          isMovingRef.current = false; 
          const now = Date.now();
          if (now - lastAttackTimeRef.current >= 1000) {
            lastAttackTimeRef.current = now;

            const myLevel = myDigimons[activeDigimon]?.level || 1;
            let pBaseDamage = myLevel * 12; 
            if (equippedGear === 'garra_combate') pBaseDamage = Math.floor(pBaseDamage * 1.5);
            const pVar = pBaseDamage * 0.15;
            let pDamage = Math.floor(pBaseDamage + (Math.random() * pVar * 2) - pVar);
            pDamage = Math.max(1, pDamage);
            const pCrit = Math.random() < 0.15;
            if (pCrit) pDamage *= 2;

            playSound('hit', soundEnabled); 
            attackMapTarget(target.instanceId, pDamage);

            let eBaseDamage = target.level * 8; 
            const eVar = eBaseDamage * 0.15;
            let eDamage = Math.floor(eBaseDamage + (Math.random() * eVar * 2) - eVar);
            eDamage = Math.max(1, eDamage);
            const eCrit = Math.random() < 0.10;
            if (eCrit) eDamage *= 2;

            const isDead = takeDamage(eDamage);

            const nowId = Date.now();
            setDamageNumbers(prevNums => [
              ...prevNums, 
              { id: nowId, instanceId: target.instanceId, damage: pDamage, isCrit: pCrit, target: 'enemy', x: target.x + (Math.random() * 4 - 2), y: target.y - 5 - (Math.random() * 2) },
              { id: nowId + 1, damage: eDamage, isCrit: eCrit, target: 'player', x: prev.x + (Math.random() * 4 - 2), y: prev.y - 5 - (Math.random() * 2) }
            ]);

            setTimeout(() => setDamageNumbers(prevNums => prevNums.filter(num => num.id !== nowId && num.id !== nowId + 1)), 1000);

            if (isDead) {
              const pName = getDigimonVisuals(activeDigimon, myLevel, true).name;
              alert(`O seu ${pName} desmaiou em combate! Voltando para a Cidade do Começo para se recuperar...`);
              setCurrentZone('cidade');
            }
          }
          return prev;
        }

        isMovingRef.current = true;
        const speed = 0.08; 
        return { x: prev.x + (dx / dist) * speed, y: prev.y + (dy / dist) * speed };
      });
    }, 30);

    return () => clearInterval(roamInterval);
  }, [mapTargets, scanningTarget, activeDigimon, myDigimons, attackMapTarget, takeDamage, isDataLoaded, hasCompletedTutorial, currentZone, equippedGear, soundEnabled, setCurrentZone]);

  useEffect(() => {
    if (scanningTarget) {
      const newLootId = Date.now();
      const lootResult = finishDNAScan(scanningTarget);
      
      playSound(lootResult.leveledUp ? 'levelup' : 'loot', soundEnabled);

      setLootPopups(prev => [...prev, { id: newLootId, x: scanningTarget.x, y: scanningTarget.y, exp: lootResult.exp, bits: lootResult.bits, item: lootResult.item }]);
      setTimeout(() => setLootPopups(prev => prev.filter(p => p.id !== newLootId)), 2000);
    }
  }, [scanningTarget, finishDNAScan, soundEnabled]);

  const positions = ['0%', '50%', '100%'];
  const isAttacking = damageNumbers.some(d => d.target === 'enemy');

  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {currentZone === 'floresta' ? (
          <div 
            className="absolute top-0 left-0 bg-[url('/map-bg.png')] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-linear [image-rendering:pixelated]" 
            style={{ 
              width: '150vw', height: '150vh', 
              transform: `translate(clamp(-50vw, calc(50vw - ${tamerPos.x * 1.5}vw), 0vw), clamp(-50vh, calc(50vh - ${tamerPos.y * 1.5}vh), 0vh))`
            }}
          >
            
            <div className={`absolute flex items-center gap-3 z-30 transition-all duration-100 ease-linear ${isAttacking ? 'attacking-bump' : ''}`} style={{ top: `${tamerPos.y}%`, left: `${tamerPos.x}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative flex flex-col items-center justify-center">
                <div className="pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ width: '56px', height: '56px', backgroundImage: `url('${directionImg}')`, backgroundSize: '300% 100%', backgroundPosition: `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated' }} />
                <div className="absolute bottom-2 w-8 h-2.5 bg-black/40 rounded-[100%] blur-[1px] -z-10"></div>
              </div>

              {activeDigimon && (() => {
                const activeStats = myDigimons[activeDigimon];
                const visual = activeStats ? getDigimonVisuals(activeDigimon, activeStats.level, true) : null;
                if (!visual) return null;
                
                const hpPercent = Math.max(0, (activeStats.hp / activeStats.maxHp) * 100);

                return (
                  <div className="relative flex flex-col items-center justify-center">
                    
                    {/* BARRA DE HP DO DIGIMON NO MAPA */}
                    <div className="absolute -top-4 w-12 h-1.5 bg-slate-900 border border-slate-700 rounded-full overflow-hidden z-20 shadow-md">
                      <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div>
                    </div>

                    {visual.isSprite ? (
                      <div className={`pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') ? '' : 'scale-x-[-1]'}`} style={{ width: '48px', height: '48px', backgroundImage: `url('${visual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated' }} />
                    ) : (
                      <img src={visual.img} className={`w-14 h-14 object-contain pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') ? '' : 'scale-x-[-1]'} ${isMovingRef.current ? 'animate-bounce' : ''}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <div className="absolute bottom-1 w-8 h-2.5 bg-black/40 rounded-[100%] blur-[1px] -z-10"></div>
                  </div>
                );
              })()}
            </div>

            {mapTargets && mapTargets.map((target) => {
              const rarity = (target as any).rarity || 'Normal';
              const isBoss = rarity === 'Chefe' || rarity === 'Divino';
              const auraClass = rarity === 'Divino' ? 'aura-divino' : rarity === 'Chefe' ? 'aura-chefe' : rarity === 'Elite' ? 'aura-elite' : '';
              
              // Inimigo no mapa DEVE usar a função original viva, não o MenuSprite.
              const enemyVisual = getDigimonVisuals(target.id, target.level, false);
              const isTakingDamage = damageNumbers.some(d => d.target === 'enemy' && d.instanceId === target.instanceId);

              return (
                <div key={target.instanceId} className="absolute flex flex-col items-center group transition-all duration-100 ease-linear z-20 pointer-events-auto cursor-pointer" style={{ top: `${target.y}%`, left: `${target.x}%`, transform: 'translate(-50%, -50%)' }}>
                  <div className="relative flex flex-col items-center justify-center">
                    {isTakingDamage && <div className="absolute top-1/2 left-1/2 z-50 text-4xl pointer-events-none drop-shadow-[0_0_5px_white]" style={{ animation: 'hitSpark 0.4s ease-out forwards' }}>💥</div>}
                    
                    {/* INIMIGOS ANIMADOS COM AS PERNAS MEXENDO */}
                    {enemyVisual.isSprite ? (
                      <div className={`pixelated relative z-10 animate-bounce ${auraClass} ${isTakingDamage ? 'is-being-hit' : ''}`} style={{ width: '48px', height: '48px', backgroundImage: `url('${enemyVisual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated', transform: isBoss ? 'scale(1.5)' : 'scale(1)' }} />
                    ) : (
                      <img src={enemyVisual.img} className={`relative object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] pixelated animate-bounce z-10 ${auraClass} ${isTakingDamage ? 'is-being-hit' : ''}`} style={{ transform: isBoss ? 'scale(1.5)' : 'scale(1)', width: '32px', height: '32px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}

                    <div className={`absolute bottom-0 ${isBoss ? 'w-20 h-5' : 'w-12 h-3.5'} bg-black/40 rounded-[100%] blur-[1.5px] -z-10`}></div>
                  </div>
                  
                  {/* BARRA DE VIDA DOS INIMIGOS */}
                  <div className="bg-black/90 px-2 py-0.5 rounded border border-slate-700 text-center mt-3 w-20 shadow-lg relative z-20">
                    <span className={`text-[9px] font-bold truncate block ${rarity === 'Divino' ? 'text-yellow-400' : rarity === 'Elite' ? 'text-blue-300' : 'text-slate-200'}`}>{target.name}</span>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-0.5"><div className={`h-full transition-all ${rarity === 'Divino' ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${Math.max(0, (target.hp / target.maxHp) * 100)}%` }}></div></div>
                  </div>
                </div>
              );
            })}

            {/* DIV WRAPPER PARA RESOLVER O BUG DO DANO SUMINDO */}
            {damageNumbers.map((dItem) => (
               <div key={dItem.id} className="absolute z-[100] pointer-events-none" style={{ left: `${dItem.x}%`, top: `${dItem.y}%` }}>
                 <div 
                   className={`font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] whitespace-nowrap 
                     ${dItem.target === 'player' ? 'text-white' : (dItem.isCrit ? 'text-yellow-400 text-2xl' : 'text-red-500 text-lg')}`
                   } 
                   style={{ 
                     animation: `${dItem.isCrit ? 'floatCrit' : 'floatDamage'} 1s ease-out forwards`,
                     textShadow: dItem.target === 'player' ? '0 0 5px red, 0 0 10px red' : 'none'
                   }}
                 >
                   {dItem.isCrit && <span className="block text-[8px] text-white -mb-1 ml-2">CRIT!</span>}
                   -{dItem.damage}
                 </div>
               </div>
            ))}

            {lootPopups.map(loot => (
              <div key={loot.id} className="absolute z-50 pointer-events-none flex flex-col items-center gap-0.5" style={{ left: `${loot.x}%`, top: `${loot.y}%`, transform: 'translate(-50%, -50%)', animation: 'floatLoot 2s ease-out forwards' }}>
                <span className="text-blue-400 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">+{loot.exp} XP</span>
                <span className="text-yellow-500 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">+{loot.bits} Bits</span>
                {loot.item && <span className="text-emerald-400 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">+1 {loot.item}</span>}
              </div>
            ))}

            {/* ANIMAÇÃO DO DIGIVICE */}
            {scanningTarget && (() => {
              const targetVisual = getDigimonVisuals(scanningTarget.id, scanningTarget.level, false);
              return (
                <div className="absolute flex flex-col items-center justify-end z-20 pointer-events-none" style={{ top: `${scanningTarget.y}%`, left: `${scanningTarget.x}%`, transform: 'translate(-50%, -75%)', width: '80px', height: '150px' }}>
                  <div className={`relative z-30 ${scanningTarget.rarity === 'Chefe' || scanningTarget.rarity === 'Divino' ? 'scale-[2.0]' : 'scale-125'}`} style={{ animation: 'suckIntoDigivice 2.5s ease-in-out forwards' }}>
                     {targetVisual.isSprite ? (
                       <div className="pixelated" style={{ width: '48px', height: '48px', backgroundImage: `url('${targetVisual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `0% 0%`, imageRendering: 'pixelated' }} />
                     ) : (
                       <img src={targetVisual.img} className="w-16 h-16 object-contain pixelated" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                     )}
                  </div>
                  
                  <div className="absolute top-[35px] w-[14px] h-[90px] z-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.8), transparent)', borderRadius: '50%', filter: 'blur(1px)', animation: 'pulseDNA 0.5s infinite alternate, fadeOut 2.5s ease-in forwards' }} />
                  <div className="absolute bottom-0 z-40 flex items-center justify-center drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transform scale-[0.55] origin-bottom">
                    <div style={{ width: '64px', height: '56px', animation: 'glowDigivice 2.5s ease-in-out forwards' }}>
                      <div className="relative w-full h-full bg-cyan-100 border-[3px] border-slate-700 rounded-[20px] flex items-center justify-center shadow-[inset_0_-5px_0_rgba(0,180,216,0.4)]">
                        <div className="absolute -top-[10px] left-[10px] w-[8px] h-[12px] bg-slate-700 rounded-t-md"></div>
                        <div className="absolute w-[44px] h-[44px] rounded-full border-[2px] border-slate-400/50 flex items-center justify-center"><div className="w-[26px] h-[26px] bg-emerald-700 border-[2px] border-slate-700 rounded-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></div></div>
                        <div className="absolute right-[4px] top-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div>
                        <div className="absolute right-[4px] bottom-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div>
                        <div className="absolute left-[4px] top-[24px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
  );
}