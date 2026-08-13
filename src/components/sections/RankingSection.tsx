// src/components/sections/RankingSection.tsx
import React from 'react';

export function RankingSection() {
  const topTamers = [
    { rank: 1, name: "TaiKamiya", level: 99, partner: "WarGreymon", power: "1.4M", color: "text-digi-gold", bg: "bg-yellow-900/20 border-yellow-700/50" },
    { rank: 2, name: "MattIshida", level: 97, partner: "MetalGarurumon", power: "1.2M", color: "text-slate-300", bg: "bg-slate-800/40 border-slate-600/50" },
    { rank: 3, name: "KenIchijouji", level: 95, partner: "Stingmon", power: "980K", color: "text-amber-700", bg: "bg-amber-900/20 border-amber-800/50" },
    { rank: 4, name: "TK_Takaishi", level: 90, partner: "Angemon", power: "850K", color: "text-slate-400", bg: "bg-slate-900/50 border-slate-800" },
    { rank: 5, name: "Sora_T", level: 88, partner: "Garudamon", power: "810K", color: "text-slate-400", bg: "bg-slate-900/50 border-slate-800" },
  ];

  return (
    <section id="ranking" className="py-24 px-6 bg-slate-950 relative z-10 border-t border-slate-900">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-100 mb-4 tracking-widest drop-shadow-md">
            RANKING <span className="text-digi-cyan">GLOBAL</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Os Tamers mais dedicados do servidor. O ranking é atualizado em tempo real com base no poder total do time e nível do líder.
          </p>
        </div>

        {/* Tabela de Ranking */}
        <div className="bg-slate-900/80 border border-digi-cyan/20 rounded-xl p-4 md:p-8 shadow-[0_0_30px_rgba(0,229,255,0.05)] backdrop-blur-sm">
          
          {/* Cabeçalho das Colunas (Escondido no Mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest pb-4 border-b border-slate-800 mb-4 px-4">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-4">Tamer ID</div>
            <div className="col-span-3">Parceiro</div>
            <div className="col-span-2 text-center">Nível</div>
            <div className="col-span-2 text-right">Poder (BP)</div>
          </div>

          {/* Lista de Jogadores */}
          <div className="flex flex-col gap-3">
            {topTamers.map((tamer) => (
              <div 
                key={tamer.rank} 
                className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-lg border transition-all hover:-translate-y-1 hover:shadow-lg ${tamer.bg}`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center md:justify-start md:pl-2">
                  <span className={`text-xl md:text-2xl font-black italic ${tamer.color}`}>
                    #{tamer.rank}
                  </span>
                </div>
                
                {/* Nome do Tamer */}
                <div className="col-span-4 flex items-center gap-3 justify-center md:justify-start">
                  <div className="w-8 h-8 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {tamer.name.charAt(0)}
                  </div>
                  <span className="font-bold text-slate-200 tracking-wider text-sm md:text-base">
                    {tamer.name}
                  </span>
                </div>

                {/* Parceiro */}
                <div className="col-span-3 text-center md:text-left text-sm font-medium text-slate-400">
                  {tamer.partner}
                </div>

                {/* Nível */}
                <div className="col-span-2 text-center">
                  <span className="inline-block bg-slate-950 px-3 py-1 rounded border border-slate-800 text-xs font-bold text-digi-cyan tracking-widest">
                    LV. {tamer.level}
                  </span>
                </div>

                {/* Poder */}
                <div className="col-span-2 text-center md:text-right">
                  <span className="font-mono font-bold text-digi-gold text-sm md:text-base">
                    {tamer.power}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}