// src/components/layout/SideMenu.tsx
import React from 'react';

export function SideMenu() {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4 p-2 bg-digi-darker/80 backdrop-blur-md border border-digi-cyan/30 rounded-lg shadow-glow-cyan">
      <div className="w-2 h-2 bg-digi-cyan mx-auto rotate-45 mb-2"></div>
      
      {/* Botão Instagram (Ícone SVG) */}
      <a href="#" className="text-slate-400 hover:text-pink-500 transition hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </a>

      {/* Botão Discord (Ícone SVG) */}
      <a href="#" className="text-slate-400 hover:text-indigo-400 transition hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 19c-1.5-1.5-3-2-3-2 .5.5 1 1.5 1 1.5M6 19c1.5-1.5 3-2 3-2-.5.5-1 1.5-1 1.5M12 15s-2.5-1-4-1-4 2-4 2c0 2 1.5 4 4 4 1.5 0 2.5-1 4-1s2.5 1 4 1c2.5 0 4-2 4-4 0 0-1.5-2-4-2-1.5 0-4 1-4 1z"></path>
          <path d="M8 11.5v-1c0-1.5 1.5-2.5 3-2.5h2c1.5 0 3 1 3 2.5v1"></path>
        </svg>
      </a>

      <div className="w-2 h-2 bg-digi-cyan mx-auto rotate-45 mt-2"></div>
    </div>
  );
}