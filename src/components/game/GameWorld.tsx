// src/components/game/GameWorld.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { getDigimonVisuals } from '../../utils/digimonVisuals';
import { playSound } from '../../utils/audioManager';

export type ModalType = 'inventory' | 'shop' | 'settings' | 'map' | 'pc' | 'quests' | 'profile' | 'digipedia' | 'gamepass' | 'incubator' | null;

interface GameWorldProps { 
  currentZone: 'floresta' | 'cidade'; 
  setActiveModal: (modal: ModalType) => void; 
  setCurrentZone: (zone: 'floresta' | 'cidade') => void; 
}

interface Hotspot { 
  id: string; 
  modal: ModalType | 'toast'; 
  name: string; 
  x: number; 
  y: number; 
  r: number; 
  msg?: string; 
}

const getSpriteData = (data: any) => {
  if (!data) return {};
  const src = data.sprites || data; 
  return {
      s_down: src.down || src.baixo || src.frente || src.andarBaixo || src.andar_baixo || src.andarbaixo,
      s_up: src.up || src.cima || src.costas || src.andarCima || src.andar_cima || src.andarcima,
      s_left: src.left || src.esquerda || src.esq || src.andarEsq || src.andar_esq || src.andaresq,
      s_right: src.right || src.direita || src.dir || src.direida || src.andarDir || src.andar_dir || src.andardir,
      s_atk: src.attack || src.ataque || src.atk || src.ataqueBase || src.ataque_base
  };
};

