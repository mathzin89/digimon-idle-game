// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore'; 
import { useAuthStore } from '../store/useAuthStore';
import { TamerPortrait } from '../components/ui/TamerPortrait';

const digimonDict: Record<string, { name: string, img: string, menuImg: string, isSprite?: boolean }> = {
  'koromon': { name: 'Koromon', img: '/koromon-esq.png', menuImg: '/koromon-init.png', isSprite: true },
  'agumon': { name: 'Agumon', img: '/agu-dg-esquerda.png', menuImg: '/agumon-init.png', isSprite: true },
  'gabumon': { name: 'Gabumon', img: '/gabumon.gif', menuImg: '/gabumon.gif' },
  'palmon': { name: 'Palmon', img: '/palmon.gif', menuImg: '/palmon.gif' },
  'greymon': { name: 'Greymon', img: '/greymon.gif', menuImg: '/greymon.gif' },
  'metalgreymon': { name: 'MetalGreymon', img: '/metalgreymon.gif', menuImg: '/metalgreymon.gif' },
  'wargreymon': { name: 'WarGreymon', img: '/wargreymon.gif', menuImg: '/wargreymon.gif' },
  'patamon': { name: 'Patamon', img: 'https://wikimon.net/images/0/07/Patamon_b_ds.gif', menuImg: 'https://wikimon.net/images/0/07/Patamon_b_ds.gif' }
};

