// src/pages/admin/tabs/ArmoryTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

interface ItemData { id: string; name: string; type: 'consumable' | 'gear'; effectValue: number; price: number; currency: 'bits' | 'gems'; icon: string; }

export function ArmoryTab() {
  const [items, setItems] = useState<ItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ItemData>({ id: '', name: '', type: 'consumable', effectValue: 0, price: 100, currency: 'bits', icon: '🍖' });

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const snap = await getDocs(collection(db, 'items'));
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ItemData)));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;
    try {
      await setDoc(doc(db, 'items', formData.id.toLowerCase()), formData);
      setIsModalOpen(false);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Deletar o item ${id}?`)) {
      try { await deleteDoc(doc(db, 'items', id)); fetchItems(); } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm">
        <div>
          <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-1">Itens de Loja e Drops</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gerencie consumíveis (Poções) e Equipamentos (Garras).</p>
        </div>
        <button onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', type: 'consumable', effectValue: 0, price: 100, currency: 'bits', icon: '🍖' }); setIsModalOpen(true); }} className="bg-amber-900/30 border border-amber-500 text-amber-400 px-5 py-2.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
          <span className="text-lg leading-none">+</span> Novo Item
        </button>
      </div>

      <div className="bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#111827] border-b border-[#1e293b] text-[9px] text-slate-400 uppercase tracking-widest">
              <th className="p-4 font-bold">Item</th>
              <th className="p-4 font-bold">Tipo</th>
              <th className="p-4 font-bold">Efeito / Bônus</th>
              <th className="p-4 font-bold">Preço de Loja</th>
              <th className="p-4 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-amber-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">Carregando Arsenal...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Nenhum item cadastrado.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[#1e293b] hover:bg-[#111827]/50 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <span className="text-2xl drop-shadow-md">{item.icon}</span>
                    <div>
                      <p className="font-bold text-white uppercase tracking-widest text-[11px] mb-0.5">{item.name}</p>
                      <span className="font-mono text-[9px] text-slate-500">{item.id}</span>
                    </div>
                  </td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-[8px] uppercase tracking-widest font-bold shadow-sm ${item.type === 'gear' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500' : 'bg-slate-800 text-slate-300 border border-slate-600'}`}>{item.type}</span></td>
                  <td className="p-4 text-green-400 font-mono text-[10px] font-bold">+{item.effectValue}</td>
                  <td className="p-4 font-mono text-[10px] font-bold">{item.currency === 'bits' ? <span className="text-yellow-400">🪙 {item.price}</span> : <span className="text-cyan-400">💎 {item.price}</span>}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => { setFormData(item); setIsEditing(true); setIsModalOpen(true); }} className="text-cyan-500 hover:text-cyan-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-cyan-500/30 rounded">Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-300 text-[10px] uppercase font-bold tracking-widest transition-colors px-3 py-1 border border-transparent hover:border-red-500/30 rounded">Excluir</button>
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
              <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="text-lg">⚔️</span> Registrar Item
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">✖</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">ID Único</label>
                <input type="text" required disabled={isEditing} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Nome Exibição</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none">
                    <option value="consumable">Consumível</option>
                    <option value="gear">Equipamento (Gear)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Valor do Bônus</label>
                  <input type="number" required value={formData.effectValue} onChange={e => setFormData({...formData, effectValue: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Preço</label>
                  <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Moeda</label>
                  <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as any})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none">
                    <option value="bits">Bits 🪙</option>
                    <option value="gems">Gemas 💎</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Ícone (Emoji)</label>
                <input type="text" required value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-[#111827] border border-[#1e293b] focus:border-amber-400 rounded px-3 py-2 text-white text-xs outline-none" maxLength={2} />
              </div>

              <div className="pt-4 border-t border-[#1e293b] flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-amber-900/40 border border-amber-500 text-amber-400 hover:bg-amber-800/60 hover:text-white px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}