export function GameWorld({ currentZone, setActiveModal, setCurrentZone }: GameWorldProps) {
  const { 
    avatar, mapTargets, scanningTarget, activeDigimon, myDigimons, equippedGear, soundEnabled,
    attackMapTarget, takeDamage, finishDNAScan, setMapHunt, isDataLoaded, hasCompletedTutorial, currentHuntType,
    serverDigimons, activeMapId, changeMap, serverMaps
  } = useGameStore();

  const [tamerPos, setTamerPos] = useState({ x: 50, y: 60 });
  const [tamerLogicalDir, setTamerLogicalDir] = useState<'down'|'up'|'left'|'right'>('down');
  
  const tamerPosRef = useRef(tamerPos);
  useEffect(() => { tamerPosRef.current = tamerPos; }, [tamerPos]);
  
  const getAvatarDirection = (gender: string, dir: string) => {
    const isFemale = gender === 'sora';
    if (isFemale) {
       switch (dir) { case 'baixo': return '/Frente feminina.png'; case 'cima': return '/costas feminina.png'; case 'esq': return '/esquerda feminina.png'; case 'dir': return '/Direita feminina.png'; case 'deitado': return '/Frente feminina.png'; default: return '/Frente feminina.png'; }
    } else {
       switch (dir) { case 'baixo': return '/Frente - masculino.png'; case 'cima': return '/Costas masculina.png'; case 'esq': return '/Esquerda - Masculino.png'; case 'dir': return '/Direita - masculino.png'; case 'deitado': return '/deitado - masculino.png'; default: return '/Frente - masculino.png'; }
    }
  };

  const [directionImg, setDirectionImg] = useState(getAvatarDirection(avatar, 'baixo'));
  const [frameStep, setFrameStep] = useState(0); 
  const [globalFrame, setGlobalFrame] = useState(0); 
  const [isFainted, setIsFainted] = useState(false);
  
  const isMovingRef = useRef(false);
  const lastAttackTimeRef = useRef<number>(0);
  const keysRef = useRef(new Set<string>());

  const [damageNumbers, setDamageNumbers] = useState<{ id: number, instanceId?: string, damage: number, x: number, y: number, isCrit: boolean, target: 'enemy' | 'player' }[]>([]);
  const [lootPopups, setLootPopups] = useState<{ id: number, x: number, y: number, exp: number, bits: number, item: string | null }[]>([]);
  const [deathMessage, setDeathMessage] = useState('');

  const cityHotspots: Hotspot[] = [
    { id: 'clinic', modal: 'toast', name: '🏥 Clínica', x: 46.5, y: 39.0, r: 1.8, msg: 'Clínica em construção!' }, 
    { id: 'shop', modal: 'shop', name: '🛒 Mercado', x: 54.8, y: 38.7, r: 1.8 }, 
    { id: 'incubator', modal: 'incubator', name: '🥚 Incubadora', x: 38.9, y: 49.8, r: 1.8 }, 
    { id: 'park', modal: 'toast', name: '⛲ Parque', x: 44.4, y: 54.1, r: 1.8, msg: 'Parque em breve!' }, 
    { id: 'farm', modal: 'toast', name: '🌱 Fazenda', x: 59.0, y: 55.7, r: 1.8, msg: 'Fazenda em breve!' }, 
    { id: 'arena', modal: 'toast', name: '⚔️ Arena', x: 63.3, y: 37.4, r: 1.8, msg: 'Arena PvP em breve!' }, 
    { id: 'map', modal: 'map', name: '🗺️ Mapa Mundi', x: 50.0, y: 46.0, r: 2.5 } 
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  useEffect(() => {
    if (isDataLoaded && hasCompletedTutorial && !currentHuntType && !activeMapId && currentZone === 'floresta') {
      const availableMaps = Object.values(serverMaps || {});
      if (availableMaps.length > 0) changeMap(availableMaps[0].id);
      else setMapHunt('koromon', 'Koromon (Local)', 1, '/koromon-esq.png', 'Normal');
    }
  }, [isDataLoaded, hasCompletedTutorial, currentHuntType, activeMapId, currentZone, serverMaps, changeMap, setMapHunt]);

  const walkSequence = [0, 1, 2, 1];

  useEffect(() => {
    const frameTimer = setInterval(() => {
      if (isMovingRef.current && !isFainted) setFrameStep((prev) => (prev + 1) % walkSequence.length);
      else setFrameStep(0); 
    }, 120); 
    return () => clearInterval(frameTimer);
  }, [isFainted, walkSequence.length]);

  useEffect(() => {
    const globalTimer = setInterval(() => { setGlobalFrame((prev) => prev + 1); }, 250);
    return () => clearInterval(globalTimer);
  }, []);

  useEffect(() => {
    if (!isDataLoaded || !hasCompletedTutorial || isFainted || currentZone === 'cidade') return;
    const enemyMoveInterval = setInterval(() => {
      useGameStore.setState(state => {
         let hasChanges = false;
         let currentTargets = state.mapTargets;
         
         if (currentTargets.length > 4) {
             currentTargets = currentTargets.slice(0, 4);
             hasChanges = true;
         }

         const newTargets = currentTargets.map(target => {
            const tx = tamerPosRef.current.x; const ty = tamerPosRef.current.y;
            const dx = tx - target.x; const dy = ty - target.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 4 && dist < 45) { 
               hasChanges = true;
               const speed = 0.015; 
               let newDir = target.dir || 'down';
               if (Math.abs(dx) > Math.abs(dy)) { newDir = dx > 0 ? 'right' : 'left'; } 
               else { newDir = dy > 0 ? 'down' : 'up'; }
               return { ...target, x: target.x + (dx/dist)*speed, y: target.y + (dy/dist)*speed, dir: newDir as any };
            }
            return target;
         });

         if (hasChanges) return { mapTargets: newTargets };
         return {};
      });
    }, 50);
    return () => clearInterval(enemyMoveInterval);
  }, [isDataLoaded, hasCompletedTutorial, isFainted, currentZone]);

  const tamerFrame = walkSequence[frameStep];

  useEffect(() => {
    if (currentZone === 'cidade') { 
        setTamerPos({ x: 50, y: 42 }); 
        setDirectionImg(getAvatarDirection(avatar, 'baixo')); 
        setTamerLogicalDir('down'); 
        setIsFainted(false); 
        keysRef.current.clear(); 
    }
  }, [currentZone, avatar]);

  const isWalkable = (x: number, y: number) => {
      return x >= 2 && x <= 98 && y >= 2 && y <= 98; 
  };

  useEffect(() => {
    if (!isDataLoaded || !hasCompletedTutorial || isFainted) return;
    const moveInterval = setInterval(() => {
      const isModalOpen = document.querySelector('.z-50.backdrop-blur-sm') !== null || document.querySelector('.z-\\[60\\]') !== null;
      if (currentZone === 'cidade') {
         if (isModalOpen) { isMovingRef.current = false; keysRef.current.clear(); return; }
         let dx = 0; let dy = 0;
         if (keysRef.current.has('w') || keysRef.current.has('arrowup')) dy -= 1; if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) dy += 1; if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) dx -= 1; if (keysRef.current.has('d') || keysRef.current.has('arrowright')) dx += 1;

         if (dx !== 0 || dy !== 0) {
            isMovingRef.current = true; const dist = Math.sqrt(dx*dx + dy*dy); const speed = 0.22; 
            setTamerPos(prev => {
                let nextX = prev.x + (dx/dist) * speed; let nextY = prev.y + (dy/dist) * speed;
                let finalX = prev.x; let finalY = prev.y;
                if (isWalkable(nextX, prev.y)) finalX = nextX; if (isWalkable(prev.x, nextY)) finalY = nextY;
                for (const spot of cityHotspots) {
                    const d = Math.sqrt(Math.pow(finalX - spot.x, 2) + Math.pow(finalY - spot.y, 2));
                    if (d < spot.r) {
                        if (spot.modal === 'toast') { setDeathMessage(spot.msg || 'Área em construção!'); setTimeout(() => setDeathMessage(''), 2000); } 
                        else { setActiveModal(spot.modal as ModalType); keysRef.current.clear(); }
                        finalX = prev.x - (dx/dist) * 2; finalY = prev.y - (dy/dist) * 2; break;
                    }
                }
                if (Math.abs(dx) > Math.abs(dy)) { setDirectionImg(getAvatarDirection(avatar, dx > 0 ? 'dir' : 'esq')); setTamerLogicalDir(dx > 0 ? 'right' : 'left'); } 
                else { setDirectionImg(getAvatarDirection(avatar, dy > 0 ? 'baixo' : 'cima')); setTamerLogicalDir(dy > 0 ? 'down' : 'up'); }
                return { x: finalX, y: finalY };
            });
         } else { isMovingRef.current = false; }
      } else {
         if (scanningTarget || !mapTargets || mapTargets.length === 0 || isModalOpen) { isMovingRef.current = false; return; }
         setTamerPos((prev) => {
            const target = mapTargets[0];
            if (!target) return prev;
            const dx = target.x - prev.x; const dy = target.y - prev.y; const dist = Math.sqrt(dx * dx + dy * dy);

            if (Math.abs(dx) > Math.abs(dy)) { setDirectionImg(getAvatarDirection(avatar, dx > 0 ? 'dir' : 'esq')); setTamerLogicalDir(dx > 0 ? 'right' : 'left'); } 
            else { setDirectionImg(getAvatarDirection(avatar, dy > 0 ? 'baixo' : 'cima')); setTamerLogicalDir(dy > 0 ? 'down' : 'up'); }

            if (dist < 4) {
               isMovingRef.current = false; const now = Date.now();
               if (now - lastAttackTimeRef.current >= 1000) {
                 lastAttackTimeRef.current = now;
                 const myLevel = myDigimons[activeDigimon]?.level || 1;
                 let pBaseDamage = myLevel * 12; if (equippedGear === 'garra_combate') pBaseDamage = Math.floor(pBaseDamage * 1.5);
                 const pVar = pBaseDamage * 0.15; let pDamage = Math.floor(pBaseDamage + (Math.random() * pVar * 2) - pVar); pDamage = Math.max(1, pDamage);
                 const pCrit = Math.random() < 0.15; if (pCrit) pDamage *= 2;
                 playSound('hit', soundEnabled); attackMapTarget(target.instanceId, pDamage);

                 let eBaseDamage = target.level * 8; const eVar = eBaseDamage * 0.15; let eDamage = Math.floor(eBaseDamage + (Math.random() * eVar * 2) - eVar); eDamage = Math.max(1, eDamage);
                 const eCrit = Math.random() < 0.10; if (eCrit) eDamage *= 2;
                 const isDead = takeDamage(eDamage);

                 const nowId = Date.now();
                 setDamageNumbers(prevNums => [ ...prevNums, { id: nowId, instanceId: target.instanceId, damage: pDamage, isCrit: pCrit, target: 'enemy', x: target.x + (Math.random() * 4 - 2), y: target.y - 5 - (Math.random() * 2) }, { id: nowId + 1, damage: eDamage, isCrit: eCrit, target: 'player', x: prev.x + (Math.random() * 4 - 2), y: prev.y - 5 - (Math.random() * 2) } ]);
                 setTimeout(() => setDamageNumbers(prevNums => prevNums.filter(num => num.id !== nowId && num.id !== nowId + 1)), 1000);

                 if (isDead) {
                   const statsAny = myDigimons[activeDigimon] as any;
                   let cleanDeathName = String(activeDigimon).split('_')[0].split('-')[0];
                   if (statsAny?.name) cleanDeathName = statsAny.name;
                   
                   setIsFainted(true); setDirectionImg(getAvatarDirection(avatar, 'deitado')); setDeathMessage(`O ${cleanDeathName} desmaiou!`);
                   setTimeout(() => { setDeathMessage(''); setIsFainted(false); setCurrentZone('cidade'); }, 3000); 
                 }
               }
               return prev;
            }
            isMovingRef.current = true; const speed = 0.08; return { x: prev.x + (dx / dist) * speed, y: prev.y + (dy / dist) * speed };
         });
      }
    }, 30);
    return () => clearInterval(moveInterval);
  }, [mapTargets, scanningTarget, activeDigimon, myDigimons, attackMapTarget, takeDamage, isDataLoaded, hasCompletedTutorial, currentZone, equippedGear, soundEnabled, setCurrentZone, avatar, isFainted]);

  useEffect(() => {
    if (scanningTarget) {
      const scanTimer = setTimeout(() => {
        const newLootId = Date.now(); const lootResult = finishDNAScan(scanningTarget);
        playSound(lootResult.leveledUp ? 'levelup' : 'loot', soundEnabled);
        setLootPopups(prev => [...prev, { id: newLootId, x: scanningTarget.x, y: scanningTarget.y, exp: lootResult.exp, bits: lootResult.bits, item: lootResult.item }]);
        setTimeout(() => setLootPopups(prev => prev.filter(p => p.id !== newLootId)), 2000);
      }, 2500); return () => clearTimeout(scanTimer);
    }
  }, [scanningTarget, finishDNAScan, soundEnabled]);

  const positions = ['0%', '50%', '100%'];
  const isAttacking = damageNumbers.some(d => d.target === 'enemy');
  const isForest = currentZone === 'floresta';

  const renderSpriteSheet = (imgSrc: string, isBoss: boolean, isHit: boolean, flip: boolean, isSpriteSheet: boolean) => {
    const frameIndex = globalFrame % 3;
    const size = isBoss ? '72px' : '48px';
    
    const imgStyle = isSpriteSheet 
      ? { width: '300%', height: '100%', transform: `translateX(-${(frameIndex * 100) / 3}%)` } 
      : { width: '100%', height: '100%', left: '0', transform: 'none', objectFit: 'contain' as const };

    return (
      // 🔥 O flip agora usa "-scale-x-100" que é o jeito certo no Tailwind!
      <div className={`relative overflow-hidden flex items-center justify-center ${isHit ? 'hit-anim' : ''} ${flip ? '-scale-x-100' : ''} ${!isSpriteSheet ? 'idle-bob' : ''}`} style={{ width: size, height: size }}>
        {imgSrc && (
          <img 
            src={imgSrc} 
            className="absolute top-0 left-0 max-w-none pixelated" 
            style={imgStyle}
            onError={(e) => { e.currentTarget.style.opacity = '0.5'; }} 
          />
        )}
      </div>
    );
  };

  const bgTransform = isForest
    ? `translate(clamp(-50vw, calc(50vw - ${tamerPos.x * 1.5}vw), 0px), clamp(-50vh, calc(50vh - ${tamerPos.y * 1.5}vh), 0px))`
    : `translate(clamp(calc(100vw - 3200px), calc(50vw - ${(tamerPos.x / 100) * 3200}px), 0px), clamp(calc(100vh - 1800px), calc(50vh - ${(tamerPos.y / 100) * 1800}px), 0px))`;

  return (
    <>
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none bg-[#050811]">
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes monsterHit { 
              0%, 100% { filter: brightness(1) sepia(0); margin-left: 0px; } 
              25% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); margin-left: -3px; } 
              75% { filter: brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(5); margin-left: 3px; } 
            }
            @keyframes suckIntoDigivice {
              0% { transform: translateY(0) scale(1); opacity: 1; filter: brightness(1); }
              40% { transform: translateY(-40px) scale(1.3) rotate(10deg); filter: brightness(2) drop-shadow(0 0 15px cyan); }
              100% { transform: translateY(50px) scale(0) rotate(-360deg); opacity: 0; filter: brightness(5) drop-shadow(0 0 30px cyan); }
            }
            @keyframes pulseDNA {
              0% { opacity: 0.5; filter: blur(1px) hue-rotate(0deg); }
              100% { opacity: 1; filter: blur(2px) hue-rotate(90deg); }
            }
            @keyframes fadeOut {
              0%, 80% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes idleBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }
            @keyframes glowDigivice {
              0%, 100% { filter: drop-shadow(0 -5px 10px rgba(0, 180, 216, 0.4)); transform: scale(1); }
              50% { filter: drop-shadow(0 -10px 25px rgba(0, 255, 255, 0.8)); transform: scale(1.05); }
            }
            .hit-anim { animation: monsterHit 0.3s ease-out; }
            .idle-bob { animation: idleBob 1.2s ease-in-out infinite; }
            ::-webkit-scrollbar { width: 4px; height: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
            ::-webkit-scrollbar-thumb:hover { background: #334155; }
          `}} />

          {currentZone === 'cidade' && (
            <div className="absolute top-4 left-4 z-[100] bg-black/80 border border-cyan-500 text-cyan-400 text-[10px] px-3 py-1.5 rounded font-mono shadow-[0_0_10px_rgba(34,211,238,0.3)] pointer-events-none backdrop-blur-sm">
              📡 GPS DEV: X: {tamerPos.x.toFixed(1)} | Y: {tamerPos.y.toFixed(1)}
            </div>
          )}

          <div 
            className={`absolute top-0 left-0 transition-transform duration-75 ease-linear bg-center bg-no-repeat ${isForest ? '[image-rendering:pixelated] bg-cover' : 'bg-cover'}`} 
            style={{ 
              backgroundImage: (isForest && activeMapId && serverMaps[activeMapId]?.bgImg) ? `url('${serverMaps[activeMapId].bgImg}')` : (isForest ? "url('/map-bg.png')" : "url('/cidade-bg.jpg')"),
              width: isForest ? '150vw' : '3200px', height: isForest ? '150vh' : '1800px', 
              transform: bgTransform
            }}
          >
            <div className={`absolute flex items-center gap-3 z-30 transition-all duration-75 ease-linear ${isAttacking ? 'attacking-bump' : ''}`} style={{ top: `${tamerPos.y}%`, left: `${tamerPos.x}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative flex flex-col items-center justify-center">
                <div className={`pixelated relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${isFainted ? 'animate-pulse grayscale' : ''}`} style={{ width: '48px', height: '48px', backgroundImage: `url('${directionImg}')`, backgroundSize: isFainted ? '100% 100%' : '300% 100%', backgroundPosition: isFainted ? '0% 0%' : `${positions[tamerFrame]} 0%`, imageRendering: 'pixelated', backgroundColor: directionImg ? 'transparent' : 'rgba(255,0,0,0.5)' }} />
                {!isFainted && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-black/60 rounded-[100%] blur-[1px] -z-10"></div>}
              </div>

              {activeDigimon && !isFainted && (() => {
                const activeStats = myDigimons[activeDigimon];
                if (!activeStats) return null; 
                
                let cleanId = String(activeDigimon).split('_')[0].split('-')[0].toLowerCase();
                
                const statsAny = activeStats as any;
                if (statsAny?.name) {
                    const nameClean = String(statsAny.name).split('_')[0].split('-')[0].toLowerCase();
                    if (serverDigimons[nameClean] || serverDigimons[Object.keys(serverDigimons).find(k => k.toLowerCase() === nameClean) || '']) {
                        cleanId = nameClean;
                    }
                }
                
                const visual = getDigimonVisuals(cleanId, activeStats.level, true);
                const serverKey = Object.keys(serverDigimons).find(k => k.toLowerCase() === cleanId) || cleanId;
                const serverData = serverDigimons[serverKey];
                const isTakingDamage = damageNumbers.some(d => d.target === 'player');
                
                let currentImg = visual.img;
                let isSprite = visual.isSprite !== false; 
                let needsFlip = false;

                if (serverData) {
                   const { s_down, s_up, s_left, s_right, s_atk } = getSpriteData(serverData);
                   
                   if (s_down || s_left || s_right || s_up) {
                       // 🔥 CORREÇÃO: Volta a ser considerado "isSprite = true" por padrão! Fim dos 3 Kuromons!
                       isSprite = (serverData as any).isSprite !== false;
                       let chosen = s_down || s_left || s_right || s_up; 
                       
                       if (isAttacking && s_atk) { 
                           chosen = s_atk; 
                       } else {
                           if (tamerLogicalDir === 'down') chosen = s_down || chosen;
                           else if (tamerLogicalDir === 'up') chosen = s_up || s_down || chosen; 
                           else if (tamerLogicalDir === 'left') {
                               if (s_left) chosen = s_left;
                               else if (s_right) { chosen = s_right; needsFlip = true; }
                           }
                           else if (tamerLogicalDir === 'right') {
                               if (s_right) chosen = s_right;
                               else if (s_left) { chosen = s_left; needsFlip = true; }
                           }
                       }
                       if (chosen) currentImg = chosen;
                   } else if (serverData.menuImg) {
                       currentImg = serverData.menuImg;
                       isSprite = false;
                   }
                }
                
                if (!isSprite && tamerLogicalDir === 'left') { needsFlip = true; }
                
                const hpPercent = Math.max(0, (activeStats.hp / activeStats.maxHp) * 100);

                return (
                  <div className="relative flex flex-col items-center justify-center">
                    {isForest && ( <div className="absolute -top-4 w-10 h-1.5 bg-[#111] border border-black rounded-full overflow-hidden z-20 shadow-md"><div className="h-full bg-red-500 transition-all duration-200" style={{ width: `${hpPercent}%` }}></div></div> )}
                    <div className="relative z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-200 flex items-center justify-center">
                       {renderSpriteSheet(currentImg, false, isTakingDamage, needsFlip, isSprite)}
                    </div>
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-black/60 rounded-[100%] blur-[1px] -z-10"></div>
                  </div>
                );
              })()}
            </div>

            {isForest && (
              <>
                 {/* 🔥 Aqui usamos o mapTargets com o INDEX para o key resolver aquele bug doido que te fazia pular */}
                 {mapTargets && mapTargets.map((target, index) => {
                  const rarity = (target as any).rarity || 'Normal';
                  const isBoss = rarity === 'Chefe' || rarity === 'Divino';
                  const auraClass = rarity === 'Divino' ? 'aura-divino' : rarity === 'Chefe' ? 'aura-chefe' : rarity === 'Elite' ? 'aura-elite' : '';
                  
                  let cleanEnemyId = String(target.id).split('_')[0].split('-')[0].toLowerCase();
                  
                  const enemyVisual = getDigimonVisuals(cleanEnemyId, target.level, false);
                  const isTakingDamage = damageNumbers.some(d => d.target === 'enemy' && d.instanceId === target.instanceId);
                  const isEnemyAttacking = damageNumbers.some(d => d.target === 'player'); 

                  const eServerKey = Object.keys(serverDigimons).find(k => k.toLowerCase() === cleanEnemyId) || cleanEnemyId;
                  const enemyServerData = serverDigimons[eServerKey];
                  const eDir = target.dir || 'down';
                  
                  let currentEnemyImg = enemyVisual.img;
                  let isSprite = enemyVisual.isSprite !== false; 
                  let needsFlip = false;

                  if (enemyServerData) {
                     const { s_down, s_up, s_left, s_right, s_atk } = getSpriteData(enemyServerData);
                     
                     if (s_down || s_left || s_right || s_up) {
                         // 🔥 CORREÇÃO 2: Volta a ser considerado isSprite = true para os inimigos também!
                         isSprite = (enemyServerData as any).isSprite !== false;
                         let chosen = s_down || s_left || s_right || s_up;
                         
                         if (isEnemyAttacking && s_atk) { 
                             chosen = s_atk; 
                         } else {
                             if (eDir === 'down') chosen = s_down || chosen;
                             else if (eDir === 'up') chosen = s_up || s_down || chosen;
                             else if (eDir === 'left') {
                                 if (s_left) chosen = s_left;
                                 else if (s_right) { chosen = s_right; needsFlip = true; }
                             }
                             else if (eDir === 'right') {
                                 if (s_right) chosen = s_right;
                                 else if (s_left) { chosen = s_left; needsFlip = true; }
                             }
                         }
                         if (chosen) currentEnemyImg = chosen;
                     } else if (enemyServerData.menuImg) {
                         currentEnemyImg = enemyServerData.menuImg;
                         isSprite = false;
                     }
                  }
                  
                  if (!isSprite && eDir === 'left') { needsFlip = true; }

                  return (
                    <div key={`${target.instanceId}-${index}`} className="absolute flex flex-col items-center group z-20 pointer-events-auto cursor-pointer transition-all duration-75" style={{ top: `${target.y}%`, left: `${target.x}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="relative flex flex-col items-center justify-center">
                        <div className={`relative z-10 ${auraClass}`}>
                           {renderSpriteSheet(currentEnemyImg, isBoss, isTakingDamage, needsFlip, isSprite)}
                        </div>
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
                    <div className={`font-black drop-shadow-[0_2px_2px_rgba(0,0,0,1)] whitespace-nowrap ${dItem.target === 'player' ? 'text-white' : (dItem.isCrit ? 'text-yellow-400 text-xl' : 'text-red-500 text-base')}`} style={{ animation: `${dItem.isCrit ? 'floatCrit' : 'floatDamage'} 1s ease-out forwards`, textShadow: dItem.target === 'player' ? '0 0 5px red, 0 0 10px red' : '1px 1px 0px black' }}>
                      {dItem.isCrit && <span className="block text-[8px] text-white -mb-1 ml-2">CRIT!</span>}-{dItem.damage}
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
                  let scanCleanId = String(scanningTarget.id).split('_')[0].split('-')[0].toLowerCase();
                  const targetVisual = getDigimonVisuals(scanCleanId, scanningTarget.level, false);
                  
                  const sServerKey = Object.keys(serverDigimons).find(k => k.toLowerCase() === scanCleanId) || scanCleanId;
                  const scanServerData = serverDigimons[sServerKey];
                  
                  let scanImg = targetVisual.img;
                  let scanIsSprite = targetVisual.isSprite !== false; 
                  
                  if (scanServerData) { 
                     const { s_down } = getSpriteData(scanServerData);
                     if (scanServerData.menuImg && !s_down) { scanImg = scanServerData.menuImg; scanIsSprite = false; }
                     else if (s_down) { 
                        scanImg = s_down; 
                        scanIsSprite = (scanServerData as any).isSprite !== false; 
                     }
                  }

                  return (
                    <div className="absolute flex flex-col items-center justify-end z-20 pointer-events-none" style={{ top: `${scanningTarget.y}%`, left: `${scanningTarget.x}%`, transform: 'translate(-50%, -75%)', width: '80px', height: '110px' }}>
                      <div className="relative z-30" style={{ animation: 'suckIntoDigivice 2.5s ease-in-out forwards' }}>
                        {renderSpriteSheet(scanImg, false, false, false, scanIsSprite)}
                      </div>
                      <div className="absolute top-[40px] w-[14px] h-[70px] z-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.8), transparent)', borderRadius: '50%', filter: 'blur(1px)', animation: 'pulseDNA 0.5s infinite alternate, fadeOut 2.5s ease-in forwards' }} />
                      <div className="absolute -bottom-2 z-40 flex items-center justify-center drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] transform scale-[0.55] origin-bottom">
                        <div style={{ width: '64px', height: '56px', animation: 'glowDigivice 2.5s ease-in-out forwards' }}>
                          <div className="relative w-full h-full bg-cyan-100 border-[3px] border-slate-700 rounded-[20px] flex items-center justify-center shadow-[inset_0_-5px_0_rgba(0,180,216,0.4)]">
                            <div className="absolute -top-[10px] left-[10px] w-[8px] h-[12px] bg-slate-700 rounded-t-md"></div><div className="absolute w-[44px] h-[44px] rounded-full border-[2px] border-slate-400/50 flex items-center justify-center"><div className="w-[26px] h-[26px] bg-emerald-700 border-[2px] border-slate-700 rounded-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"></div></div><div className="absolute right-[4px] top-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div><div className="absolute right-[4px] bottom-[12px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full"></div><div className="absolute left-[4px] top-[24px] w-[6px] h-[6px] bg-blue-600 border border-slate-700 rounded-full shadow-sm"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {!isForest && (() => {
                const activeSpots = cityHotspots
                  .map(spot => ({ spot, dist: Math.hypot(tamerPos.x - spot.x, tamerPos.y - spot.y) }))
                  .filter(item => item.dist < item.spot.r)
                  .sort((a, b) => a.dist - b.dist);

                const closestSpot = activeSpots.length > 0 ? activeSpots[0].spot : null;

                if (closestSpot) {
                    return (
                        <div key={closestSpot.id} className="absolute z-40 transform -translate-x-1/2 -translate-y-full animate-pulse pointer-events-none" style={{ top: `${closestSpot.y - 2}%`, left: `${closestSpot.x}%` }}>
                            <span className="bg-[#0a0f1a]/90 text-cyan-400 text-[10px] font-bold px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-sm shadow-lg whitespace-nowrap uppercase tracking-widest">{closestSpot.name}</span>
                        </div>
                    )
                }
                return null;
            })()}

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