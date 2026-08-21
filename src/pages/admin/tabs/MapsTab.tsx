import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

interface MapData { id: string; name: string; minLevel: number; bgImg: string; spawns: string; }

const IMGBB_API_KEY = '2c552c56d92a69888ea827f3764c992b'; 

export function MapTab() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);

  const [formData, setFormData] = useState<MapData>({ 
    id: '', name: '', minLevel: 1, bgImg: '', spawns: '' 
  });

  const fetchMaps = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'maps'));
      setMaps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapData)));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchMaps(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    
    const cleanSpawns = formData.spawns.split(',').map(s => s.trim()).filter(s => s !== '').join(',');
    const finalData = { ...formData, spawns: cleanSpawns };

    try {
      await setDoc(doc(db, 'maps', finalData.id.toLowerCase()), finalData);
      setIsModalOpen(false);
      fetchMaps();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deletar o mapa ${id}?`)) {
      try { await deleteDoc(doc(db, 'maps', id)); fetchMaps(); } catch (e) { console.error(e); }
    }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    try {
      const data = new FormData();
      data.append('image', file);
      
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: data
      });
      
      const json = await response.json();
      if (json.success) {
        setFormData(prev => ({ ...prev, bgImg: json.data.url }));
      } else {
        throw new Error(json.error?.message || 'Erro no ImgBB');
      }
    } catch (err) {
      console.error(err);
      alert("Erro no upload. Verifique se a API Key está correta.");
    } finally {
      setUploadingBg(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-1">Controle de Zonas (Mapas)</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gerencie as áreas do jogo e defina os spawns.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', minLevel: 1, bgImg: '', spawns: '' }); setIsModalOpen(true); }} className="bg-cyan-900/30 border border-cyan-500 hover:bg-cyan-800/50 text-cyan-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Nova Zona
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] border-b border-[#1e293b] text-[9px] text-slate-400 uppercase tracking-widest">
              <th className="p-4 font-bold">Fundo / ID</th>
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold">Nv. Mínimo</th>
              <th className="p-4 font-bold">Habitantes (Spawns)</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-cyan-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando...</td></tr>
            ) : maps.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Nenhum mapa cadastrado.</td></tr>
            ) : (
              maps.map((map) => (
                <tr key={map.id} className="border-b border-[#1e293b] hover:bg-[#111827]/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-12 h-8 bg-black rounded border border-[#1e293b] flex items-center justify-center overflow-hidden">
                       {map.bgImg ? <img src={map.bgImg} className="w-full h-full object-cover" alt="bg" /> : <span className="text-[10px]">🗺️</span>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{map.id}</span>
                  </td>
                  <td className="p-4 font-bold text-white uppercase tracking-widest text-[11px]">{map.name}</td>
                  <td className="p-4 font-mono text-yellow-400">{map.minLevel}</td>
                  <td className="p-4">
                     <span className="text-[9px] text-slate-300 font-mono bg-slate-800/50 px-2 py-1 rounded border border-slate-700 max-w-[200px] truncate block">
                       {map.spawns || 'Nenhum'}
                     </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setFormData(map); setIsEditing(true); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-cyan-500/30 rounded">Editar</button>
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
          <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1e293b] bg-[#111827] flex justify-between items-center">
              <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="text-lg">🗺️</span> {isEditing ? `Editando: ${formData.id}` : 'Criar Nova Zona'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">✖</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">ID Único (ex: praia_1)</label>
                  <input type="text" required disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-cyan-400 rounded px-3 py-2 text-white text-xs outline-none disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Nome de Exibição</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-cyan-400 rounded px-3 py-2 text-white text-xs outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="col-span-1">
                  <label className="block text-yellow-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">Nível Mínimo</label>
                  <input type="number" required value={formData.minLevel} onChange={e => setFormData({...formData, minLevel: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-yellow-400/50 rounded px-3 py-2 text-yellow-400 text-xs outline-none font-mono" />
                </div>

                <div className="col-span-2">
                   <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Imagem Fundo (Upload Automático)</label>
                   <div className="flex gap-2">
                      <input type="file" accept="image/*" onChange={handleBgUpload} className="w-full text-[9px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer bg-[#111827] border border-[#1e293b] rounded py-1 pl-1" />
                      {uploadingBg && <span className="text-[10px] text-cyan-400 animate-pulse font-mono flex items-center px-2">Up...</span>}
                   </div>
                </div>
              </div>

              {formData.bgImg && (
                <div className="w-full h-24 bg-black border border-[#1e293b] rounded-lg overflow-hidden relative">
                   <img src={formData.bgImg} className="w-full h-full object-cover opacity-60" alt="Preview" />
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <span className="bg-black/80 px-3 py-1 rounded text-[9px] text-cyan-400 font-mono border border-cyan-500/30 truncate max-w-[90%]">{formData.bgImg}</span>
                   </div>
                </div>
              )}

              <div>
                <label className="block text-green-400/70 text-[9px] font-bold uppercase tracking-widest mb-1">Digimons (Separados por Vírgula)</label>
                <textarea required rows={3} value={formData.spawns} onChange={e => setFormData({...formData, spawns: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-green-400/50 rounded px-3 py-2 text-green-400 text-xs outline-none font-mono custom-scrollbar" placeholder="ex: kuromon, agumon_base" />
              </div>
              
              <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={uploadingBg} className="bg-cyan-900/40 border border-cyan-500 text-cyan-400 hover:bg-cyan-800/60 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">Salvar no Banco</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}