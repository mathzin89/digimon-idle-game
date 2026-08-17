// src/pages/admin/AdminLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // LOGIN NORMAL COM TRAVA DE SEGURANÇA
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docSnap = await getDoc(doc(db, 'users', user.uid));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const role = data.role || 'player';

        if (role === 'owner' || role === 'admin' || role === 'mod') {
          navigate('/admin/dashboard');
        } else {
          await auth.signOut();
          setError('Acesso negado: Sua conta não tem permissões de administrador.');
        }
      } else {
        await auth.signOut();
        setError('Conta não encontrada no servidor.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Credenciais incorretas. Use a mesma conta do jogo.');
    } finally {
      setIsLoading(false);
    }
  };

  // FUNÇÃO DE BOOTSTRAP (PRIMEIRO ACESSO)
  const handleClaimRoot = async () => {
    if (!email || !password) {
      setError('Preencha seu e-mail e senha antes de reivindicar o servidor.');
      return;
    }
    
    if (!window.confirm('ATENÇÃO: Isso vai forçar sua conta a virar [OWNER]. Tem certeza?')) return;

    setError('');
    setIsLoading(true);

    try {
      // 1. Loga com a sua conta normal
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Injeta a tag de OWNER direto no seu documento
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'owner'
      });

      alert('👑 Conta promovida a OWNER com sucesso! Bem-vindo ao sistema.');
      
      // 3. Libera a entrada
      navigate('/admin/dashboard');

    } catch (err: any) {
      console.error(err);
      setError('Erro ao reivindicar. Verifique se o e-mail e senha estão corretos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f2fe] flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 2px, transparent 2px), linear-gradient(90deg, #ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="bg-white border-2 border-blue-200 p-8 rounded-2xl shadow-xl z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-50 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-inner mb-4">
             <span className="text-3xl animate-spin-slow">🌐</span>
          </div>
          <h1 className="text-blue-800 font-black tracking-widest uppercase text-2xl drop-shadow-sm text-center">Admin.Sys</h1>
          <p className="text-[10px] text-orange-500 uppercase tracking-widest font-black mt-1">Acesso Restrito</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center mb-6 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1.5 ml-1">E-mail Oficial</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-blue-100 focus:border-blue-400 focus:bg-white rounded-xl px-4 py-3 text-blue-900 text-sm outline-none font-bold transition-all shadow-inner" 
              placeholder="admin@digitalworld.com"
            />
          </div>

          <div>
            <label className="block text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1.5 ml-1">Senha</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-blue-100 focus:border-blue-400 focus:bg-white rounded-xl px-4 py-3 text-blue-900 text-sm outline-none font-bold transition-all shadow-inner" 
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-xl uppercase tracking-widest text-xs transition-all shadow-[0_4px_15px_rgba(37,99,235,0.3)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* BOTÃO MÁGICO PARA O PRIMEIRO ACESSO */}
        <div className="mt-6 border-t-2 border-blue-50 pt-6">
          <button 
            type="button"
            onClick={handleClaimRoot}
            disabled={isLoading}
            className="w-full bg-orange-100 border-2 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-orange-600 font-black py-3 rounded-xl uppercase tracking-widest text-[10px] transition-all shadow-sm disabled:opacity-50"
          >
            👑 Reivindicar Servidor (Primeiro Acesso)
          </button>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center mt-3">
            Use apenas uma vez para registrar a sua conta como ROOT.
          </p>
        </div>

      </div>
    </div>
  );
}