const getDigimonVisuals = (baseId: string, level: number) => {
  if (baseId === 'agumon') {
    if (level < 30) return { name: 'Koromon', img: '/koromon-esq.png', menuImg: '/koromon-init.png', isSprite: true };
    if (level < 100) return { name: 'Agumon', img: '/agu-dg-esquerda.png', menuImg: '/agumon-init.png', isSprite: true };
    if (level < 300) return { name: 'Greymon', img: '/greymon.gif', menuImg: '/greymon.gif', isSprite: false };
    if (level < 600) return { name: 'MetalGreymon', img: '/metalgreymon.gif', menuImg: '/metalgreymon.gif', isSprite: false };
    return { name: 'WarGreymon', img: '/wargreymon.gif', menuImg: '/wargreymon.gif', isSprite: false };
  }
  const data = digimonDict[baseId];
  return data ? { name: data.name, img: data.img, menuImg: data.menuImg, isSprite: data.isSprite } : { name: baseId, img: `/${baseId}.gif`, menuImg: `/${baseId}.gif`, isSprite: false };
};

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

  const [currentZone, setCurrentZone] = useState<'floresta' | 'cidade'>('floresta');

  const [tamerPos, setTamerPos] = useState({ x: 50, y: 50 });
  const [directionImg, setDirectionImg] = useState('/andar-baixo.png');
  const [frameStep, setFrameStep] = useState(0);
  
  const isMovingRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);

  const [damageNumbers, setDamageNumbers] = useState<{ id: number, instanceId: string, damage: number, x: number, y: number, isCrit: boolean }[]>([]);
  const [lootPopups, setLootPopups] = useState<{ id: number, x: number, y: number, exp: number, bits: number }[]>([]);

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
    if (isDataLoaded && hasCompletedTutorial && (!mapTargets || mapTargets.length === 0) && !scanningTarget && currentZone === 'floresta') {
      setMapHunt('koromon', 'Koromon', 1, digimonDict['koromon'].img, 'Normal');
    }
  }, [isDataLoaded, hasCompletedTutorial, mapTargets?.length, scanningTarget, setMapHunt, currentZone]);

  const walkSequence = [0, 1, 2, 1];

  useEffect(() => {
    const frameTimer = setInterval(() => {
      if (isMovingRef.current) {
        setFrameStep((prev) => (prev + 1) % walkSequence.length);
      } else {
        setFrameStep(0); 
      }
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

        if (Math.abs(dx) > Math.abs(dy)) {
          setDirectionImg(dx > 0 ? '/andar-dir.png' : '/andar-esq.png');
        } else {
          setDirectionImg(dy > 0 ? '/andar-baixo.png' : '/andar-cima.png');
        }

        if (dist < 4) {
          isMovingRef.current = false; 
          
          const now = Date.now();
          const ATTACK_SPEED_MS = 1000;

          if (now - lastAttackTimeRef.current >= ATTACK_SPEED_MS) {
            lastAttackTimeRef.current = now;

            const myLevel = myDigimons[activeDigimon]?.level || 1;
            
            let baseDamage = myLevel * 12; 
            const variance = baseDamage * 0.15;
            let finalDamage = Math.floor(baseDamage + (Math.random() * variance * 2) - variance);
            finalDamage = Math.max(1, finalDamage);

            const isCrit = Math.random() < 0.15;
            if (isCrit) finalDamage *= 2;

            attackMapTarget(target.instanceId, finalDamage);

            const newDamageId = Date.now();
            setDamageNumbers(prevNums => [
              ...prevNums, 
              { 
                id: newDamageId, 
                instanceId: target.instanceId, 
                damage: finalDamage,
                isCrit,
                x: target.x + (Math.random() * 4 - 2), 
                y: target.y - 5 - (Math.random() * 2) 
              }
            ]);

            setTimeout(() => {
              setDamageNumbers(prevNums => prevNums.filter(num => num.id !== newDamageId));
            }, 1000);
          }

          return prev;
        }

        isMovingRef.current = true;
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
  }, [mapTargets, scanningTarget, activeDigimon, myDigimons, attackMapTarget, isDataLoaded, hasCompletedTutorial, currentZone]);

  useEffect(() => {
    if (scanningTarget) {
      const newLootId = Date.now();
      const exp = (scanningTarget.level || 1) * 20;
      const bits = (scanningTarget.level || 1) * 25;
      
      setLootPopups(prev => [...prev, { id: newLootId, x: scanningTarget.x, y: scanningTarget.y, exp, bits }]);
      
      setTimeout(() => {
        setLootPopups(prev => prev.filter(p => p.id !== newLootId));
      }, 2000);

      const scanTimer = setTimeout(() => {
        finishDNAScan(scanningTarget);
      }, 2500); 
      return () => clearTimeout(scanTimer);
    }
  }, [scanningTarget, finishDNAScan]);

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

  const positions = ['0%', '50%', '100%'];
  // Variável para saber se o personagem está atacando agora (baseado nos números de dano na tela)
  const isAttacking = damageNumbers.length > 0;

  return (
    <div className="min-h-screen relative w-full h-screen overflow-hidden bg-[#4d9262] font-sans selection:bg-digi-cyan/30">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes suckIntoDigivice {
          0% { transform: translateY(0) scale(1); filter: brightness(1) drop-shadow(0 0 5px cyan); opacity: 0.9; }
          40% { transform: translateY(40px) scale(0.6); filter: brightness(2) drop-shadow(0 0 15px cyan) hue-rotate(45deg); opacity: 0.7; }
          100% { transform: translateY(100px) scale(0); filter: brightness(3); opacity: 0; }
        }
        @keyframes pulseDNA {
          from { width: 8px; opacity: 0.6; }
          to { width: 14px; opacity: 1; }
        }
        @keyframes fadeOut {
          0%, 80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes glowDigivice {
          0% { transform: scale(0.5) translateY(10px); filter: drop-shadow(0 0 0px cyan); opacity: 0; }
          20% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 10px cyan); opacity: 1; }
          50%, 80% { transform: scale(1.05); filter: drop-shadow(0 0 20px cyan); opacity: 1; }
          100% { transform: scale(1); filter: drop-shadow(0 0 5px cyan); opacity: 0; }
        }
        @keyframes floatDamage {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-15px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
        @keyframes floatCrit {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          15% { transform: translateY(-10px) scale(1.8); opacity: 1; filter: brightness(1.5); }
          100% { transform: translateY(-45px) scale(1.2); opacity: 0; }
        }
        @keyframes floatLoot {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-20px) scale(1.1); opacity: 1; }
          80% { transform: translateY(-40px) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(0.8); opacity: 0; }
        }
        @keyframes spinPortal {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .aura-elite { filter: drop-shadow(0 0 8px #3b82f6); }
        .aura-chefe { filter: drop-shadow(0 0 12px #ef4444) brightness(1.2); }
        .aura-divino { filter: drop-shadow(0 0 20px #fbbf24) brightness(1.4); }

        /* NOVIDADES DE COMBATE VISUAL */
        /* 1. Efeito de piscar vermelho quando o monstro toma hit */
        @keyframes flashHit {
          0%, 100% { filter: brightness(1) sepia(0); }
          50% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); }
        }
        .is-being-hit {
          animation: flashHit 0.3s ease-out;
        }

        /* 2. Efeito de explosão (Faísca) no inimigo */
        @keyframes hitSpark {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          30% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        /* 3. Efeito do Tamer/Digimon "Avançando" para atacar */
        @keyframes attackThrust {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(calc(-50% + 4px), -50%); } /* Um pequeno pulinho pra frente */
        }
        .attacking-bump {
          animation: attackThrust 0.3s ease-in-out infinite alternate;
        }
      `}} />

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {currentZone === 'floresta' ? (
          <div 
            className="absolute top-0 left-0 bg-[url('/map-bg.png')] bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-linear [image-rendering:pixelated]"
            style={{
              width: '150vw',
              height: '150vh',
              transform: `translate(
                clamp(-50vw, calc(50vw - ${tamerPos.x * 1.5}vw), 0vw), 
                clamp(-50vh, calc(50vh - ${tamerPos.y * 1.5}vh), 0vh)
              )`
            }}
          >
            {/* O SEU TAMER E SEU DIGIMON ATIVO (COM ANIMAÇÃO DE ATAQUE) */}
            <div 
              className={`absolute flex items-center gap-3 z-30 transition-all duration-100 ease-linear ${isAttacking ? 'attacking-bump' : ''}`}
              style={{ top: `${tamerPos.y}%`, left: `${tamerPos.x}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div 
                  className="pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" 
                  style={{ 
                    width: '56px', 
                    height: '56px', 
                    backgroundImage: `url('${directionImg}')`,
                    backgroundSize: '300% 100%',
                    backgroundPosition: `${positions[tamerFrame]} 0%`,
                    imageRendering: 'pixelated'
                  }} 
                />
                <div className="absolute bottom-2 w-8 h-2.5 bg-black/40 rounded-[100%] blur-[1px] -z-10"></div>
              </div>

              {activeDigimon && (() => {
                const activeStats = myDigimons[activeDigimon];
                const visual = activeStats ? getDigimonVisuals(activeDigimon, activeStats.level) : null;
                
                if (!visual) return null;

                return (
                  <div className="relative flex flex-col items-center justify-center">
                    {visual.isSprite ? (
                      <div 
                        className={`pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') ? '' : 'scale-x-[-1]'}`} 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundImage: `url('${visual.img}')`,
                          backgroundSize: '300% 100%',
                          backgroundPosition: `${positions[tamerFrame]} 0%`,
                          imageRendering: 'pixelated'
                        }} 
                      />
                    ) : (
                      <img 
                        src={visual.img} 
                        alt="Seu Digimon" 
                        className={`w-14 h-14 object-contain pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 ${directionImg.includes('esq') ? '' : 'scale-x-[-1]'} ${isMovingRef.current ? 'animate-bounce' : ''}`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="absolute bottom-1 w-8 h-2.5 bg-black/40 rounded-[100%] blur-[1px] -z-10"></div>
                  </div>
                );
              })()}
            </div>

            {/* MONSTROS ERRANTES COM EFEITOS DE HIT */}
            {mapTargets && mapTargets.map((target) => {
              const rarity = (target as any).rarity || 'Normal';
              const isBoss = rarity === 'Chefe' || rarity === 'Divino';
              const auraClass = rarity === 'Divino' ? 'aura-divino' : rarity === 'Chefe' ? 'aura-chefe' : rarity === 'Elite' ? 'aura-elite' : '';
              
              const enemyVisual = getDigimonVisuals(target.id, target.level);
              
              // Verifica se este monstro específico está tomando dano agora
              const isTakingDamage = damageNumbers.some(d => d.instanceId === target.instanceId);

              return (
                <div 
                  key={target.instanceId}
                  className="absolute flex flex-col items-center group transition-all duration-100 ease-linear z-20 pointer-events-auto cursor-pointer"
                  style={{ top: `${target.y}%`, left: `${target.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="relative flex flex-col items-center justify-center">
                    
                    {/* A Faísca de Impacto em cima do Monstro */}
                    {isTakingDamage && (
                      <div 
                        className="absolute top-1/2 left-1/2 z-50 text-4xl pointer-events-none drop-shadow-[0_0_5px_white]"
                        style={{ animation: 'hitSpark 0.4s ease-out forwards' }}
                      >
                        💥
                      </div>
                    )}

                    {/* Renderização do Inimigo com a classe de piscar (is-being-hit) */}
                    {enemyVisual.isSprite ? (
                      <div 
                        className={`pixelated relative z-10 animate-bounce ${auraClass} ${isBoss ? 'scale-150 mb-4' : 'scale-100'} ${isTakingDamage ? 'is-being-hit' : ''}`} 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundImage: `url('${enemyVisual.img}')`,
                          backgroundSize: '300% 100%',
                          backgroundPosition: `${positions[tamerFrame]} 0%`, 
                          imageRendering: 'pixelated'
                        }} 
                      />
                    ) : (
                      <img 
                        src={enemyVisual.img} 
                        alt={target.name} 
                        className={`relative object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] pixelated animate-bounce z-10 ${auraClass} ${isBoss ? 'w-36 h-36' : 'w-20 h-20'} ${isTakingDamage ? 'is-being-hit' : ''}`}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}

                    <div className={`absolute bottom-0 ${isBoss ? 'w-24 h-6' : 'w-12 h-3.5'} bg-black/40 rounded-[100%] blur-[1.5px] -z-10`}></div>
                  </div>

                  {isBoss ? (
                    <div className={`bg-red-950/90 px-3 py-1 rounded border-2 ${rarity === 'Divino' ? 'border-yellow-400 shadow-[0_0_15px_yellow]' : 'border-red-500 shadow-[0_0_15px_red]'} text-center mt-2 w-36`}>
                      <span className={`${rarity === 'Divino' ? 'text-white' : 'text-yellow-400'} text-xs font-black truncate block uppercase drop-shadow-md`}>{rarity === 'Divino' ? '✨' : '⚠️'} {target.name}</span>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mt-1 border border-red-900">
                        <div className={`h-full transition-all ${rarity === 'Divino' ? 'bg-gradient-to-r from-yellow-300 to-white' : 'bg-gradient-to-r from-red-600 to-yellow-400'}`} style={{ width: `${Math.max(0, (target.hp / target.maxHp) * 100)}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/90 px-2 py-0.5 rounded border border-slate-700 text-center mt-1 w-24 shadow-lg">
                      <span className={`text-[10px] font-bold truncate block ${rarity === 'Elite' ? 'text-blue-300' : 'text-slate-200'}`}>{target.name}</span>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mt-0.5">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${Math.max(0, (target.hp / target.maxHp) * 100)}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* NÚMEROS DE DANO COM SUPORTE A CRÍTICO */}
            {damageNumbers.map((damageItem) => (
               <div 
                 key={damageItem.id}
                 className={`absolute z-50 pointer-events-none font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] ${damageItem.isCrit ? 'text-yellow-400 text-2xl' : 'text-red-500 text-lg'}`}
                 style={{
                   left: `${damageItem.x}%`,
                   top: `${damageItem.y}%`,
                   transform: 'translate(-50%, -50%)',
                   animation: `${damageItem.isCrit ? 'floatCrit' : 'floatDamage'} 1s ease-out forwards`,
                 }}
               >
                 {damageItem.isCrit && <span className="block text-[8px] text-white -mb-1 ml-2">CRIT!</span>}
                 -{damageItem.damage}
               </div>
            ))}

            {/* LOOTS FLUTUANTES NO MAPA */}
            {lootPopups.map(loot => (
              <div key={loot.id} className="absolute z-50 pointer-events-none flex flex-col items-center gap-0.5" style={{ left: `${loot.x}%`, top: `${loot.y}%`, transform: 'translate(-50%, -50%)', animation: 'floatLoot 2s ease-out forwards' }}>
                <span className="text-blue-400 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">+{loot.exp} XP</span>
                <span className="text-yellow-500 font-black text-sm drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">+{loot.bits} Bits</span>
              </div>
            ))}

            {/* A ANIMAÇÃO DO DIGIVICE NO LOCAL DA DERROTA */}
            {scanningTarget && (() => {
              const targetVisual = getDigimonVisuals(scanningTarget.id, scanningTarget.level);
              return (
                <div
                  className="absolute flex flex-col items-center justify-end z-20 pointer-events-none"
                  style={{
                    top: `${scanningTarget.y}%`,
                    left: `${scanningTarget.x}%`,
                    transform: 'translate(-50%, -75%)',
                    width: '80px', 
                    height: '150px' 
                  }}
                >
                  {targetVisual.isSprite ? (
                    <div 
                      className={`absolute top-0 pixelated z-30 ${scanningTarget.rarity === 'Chefe' || scanningTarget.rarity === 'Divino' ? 'scale-[2.0]' : 'scale-110'}`} 
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundImage: `url('${targetVisual.img}')`,
                        backgroundSize: '300% 100%',
                        backgroundPosition: `0% 0%`,
                        imageRendering: 'pixelated',
                        animation: 'suckIntoDigivice 2.5s ease-in-out forwards'
                      }} 
                    />
                  ) : (
                    <img
                      src={targetVisual.img}
                      alt={`${scanningTarget.name} derrotado`}
                      className={`absolute top-0 object-contain pixelated z-30 ${scanningTarget.rarity === 'Chefe' || scanningTarget.rarity === 'Divino' ? 'w-24 h-24' : 'w-16 h-16'}`}
                      style={{ animation: 'suckIntoDigivice 2.5s ease-in-out forwards' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}

                  <div
                    className="absolute top-[35px] w-[14px] h-[90px] z-20"
                    style={{
                      background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.8), transparent)',
                      borderRadius: '50%',
                      filter: 'blur(1px)',
                      animation: 'pulseDNA 0.5s infinite alternate, fadeOut 2.5s ease-in forwards'
                    }}
                  />

                  <div className="absolute bottom-0 z-40 flex items-center justify-center drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transform scale-[0.55] origin-bottom">
                    <div
                      style={{
                        width: '64px',
                        height: '56px',
                        animation: 'glowDigivice 2.5s ease-in-out forwards'
                      }}
                    >
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
          </div>
        ) : (
          /* MODO CIDADE */
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/cidade-bg.png')] bg-cover bg-center bg-no-repeat pointer-events-auto flex items-center justify-center">
             <div className="relative w-[800px] h-[600px] bg-black/40 border-4 border-slate-700/50 rounded-xl backdrop-blur-sm p-8 flex flex-col items-center shadow-2xl">
               <h1 className="text-3xl font-black text-digi-cyan uppercase tracking-widest mb-10 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">Cidade do Começo</h1>
               <div className="flex gap-16">
                 <div onClick={() => setActiveModal('shop')} className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                   <div className="w-24 h-24 bg-red-900/80 border-2 border-red-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_red] group-hover:bg-red-800"><span className="text-4xl">🛒</span></div>
                   <span className="text-white font-bold bg-slate-900 px-3 py-1 rounded border border-slate-700 uppercase tracking-widest text-xs">Mercado Local</span>
                 </div>
                 <div onClick={() => setActiveModal('pc')} className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                   <div className="w-24 h-24 bg-blue-900/80 border-2 border-blue-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_blue] group-hover:bg-blue-800"><span className="text-4xl">💻</span></div>
                   <span className="text-white font-bold bg-slate-900 px-3 py-1 rounded border border-slate-700 uppercase tracking-widest text-xs">Digi-Bank</span>
                 </div>
                 <div onClick={() => alert('Mercado Livre de Jogadores em breve!')} className="group flex flex-col items-center cursor-pointer hover:scale-110 transition-transform">
                   <div className="w-24 h-24 bg-emerald-900/80 border-2 border-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_#10b981] group-hover:bg-emerald-800 relative">
                     <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-pulse">NOVO</span><span className="text-4xl">🤝</span>
                   </div>
                   <span className="text-white font-bold bg-slate-900 px-3 py-1 rounded border border-slate-700 uppercase tracking-widest text-xs">Mercado Online</span>
                 </div>
               </div>
               <div className="absolute bottom-10 flex flex-col items-center pointer-events-none">
                 <div className="flex gap-4 items-end">
                   <div className="pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ width: '64px', height: '64px', backgroundImage: `url('/andar-baixo.png')`, backgroundSize: '300% 100%', backgroundPosition: `0% 0%`, imageRendering: 'pixelated' }} />
                   {activeDigimon && (() => {
                     const visual = getDigimonVisuals(activeDigimon, myDigimons[activeDigimon]?.level || 1);
                     return <img src={visual.menuImg} className="w-16 h-16 object-contain pixelated drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" />;
                   })()}
                 </div>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 2. UI DO JOGADOR                                     */}
      {/* ==================================================== */}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button onClick={() => setCurrentZone(prev => prev === 'floresta' ? 'cidade' : 'floresta')} className="bg-slate-950/90 border-2 border-digi-cyan text-digi-cyan px-6 py-2 rounded-full font-black uppercase tracking-widest hover:bg-digi-cyan hover:text-slate-900 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          Viajar para: {currentZone === 'floresta' ? '🏰 Cidade Inicial' : '🌲 Floresta (Hunt)'}
        </button>
      </div>

      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-950/90 border border-slate-700/50 rounded-md p-1.5 flex gap-2 shadow-lg backdrop-blur-sm pointer-events-auto">
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
             const visual = getDigimonVisuals(id, stats?.level || 1);
             return (
               <div key={id} onClick={() => setActiveDigimon(id)} className={`bg-slate-900 border ${isActive ? 'border-digi-gold shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'border-slate-800'} rounded p-1.5 flex items-center gap-2 cursor-pointer hover:border-digi-cyan/50 transition-all`}>
                 <img 
                   src={visual.menuImg} 
                   className="w-10 h-10 object-contain bg-slate-950 rounded border border-slate-700 p-1 pixelated" 
                   alt={visual.name}
                   onError={(e) => { e.currentTarget.style.display = 'none'; }}
                 />
                 <div className="flex-1">
                   <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                     <span className="flex items-center gap-1">{isActive && <span className="text-[10px]">👑</span>} {visual.name}</span>
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

      {/* === MODAIS COMPLETOS === */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto">
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
                        const data = digimonDict[id] || { name: 'Desconhecido', menuImg: '' };
                        return (
                          <div key={id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center gap-4">
                            <img src={data.menuImg} className={`w-12 h-12 object-contain bg-slate-950 rounded border ${isReady ? 'border-digi-cyan' : 'border-slate-700 grayscale'} pixelated`} />
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
                        <img src={data.menuImg} alt={data.name} className={`w-12 h-12 object-contain p-1 ${hasDigimon ? '' : 'brightness-0 opacity-30'} pixelated`} />
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
                    <button onClick={() => { setMapHunt('koromon', 'Koromon', 1, digimonDict['koromon'].img, 'Normal'); closeModal(); setCurrentZone('floresta'); }} className="absolute top-1/4 left-1/4 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-digi-gold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="/koromon-init.png" className="w-10 h-10 object-contain pixelated" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Pradaria Koromon</p></div>
                    </button>
                    <button onClick={() => { setMapHunt('agumon', 'Agumon', 20, digimonDict['agumon'].img, 'Normal'); closeModal(); setCurrentZone('floresta'); }} className="absolute top-1/2 left-2/3 group transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-12 h-12 bg-slate-900 border-2 border-slate-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-digi-cyan transition-transform z-10 relative overflow-hidden"><img src="/agumon-init.png" className="w-10 h-10 object-contain pixelated" /></div>
                      <div className="bg-slate-950/90 border border-slate-700 px-2 py-0.5 rounded mt-1 text-center"><p className="text-[10px] font-bold text-white uppercase">Ninho Agumon</p></div>
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