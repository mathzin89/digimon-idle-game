// src/pages/admin/tabs/DigimonTab.tsx
import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../services/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface DigimonData { 
  id: string; 
  name: string; 
  hp: number; 
  atk: number; 
  evolvesTo: string; 
  evolveLevel: number; 
  rarity: string; 
  menuImg: string; 
  portraitImg: string;
}

export function DigimonTab() {
  const [digimons, setDigimons] = useState<DigimonData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [uploadingMenu, setUploadingMenu] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);

  const [formData, setFormData] = useState<DigimonData>({ 
    id: '', name: '', hp: 1000, atk: 10, evolvesTo: '', evolveLevel: 0, rarity: 'Normal', menuImg: '', portraitImg: '' 
  });

  const fetchDigimons = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'digimons'));
      setDigimons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DigimonData)));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchDigimons(); 
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      await setDoc(doc(db, 'digimons', formData.id.toLowerCase()), formData);
      setIsModalOpen(false);
      fetchDigimons();
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deletar ${id}? Essa ação não pode ser desfeita.`)) {
      try { 
        await deleteDoc(doc(db, 'digimons', id)); 
        fetchDigimons(); 
      } catch (e) { 
        console.error(e); 
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'menuImg' | 'portraitImg') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.id) {
      alert("Por favor, preencha o campo 'ID Único' antes de subir as imagens. Ele é usado para organizar as pastas na nuvem.");
      return;
    }

    if (field === 'menuImg') setUploadingMenu(true);
    else setUploadingPortrait(true);

    try {
      const storageRef = ref(storage, `digimons/${formData.id}_${field}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, [field]: downloadURL }));
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer upload da imagem. Verifique se ativou o Storage no Firebase Console.");
    } finally {
      if (field === 'menuImg') setUploadingMenu(false);
      else setUploadingPortrait(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-1">Banco de Dados Ativo</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cadastre atributos e faça upload dos sprites para o Firebase Storage.</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', hp: 1000, atk: 10, evolvesTo: '', evolveLevel: 0, rarity: 'Normal', menuImg: '', portraitImg: '' }); setIsModalOpen(true); }} className="bg-cyan-900/30 border border-cyan-500 hover:bg-cyan-800/50 text-cyan-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Nova Espécie
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] border-b border-[#1e293b] text-[9px] text-slate-400 uppercase tracking-widest">
              <th className="p-4 font-bold">Imagens / ID</th>
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold">Atributos Base</th>
              <th className="p-4 font-bold">Evolução</th>
              <th className="p-4 font-bold">Raridade</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-cyan-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando...</td></tr>
            ) : digimons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Nenhum Digimon.</td></tr>
            ) : (
              digimons.map((digi) => (
                <tr key={digi.id} className="border-b border-[#1e293b] hover:bg-[#111827]/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-full border border-[#1e293b] flex items-center justify-center overflow-hidden">
                       {digi.portraitImg ? <img src={digi.portraitImg} className="w-full h-full object-contain" alt="face" /> : <span className="text-[10px]">👤</span>}
                    </div>
                    <div className="w-10 h-10 bg-black rounded-lg border border-[#1e293b] flex items-center justify-center overflow-hidden">
                       {digi.menuImg ? <img src={digi.menuImg} className="w-full h-full object-contain pixelated" alt="sprite" /> : <span className="text-[10px]">🦖</span>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 ml-2">{digi.id}</span>
                  </td>
                  <td className="p-4 font-bold text-white uppercase tracking-widest text-[11px]">{digi.name}</td>
                  <td className="p-4">
                     <div className="flex flex-col gap-1">
                       <span className="font-mono text-green-400 text-[9px]">HP: {digi.hp}</span>
                       <span className="font-mono text-red-400 text-[9px]">ATK: {digi.atk}</span>
                     </div>
                  </td>
                  <td className="p-4 font-mono text-[9px]">{digi.evolvesTo ? <span className="text-yellow-400">{digi.evolvesTo} (Nv. {digi.evolveLevel})</span> : <span className="text-slate-500">MÁXIMO</span>}</td>
                  <td className="p-4"><span className="bg-slate-800 border border-slate-600 text-slate-300 px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold shadow-sm">{digi.rarity}</span></td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setFormData(digi); setIsEditing(true); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-cyan-500/30 rounded">Editar</button>
                    <button onClick={() => handleDelete(digi.id)} className="text-red-500 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-red-500/30 rounded">Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#1e293b] bg-[#111827] flex justify-between items-center">
              <h3 className="text-cyan-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="text-lg">💾</span> {isEditing ? `Editando: ${formData.id}` : 'Registrar Nova Espécie'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">✖</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">ID Único (ex: agumon_base)</label>
                  <input type="text" required disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-cyan-400 rounded px-3 py-2 text-white text-xs outline-none disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Nome de Exibição</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-cyan-400 rounded px-3 py-2 text-white text-xs outline-none" />
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1e293b] p-4 rounded-lg space-y-4">
                 <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest border-b border-[#1e293b] pb-2">Central de Mídia (Upload)</h4>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-2">Sprite de Batalha (Corpo)</label>
                       <div className="flex gap-3 items-center">
                          <div className="w-16 h-16 bg-[#0a0f1a] border border-[#1e293b] rounded-md flex items-center justify-center overflow-hidden shrink-0">
                             {uploadingMenu ? <span className="text-[10px] text-cyan-400 animate-pulse font-mono">Up...</span> : formData.menuImg ? <img src={formData.menuImg} className="w-full h-full object-contain pixelated" /> : <span className="text-xs">🦖</span>}
                          </div>
                          <div className="flex-1">
                             <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'menuImg')} className="w-full text-[9px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer" />
                             <input type="text" value={formData.menuImg} onChange={e => setFormData({...formData, menuImg: e.target.value})} placeholder="Ou cole a URL direta aqui" className="mt-2 w-full bg-[#0a0f1a] border border-[#1e293b] text-slate-400 text-[9px] px-2 py-1 rounded outline-none" />
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-2">Ícone de Rosto (Avatar)</label>
                       <div className="flex gap-3 items-center">
                          <div className="w-16 h-16 bg-[#0a0f1a] border border-[#1e293b] rounded-full flex items-center justify-center overflow-hidden shrink-0">
                             {uploadingPortrait ? <span className="text-[10px] text-purple-400 animate-pulse font-mono">Up...</span> : formData.portraitImg ? <img src={formData.portraitImg} className="w-full h-full object-contain" /> : <span className="text-xs">👤</span>}
                          </div>
                          <div className="flex-1">
                             <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'portraitImg')} className="w-full text-[9px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-purple-900/30 file:text-purple-400 hover:file:bg-purple-900/50 cursor-pointer" />
                             <input type="text" value={formData.portraitImg} onChange={e => setFormData({...formData, portraitImg: e.target.value})} placeholder="Ou cole a URL direta aqui" className="mt-2 w-full bg-[#0a0f1a] border border-[#1e293b] text-slate-400 text-[9px] px-2 py-1 rounded outline-none" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">HP Base</label>
                  <input type="number" required value={formData.hp} onChange={e => setFormData({...formData, hp: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-green-400/50 rounded px-3 py-2 text-green-400 text-xs outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-red-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">Ataque Base</label>
                  <input type="number" required value={formData.atk} onChange={e => setFormData({...formData, atk: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-red-400/50 rounded px-3 py-2 text-red-400 text-xs outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-yellow-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">Evolui Para (ID)</label>
                  <input type="text" value={formData.evolvesTo} onChange={e => setFormData({...formData, evolvesTo: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-yellow-400/50 rounded px-3 py-2 text-yellow-400 text-xs outline-none font-mono" placeholder="Vazio = Forma Final" />
                </div>
                <div>
                  <label className="block text-yellow-500/70 text-[9px] font-bold uppercase tracking-widest mb-1">Nível Evolução</label>
                  <input type="number" value={formData.evolveLevel} onChange={e => setFormData({...formData, evolveLevel: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-yellow-400/50 rounded px-3 py-2 text-yellow-400 text-xs outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-blue-400/70 text-[9px] font-bold uppercase tracking-widest mb-1">Raridade</label>
                  <select value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-blue-400/50 rounded px-3 py-2 text-blue-400 text-xs outline-none">
                    <option value="Normal">Normal</option>
                    <option value="Elite">Elite</option>
                    <option value="Chefe">Chefe</option>
                    <option value="Divino">Divino</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" disabled={uploadingMenu || uploadingPortrait} className="bg-cyan-900/40 border border-cyan-500 text-cyan-400 hover:bg-cyan-800/60 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">Salvar no Banco</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}