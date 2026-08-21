// src/pages/admin/tabs/DigimonTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

interface DigimonData { 
  id: string; name: string; hp: number; atk: number; evolvesTo: string; evolveLevel: number; rarity: string; menuImg: string; portraitImg: string;
  sprites: { down: string; up: string; left: string; right: string; attack: string; }; 
}

// ⚠️ SUA CHAVE DO IMGBB:
const IMGBB_API_KEY = '2c552c56d92a69888ea827f3764c992b'; 

export function DigimonTab() {
  const [digimons, setDigimons] = useState<DigimonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<DigimonData>({ 
    id: '', name: '', hp: 100, atk: 10, evolvesTo: '', evolveLevel: 0, rarity: 'Normal', menuImg: '', portraitImg: '', 
    sprites: { down: '', up: '', left: '', right: '', attack: '' } 
  });

  const fetchDigimons = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'digimons'));
      setDigimons(snap.docs.map(doc => {
        const d = doc.data();
        return { id: doc.id, sprites: d.sprites || { down: '', up: '', left: '', right: '', attack: '' }, ...d } as DigimonData;
      }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDigimons(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    const finalData = { ...formData };
    
    // 🔥 CORREÇÃO DOS TRIGÊMEOS: Agora ele força o menuImg a usar a foto de rosto (portraitImg)
    finalData.menuImg = finalData.portraitImg || finalData.sprites.down || '';

    try {
      await setDoc(doc(db, 'digimons', finalData.id.toLowerCase()), finalData);
      setIsModalOpen(false);
      fetchDigimons();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deletar ${id}?`)) {
      try { await deleteDoc(doc(db, 'digimons', id)); fetchDigimons(); } catch (e) { console.error(e); }
    }
  };

  const uploadToImgBB = async (file: File) => {
    // 🔥 Trava de segurança burra removida! Agora só barra se a chave estiver vazia.
    if (!IMGBB_API_KEY || IMGBB_API_KEY.trim() === '') {
      throw new Error("CHAVE_FALTANDO");
    }

    const data = new FormData();
    data.append('image', file);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: data });
    const json = await response.json();
    if (json.success) return json.data.url;
    throw new Error(json.error?.message || 'Erro no ImgBB');
  };

  const handleSpriteUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'down' | 'up' | 'left' | 'right' | 'attack' | 'portrait') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingState(prev => ({ ...prev, [type]: true }));
    try {
      const url = await uploadToImgBB(file);
      if (type === 'portrait') {
        setFormData(prev => ({ ...prev, portraitImg: url }));
      } else {
        setFormData(prev => ({ ...prev, sprites: { ...prev.sprites, [type]: url } }));
      }
    } catch (err: any) { 
      console.error(err);
      if (err.message === "CHAVE_FALTANDO") {
         alert("⚠️ ERRO: Você esqueceu de colocar a sua API Key do ImgBB no código! Vá na linha 12 do DigimonTab.tsx e cole ela.");
      } else {
         alert(`Erro no Upload: ${err.message}. A API pode estar fora, cole o link direto na caixinha!`); 
      }
    } finally { 
      setUploadingState(prev => ({ ...prev, [type]: false })); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b]">
        <div>
          <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-1">Banco de Dados Ativo</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Faça Upload ou cole o Link Direto dos sprites.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', hp: 100, atk: 10, evolvesTo: '', evolveLevel: 0, rarity: 'Normal', menuImg: '', portraitImg: '', sprites: { down: '', up: '', left: '', right: '', attack: '' } }); setIsModalOpen(true); }} className="bg-cyan-900/30 border border-cyan-500 text-cyan-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest">
          + Nova Espécie
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] border-b border-[#1e293b] text-[9px] text-slate-400 uppercase tracking-widest">
              <th className="p-4 font-bold">Imagens / ID</th><th className="p-4 font-bold">Nome</th><th className="p-4 font-bold">Atributos Base</th><th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {digimons.map((digi) => (
              <tr key={digi.id} className="border-b border-[#1e293b] hover:bg-[#111827]/50">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-full border border-[#1e293b] overflow-hidden">{digi.portraitImg ? <img src={digi.portraitImg} className="w-full h-full object-contain" alt="face" /> : <span className="text-[10px] flex justify-center items-center h-full">👤</span>}</div>
                  <div className="w-10 h-10 bg-black rounded-lg border border-[#1e293b] overflow-hidden relative">
                    {digi.sprites?.down ? <img src={digi.sprites.down} className="absolute top-0 left-0 h-full max-w-none pixelated" style={{ width: '300%' }} alt="sprite" /> : <span className="text-[10px] flex justify-center items-center h-full">🦖</span>}
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">{digi.id}</span>
                </td>
                <td className="p-4 font-bold text-white uppercase tracking-widest text-[11px]">{digi.name}</td>
                <td className="p-4"><span className="font-mono text-green-400 text-[9px]">HP: {digi.hp}</span> <br/><span className="font-mono text-red-400 text-[9px]">ATK: {digi.atk}</span></td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => { setFormData(digi); setIsEditing(true); setIsModalOpen(true); }} className="text-cyan-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1">Editar</button>
                  <button onClick={() => handleDelete(digi.id)} className="text-red-500 text-[10px] uppercase font-bold tracking-widest px-3 py-1">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#1e293b] bg-[#111827] flex justify-between">
              <h3 className="text-cyan-400 font-bold uppercase text-xs flex items-center gap-2">💾 {isEditing ? `Editando: ${formData.id}` : 'Registrar Espécie'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✖</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-slate-400 text-[9px] font-bold uppercase mb-1">ID Único</label><input type="text" required disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-cyan-500" /></div>
                <div><label className="block text-slate-400 text-[9px] font-bold uppercase mb-1">Nome</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-cyan-500" /></div>
              </div>

              <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg">
                 <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest border-b border-[#1e293b] pb-2 mb-4">Mapeamento de Ações (Upload ou Link Direto)</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['down', 'up', 'left', 'right', 'attack'].map((dir) => {
                      const type = dir as keyof typeof formData.sprites;
                      const label = type === 'down' ? 'Andar Baixo' : type === 'up' ? 'Andar Cima' : type === 'left' ? 'Andar Esq.' : type === 'right' ? 'Andar Dir.' : 'Ataque';
                      return (
                        <div key={type} className="bg-[#0a0f1a] p-3 rounded border border-[#1e293b] flex flex-col items-center">
                          <label className="block text-slate-400 text-[8px] font-bold uppercase mb-2 text-center w-full">{label}</label>
                          <div className="flex w-full gap-3 items-center">
                             <div className="w-12 h-12 bg-black border border-[#1e293b] rounded overflow-hidden relative shrink-0">
                                {uploadingState[type] ? <span className="text-[8px] text-cyan-400 absolute inset-0 flex items-center justify-center animate-pulse">Up...</span> 
                                : formData.sprites[type] ? <img src={formData.sprites[type]} className="absolute top-0 left-0 h-full max-w-none pixelated" style={{ width: '300%' }} /> : <span className="text-xs absolute inset-0 flex items-center justify-center">🏃</span>}
                             </div>
                             <div className="flex-1 space-y-2">
                               <input type="file" accept="image/*" onChange={(e) => handleSpriteUpload(e, type)} className="w-full text-[8px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-cyan-900/30 file:text-cyan-400 cursor-pointer" />
                               <input type="text" placeholder="Ou cole o link direto da imagem..." value={formData.sprites[type]} onChange={e => setFormData(prev => ({ ...prev, sprites: { ...prev.sprites, [type]: e.target.value } }))} className="w-full bg-[#111827] border border-[#1e293b] focus:border-cyan-400 text-slate-300 text-[8px] p-1.5 rounded outline-none transition-colors" />
                             </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    <div className="bg-[#0a0f1a] p-3 rounded border border-[#1e293b] flex flex-col items-center">
                      <label className="block text-purple-400 text-[8px] font-bold uppercase mb-2 text-center w-full">Ícone de Rosto</label>
                      <div className="flex w-full gap-3 items-center">
                         <div className="w-12 h-12 bg-black rounded-full border border-[#1e293b] overflow-hidden flex items-center justify-center shrink-0">
                            {uploadingState['portrait'] ? <span className="text-[8px] text-purple-400 animate-pulse">Up...</span> : formData.portraitImg ? <img src={formData.portraitImg} className="w-full h-full object-contain" /> : <span className="text-xs">👤</span>}
                         </div>
                         <div className="flex-1 space-y-2">
                           <input type="file" accept="image/*" onChange={(e) => handleSpriteUpload(e, 'portrait')} className="w-full text-[8px] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-900/30 file:text-purple-400 cursor-pointer" />
                           <input type="text" placeholder="Ou cole o link do ícone..." value={formData.portraitImg} onChange={e => setFormData(prev => ({ ...prev, portraitImg: e.target.value }))} className="w-full bg-[#111827] border border-[#1e293b] focus:border-purple-400 text-slate-300 text-[8px] p-1.5 rounded outline-none transition-colors" />
                         </div>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div><label className="block text-green-500/70 text-[9px] font-bold uppercase mb-1">HP Base</label><input type="number" required value={formData.hp} onChange={e => setFormData({...formData, hp: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-green-500/50" /></div>
                <div><label className="block text-red-500/70 text-[9px] font-bold uppercase mb-1">ATK Base</label><input type="number" required value={formData.atk} onChange={e => setFormData({...formData, atk: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-red-500/50" /></div>
                <div><label className="block text-yellow-500/70 text-[9px] font-bold uppercase mb-1">Evolui Para (ID)</label><input type="text" value={formData.evolvesTo} onChange={e => setFormData({...formData, evolvesTo: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-yellow-500/50" /></div>
                <div><label className="block text-yellow-500/70 text-[9px] font-bold uppercase mb-1">Nv. Evolução</label><input type="number" value={formData.evolveLevel} onChange={e => setFormData({...formData, evolveLevel: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] text-white text-xs p-2 rounded outline-none focus:border-yellow-500/50" /></div>
              </div>
              
              <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-cyan-900/40 border border-cyan-500 text-cyan-400 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-800/60 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]">Salvar no Banco</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}