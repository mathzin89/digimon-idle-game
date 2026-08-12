// src/pages/LoginPage.tsx
import React from 'react';
import { Button } from '../components/ui/Button';
import splashBg from "../assets/splash-bg.png";
export function LoginPage() {
  return (
    <div className="min-h-screen bg-digi-dark relative flex items-center justify-center overflow-hidden">
      
      {/* Background - Corrigido */}
      <div className="absolute inset-0 z-0">
         <img 
           src={splashBg} 
           className="w-full h-full object-cover" 
           alt="Digital World Background"
         />
         {/* Na tela de login mantemos um pouco mais de blur e escuridão uniforme apenas para destacar o formulário */}
         <div className="absolute inset-0 bg-digi-dark/50 z-10 backdrop-blur-[3px]"></div>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-digi-cyan/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.05)] backdrop-blur-md">
         
         {/* Cabeçalho do Login */}
         <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-digi-gold to-yellow-700 drop-shadow-md">
              DIGI IDLE
            </h1>
            <p className="text-digi-cyan tracking-[0.3em] text-xs mt-2 uppercase font-bold">
              Acesso ao Digital World
            </p>
         </div>

         {/* Formulário */}
         <form className="flex flex-col gap-5">
            <div>
               <label className="block text-slate-400 text-xs font-bold mb-2 tracking-widest uppercase">
                 Tamer ID (Usuário)
               </label>
               <input 
                 type="text" 
                 className="w-full bg-slate-950/50 border border-slate-700 rounded px-4 py-3 text-slate-200 focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" 
                 placeholder="Seu nome de jogador" 
               />
            </div>
            <div>
               <label className="block text-slate-400 text-xs font-bold mb-2 tracking-widest uppercase">
                 Senha
               </label>
               <input 
                 type="password" 
                 className="w-full bg-slate-950/50 border border-slate-700 rounded px-4 py-3 text-slate-200 focus:outline-none focus:border-digi-cyan focus:bg-slate-900 transition shadow-inner" 
                 placeholder="••••••••" 
               />
            </div>

            <Button variant="primary" className="w-full mt-4 py-4 text-lg" type="button">
               INICIAR LINK
            </Button>
         </form>

         {/* Links Úteis */}
         <div className="mt-8 text-center text-sm text-slate-500">
            Novo no Digital World?{' '}
            <a href="/register" className="text-digi-cyan hover:text-white transition hover:underline">
              Criar conta
            </a>
         </div>
         <div className="mt-4 text-center">
            <a href="/" className="text-xs text-slate-600 hover:text-slate-400 transition uppercase tracking-wider">
              &lt; Voltar para o Início
            </a>
         </div>

      </div>
    </div>
  );
}