// src/components/sections/BrowserFeature.tsx
import React from 'react';

export function BrowserFeature() {
  return (
    <section className="relative py-24 px-8 bg-digi-darker border-t border-digi-cyan/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Lado Esquerdo: Textos e Badges */}
        <div>
          <p className="text-digi-gold font-bold tracking-[0.2em] text-xs mb-4 uppercase flex items-center gap-2">
            <span className="w-4 h-[2px] bg-digi-gold"></span>
            RPG ONLINE
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-100 mb-6 leading-tight">
            NO SEU NAVEGADOR, SEM DOWNLOAD
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Rode direto no navegador — sem instalar nada. Em poucos minutos você cria conta, escolhe seu parceiro inicial e começa a caçar no Digital World. Também no celular, como um app.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 rounded-full border border-digi-gold/30 text-digi-gold text-sm bg-digi-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              Sem download
            </span>
            <span className="px-4 py-2 rounded-full border border-digi-gold/30 text-digi-gold text-sm bg-digi-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              Direto no navegador
            </span>
            <span className="px-4 py-2 rounded-full border border-digi-gold/30 text-digi-gold text-sm bg-digi-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              Também no celular
            </span>
          </div>
        </div>

        {/* Lado Direito: Mockup do Navegador com a "Gameplay" */}
        <div className="relative">
          {/* Brilho de fundo (Glow effect) */}
          <div className="absolute inset-0 bg-digi-cyan/20 blur-[100px] rounded-full z-0"></div>
          
          {/* Janela Fake do Navegador */}
          <div className="relative z-10 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50 hover:-translate-y-2 transition duration-500">
            
            {/* Barra superior do navegador fake */}
            <div className="bg-slate-950 px-4 py-3 flex items-center gap-2 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 px-3 py-1 bg-slate-900 rounded text-xs text-slate-500 font-mono w-48 text-center truncate flex-1 md:flex-none">
                play.digiidleworld.com
              </div>
            </div>
            
            {/* Imagem de "Gameplay" (Usando um placeholder de pixel art/game por enquanto) */}
            <img 
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop" 
              alt="Screenshot do Jogo" 
              className="w-full h-auto opacity-80 hover:opacity-100 transition duration-300"
            />
          </div>
        </div>

      </div>
    </section>
  );
}