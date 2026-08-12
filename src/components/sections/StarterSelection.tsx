// src/components/sections/StarterSelection.tsx
import React from 'react';

export function StarterSelection() {
  const starters = [
    {
      name: "Agumon",
      type: "Fogo | Vacina",
      borderColor: "hover:border-red-500",
      glowBg: "group-hover:bg-red-500/10",
      glowShadow: "shadow-[0_0_40px_rgba(239,68,68,0.15)]",
      typeColor: "text-red-400",
      img: "https://wikimon.net/images/thumb/6/6f/Agumon_%28Digimon_World%29.png/120px-Agumon_%28Digimon_World%29.png"
    },
    {
      name: "Gabumon",
      type: "Água | Data",
      borderColor: "hover:border-blue-500",
      glowBg: "group-hover:bg-blue-500/10",
      glowShadow: "shadow-[0_0_40px_rgba(59,130,246,0.15)]",
      typeColor: "text-blue-400",
      img: "https://wikimon.net/images/thumb/3/3a/Gabumon_%28Digimon_World%29.png/120px-Gabumon_%28Digimon_World%29.png"
    },
    {
      name: "Palmon",
      type: "Planta | Data",
      borderColor: "hover:border-emerald-500",
      glowBg: "group-hover:bg-emerald-500/10",
      glowShadow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
      typeColor: "text-emerald-400",
      img: "https://wikimon.net/images/thumb/d/d4/Palmon_%28Digimon_World%29.png/120px-Palmon_%28Digimon_World%29.png"
    }
  ];

  return (
    <section className="py-24 px-8 bg-digi-darker relative z-10 flex flex-col items-center justify-center border-t border-digi-cyan/10">
      
      {/* Cabeçalho da Seção */}
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-100 mb-4 uppercase tracking-widest drop-shadow-md">
          Escolha Seu Parceiro Inicial
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Ele será o líder do seu time — quem caça nas hunts. Renderizado direto do <span className="font-mono text-digi-cyan">.dat/.spr</span>.
        </p>
      </div>

      {/* Grid de Escolha */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center w-full max-w-4xl">
        {starters.map((starter, index) => (
          <div 
            key={index}
            className={`w-64 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center transition-all duration-500 cursor-pointer relative overflow-hidden group ${starter.borderColor} shadow-lg shadow-black/50 hover:-translate-y-2`}
          >
            {/* Efeito de Luz Interna (Hover) */}
            <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 blur-2xl z-0 ${starter.glowBg}`}></div>
            
            {/* Círculo com o Sprite */}
            <div className={`relative z-10 w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-slate-950/80 transition-all duration-500 ${starter.glowShadow} group-hover:scale-110`}>
              <img 
                src={starter.img} 
                alt={starter.name} 
                className="w-16 h-16 object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Textos */}
            <h3 className="relative z-10 text-xl font-bold text-slate-200 mb-1 font-serif">
              {starter.name}
            </h3>
            <span className={`relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] ${starter.typeColor}`}>
              {starter.type}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}