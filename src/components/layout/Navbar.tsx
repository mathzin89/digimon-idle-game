// src/components/layout/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import logoImg from '../../assets/logo.png'; 

export function Navbar() {
  return (
    <header className="fixed w-top top-4 left-4 right-4 z-50 flex justify-center max-w-7xl mx-auto">
      
      {/* Container Principal da Barra (Moldura Estilo RPG) */}
      <nav className="w-full bg-digi-darker/95 border border-digi-gold/40 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.8)] relative rounded-sm">
        
        {/* Detalhes de Canto (Losangos ciano nas pontas igual à referência) */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-digi-cyan rotate-45 border border-digi-dark shadow-glow-cyan"></div>
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-digi-cyan rotate-45 border border-digi-dark shadow-glow-cyan"></div>

        {/* Links - Esquerda */}
        <ul className="hidden lg:flex items-center space-x-8 text-xs font-bold tracking-widest text-slate-300">
          <li>
            <Link to="/" className="text-digi-cyan border-b-2 border-digi-cyan pb-1 transition">INÍCIO</Link>
          </li>
          <li>
            <a href="#ranking" className="hover:text-digi-cyan transition">RANKING</a>
          </li>
          <li>
            <a href="#regras" className="hover:text-digi-cyan transition">REGRAS</a>
          </li>
          <li>
            <a href="#digipedia" className="border border-digi-gold/50 px-3 py-1.5 rounded text-digi-gold hover:bg-digi-gold/10 transition flex items-center gap-2">
              <span>📖</span> DIGIPEDIA
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-digi-cyan transition">FAQ</a>
          </li>
        </ul>
        
        {/* Logo Centralizada que "Vaza" para Fora da Barra */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-[20%] flex flex-col items-center cursor-pointer group">
          <Link to="/" className="flex flex-col items-center">
            <img 
              src={logoImg} 
              alt="Digi Idle World Logo" 
              className="h-20 md:h-24 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </div>

        {/* Lado Direito: Seletor de Idioma e Botão Entrar */}
        <div className="flex items-center gap-4 ml-auto lg:ml-0">
          
          {/* Botão de Idioma */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs text-slate-300 font-semibold cursor-pointer hover:border-slate-500 transition">
            <span>🇧🇷</span>
            <span>PT</span>
          </div>

          {/* Botão Entrar com Moldura Ciano */}
          <Link to="/login">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-digi-cyan/30 rounded blur opacity-50 group-hover:opacity-100 transition"></div>
              <button className="relative px-6 py-2 bg-digi-dark border border-digi-cyan text-digi-cyan text-xs font-bold uppercase tracking-wider rounded hover:bg-digi-cyan/10 transition shadow-glow-cyan flex items-center gap-1">
                <span>&gt; ENTRAR</span>
              </button>
            </div>
          </Link>

        </div>

      </nav>
    </header>
  );
}