// src/pages/admin/tabs/MapsTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

interface MapData { id: string; name: string; bgImage: string; minLevel: number; spawns: string; }

export function MapsTab() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MapData>({ id: '', name: '', bgImage: '', minLevel: 1, spawns: '' });

  const fetchMaps = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'maps'));
      setMaps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapData)));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMaps(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      await setDoc(doc(db, 'maps', formData.id.toLowerCase()), formData);
      setIsModalOpen(false);
      fetchMaps();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deletar a zona ${id}?`)) {
      try { await deleteDoc(doc(db, 'maps', id)); fetchMaps(); } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1">Zonas de Caça</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Defina requisitos de nível e crie a lista de monstros que habitam o local.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', bgImage: '', minLevel: 1, spawns: '' }); setIsModalOpen(true); }} className="bg-emerald-900/30 border border-emerald-500 text-emerald-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Nova Zona
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] border-b border-[#1e293b] text-[9px] text-slate-400 uppercase tracking-widest">
              <th className="p-4 font-bold w-1/4">ID / Nome</th>
              <th className="p-4 font-bold text-center">Nível Mínimo</th>
              <th className="p-4 font-bold">Digimons (Spawns)</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr><td colSpan={4} className="text-center py-8 text-emerald-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando...</td></tr>
            ) : maps.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Nenhuma Zona.</td></tr>
            ) : (
              maps.map((map) => (
                <tr key={map.id} className="border-b border-[#1e293b] hover:bg-[#111827]/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-white uppercase tracking-widest text-[11px] mb-1">{map.name}</p>
                    <span className="font-mono text-[10px] text-slate-500">{map.id}</span>
                  </td>
                  <td className="p-4 text-center"><span className="bg-slate-800 border border-slate-600 text-yellow-400 px-3 py-1 rounded text-[10px] font-bold shadow-sm font-mono">Lv. {map.minLevel}</span></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {map.spawns.split(',').map((s, idx) => s.trim() && <span key={idx} className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest shadow-sm">{s.trim()}</span>)}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setFormData(map); setIsEditing(true); setIsModalOpen(true); }} className="text-emerald-500 hover:text-emerald-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-emerald-500/30 rounded">Editar</button>
                    <button onClick={() => handleDelete(map.id)} className="text-red-500 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-red-500/30 rounded">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1e293b] bg-[#111827] flex justify-between items-center">
              <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="text-lg">🗺️</span> {isEditing ? `Editando: ${formData.id}` : 'Criar Nova Zona'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">✖</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">ID Único</label>
                <input type="text" required disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-emerald-400 rounded px-3 py-2 text-white text-xs outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Nome de Exibição</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-emerald-400 rounded px-3 py-2 text-white text-xs outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">Nível Mínimo</label>
                  <input type="number" required value={formData.minLevel} onChange={e => setFormData({...formData, minLevel: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-yellow-400/50 rounded px-3 py-2 text-yellow-400 text-xs outline-none font-mono" min="1" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Imagem Fundo</label>
                  <input type="text" required value={formData.bgImage} onChange={e => setFormData({...formData, bgImage: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-emerald-400 rounded px-3 py-2 text-white text-xs outline-none font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Digimons (Separados por vírgula)</label>
                <textarea required value={formData.spawns} onChange={e => setFormData({...formData, spawns: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-emerald-400 rounded px-3 py-2 text-white text-xs outline-none font-mono min-h-[80px]" placeholder="koromon, agumon" />
              </div>
              <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-emerald-900/40 border border-emerald-500 text-emerald-400 hover:bg-emerald-800/60 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">Salvar no Banco</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}