// src/components/sections/DigipediaSection.tsx
import React from 'react';

export function DigipediaSection() {
  // Dados de exemplo simulando um banco de dados de Digimons
  const digimons = [
    {
      id: "#001",
      name: "Agumon",
      stage: "Rookie",
      type: "Reptile",
      attribute: "Vaccine",
      image: "https://wikimon.net/images/6/6f/Agumon_%28Digimon_World%29.png",
      color: "from-orange-500/20 to-red-600/20",
      borderColor: "border-orange-500/50"
    },
    {
      id: "#045",
      name: "Garurumon",
      stage: "Champion",
      type: "Beast",
      attribute: "Data",
      image: "https://wikimon.net/images/thumb/7/7b/Garurumon.png/200px-Garurumon.png",
      color: "from-blue-500/20 to-cyan-600/20",
      borderColor: "border-blue-500/50"
    },
    {
      id: "#078",
      name: "Angemon",
      stage: "Champion",
      type: "Angel",
      attribute: "Vaccine",
      image: "https://wikimon.net/images/thumb/e/e0/Angemon_New_Century.png/200px-Angemon_New_Century.png",
      color: "from-yellow-400/20 to-amber-600/20",
      borderColor: "border-yellow-400/50"
    }
  ];

  return (
    <section id="digipedia" className="py-24 px-6 bg-slate-900 relative z-10 border-t border-slate-800">
      
      {/* Background Holográfico */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-digi-cyan/5 via-transparent to-transparent z-0"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-100 mb-4 tracking-widest drop-shadow-md">
            DIGIPEDIA <span className="text-digi-cyan">DATABASE</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Consulte os registros do Digital World. Descubra os atributos, tipos e rotas evolutivas dos parceiros que você pode recrutar.
          </p>
        </div>

        {/* Grid de Cards Holográficos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {digimons.map((digi) => (
            <div 
              key={digi.id} 
              className={`relative bg-slate-950 rounded-xl border ${digi.borderColor} overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
            >
              {/* Luz de fundo do Card */}
              <div className={`absolute inset-0 bg-gradient-to-br ${digi.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
              
              {/* Header do Card */}
              <div className="relative z-10 p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/80">
                <span className="font-mono text-digi-cyan font-bold text-sm tracking-widest">{digi.id}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{digi.stage}</span>
              </div>

              {/* Imagem do Digimon */}
              <div className="relative z-10 h-48 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-black/40">
                <img 
                  src={digi.image} 
                  alt={digi.name} 
                  className="h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Informações Inferiores */}
              <div className="relative z-10 p-6 bg-slate-950/90 backdrop-blur-md">
                <h3 className="text-2xl font-black text-slate-100 mb-4 tracking-wider">{digi.name}</h3>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tipo</span>
                    <span className="text-xs text-slate-300 font-bold">{digi.type}</span>
                  </div>
                  <div className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded text-center">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Atributo</span>
                    <span className="text-xs text-slate-300 font-bold">{digi.attribute}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Ver Mais */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-transparent border border-digi-cyan text-digi-cyan font-bold text-sm tracking-widest uppercase rounded hover:bg-digi-cyan/10 transition shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            Acessar Banco de Dados Completo
          </button>
        </div>

      </div>
    </section>
  );
}