// src/components/game/GameWorld.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getDigimonVisuals, MenuSprite, digimonDict } from '../../utils/digimonVisuals';
import { playSound } from '../../utils/audioManager';

export type ModalType = 'inventory' | 'shop' | 'settings' | 'map' | 'pc' | 'quests' | 'profile' | 'digipedia' | 'gamepass' | null;

interface GameWorldProps { currentZone: 'floresta' | 'cidade'; setActiveModal: (modal: ModalType) => void; setCurrentZone: (zone: 'floresta' | 'cidade') => void; }

interface Hotspot {
  id: string;
  modal: ModalType | 'toast';
  name: string;
  x: number;
  y: number;
  r: number;
  msg?: string;
}

export function GameWorld({ currentZone, setActiveModal, setCurrentZone }: GameWorldProps) {
  const { 
    avatar, 
    mapTargets, scanningTarget, activeDigimon, myDigimons, equippedGear, soundEnabled,
    attackMapTarget, takeDamage, finishDNAScan, setMapHunt, isDataLoaded, hasCompletedTutorial, currentHuntType
  } = useGameStore();

  const [tamerPos, setTamerPos] = useState({ x: 50, y: 60 });
  
  const getAvatarDirection = (gender: string, dir: string) => {
    const isFemale = gender === 'sora';

    if (isFemale) {
       switch (dir) {
         case 'baixo': return '/Frente feminina.png';
         case 'cima': return '/costas feminina.png';
         case 'esq': return '/esquerda feminina.png';
         case 'dir': return '/Direita feminina.png';
         case 'deitado': return '/Frente feminina.png'; 
         default: return '/Frente feminina.png';
       }
    } else {
       switch (dir) {
         case 'baixo': return '/Frente - masculino.png';
         case 'cima': return '/Costas masculina.png';
         case 'esq': return '/Esquerda - Masculino.png';
         case 'dir': return '/Direita - masculino.png';
         case 'deitado': return '/deitado - masculino.png';
         default: return '/Frente - masculino.png';
       }
    }
  };

  const [directionImg, setDirectionImg] = useState(getAvatarDirection(avatar, 'baixo'));
  const [frameStep, setFrameStep] = useState(0);
  const [isFainted, setIsFainted] = useState(false);
  
  const isMovingRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const keysRef = useRef(new Set<string>());

  const [damageNumbers, setDamageNumbers] = useState<{ id: number, instanceId?: string, damage: number, x: number, y: number, isCrit: boolean, target: 'enemy' | 'player' }[]>([]);
  const [lootPopups, setLootPopups] = useState<{ id: number, x: number, y: number, exp: number, bits: number, item: string | null }[]>([]);
  const [deathMessage, setDeathMessage] = useState('');

  const cityHotspots: Hotspot[] = [
    { id: 'clinic', modal: 'toast', name: '🏥 Clínica', x: 45, y: 35, r: 3, msg: 'Clínica em construção!' },
    { id: 'shop', modal: 'shop', name: '🛒 Mercado', x: 65, y: 35, r: 3 },
    { id: 'pc', modal: 'pc', name: '💻 Digi-Bank', x: 30, y: 47, r: 3 }, 
    { id: 'farm', modal: 'toast', name: '🌱 Fazenda', x: 72, y: 62, r: 3, msg: 'Fazenda em breve!' },
    { id: 'arena', modal: 'toast', name: '⚔️ Arena', x: 82, y: 31, r: 3, msg: 'Arena PvP em breve!' },
    { id: 'map', modal: 'map', name: '🗺️ Mapa Mundi', x: 50, y: 50, r: 4 } 
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isDataLoaded && hasCompletedTutorial && !currentHuntType && currentZone === 'floresta') {
      setMapHunt('koromon', 'Koromon', 1, '/koromon-esq.png', 'Normal');
    }
  }, [isDataLoaded, hasCompletedTutorial, currentHuntType, currentZone, setMapHunt]);

  const walkSequence = [0, 1, 2, 1];

  useEffect(() => {
    const frameTimer = setInterval(() => {
      if (isMovingRef.current && !isFainted) setFrameStep((prev) => (prev + 1) % walkSequence.length);
      else setFrameStep(0); 
    }, 120); 
    return () => clearInterval(frameTimer);
  }, [isFainted]);

  const tamerFrame = walkSequence[frameStep];

  useEffect(() => {
    if (currentZone === 'cidade') {
       setTamerPos({ x: 50, y: 58 }); 
       setDirectionImg(getAvatarDirection(avatar, 'cima'));
       setIsFainted(false);
       keysRef.current.clear();
    }
  }, [currentZone, avatar]);

  const isWalkable = (x: number, y: number) => {
      const distToCenter = Math.hypot(x - 50, y - 50);
      if (distToCenter <= 18) return true; 

      if (x >= 40 && x <= 50 && y >= 32 && y <= 40) return true; 
      if (x >= 60 && x <= 70 && y >= 32 && y <= 40) return true; 
      if (x >= 28 && x <= 35 && y >= 42 && y <= 52) return true; 
      if (x >= 65 && x <= 75 && y >= 55 && y <= 65) return true; 
      if (x >= 75 && x <= 85 && y >= 28 && y <= 38) return true; 

      return false; 
  };

  useEffect(() => {
    if (!isDataLoaded || !hasCompletedTutorial || isFainted) return;

    const moveInterval = setInterval(() => {
      const isModalOpen = document.querySelector('.z-50.backdrop-blur-sm') !== null || document.querySelector('.z-\\[60\\]') !== null;
      
      if (currentZone === 'cidade') {
         if (isModalOpen) {
            isMovingRef.current = false;
            keysRef.current.clear();
            return;
         }

         let dx = 0; let dy = 0;
         if (keysRef.current.has('w') || keysRef.current.has('arrowup')) dy -= 1;
         if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) dy += 1;
         if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) dx -= 1;
         if (keysRef.current.has('d') || keysRef.current.has('arrowright')) dx += 1;

         if (dx !== 0 || dy !== 0) {
            isMovingRef.current = true;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const speed = 0.22; 
            
            setTamerPos(prev => {
                let nextX = prev.x + (dx/dist) * speed;
                let nextY = prev.y + (dy/dist) * speed;
                
                let finalX = prev.x;
                let finalY = prev.y;

                if (isWalkable(nextX, prev.y)) finalX = nextX;
                if (isWalkable(prev.x, nextY)) finalY = nextY;

                for (const spot of cityHotspots) {
                    const d = Math.sqrt(Math.pow(finalX - spot.x, 2) + Math.pow(finalY - spot.y, 2));
                    if (d < spot.r) {
                        if (spot.modal === 'toast') {
                            setDeathMessage(spot.msg || 'Área em construção!');
                            setTimeout(() => setDeathMessage(''), 2000);
                        } else {
                            setActiveModal(spot.modal as ModalType);
                            keysRef.current.clear(); 
                        }
                        finalX = prev.x - (dx/dist) * 2;
                        finalY = prev.y - (dy/dist) * 2;
                        break;
                    }
                }

                if (Math.abs(dx) > Math.abs(dy)) setDirectionImg(getAvatarDirection(avatar, dx > 0 ? 'dir' : 'esq'));
                else setDirectionImg(getAvatarDirection(avatar, dy > 0 ? 'baixo' : 'cima'));

                return { x: finalX, y: finalY };
            });
         } else {
            isMovingRef.current = false;
         }

      } else {
         if (scanningTarget || !mapTargets || mapTargets.length === 0 || isModalOpen) {
            isMovingRef.current = false;
            return;
         }

         setTamerPos((prev) => {
            const target = mapTargets[0];
            if (!target) return prev;

            const dx = target.x - prev.x;
            const dy = target.y - prev.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (Math.abs(dx) > Math.abs(dy)) setDirectionImg(getAvatarDirection(avatar, dx > 0 ? 'dir' : 'esq'));
            else setDirectionImg(getAvatarDirection(avatar, dy > 0 ? 'baixo' : 'cima'));

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
                   setIsFainted(true); 
                   setDirectionImg(getAvatarDirection(avatar, 'deitado'));
                   setDeathMessage(`O seu ${pName} desmaiou e foi levado para a Base!`);
                   
                   setTimeout(() => {
                     setDeathMessage('');
                     setIsFainted(false);
                     setCurrentZone('cidade');
                   }, 3000); 
                 }
               }
               return prev;
            }

            isMovingRef.current = true;
            const speed = 0.08; 
            return { x: prev.x + (dx / dist) * speed, y: prev.y + (dy / dist) * speed };
         });
      }
    }, 30);

    return () => clearInterval(moveInterval);
  }, [mapTargets, scanningTarget, activeDigimon, myDigimons, attackMapTarget, takeDamage, isDataLoaded, hasCompletedTutorial, currentZone, equippedGear, soundEnabled, setCurrentZone, avatar, isFainted]);

  useEffect(() => {
    if (scanningTarget) {
      const scanTimer = setTimeout(() => {
        const newLootId = Date.now();
        const lootResult = finishDNAScan(scanningTarget);
        playSound(lootResult.leveledUp ? 'levelup' : 'loot', soundEnabled);
        setLootPopups(prev => [...prev, { id: newLootId, x: scanningTarget.x, y: scanningTarget.y, exp: lootResult.exp, bits: lootResult.bits, item: lootResult.item }]);
        setTimeout(() => setLootPopups(prev => prev.filter(p => p.id !== newLootId)), 2000);
      }, 2500); 
      return () => clearTimeout(scanTimer);
    }
  }, [scanningTarget, finishDNAScan, soundEnabled]);

  const positions = ['0%', '50%', '100%'];
  const isAttacking = damageNumbers.some(d => d.target === 'enemy');
  const isForest = currentZone === 'floresta';

  return (
    <>
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none bg-[#050811]">
          
          <div 
            className={`absolute top-0 left-0 transition-transform duration-75 ease-linear bg-center bg-no-repeat ${isForest ? '[image-rendering:pixelated] bg-cover' : 'bg-cover'}`} 
            style={{ 
              backgroundImage: isForest ? "url('/map-bg.png')" : "url('/cidade-bg.jpg')",
              width: isForest ? '150vw' : '3200px', 
              height: isForest ? '150vh' : '1800px', 
              transform: isForest 
                  ? `translate(clamp(-50vw, calc(50vw - ${tamerPos.x * 1.5}vw), 0vw), clamp(-50vh, calc(50vh - ${tamerPos.y * 1.5}vh), 0vh))`
                  : `translate(calc(50vw - ${(tamerPos.x / 100) * 3200}px), calc(50vh - ${(tamerPos.y / 100) * 1800}px))`
            }}
          >
            
            <div className={`absolute flex items-center gap-3 z-30 transition-all duration-75 ease-linear ${isAttacking ? 'attacking-bump' : ''}`} style={{ top: `${tamerPos.y}%`, left: `${tamerPos.x}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative flex flex-col items-center justify-center">
                <div 
                  className={`pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${isFainted ? 'animate-pulse grayscale' : ''}`} 
                  style={{ 
                    width: '48px', height: '48px', 
                    backgroundImage: `url('${directionImg}')`, 
                    backgroundSize: isFainted ? '100% 100%' : '300% 100%', 
                    backgroundPosition: isFainted ? '0% 0%' : `${positions[tamerFrame]} 0%`, 
                    imageRendering: 'pixelated',
                    backgroundColor: directionImg ? 'transparent' : 'rgba(255,0,0,0.5)'
                  }} 
                />
                {/* CORREÇÃO 1: Sombra centralizada com left-1/2 -translate-x-1/2 */}
                {!isFainted && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/60 rounded-[100%] blur-[1px] -z-10"></div>}
              </div>

              {activeDigimon && !isFainted && (() => {
                const activeStats = myDigimons[activeDigimon];
                
                // CORREÇÃO 2: Passando o nível "1" para a função forçar a renderizar a forma base do ID!
                const visual = activeStats ? getDigimonVisuals(activeDigimon, 1, isForest) : null;
                
                if (!visual) return null;
                
                const hpPercent = Math.max(0, (activeStats.hp / activeStats.maxHp) * 100);
                const isTakingDamage = damageNumbers.some(d => d.target === 'player');

                return (
                  <div className="relative flex flex-col items-center justify-center">
                    {isForest && (
                      <div className="absolute -top-4 w-10 h-1.5 bg-[#111] border border-black rounded-full overflow-hidden z-20 shadow-md">
                        <div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div>
                      </div>
                    )}

                    {visual.isSprite ? (
                      <div className={`pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') || directionImg.includes('esquerda') || directionImg.includes('Esquerda') ? '' : 'scale-x-[-1]'} ${isTakingDamage ? 'hit-anim' : ''}`} style={{ width: '40px', height: '40px', backgroundImage: `url('${visual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated' }} />
                    ) : (
                      <img src={visual.img} className={`w-10 h-10 object-contain pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') || directionImg.includes('esquerda') || directionImg.includes('Esquerda') ? '' : 'scale-x-[-1]'} ${isTakingDamage ? 'hit-anim' : ''}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    {/* Sombra centralizada do Digimon */}
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-black/60 rounded-[100%] blur-[1px] -z-10"></div>
                  </div>
                );
              })()}
            </div>

            {isForest && (
              <>
                 {mapTargets && mapTargets.map((target) => {
                  const rarity = (target as any).rarity || 'Normal';
                  const isBoss = rarity === 'Chefe' || rarity === 'Divino';
                  const auraClass = rarity === 'Divino' ? 'aura-divino' : rarity === 'Chefe' ? 'aura-chefe' : rarity === 'Elite' ? 'aura-elite' : '';
                  const enemyVisual = getDigimonVisuals(target.id, target.level, false);
                  const isTakingDamage = damageNumbers.some(d => d.target === 'enemy' && d.instanceId === target.instanceId);

                  return (
                    <div key={target.instanceId} className="absolute flex flex-col items-center group transition-all duration-100 ease-linear z-20 pointer-events-auto cursor-pointer" style={{ top: `${target.y}%`, left: `${target.x}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="relative flex flex-col items-center justify-center">
                        {enemyVisual.isSprite ? (
                          <div className={`pixelated relative z-10 animate-bounce ${auraClass} ${isTakingDamage ? 'hit-anim' : ''}`} style={{ width: '48px', height: '48px', backgroundImage: `url('${enemyVisual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated', transform: isBoss ? 'scale(1.5)' : 'scale(1)' }} />
                        ) : (
                          <img src={enemyVisual.img} className={`relative object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] pixelated animate-bounce z-10 ${auraClass} ${isTakingDamage ? 'hit-anim' : ''}`} style={{ transform: isBoss ? 'scale(1.5)' : 'scale(1)', width: '32px', height: '32px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        )}
                        <div className={`absolute bottom-0 ${isBoss ? 'w-20 h-5' : 'w-12 h-3.5'} bg-black/40 rounded-[100%] blur-[1.5px] -z-10`}></div>
                      </div>
                      
                      <div className="bg-[#111]/90 px-2 py-0.5 rounded border border-black text-center mt-3 w-20 shadow-lg relative z-20">
                        <span className={`text-[9px] font-bold truncate block ${rarity === 'Divino' ? 'text-yellow-400' : rarity === 'Elite' ? 'text-blue-300' : 'text-slate-200'}`}>{target.name}</span>
                        <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden mt-0.5"><div className={`h-full transition-all ${rarity === 'Divino' ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${Math.max(0, (target.hp / target.maxHp) * 100)}%` }}></div></div>
                      </div>
                    </div>
                  );
                })}

                {damageNumbers.map((dItem) => (
                  <div key={dItem.id} className="absolute z-[100] pointer-events-none" style={{ left: `${dItem.x}%`, top: `${dItem.y}%` }}>
                    <div 
                      className={`font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] whitespace-nowrap ${dItem.target === 'player' ? 'text-white' : (dItem.isCrit ? 'text-yellow-400 text-xl' : 'text-red-500 text-base')}`} 
                      style={{ animation: `${dItem.isCrit ? 'floatCrit' : 'floatDamage'} 1s ease-out forwards`, textShadow: dItem.target === 'player' ? '0 0 5px red, 0 0 10px red' : '1px 1px 0px black' }}
                    >
                      {dItem.isCrit && <span className="block text-[8px] text-white -mb-1 ml-2">CRIT!</span>}
                      -{dItem.damage}
                    </div>
                  </div>
                ))}

                {lootPopups.map(loot => (
                  <div key={loot.id} className="absolute z-50 pointer-events-none flex flex-col items-center gap-0.5" style={{ left: `${loot.x}%`, top: `${loot.y}%`, transform: 'translate(-50%, -50%)', animation: 'floatLoot 2s ease-out forwards' }}>
                    <span className="text-cyan-400 font-bold text-xs drop-shadow-[1px_1px_0_black]">+{loot.exp} XP</span>
                    <span className="text-yellow-400 font-bold text-xs drop-shadow-[1px_1px_0_black]">+{loot.bits} Bits</span>
                    {loot.item && <span className="text-green-400 font-bold text-xs drop-shadow-[1px_1px_0_black]">+1 {loot.item}</span>}
                  </div>
                ))}

                {scanningTarget && (() => {
                  const targetVisual = getDigimonVisuals(scanningTarget.id, scanningTarget.level, false);
                  return (
                    <div className="absolute flex flex-col items-center justify-end z-20 pointer-events-none" style={{ top: `${scanningTarget.y}%`, left: `${scanningTarget.x}%`, transform: 'translate(-50%, -75%)', width: '80px', height: '110px' }}>
                      <div className="relative z-30" style={{ animation: 'suckIntoDigivice 2.5s ease-in-out forwards' }}>
                        {targetVisual.isSprite ? (
                          <div className="pixelated" style={{ width: '48px', height: '48px', backgroundImage: `url('${targetVisual.img}')`, backgroundSize: '300% 100%', backgroundPosition: `0% 0%`, imageRendering: 'pixelated' }} />
                        ) : (
                          <img src={targetVisual.img} className="w-16 h-16 object-contain pixelated" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        )}
                      </div>
                      <div className="absolute top-[40px] w-[14px] h-[70px] z-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.8), transparent)', borderRadius: '50%', filter: 'blur(1px)', animation: 'pulseDNA 0.5s infinite alternate, fadeOut 2.5s ease-in forwards' }} />
                      <div className="absolute -bottom-2 z-40 flex items-center justify-center drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transform scale-[0.55] origin-bottom">
                        <div style={{ width: '64px', height: '56px', animation: 'glowDigivice 2.5s ease-in-out forwards' }}>
                          <div className="relative w-full h-full bg-cyan-100 border-[3px] border-slate-700 rounded-[20px] flex items-center justify-center shadow-[inset_0_-5px_0_rgba(0,180,216,0.4)]">
                            <div className="absolute -top-[10px] left-[10px] w-[8px] h-[12px] bg-slate-700 rounded-t-md"></div>
                            <div className="absolute w-[44px] h-[44px] rounded-full border-[2px] border-slate-400/50 flex items-center justify-center">
                              <div className="w-[26px] h-[26px] bg-emerald-700 border-[2px] border-slate-700 rounded-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></div>
                            </div>
                            <div className="absolute right-[4px] top-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div>
                            <div className="absolute right-[4px] bottom-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div>
                            <div className="absolute left-[4px] top-[24px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {!isForest && cityHotspots.map(spot => {
                const dist = Math.sqrt(Math.pow(tamerPos.x - spot.x, 2) + Math.pow(tamerPos.y - spot.y, 2));
                if (dist < 8) {
                    return (
                        <div key={spot.id} className="absolute z-40 transform -translate-x-1/2 -translate-y-full animate-pulse pointer-events-none" style={{ top: `${spot.y - 2}%`, left: `${spot.x}%` }}>
                            <span className="bg-[#0a0f1a]/90 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-sm shadow-lg whitespace-nowrap uppercase tracking-widest">{spot.name}</span>
                        </div>
                    )
                }
                return null;
            })}

          </div>
      </div>

      {deathMessage && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-[#0a0f1a] border border-[#1e293b] py-4 px-8 shadow-2xl rounded-lg text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-2 drop-shadow-md">Aviso do Sistema</h2>
          <p className="text-slate-200 text-sm font-bold uppercase">{deathMessage}</p>
        </div>
      )}
    </>
  );
}