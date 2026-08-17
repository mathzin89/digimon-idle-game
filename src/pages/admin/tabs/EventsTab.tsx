// src/pages/admin/tabs/EventsTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ServerSettings { globalExpMultiplier: number; globalDropMultiplier: number; isEventActive: boolean; rngRates: { normal: number; elite: number; chefe: number; divino: number; }; }

export function EventsTab() {
  const [serverSettings, setServerSettings] = useState<ServerSettings>({ globalExpMultiplier: 1, globalDropMultiplier: 1, isEventActive: false, rngRates: { normal: 70, elite: 20, chefe: 8, divino: 2 } });
  const [isLoading, setIsLoading] = useState(true);

  const fetchServerSettings = async () => {
    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'server', 'settings'));
      if (docSnap.exists()) { setServerSettings(docSnap.data() as ServerSettings); } 
      else { await setDoc(doc(db, 'server', 'settings'), serverSettings); }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchServerSettings(); }, []);

  const saveServerSettings = async () => {
    try { await setDoc(doc(db, 'server', 'settings'), serverSettings); alert('Configurações aplicadas com sucesso!'); } 
    catch (e) { console.error(e); alert('Erro ao salvar.'); }
  };

  if (isLoading) return <div className="text-center py-8 text-orange-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando Eventos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-1">Live Ops: Eventos Ativos</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ligue multiplicadores para todo o servidor em tempo real.</p>
        </div>
        <button onClick={saveServerSettings} className="bg-orange-900/30 border border-orange-500 text-orange-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:bg-orange-800/60 hover:text-white">
          Aplicar no Servidor
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-orange-500/30 rounded-lg p-6 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
        <label className="flex items-center gap-4 cursor-pointer group mb-8 p-4 bg-[#111827] border border-[#1e293b] rounded-lg hover:border-orange-500/50 transition-colors">
          <input type="checkbox" checked={serverSettings.isEventActive} onChange={e => setServerSettings({...serverSettings, isEventActive: e.target.checked})} className="w-6 h-6 accent-orange-500" />
          <div>
            <span className="block text-orange-400 text-sm font-bold uppercase tracking-widest">Habilitar Evento Global</span>
            <span className="block text-slate-500 text-[10px] uppercase tracking-widest mt-1">Ao desligar, todos os multiplicadores voltam para x1 para os jogadores.</span>
          </div>
        </label>

        <div className={`grid grid-cols-2 gap-6 transition-opacity duration-300 ${serverSettings.isEventActive ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
          <div className="bg-[#111827] border border-[#1e293b] p-5 rounded-lg">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><span>✨</span> Multiplicador de Experiência (EXP)</h4>
            <input type="range" min="1" max="5" step="0.5" value={serverSettings.globalExpMultiplier} onChange={e => setServerSettings({...serverSettings, globalExpMultiplier: Number(e.target.value)})} className="w-full accent-orange-500 h-2 bg-[#0a0f1a] rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 font-mono">
              <span>1x</span> <span className="text-orange-400 text-lg">{serverSettings.globalExpMultiplier}x</span> <span>5x</span>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#1e293b] p-5 rounded-lg">
            <h4 className="text-white text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><span>💎</span> Multiplicador de Drops (Itens)</h4>
            <input type="range" min="1" max="5" step="0.5" value={serverSettings.globalDropMultiplier} onChange={e => setServerSettings({...serverSettings, globalDropMultiplier: Number(e.target.value)})} className="w-full accent-cyan-500 h-2 bg-[#0a0f1a] rounded-lg appearance-none cursor-pointer" />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 font-mono">
              <span>1x</span> <span className="text-cyan-400 text-lg">{serverSettings.globalDropMultiplier}x</span> <span>5x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}