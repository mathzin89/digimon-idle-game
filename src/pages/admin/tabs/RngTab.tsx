// src/pages/admin/tabs/RngTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ServerSettings { globalExpMultiplier: number; globalDropMultiplier: number; isEventActive: boolean; rngRates: { normal: number; elite: number; chefe: number; divino: number; }; }

export function RngTab() {
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
    const total = serverSettings.rngRates.normal + serverSettings.rngRates.elite + serverSettings.rngRates.chefe + serverSettings.rngRates.divino;
    if (total !== 100) return alert('A soma das taxas precisa ser exatamente 100%!');
    try { await setDoc(doc(db, 'server', 'settings'), serverSettings); alert('Taxas de RNG atualizadas!'); } 
    catch (e) { console.error(e); alert('Erro ao salvar.'); }
  };

  if (isLoading) return <div className="text-center py-8 text-indigo-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando RNG...</div>;

  const total = serverSettings.rngRates.normal + serverSettings.rngRates.elite + serverSettings.rngRates.chefe + serverSettings.rngRates.divino;
  const isValid = total === 100;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-1">Motor de Probabilidades (RNG)</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ajuste as chances matemáticas do servidor. A soma deve fechar em 100%.</p>
        </div>
        <button onClick={saveServerSettings} className="bg-indigo-900/30 border border-indigo-500 text-indigo-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:bg-indigo-800/60 hover:text-white">
          Gravar Novas Taxas
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg p-6 shadow-lg">
        <div className={`mb-6 p-3 rounded border text-[10px] font-bold uppercase tracking-widest text-center ${isValid ? 'bg-green-900/20 border-green-500/30 text-green-400' : 'bg-red-900/20 border-red-500/30 text-red-400 animate-pulse'}`}>
          Soma Total das Probabilidades: {total.toFixed(1)}% {isValid ? '(Validado)' : '(Obrigatório ser exatamente 100%)'}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-[#111827] border border-[#1e293b] p-4 rounded-lg">
            <div className="w-24 text-[10px] font-bold uppercase tracking-widest text-slate-400">Normal</div>
            <input type="range" min="0" max="100" step="0.5" value={serverSettings.rngRates.normal} onChange={e => setServerSettings({...serverSettings, rngRates: {...serverSettings.rngRates, normal: Number(e.target.value)}})} className="flex-1 accent-slate-400" />
            <div className="w-16 text-right font-mono text-white text-xs">{serverSettings.rngRates.normal}%</div>
          </div>
          
          <div className="flex items-center gap-4 bg-[#111827] border border-[#1e293b] p-4 rounded-lg">
            <div className="w-24 text-[10px] font-bold uppercase tracking-widest text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">Elite</div>
            <input type="range" min="0" max="100" step="0.5" value={serverSettings.rngRates.elite} onChange={e => setServerSettings({...serverSettings, rngRates: {...serverSettings.rngRates, elite: Number(e.target.value)}})} className="flex-1 accent-blue-500" />
            <div className="w-16 text-right font-mono text-white text-xs">{serverSettings.rngRates.elite}%</div>
          </div>

          <div className="flex items-center gap-4 bg-[#111827] border border-[#1e293b] p-4 rounded-lg">
            <div className="w-24 text-[10px] font-bold uppercase tracking-widest text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">Chefe</div>
            <input type="range" min="0" max="100" step="0.5" value={serverSettings.rngRates.chefe} onChange={e => setServerSettings({...serverSettings, rngRates: {...serverSettings.rngRates, chefe: Number(e.target.value)}})} className="flex-1 accent-red-500" />
            <div className="w-16 text-right font-mono text-white text-xs">{serverSettings.rngRates.chefe}%</div>
          </div>

          <div className="flex items-center gap-4 bg-[#111827] border border-[#1e293b] p-4 rounded-lg">
            <div className="w-24 text-[10px] font-bold uppercase tracking-widest text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">Divino</div>
            <input type="range" min="0" max="100" step="0.1" value={serverSettings.rngRates.divino} onChange={e => setServerSettings({...serverSettings, rngRates: {...serverSettings.rngRates, divino: Number(e.target.value)}})} className="flex-1 accent-yellow-400" />
            <div className="w-16 text-right font-mono text-yellow-400 text-xs font-bold">{serverSettings.rngRates.divino}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}