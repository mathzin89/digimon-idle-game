// src/components/sections/FaqSection.tsx
import React, { useState } from 'react';

export function FaqSection() {
  // Estado para controlar qual pergunta está aberta (inicia com a primeira aberta: índice 0)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Como funciona um jogo Idle?",
      a: "Em um jogo Idle, o progresso principal acontece automaticamente. Seus Digimons continuam farmando Bits e Experiência mesmo quando você está com a aba fechada. Você entra no site para gerenciar recursos, evoluir e enfrentar chefes."
    },
    {
      q: "É realmente 100% gratuito?",
      a: "Sim! Digi Idle World é um projeto feito de fã para fãs. Não existem microtransações, passes de batalha ou anúncios. Todos os jogadores têm as mesmas chances de chegar ao topo do ranking."
    },
    {
      q: "Posso capturar novos Digimons?",
      a: "Com certeza! Durante a sua jornada no Digital World, você encontrará Ovos (Digi-Eggs) e poderá recrutar novos parceiros usando os Bits e Gemas que coletar nas Hunts."
    },
    {
      q: "O que acontece se o HP do meu Digimon zerar?",
      a: "Seu Digimon nunca 'morre' permanentemente. Se o HP chegar a zero, ele entra em modo de recuperação (Fadiga) e você precisará aguardar um tempo de cooldown para que ele volte à batalha."
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-digi-dark relative z-10 border-t border-slate-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-slate-100 mb-4 tracking-widest drop-shadow-md">
            CENTRAL DE <span className="text-digi-cyan">AJUDA</span>
          </h2>
          <p className="text-slate-400 text-sm md:text-base">Dúvidas frequentes sobre as mecânicas do Digital World.</p>
        </div>

        {/* Lista de Perguntas (Accordion) */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-lg transition-all duration-300 overflow-hidden ${
                openIndex === index 
                ? 'border-digi-cyan bg-slate-900/80 shadow-[0_0_15px_rgba(0,229,255,0.1)]' 
                : 'border-slate-800 bg-slate-950/50 hover:border-slate-600'
              }`}
            >
              {/* Botão da Pergunta */}
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
              >
                <span className={`font-bold tracking-wider text-sm md:text-base transition-colors ${openIndex === index ? 'text-digi-cyan' : 'text-slate-200 group-hover:text-white'}`}>
                  <span className="text-digi-gold mr-3 font-black">Q.</span>{faq.q}
                </span>
                <span className={`text-xl text-slate-500 font-light transition-transform duration-300 ${openIndex === index ? 'rotate-45 text-digi-cyan' : ''}`}>
                  +
                </span>
              </button>
              
              {/* Resposta (Conteúdo) */}
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4 relative">
                  <span className="text-digi-cyan font-black mr-2">A.</span>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}