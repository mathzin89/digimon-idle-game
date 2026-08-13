// src/components/sections/RulesSection.tsx
import React from 'react';

export function RulesSection() {
  const rules = [
    {
      id: "01",
      title: "Progresso Contínuo",
      description: "No mundo digital, o tempo não para. Seus parceiros continuam caçando e coletando Bits mesmo com você offline. O limite de acúmulo de recompensas offline é de 12 horas.",
      icon: "⏳"
    },
    {
      id: "02",
      title: "Sistema de Combate",
      description: "As batalhas ocorrem de forma semi-automática. O seu Dano Base (BP) dita a velocidade para derrotar inimigos. Golpes críticos dependem da afinidade do seu parceiro.",
      icon: "⚔️"
    },
    {
      id: "03",
      title: "Gerenciamento de Fadiga",
      description: "Digimons não são máquinas. Se a energia zerar durante uma Hunt intensa, o parceiro entra em modo de recuperação. Você deve usar itens ou aguardar o tempo de descanso.",
      icon: "🔋"
    },
    {
      id: "04",
      title: "Fair Play Absoluto",
      description: "O uso de macros externos, autoclickers (fora das mecânicas nativas do jogo) ou bots resultará em banimento permanente do seu Tamer ID. Jogue limpo.",
      icon: "⚖️"
    }
  ];

  return (
    <section id="regras" className="py-24 px-6 bg-slate-950 relative z-10 border-t border-slate-900">
       <div className="max-w-5xl mx-auto">
         
         {/* Cabeçalho */}
         <div className="text-center mb-16">
           <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-100 mb-4 tracking-widest drop-shadow-md">
             CÓDIGO DE <span className="text-digi-gold">CONDUTA</span>
           </h2>
           <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
             As leis fundamentais que regem o Digital World. Todo Tamer deve conhecê-las antes de iniciar sua jornada.
           </p>
         </div>

         {/* Grid de Regras */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {rules.map((rule) => (
             <div 
               key={rule.id} 
               className="bg-slate-900/40 border border-slate-800 p-8 rounded-xl hover:bg-slate-900/80 hover:border-digi-gold/50 transition-all duration-300 group relative overflow-hidden shadow-lg"
             >
                {/* Número de Fundo (Marca d'água) */}
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                  <span className="text-9xl font-black italic text-slate-100">{rule.id}</span>
                </div>
                
                <div className="text-4xl mb-6 drop-shadow-md">{rule.icon}</div>
                <h3 className="text-xl font-bold text-slate-200 mb-3 tracking-wider">{rule.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10">{rule.description}</p>
             </div>
           ))}
         </div>

       </div>
    </section>
  );
}