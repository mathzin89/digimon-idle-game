// src/pages/VerifyEmailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import splashBg from '../assets/splash-bg.png';

export function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-digi-dark relative flex items-center justify-center overflow-hidden">
      
      <div className="absolute inset-0 z-0">
         <img src={splashBg} className="w-full h-full object-cover" alt="Digital World Background" />
         <div className="absolute inset-0 bg-digi-dark/50 z-10 backdrop-blur-[3px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-yellow-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.1)] backdrop-blur-md text-center">
         
         <div className="text-5xl mb-4">📧</div>
         
         <h1 className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-digi-gold to-yellow-700 drop-shadow-md mb-2">
           VERIFIQUE SEU E-MAIL
         </h1>
         
         <p className="text-slate-300 text-sm mb-6 leading-relaxed">
           Nós enviamos um link de confirmação para o seu e-mail. Para ativar o seu Digivice e entrar no Digital World, clique no link enviado.
         </p>

         <div className="bg-slate-950/50 border border-slate-700 p-4 rounded text-xs text-slate-400 mb-6">
           <span className="font-bold text-red-400 block mb-1">Atenção:</span>
           Após clicar no link do e-mail, atualize esta página ou faça login novamente para jogar.
         </div>

         <Link to="/login" className="w-full block">
           <Button variant="primary" className="w-full py-3 text-sm font-black uppercase tracking-widest">
             Já confirmei, ir para Login
           </Button>
         </Link>

      </div>
    </div>
  );
}