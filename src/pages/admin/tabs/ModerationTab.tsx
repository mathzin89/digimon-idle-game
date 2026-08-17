// src/pages/admin/tabs/ModerationTab.tsx
import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';

interface ChatLog { id: string; author: string; authorId: string; text: string; timestamp: number; }

export function ModerationTab() {
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setChatLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatLog)));
    });
    return () => unsub();
  }, []);

  const banUser = async (uid: string) => {
    if (window.confirm('Banir este jogador imediatamente do servidor?')) {
      try { await updateDoc(doc(db, 'users', uid), { isBanned: true }); alert('Conta banida com sucesso.'); } 
      catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      <div className="flex justify-between items-center bg-[#111827] p-5 rounded-lg border border-[#1e293b] shadow-sm shrink-0">
        <div>
          <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">Auditoria de Servidor</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Monitore o chat em tempo real e aplique punições imediatamente.</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0f1a] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg flex flex-col">
         <div className="bg-[#111827] border-b border-[#1e293b] p-3 text-[9px] text-slate-400 uppercase tracking-widest font-bold">
           Live Chat Log
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {chatLogs.length === 0 ? (
              <p className="text-center text-slate-500 text-[10px] uppercase tracking-widest py-8">Chat silencioso no momento.</p>
            ) : (
              chatLogs.map(log => (
                <div key={log.id} className="bg-[#050811] border border-[#1e293b] p-3 rounded flex justify-between items-center hover:border-red-500/30 transition-colors group">
                  <div className="text-[10px] font-mono flex items-center gap-3">
                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-cyan-400 font-bold">{log.author}:</span>
                    <span className="text-white">{log.text}</span>
                  </div>
                  <button onClick={() => banUser(log.authorId)} className="opacity-0 group-hover:opacity-100 bg-red-900/30 border border-red-500 hover:bg-red-900/60 text-red-400 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all">Banir Conta</button>
                </div>
              ))
            )}
         </div>
      </div>
    </div>
  );
}