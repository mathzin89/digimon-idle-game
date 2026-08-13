// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Button } from '../components/ui/Button';
import splashBg from "../assets/splash-bg.png";

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-digi-dark relative flex items-center justify-center overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <img 
           src={splashBg} 
           className="w-full h-full object-cover" 
           alt="Digital World Background"
         />
         <div className="absolute inset-0 bg-digi-dark/50 z-10 backdrop-blur-[3px]"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-digi-cyan/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.05)] backdrop-blur-md">
         
         <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-digi-gold to-yellow-700 drop-shadow-md">
              DIGI IDLE
            </h1>
            <p className="text-digi-cyan tracking-[0.3em] text-xs mt-2 uppercase font-bold">
              Acesso ao Digital World
            </p>
         </div>

         {error && (
           <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-xs font-bold border border-red-800 text-center">
             {error}
           </div>
         )}

         <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
               {/* No Firebase padronizamos o login por E-mail */}
               <label className="block text-slate-400 text-xs font-bold mb-2 tracking-widest uppercase">
                 E-mail de Acesso
               </label>
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-slate-950/50 border border-slate-700 rounded px-4 py-3 text-slate-200 focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" 
                 placeholder="tamer@email.com" 
               />
            </div>
            <div>
               <label className="block text-slate-400 text-xs font-bold mb-2 tracking-widest uppercase">
                 Senha
               </label>
               <input 
                 type="password" 
                 required
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-slate-950/50 border border-slate-700 rounded px-4 py-3 text-slate-200 focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" 
                 placeholder="••••••••" 
               />
            </div>

            <Button 
              variant="primary" 
              type="submit"
              disabled={loading} 
              className="w-full mt-4 py-4 text-lg disabled:opacity-50"
            >
               {loading ? 'INICIANDO LINK...' : 'INICIAR LINK'}
            </Button>
         </form>

         <div className="mt-8 text-center text-sm text-slate-500">
            Novo no Digital World?{' '}
            <Link to="/register" className="text-digi-cyan hover:text-white transition hover:underline">
              Criar conta
            </Link>
         </div>
         <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-slate-600 hover:text-slate-400 transition uppercase tracking-wider">
              &lt; Voltar para o Início
            </Link>
         </div>

      </div>
    </div>
  );
}