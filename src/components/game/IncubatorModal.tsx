import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getDigimonVisuals } from '../../utils/digimonVisuals';

interface IncubatorModalProps {
  onClose: () => void;
}

export function IncubatorModal({ onClose }: IncubatorModalProps) {
  const { bits, serverDigimons, myDigimons, ownedDigimons, saveProgress } = useGameStore();
  const { user } = useAuthStore();
  
  // Fases: 'idle' -> 'shaking' -> 'flash' -> 'reveal'
  const [hatchPhase, setHatchPhase] = useState<'idle' | 'shaking' | 'flash' | 'reveal'>('idle');
  const [progress, setProgress] = useState(0);
  const [newDigimonId, setNewDigimonId] = useState<string | null>(null);

  const INCU_COST = 500;

  const handleIncubate = () => {
    if (bits < INCU_COST) {
      alert('Você não tem Bits suficientes! (Custa 500)');
      return;
    }

    setHatchPhase('shaking');
    let currProgress = 0;
    
    const interval = setInterval(() => {
      currProgress += 5;
      setProgress(currProgress);
      
      if (currProgress >= 100) {
        clearInterval(interval);
        
        const allKeys = Object.keys(serverDigimons);
        const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
        setNewDigimonId(randomKey);
        
        setHatchPhase('flash');

        setTimeout(() => {
          setHatchPhase('reveal');
          
          useGameStore.setState(state => {
            const isNew = !state.ownedDigimons.includes(randomKey);
            const newOwned = isNew ? [...state.ownedDigimons, randomKey] : state.ownedDigimons;
            
            const baseStats = state.serverDigimons[randomKey];
            const newMyDigis = { ...state.myDigimons };
            
            if (isNew) {
              newMyDigis[randomKey] = { level: 1, exp: 0, maxExp: 100, hp: baseStats.hp, maxHp: baseStats.hp, atk: baseStats.atk };
            }

            return { 
              bits: state.bits - INCU_COST, 
              ownedDigimons: newOwned,
              myDigimons: newMyDigis
            };
          });

          if (user) saveProgress(user.uid);

        }, 1500);
      }
    }, 150);
  };

  const handleReset = () => {
    setHatchPhase('idle');
    setProgress(0);
    setNewDigimonId(null);
  };

  const visual = newDigimonId ? getDigimonVisuals(newDigimonId, 1, false) : null;
  const isIncubating = hatchPhase === 'shaking';

  // 🔥 LÓGICA CORRIGIDA: Prioridade MÁXIMA para o rosto cadastrado no CMS
  let displayImage = visual?.img;
  
  if (newDigimonId && serverDigimons[newDigimonId]) {
     const sDigi = serverDigimons[newDigimonId];
     
     // 1º Prioridade: A foto do rosto (menuImg)
     if (sDigi.menuImg) {
        displayImage = sDigi.menuImg;
     } 
     // 2º Prioridade: O sprite de movimento (apenas como precaução se o rosto estiver vazio)
     else if (sDigi.sprites && sDigi.sprites.down) {
        displayImage = sDigi.sprites.down;
     }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes epicShake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2px, -2px) rotate(5deg); }
          50% { transform: translate(-2px, 2px) rotate(-5deg); }
          75% { transform: translate(2px, 2px) rotate(5deg); }
        }
        @keyframes whiteFlash {
          0% { filter: brightness(1) drop-shadow(0 0 0px white); transform: scale(1); }
          50% { filter: brightness(10) drop-shadow(0 0 100px white); transform: scale(1.2); }
          100% { filter: brightness(100) drop-shadow(0 0 200px white); transform: scale(1.5); }
        }
        @keyframes revealPop {
          0% { filter: brightness(10); transform: scale(0.5); opacity: 0; }
          50% { filter: brightness(5); transform: scale(1.2); opacity: 1; }
          100% { filter: brightness(1); transform: scale(1); opacity: 1; }
        }
        .anim-shake { animation: epicShake 0.2s linear infinite; }
        .anim-flash { animation: whiteFlash 1.5s ease-in forwards; }
        .anim-reveal { animation: revealPop 1s ease-out forwards; }
      `}} />

      <div className="bg-[#0a0f1a] border border-cyan-500/50 rounded-xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] relative flex flex-col">
        
        {hatchPhase !== 'reveal' && (
          <div className="p-4 border-b border-cyan-500/30 bg-[#111827] flex justify-between items-center">
            <h3 className="text-cyan-400 font-black uppercase tracking-widest text-sm">🧬 Sistema Gacha</h3>
            <button onClick={onClose} disabled={isIncubating || hatchPhase === 'flash'} className="text-slate-500 hover:text-white font-bold disabled:opacity-30">✖</button>
          </div>
        )}

        <div className={`p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000 ${hatchPhase === 'reveal' ? 'h-[400px]' : 'h-[300px]'}`}>
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#0a0f1a] to-[#0a0f1a]"></div>
          <div className={`absolute inset-0 bg-white transition-opacity duration-1000 z-40 ${hatchPhase === 'flash' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>

          <div className="relative z-10 w-40 h-40 flex items-center justify-center">
            
            {hatchPhase !== 'reveal' && (
              <>
                <div className={`absolute inset-0 border-[3px] border-l-cyan-400 border-r-purple-500 border-y-transparent rounded-full transition-all duration-500 ${isIncubating || hatchPhase === 'flash' ? 'animate-[spin_1s_linear_infinite]' : 'opacity-30'}`}></div>
                <div className={`absolute -inset-4 border-[2px] border-y-cyan-500/50 border-x-transparent rounded-full transition-all duration-500 ${isIncubating || hatchPhase === 'flash' ? 'animate-[spin_2s_linear_infinite_reverse]' : 'opacity-10'}`}></div>
              </>
            )}
            
            <div className="relative z-20 w-32 h-32 flex items-center justify-center">
              {(hatchPhase === 'idle' || hatchPhase === 'shaking' || hatchPhase === 'flash') && (
                <div className={`text-7xl drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] 
                  ${hatchPhase === 'shaking' ? 'anim-shake' : ''} 
                  ${hatchPhase === 'flash' ? 'anim-flash' : 'hover:scale-110 transition-transform'}`}>
                  🥚
                </div>
              )}

              {hatchPhase === 'reveal' && displayImage && (
                <div className="relative anim-reveal w-48 h-48 flex items-center justify-center">
                   <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full animate-pulse"></div>
                   
                   {/* 🔥 Exibição da imagem ajustada para não quebrar ou esticar */}
                   <img 
                     src={displayImage} 
                     className="w-full h-full object-contain pixelated drop-shadow-[0_0_15px_rgba(0,0,0,1)] relative z-10" 
                     alt="Novo Monstro" 
                   />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 w-full text-center relative z-10">
            {hatchPhase === 'shaking' && (
              <div className="space-y-2 w-3/4 mx-auto">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse drop-shadow-[0_0_5px_cyan]">Reestruturando Código Genético...</span>
                <div className="w-full h-1.5 bg-[#111827] rounded-full overflow-hidden border border-cyan-900/50">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}
            
            {hatchPhase === 'reveal' && serverDigimons[newDigimonId!] && (
              <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in zoom-in">
                <h2 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_2px_2px_black]">{serverDigimons[newDigimonId!].name}</h2>
                <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest mt-1">Registrado no Digi-Bank!</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-cyan-500/30 bg-[#111827] flex gap-3 z-50">
          {hatchPhase === 'reveal' ? (
             <button onClick={handleReset} className="flex-1 bg-cyan-900/40 border border-cyan-500 text-cyan-300 p-3 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-800/60 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]">
               Incubar Novo Ovo
             </button>
          ) : (
             <>
                <button disabled className="flex-1 bg-[#0a0f1a] border border-[#1e293b] text-slate-500 p-3 rounded-md text-[10px] font-bold uppercase tracking-widest">
                  Bits: {bits?.toLocaleString()}
                </button>
                <button 
                  onClick={handleIncubate}
                  disabled={isIncubating || hatchPhase === 'flash' || bits < INCU_COST}
                  className="flex-[2] bg-cyan-900/40 border border-cyan-500 text-cyan-300 p-3 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-800/60 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-30 disabled:hover:bg-cyan-900/40"
                >
                  {bits < INCU_COST ? `Faltam ${INCU_COST - bits} Bits` : `Iniciar Síntese (${INCU_COST} Bits)`}
                </button>
             </>
          )}
        </div>
      </div>
    </div>
  );
}