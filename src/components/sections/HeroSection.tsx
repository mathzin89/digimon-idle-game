// src/components/sections/HeroSection.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // <-- IMPORTAÇÃO NOVA AQUI
import { Button } from '../ui/Button';
import splashBg from '../../assets/splash-bg.png';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 overflow-hidden">
      
      {/* Background Épico */}
      <div className="absolute inset-0 z-0">
        <img 
          src={splashBg} 
          alt="Digital World Splash Art" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-digi-dark/80 via-digi-dark/40 to-digi-dark z-10"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-4xl mt-12">
        <p className="text-digi-cyan font-bold tracking-[0.3em] text-xs mb-6 uppercase flex items-center gap-4">
          <span className="w-8 h-[1px] bg-digi-cyan"></span>
          O Maior Idle de Digimon
          <span className="w-8 h-[1px] bg-digi-cyan"></span>
        </p>
        
        <h2 className="text-6xl md:text-8xl font-serif font-black text-slate-100 mb-8 drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
          DIGI IDLE WORLD
        </h2>
        
        <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
          Entre no Digital World onde Tamers poderosos, batalhas intensas e desafios imprevisíveis moldam cada passo da sua jornada — a progressão é automática e a imersão é total, direto do seu navegador.
        </p>
        
        {/* BOTÕES COM OS LINKS DE ROTA AQUI */}
        <div className="flex flex-col sm:flex-row gap-6">
          <Link to="/login">
            <Button variant="primary" className="px-10 py-4 text-lg w-full sm:w-auto">
              JOGAR AGORA
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" className="px-10 py-4 text-lg border-slate-600 text-slate-300 shadow-none hover:bg-slate-800 hover:border-slate-400 w-full sm:w-auto">
              CRIAR CONTA
            </Button>
          </Link>
        </div>
      </div>

      {/* Barra de Status Inferior */}
      <div className="relative z-20 w-full max-w-5xl mx-auto mt-auto mb-8 border-y border-digi-gold/20 bg-digi-darker/60 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-around py-6 text-center divide-y md:divide-y-0 md:divide-x divide-digi-gold/10">
          
          <div className="px-8 py-2 md:py-0 flex flex-col items-center">
            <span className="text-digi-gold font-serif font-bold text-2xl mb-1 flex items-center gap-2">
              <span className="text-xl">👑</span> 100% GRATUITO
            </span>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Para Sempre</span>
          </div>
          
          <div className="px-8 py-2 md:py-0 flex flex-col items-center">
            <span className="text-digi-gold font-serif font-bold text-2xl mb-1 flex items-center gap-2">
              <span className="text-xl">⚔️</span> 70K+ JOGADORES
            </span>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Comunidade Ativa</span>
          </div>
          
          <div className="px-8 py-2 md:py-0 flex flex-col items-center">
            <span className="text-digi-gold font-serif font-bold text-2xl mb-1 flex items-center gap-2">
              <span className="text-xl">📈</span> 1-2 UPDATES
            </span>
            <span className="text-slate-500 text-xs tracking-wider uppercase">Por Semana</span>
          </div>

        </div>
      </div>

    </section>
  );
}