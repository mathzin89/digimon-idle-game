// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Button } from '../components/ui/Button';
import splashBg from '../assets/splash-bg.png';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [tamerId, setTamerId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }
    
    if (password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres.');
    }

    setLoading(true);

    try {
      // 1. Cria a conta no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Salva o Tamer ID no perfil do usuário
      await updateProfile(userCredential.user, {
        displayName: tamerId
      });

      // 3. Dispara o e-mail oficial de verificação do Firebase
      await sendEmailVerification(userCredential.user);

      // 4. Redireciona para a tela de aviso de e-mail (e não mais pro jogo)
      navigate('/verify-email');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao criar conta. Verifique os dados ou tente outro e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-digi-dark relative flex items-center justify-center overflow-hidden py-12">
      
      <div className="absolute inset-0 z-0">
         <img src={splashBg} className="w-full h-full object-cover" alt="Digital World Background" />
         <div className="absolute inset-0 bg-digi-dark/50 z-10 backdrop-blur-[3px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-digi-cyan/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.05)] backdrop-blur-md">
         
         <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-digi-gold to-yellow-700 drop-shadow-md">
              NOVO TAMER
            </h1>
            <p className="text-digi-cyan tracking-[0.2em] text-xs mt-2 uppercase font-black">
              Registro no Digital World
            </p>
         </div>

         {error && (
           <div className="bg-red-900/50 text-red-400 p-3 rounded mb-4 text-xs font-bold border border-red-800 text-center">
             {error}
           </div>
         )}

         <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
               <label className="block text-slate-300 text-[11px] font-extrabold mb-1.5 tracking-widest uppercase">
                 Email de Acesso
               </label>
               <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950/60 border border-slate-600 rounded px-4 py-2.5 text-slate-100 font-semibold text-sm focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" placeholder="tamer@email.com" />
            </div>
            
            <div>
               <label className="block text-slate-300 text-[11px] font-extrabold mb-1.5 tracking-widest uppercase">
                 Tamer ID (Nome no Jogo)
               </label>
               <input type="text" required value={tamerId} onChange={(e) => setTamerId(e.target.value)} className="w-full bg-slate-950/60 border border-slate-600 rounded px-4 py-2.5 text-slate-100 font-semibold text-sm focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" placeholder="Ex: TaiKamiya" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-slate-300 text-[11px] font-extrabold mb-1.5 tracking-widest uppercase">Senha</label>
                 <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950/60 border border-slate-600 rounded px-4 py-2.5 text-slate-100 font-semibold text-sm focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" placeholder="••••••••" />
              </div>
              <div>
                 <label className="block text-slate-300 text-[11px] font-extrabold mb-1.5 tracking-widest uppercase">Confirmar</label>
                 <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-950/60 border border-slate-600 rounded px-4 py-2.5 text-slate-100 font-semibold text-sm focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" placeholder="••••••••" />
              </div>
            </div>

            <div className="w-full block mt-4">
              <Button variant="primary" type="submit" disabled={loading} className="w-full py-3.5 text-base font-black disabled:opacity-50">
                {loading ? 'CONECTANDO...' : 'CRIAR CONTA'}
              </Button>
            </div>
         </form>

         <div className="mt-8 text-center text-sm font-semibold text-slate-500">
            Já possui um Digivice?{' '}
            <Link to="/login" className="text-digi-cyan hover:text-white transition hover:underline">Fazer Login</Link>
         </div>
         <div className="mt-4 text-center">
            <Link to="/" className="text-[10px] font-bold text-slate-600 hover:text-slate-400 transition uppercase tracking-wider">&lt; Voltar para a Landing Page</Link>
         </div>
      </div>
    </div>
  );
}