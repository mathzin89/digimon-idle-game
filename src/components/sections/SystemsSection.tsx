// src/components/sections/SystemsSection.tsx
import React, { useState } from 'react';

export function SystemsSection() {
  // Estado para controlar qual aba está ativa (inicia na aba 0)
  const [activeTab, setActiveTab] = useState(0);

  const systems = [
    {
      id: 'pve',
      title: "PvE ESTRATÉGICO",
      content: "Enfrente chefes de área e Dark Masters em combates que exigem mais do que força bruta — atributo (Data, Vaccine, Virus), nível e estratégia decidem a vitória."
    },
    {
      id: 'scan',
      title: "SCAN E PROGRESSO",
      content: "Acumule dados escaneados de Digimons derrotados. Ao atingir 100%, converta os dados em um novo parceiro no seu Digivice direto da incubadora."
    },
    {
      id: 'evo',
      title: "EVOLUÇÃO POR ITEM",
      content: "Nem todo Digimon evolui apenas por nível. Encontre Digimentals (Armor), Brasões e itens raros no mapa para desbloquear formas secretas e ancestrais."
    },
    {
      id: 'market',
      title: "MERCADO LIVRE",
      content: "Uma economia real e viva gerida pelos jogadores. Venda itens de drop, Digi-Eggs raros e chips de aprimoramento na casa de leilões do servidor."
    },
    {
      id: 'offline',
      title: "PROGRESSO OFFLINE",
      content: "Seu Tamer não descansa. Configure a rota de caça do seu parceiro e continue farmando experiência e Bits mesmo com o navegador fechado e o PC desligado."
    }
  ];

  return (
    <section className="py-24 px-8 bg-digi-dark relative z-10 border-t border-digi-cyan/10">
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        
        {/* Cabeçalho */}
        <p className="text-digi-gold font-bold tracking-[0.2em] text-xs mb-4 uppercase">
          Mecânicas de Jogo
        </p>
        <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-100 mb-12 uppercase">
          Os Sistemas Que Definem O Digi Idle World
        </h2>

        {/* Navegação das Abas (Tabs) */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {systems.map((sys, index) => (
            <button
              key={sys.id}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 border uppercase tracking-wider ${
                activeTab === index 
                  ? 'bg-digi-cyan/10 border-digi-cyan text-digi-cyan shadow-glow-cyan scale-105' 
                  : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 bg-slate-900/50'
              }`}
            >
              {sys.title}
            </button>
          ))}
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-8 md:p-12 min-h-[160px] flex flex-col justify-center items-center shadow-lg transition-all duration-500 relative overflow-hidden">
          {/* Efeito de brilho sutil no fundo do card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-digi-cyan/30 to-transparent"></div>
          
          <h3 className="text-2xl font-serif text-digi-gold mb-4 animate-[fadeIn_0.3s_ease-in-out]">
            {systems[activeTab].title}
          </h3>
          <p className="text-slate-300 text-base md:text-lg max-w-3xl leading-relaxed animate-[fadeIn_0.5s_ease-in-out]">
            {systems[activeTab].content}
          </p>
        </div>

        {/* Barra de Progresso da Comunidade */}
        <div className="w-full max-w-2xl mt-24">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
            <span>Rumo a 100.000 Tamers</span>
            <span className="text-digi-gold">70K / 100K</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner border border-slate-700 relative">
            {/* O width define o preenchimento da barra */}
            <div 
              className="absolute top-0 left-0 bg-gradient-to-r from-yellow-600 via-digi-gold to-yellow-300 h-full rounded-full shadow-glow-gold transition-all duration-1000 ease-out"
              style={{ width: '70%' }}
            >
              {/* Efeito de brilho animado na ponta da barra */}
              <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/40 blur-[2px] animate-pulse"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}