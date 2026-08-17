// src/pages/admin/tabs/AnalyticsTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface PlayerData { 
  id: string; bits: number; gems: number; isPremium: boolean; isBanned: boolean; role: string; 
}

export function AnalyticsTab() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        setPlayers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlayerData)));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const totalBits = players.reduce((acc, p) => acc + (p.bits || 0), 0);
  const totalGems = players.reduce((acc, p) => acc + (p.gems || 0), 0);
  const totalPremium = players.filter(p => p.isPremium || p.role === 'vip').length;
  const totalBanned = players.filter(p => p.isBanned).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-blue-600 font-black tracking-widest uppercase text-[10px] animate-pulse">Lendo Banco de Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER DA ABA */}
      <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-blue-800 font-black uppercase tracking-widest text-lg">Inteligência de Servidor</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Visão geral e monitoramento da base de dados.</p>
        </div>
        <div className="text-5xl drop-shadow-sm opacity-90">📊</div>
      </div>
      
      {/* GRID DE CARDS CLAROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CARD 1 */}
        <div className="bg-white border-2 border-blue-100 p-6 rounded-2xl shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Contas Criadas</p>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">👥</div>
          </div>
          <h4 className="text-4xl font-black text-blue-800">{players.length}</h4>
        </div>

        {/* CARD 2 */}
        <div className="bg-white border-2 border-purple-100 p-6 rounded-2xl shadow-sm hover:border-purple-400 transition-colors flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Premium/VIP</p>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">👑</div>
          </div>
          <div className="flex items-end gap-3">
             <h4 className="text-4xl font-black text-purple-600">{totalPremium}</h4>
             <span className="text-[10px] text-slate-400 font-bold pb-1 block">Jogadores</span>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="bg-white border-2 border-orange-100 p-6 rounded-2xl shadow-sm hover:border-orange-400 transition-colors flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Bits (Economia)</p>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🪙</div>
          </div>
          <h4 className="text-3xl font-black text-orange-500 font-mono tracking-tighter">{totalBits.toLocaleString()}</h4>
        </div>

        {/* CARD 4 */}
        <div className="bg-white border-2 border-cyan-100 p-6 rounded-2xl shadow-sm hover:border-cyan-400 transition-colors flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Gemas Premium</p>
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">💎</div>
          </div>
          <h4 className="text-3xl font-black text-cyan-500 font-mono tracking-tighter">{totalGems.toLocaleString()}</h4>
        </div>

      </div>

      {/* BANNER DE SEGURANÇA */}
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-2xl shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-white border-4 border-red-100 flex items-center justify-center text-red-500 font-black text-2xl shadow-inner shrink-0">
          {totalBanned}
        </div>
        <div>
          <h4 className="text-red-700 text-sm font-black uppercase tracking-widest">Radar de Segurança (Bans)</h4>
          <p className="text-[11px] text-red-900/60 font-bold mt-1 uppercase">Jogadores infratores banidos permanentemente do servidor.</p>
        </div>
      </div>

    </div>
  );
}