// src/pages/InitiationPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/useAuthStore';
import { TamerPortrait } from '../components/ui/TamerPortrait'; // IMPORT ATUALIZADO AQUI!

const STARTERS = [
  { id: 'agumon', name: 'Agumon', type: 'Fogo', img: '/agumon-init.png', desc: 'Ataque alto. Perfeito para combates agressivos.' },
  { id: 'gabumon', name: 'Gabumon', type: 'Água/Gelo', img: 'https://wikimon.net/images/4/4d/Gabumon_b_ds.gif', desc: 'Equilibrado. Boa resistência e ataques precisos.' },
  { id: 'palmon', name: 'Palmon', type: 'Planta', img: 'https://wikimon.net/images/6/69/Palmon_b_ds.gif', desc: 'Tático. Foca em efeitos e suporte a longo prazo.' }
];

export function InitiationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { completeTutorial } = useGameStore();

  const [step, setStep] = useState(1);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedStarter, setSelectedStarter] = useState('');

  const handleFinish = async () => {
    if (user && selectedStarter) {
      await completeTutorial(user.uid, selectedGender, selectedStarter);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-digi-cyan/30">
      
      {/* ESTILOS DA ANIMAÇÃO DO SPRITE CORRIGIDOS E 100% FLUIDOS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rugidoAgumon {
          0%, 30% { background-position: 0% 0%; }    /* Frame 1 */
          31%, 65% { background-position: 50% 0%; }  /* Frame 2 */
          66%, 100% { background-position: 100% 0%; } /* Frame 3 */
        }
        
        .agumon-starter {
          width: 90px; 
          height: 90px;
          background-image: url('/agumon-init.png');
          background-size: 300% 100%; /* 3 frames exatos na imagem */
          background-repeat: no-repeat;
          image-rendering: pixelated;
          
          /* Roda a animação 1 vez ao carregar a tela e para no último frame (forwards) */
          animation: rugidoAgumon 0.7s 1 forwards;
        }

        /* Quando passa o mouse, a animação entra em loop de vai-e-vem (alternate) */
        .group:hover .agumon-starter {
          animation: rugidoAgumon 0.6s infinite alternate;
        }
      `}} />

      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-digi-cyan/20 via-black to-black"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>

      <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col items-center min-h-[500px]">
        
        {/* PASSO 1: BOAS VINDAS */}
        {step === 1 && (
          <div className="text-center animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-black text-digi-cyan tracking-widest uppercase mb-6 drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
              Bem-vindo ao Digital World
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-mono mb-12 max-w-2xl leading-relaxed">
              Os dados foram alinhados. Uma nova conexão foi estabelecida... Escolha o seu perfil de Tamer.
            </p>
            <button onClick={() => setStep(2)} className="bg-transparent border-2 border-digi-cyan text-digi-cyan px-10 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-digi-cyan hover:text-black transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              Iniciar Conexão
            </button>
          </div>
        )}

        {/* PASSO 2: ESCOLHER GÊNERO COM PORTRAIT ESTÁTICO */}
        {step === 2 && (
          <div className="w-full animate-in slide-in-from-right duration-500 flex flex-col items-center">
            <h2 className="text-2xl font-black text-digi-gold tracking-widest uppercase mb-2">Qual o seu gênero, Tamer?</h2>
            <p className="text-slate-500 text-sm font-mono mb-10">Escolha a sua representação no Digital World.</p>
            
            <div className="grid grid-cols-2 gap-8 w-full max-w-md mb-12">
              <div 
                onClick={() => setSelectedGender('male')}
                className={`bg-slate-900/50 border-2 rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all ${selectedGender === 'male' ? 'border-digi-gold shadow-[0_0_30px_rgba(255,215,0,0.3)] scale-105' : 'border-slate-800 hover:border-slate-600'}`}
              >
                {/* Usando TamerPortrait agora para ficar estático */}
                <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 overflow-hidden shadow-inner">
                  <TamerPortrait gender="male" />
                </div>
                <span className="font-bold tracking-widest uppercase text-xs text-digi-gold">Masculino</span>
              </div>

              <div 
                onClick={() => setSelectedGender('female')}
                className={`bg-slate-900/50 border-2 rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all ${selectedGender === 'female' ? 'border-digi-gold shadow-[0_0_30px_rgba(255,215,0,0.3)] scale-105' : 'border-slate-800 hover:border-slate-600'}`}
              >
                {/* Usando TamerPortrait agora para ficar estático */}
                <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center mb-4 border-2 border-slate-700 overflow-hidden shadow-inner">
                  <TamerPortrait gender="female" />
                </div>
                <span className="font-bold tracking-widest uppercase text-xs text-digi-gold">Feminino</span>
              </div>
            </div>

            <button onClick={() => setStep(3)} className="px-12 py-3 rounded-full font-bold uppercase tracking-widest bg-digi-cyan text-black shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:bg-cyan-400 transition-all">
              Confirmar Perfil
            </button>
          </div>
        )}

        {/* PASSO 3: ESCOLHER DIGIMON INICIAL */}
        {step === 3 && (
          <div className="w-full animate-in slide-in-from-right duration-500 flex flex-col items-center">
            <h2 className="text-2xl font-black text-emerald-400 tracking-widest uppercase mb-2">Escolha seu Parceiro</h2>
            <p className="text-slate-500 text-sm font-mono mb-10">Este Digimon será seu companheiro na jornada.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
              {STARTERS.map((st) => (
                <div 
                  key={st.id} 
                  onClick={() => setSelectedStarter(st.id)}
                  className={`group bg-slate-900/50 border-2 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer transition-all ${selectedStarter === st.id ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] scale-105' : 'border-slate-800 hover:border-slate-600'}`}
                >
                  
                  {st.id === 'agumon' ? (
                    <div className="agumon-starter mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"></div>
                  ) : (
                    <img src={st.img} alt={st.name} className="h-20 object-contain pixelated mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-110" />
                  )}
                  
                  <h3 className={`font-black tracking-widest uppercase text-lg mb-1 mt-2 ${selectedStarter === st.id ? 'text-emerald-400' : 'text-slate-300'}`}>{st.name}</h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase border border-slate-700 px-2 py-0.5 rounded-full mb-3">{st.type}</span>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">{st.desc}</p>
                </div>
              ))}
            </div>

            <button onClick={handleFinish} disabled={!selectedStarter} className={`px-12 py-3 rounded-full font-bold uppercase tracking-widest transition-all ${selectedStarter ? 'bg-emerald-400 text-black shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:bg-emerald-300' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
              Entrar no Mundo
            </button>
          </div>
        )}

      </div>
    </div>
  );
}