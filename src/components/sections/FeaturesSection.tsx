// src/components/sections/FeaturesSection.tsx
import React from 'react';

export function FeaturesSection() {
  const features = [
    {
      icon: "🧬",
      title: "DIGIEVOLUÇÃO",
      description: "Desperte o verdadeiro poder do seu parceiro. Evolua por níveis ou utilize itens especiais (Digimentals, Crests) para alcançar formas superiores.",
      list: [
        "Linhas evolutivas ramificadas (Ex: Agumon pode virar Greymon ou Tyranomon)",
        "Evolução por nível, tempo ou item",
        "Status que crescem com atributos e naturezas únicos"
      ]
    },
    {
      icon: "📱",
      title: "SCAN & DIGIVICE",
      description: "Enfraqueça Digimons selvagens e colete seus dados. Cada Scan é único, dependendo do seu Digivice e do poder do inimigo.",
      list: [
        "Chance baseada no HP e nível do alvo",
        "Atributos (Data, Virus, Vaccine) definidos no scan",
        "Digivice completo com monstros clássicos do Digital World"
      ]
    },
    {
      icon: "⚔️",
      title: "COMBATE & IDLE",
      description: "Seu parceiro líder caça sozinho usando as melhores skills reais dele — até quando você está offline. Volte e colha XP, Bits e itens.",
      list: [
        "O líder usa a melhor skill baseada na fraqueza inimiga",
        "Efetividade, STAB e dano fiéis à franquia",
        "A caçada (hunt) continua mesmo com o jogo fechado"
      ]
    },
    {
      icon: "🤝",
      title: "COMUNIDADE TAMER",
      description: "Movimente a economia com o mercado entre Tamers. Negocie itens, Digi-Eggs, e dispute o topo do ranking dos melhores do servidor.",
      list: [
        "Mercado Livre (Bits ou moedas premium)",
        "Economia viva controlada pelos jogadores",
        "Ranking competitivo de Tamers e Guildas"
      ]
    }
  ];

  return (
    <section className="py-24 px-8 bg-digi-dark relative z-10 border-t border-digi-cyan/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16">
          <p className="text-digi-gold font-bold tracking-[0.2em] text-xs mb-4 uppercase">
            Recursos Exclusivos
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-100 mb-6">
            CARACTERÍSTICAS PRINCIPAIS
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Explore os pilares que tornam o Digi Idle World uma experiência inesquecível — onde aventura, estratégia e nostalgia se encontram em um só universo.
          </p>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-digi-panel border border-slate-800 rounded-xl p-6 hover:border-digi-cyan transition duration-300 hover:-translate-y-1 shadow-lg shadow-black/40 group"
            >
              <div className="text-3xl mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-3 font-serif uppercase tracking-wider">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed min-h-[80px]">
                {feature.description}
              </p>
              
              <ul className="space-y-3">
                {feature.list.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="text-digi-cyan mt-[2px]">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}