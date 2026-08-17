// src/pages/admin/AdminLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // LOGIN NORMAL COM TRAVA DE SEGURANÇA RBAC
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

        // Apenas diretores passam daqui
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

        <div className="mt-6 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Sistema com monitoramento de intrusão ativo.
          </p>
        </div>
      </div>
    </div>
  );
}