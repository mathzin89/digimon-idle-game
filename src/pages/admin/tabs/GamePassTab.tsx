// src/pages/admin/tabs/GamePassTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface GamePassMission { id: string; targetId: string; desc: string; target: number; reward: number; }
interface SeasonData { id: string; name: string; isActive: boolean; missions: GamePassMission[]; }

export function GamePassTab() {
  const [seasons, setSeasons] = useState<SeasonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSeasons = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'seasons'));
      setSeasons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeasonData)));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchSeasons(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-1">Temporadas do Servidor</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Crie temporadas e ative qual grupo de missões os jogadores vão receber.</p>
        </div>
        <button onClick={() => alert("Em breve: Modal de Criar Temporada completo.")} className="bg-pink-900/30 border border-pink-500 text-pink-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Nova Temporada
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mock Season Card */}
        <div className="bg-[#0a0f1a] border border-pink-500/50 rounded-lg p-5 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-sm">Temporada 1 - Beta</h4>
                <span className="text-[9px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Ativa</span>
              </div>
              <button className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Editar Missões</button>
            </div>
            <div className="space-y-2">
              <div className="bg-[#111827] border border-[#1e293b] p-2 rounded flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">Derrote 50 Koromon</span>
                <span className="text-yellow-400">+10 BPP</span>
              </div>
              <div className="bg-[#111827] border border-[#1e293b] p-2 rounded flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-300">Derrote 50 Agumon</span>
                <span className="text-yellow-400">+20 BPP</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}