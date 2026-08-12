// src/components/layout/Footer.tsx
import React from 'react';
import { Button } from '../ui/Button';

export function Footer() {
  return (
    <footer className="relative bg-digi-darker border-t border-digi-cyan/10 pt-24 pb-8 flex flex-col items-center z-10">
      
      {/* Final Call to Action (CTA) */}
      <div className="text-center mb-24 px-4 relative">
        {/* Glow de fundo para destacar o botão final */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-digi-gold/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-100 mb-6 uppercase drop-shadow-md">
          Jogue Agora
        </h2>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Em poucos minutos você cria conta, escolhe seu parceiro inicial e começa a caçada. Tudo direto no seu navegador.
        </p>
        <Button variant="primary" className="px-12 py-4 text-xl mx-auto shadow-glow-gold hover:scale-105">
          JOGAR AGORA
        </Button>
      </div>

      {/* Grid do Rodapé */}
      <div className="w-full max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-t border-slate-800/60 pt-12">
        
        {/* Logo / Sobre */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex flex-col items-center md:items-start mb-4 cursor-pointer hover:opacity-80 transition">
            <h2 className="text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-digi-gold to-yellow-700">
              DIGI IDLE
            </h2>
            <span className="text-[10px] text-digi-cyan tracking-[0.2em] font-bold -mt-1">WORLD</span>
          </div>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            O MAIOR idle de Digimon com a jogabilidade clássica e progressão estratégica que você sempre sonhou.
          </p>
        </div>

        {/* Links de Navegação */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="text-slate-200 font-bold uppercase tracking-widest text-xs mb-6 border-b border-slate-800 pb-2">
            Navegação
          </h4>
          <ul className="space-y-3 text-slate-500 text-sm font-medium">
            <li><a href="#" className="hover:text-digi-cyan transition">Características Principais</a></li>
            <li><a href="#" className="hover:text-digi-cyan transition">Sistemas do Jogo</a></li>
            <li><a href="#" className="hover:text-digi-cyan transition">Criar Conta / Jogar</a></li>
          </ul>
        </div>

        {/* Redes Sociais */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h4 className="text-slate-200 font-bold uppercase tracking-widest text-xs mb-6 border-b border-slate-800 pb-2">
            Redes Sociais
          </h4>
          <p className="text-slate-500 text-sm mb-4">Siga e fique por dentro dos updates semanais!</p>
          <div className="flex gap-4">
            {/* Instagram */}
            <a href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-500 hover:-translate-y-1 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            {/* Discord */}
            <a href="#" className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-400 hover:-translate-y-1 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 19c-1.5-1.5-3-2-3-2 .5.5 1 1.5 1 1.5M6 19c1.5-1.5 3-2 3-2-.5.5-1 1.5-1 1.5M12 15s-2.5-1-4-1-4 2-4 2c0 2 1.5 4 4 4 1.5 0 2.5-1 4-1s2.5 1 4 1c2.5 0 4-2 4-4 0 0-1.5-2-4-2-1.5 0-4 1-4 1z"></path><path d="M8 11.5v-1c0-1.5 1.5-2.5 3-2.5h2c1.5 0 3 1 3 2.5v1"></path></svg>
            </a>
          </div>
        </div>

      </div>

      {/* Copyright & Disclaimer (Aviso Legal Importante para Fan Games) */}
      <div className="w-full text-center border-t border-slate-800/40 pt-6 px-4">
        <p className="text-slate-600 text-xs mb-2 font-mono">
          © {new Date().getFullYear()} DIGI IDLE WORLD.
        </p>
        <p className="text-slate-700 text-[10px] max-w-3xl mx-auto leading-relaxed">
          Desenvolvido de fã para fã. O Digi Idle World é um projeto não-oficial e não possui afiliação com a Bandai Namco Entertainment, Toei Animation ou propriedades Digimon. Todos os direitos de imagem, nomes e marcas registradas pertencem aos seus respectivos criadores e proprietários.
        </p>
      </div>
    </footer>
  );
}