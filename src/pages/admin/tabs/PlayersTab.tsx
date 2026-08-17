// src/pages/admin/tabs/PlayersTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

interface PlayerData { 
  id: string; 
  tamerName: string; 
  email: string; 
  bits: number; 
  gems: number; 
  bpp: number; 
  isPremium: boolean; 
  isBanned: boolean; 
  role: 'player' | 'vip' | 'mod' | 'admin' | 'owner'; 
}

export function PlayersTab() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PlayerData>({ 
    id: '', tamerName: '', email: '', bits: 0, gems: 0, bpp: 0, isPremium: false, isBanned: false, role: 'player' 
  });

  const fetchPlayers = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setPlayers(snap.docs.map(doc => {
        const d = doc.data();
        return { 
          id: doc.id, 
          tamerName: d.tamerName || '', // Removi o fallback estático para facilitar a edição
          email: d.email || '', 
          bits: d.bits || 0, 
          gems: d.gems || 0, 
          bpp: d.bpp || 0, 
          isPremium: d.isPremium || false, 
          isBanned: d.isBanned || false, 
          role: d.role || 'player' 
        };
      }));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      // Agora o painel envia TODOS os dados para o Firebase, atualizando o documento por completo
      await updateDoc(doc(db, 'users', formData.id), {
        tamerName: formData.tamerName,
        email: formData.email,
        bits: formData.bits, 
        gems: formData.gems, 
        bpp: formData.bpp,
        isPremium: formData.isPremium, 
        isBanned: formData.isBanned,
        role: formData.role
      });
      setIsModalOpen(false);
      fetchPlayers();
    } catch (e) { 
      console.error(e); 
      alert("Erro ao salvar os dados no Firebase.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <span className="text-red-500 font-black bg-red-900/20 px-1.5 py-0.5 rounded border border-red-500/30">[OWNER]</span>;
      case 'admin': return <span className="text-cyan-400 font-bold bg-cyan-900/20 px-1.5 py-0.5 rounded border border-cyan-500/30">[ADM]</span>;
      case 'mod': return <span className="text-emerald-400 font-bold bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/30">[MOD]</span>;
      case 'vip': return <span className="text-purple-400 font-bold bg-purple-900/20 px-1.5 py-0.5 rounded border border-purple-500/30">[VIP]</span>;
      default: return <span className="text-slate-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-600">[PLAYER]</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-blue-800 font-black uppercase tracking-widest text-lg">Contas Registradas</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Injete moedas, altere nomes, atribua cargos ou aplique banimentos.</p>
        </div>
        <div className="text-5xl drop-shadow-sm opacity-90">👥</div>
      </div>

      <div className="bg-white border-2 border-blue-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-blue-50 border-b-2 border-blue-100 text-[9px] text-blue-800 uppercase tracking-widest">
              <th className="p-4 font-black">Jogador / UID</th>
              <th className="p-4 font-black text-center">Hierarquia</th>
              <th className="p-4 font-black">Bolsa (Bits/Gemas/BPP)</th>
              <th className="p-4 font-black text-center">Status</th>
              <th className="p-4 font-black text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs text-slate-700">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-blue-600 font-black tracking-widest uppercase text-[10px] animate-pulse">Carregando Jogadores...</td></tr>
            ) : players.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Nenhum jogador encontrado.</td></tr>
            ) : (
              players.map((player) => (
                <tr key={player.id} className={`border-b border-blue-50 transition-colors ${player.isBanned ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-4">
                    <p className={`font-black uppercase tracking-widest text-[11px] mb-1 ${player.isBanned ? 'text-red-600' : 'text-blue-800'}`}>
                      {player.tamerName || 'SEM NOME'}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[9px] text-slate-400" title={player.id}>ID: {player.id.substring(0, 10)}...</span>
                      {player.email && <span className="font-mono text-[9px] text-blue-400">{player.email}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                     {getRoleBadge(player.role)}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3 font-mono text-[10px] font-bold">
                      <span className="text-orange-500" title="Bits">🪙 {player.bits}</span>
                      <span className="text-cyan-500" title="Gemas">💎 {player.gems}</span>
                      <span className="text-purple-500" title="Battle Pass Points">⭐ {player.bpp}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {player.isBanned 
                      ? <span className="text-red-500 font-black text-[9px] uppercase tracking-widest bg-red-100 px-2 py-1 rounded">Banido</span> 
                      : <span className="text-green-500 font-black text-[9px] uppercase tracking-widest bg-green-100 px-2 py-1 rounded">Ativo</span>}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setFormData(player); setIsModalOpen(true); }} 
                      className="text-blue-600 hover:text-white hover:bg-blue-600 text-[10px] uppercase font-black tracking-widest transition-colors px-3 py-1.5 border-2 border-blue-200 hover:border-blue-600 rounded-lg shadow-sm"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO DE JOGADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b-2 border-blue-50 bg-slate-50 flex justify-between items-center">
              <h3 className="text-blue-800 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <span className="text-xl">⚙️</span> Editar: {formData.tamerName || formData.id.substring(0,8)}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors text-xl font-black">✖</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-5">
              
              {/* BLOCO DE IDENTIFICAÇÃO */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border-2 border-blue-50 p-4 rounded-xl">
                <div>
                  <label className="block text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">Nome do Tamer</label>
                  <input 
                    type="text" 
                    value={formData.tamerName} 
                    onChange={e => setFormData({...formData, tamerName: e.target.value})} 
                    className="w-full bg-white border-2 border-blue-100 focus:border-blue-400 rounded-lg px-3 py-2 text-blue-900 text-xs outline-none font-bold" 
                    placeholder="Ex: Matheus"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">E-mail</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-white border-2 border-blue-100 focus:border-blue-400 rounded-lg px-3 py-2 text-blue-900 text-xs outline-none font-bold" 
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              {/* BLOCO DE CARGO */}
              <div>
                 <label className="block text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5 pl-1">Hierarquia / Cargo (Role)</label>
                 <select 
                   value={formData.role} 
                   onChange={e => setFormData({...formData, role: e.target.value as any})} 
                   className="w-full bg-white border-2 border-blue-100 focus:border-blue-400 rounded-lg px-3 py-2.5 text-blue-900 text-xs outline-none font-black tracking-widest shadow-sm"
                 >
                   <option value="player">Jogador Padrão</option>
                   <option value="vip">VIP (Premium)</option>
                   <option value="mod">Moderador (Chat)</option>
                   <option value="admin">Administrador (Mapas/Itens)</option>
                   <option value="owner">Dono (Acesso Total)</option>
                 </select>
              </div>

              {/* BLOCO DE ECONOMIA */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-orange-500 text-[9px] font-black uppercase tracking-widest mb-1.5 pl-1">Bits (🪙)</label>
                  <input type="number" required value={formData.bits} onChange={e => setFormData({...formData, bits: Number(e.target.value)})} className="w-full bg-white border-2 border-orange-100 focus:border-orange-400 rounded-lg px-3 py-2 text-orange-600 text-xs outline-none font-mono font-bold shadow-sm" min="0" />
                </div>
                <div>
                  <label className="block text-cyan-500 text-[9px] font-black uppercase tracking-widest mb-1.5 pl-1">Gemas (💎)</label>
                  <input type="number" required value={formData.gems} onChange={e => setFormData({...formData, gems: Number(e.target.value)})} className="w-full bg-white border-2 border-cyan-100 focus:border-cyan-400 rounded-lg px-3 py-2 text-cyan-600 text-xs outline-none font-mono font-bold shadow-sm" min="0" />
                </div>
                <div>
                  <label className="block text-purple-500 text-[9px] font-black uppercase tracking-widest mb-1.5 pl-1">BPP (⭐)</label>
                  <input type="number" required value={formData.bpp} onChange={e => setFormData({...formData, bpp: Number(e.target.value)})} className="w-full bg-white border-2 border-purple-100 focus:border-purple-400 rounded-lg px-3 py-2 text-purple-600 text-xs outline-none font-mono font-bold shadow-sm" min="0" />
                </div>
              </div>

              {/* BLOCO DE STATUS */}
              <div className="border-2 border-blue-50 bg-slate-50 rounded-xl p-4 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} className="w-4 h-4 accent-purple-500" />
                  <div>
                    <span className="block text-purple-600 text-[10px] font-black uppercase tracking-widest">Passe Game Pass Ativo</span>
                  </div>
                </label>
                <div className="h-0.5 bg-blue-100 w-full rounded-full"></div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={formData.isBanned} onChange={e => setFormData({...formData, isBanned: e.target.checked})} className="w-4 h-4 accent-red-500" />
                  <div>
                    <span className="block text-red-600 text-[10px] font-black uppercase tracking-widest">Conta Banida</span>
                  </div>
                </label>
              </div>

              {/* BOTÕES DE AÇÃO */}
              <div className="pt-4 flex justify-end gap-3 border-t-2 border-blue-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-md border-b-4 border-blue-800 active:border-b-0 active:translate-y-1">Salvar Dados</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}