// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Importação de TODAS as Abas
import { PlayersTab } from './tabs/PlayersTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { DigimonTab } from './tabs/DigimonTab';
import { MapsTab } from './tabs/MapsTab';
import { ArmoryTab } from './tabs/ArmoryTab';
import { GamePassTab } from './tabs/GamePassTab';
import { EventsTab } from './tabs/EventsTab';
import { RngTab } from './tabs/RngTab';
import { ModerationTab } from './tabs/ModerationTab';

export function AdminDashboard() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'digimons' | 'maps' | 'players' | 'gamepass' | 'armory' | 'moderation' | 'analytics' | 'events' | 'rng'>('analytics'); 
  
  // Estado real puxando do banco de dados
  const [myAdminRole, setMyAdminRole] = useState<string | null>(null);

  // Puxar o cargo assim que abrir o painel
  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          setMyAdminRole(docSnap.data().role || 'player');
        } else {
          setMyAdminRole('player');
        }
      });
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'players': return <PlayersTab />;
      case 'analytics': return <AnalyticsTab />;
      case 'digimons': return <DigimonTab />;
      case 'maps': return <MapsTab />;
      case 'armory': return <ArmoryTab />;
      case 'gamepass': return <GamePassTab />;
      case 'events': return <EventsTab />;
      case 'rng': return <RngTab />;
      case 'moderation': return <ModerationTab />;
      default: 
        return (
          <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <span className="text-5xl grayscale opacity-20 mb-4">🚧</span>
            <h3 className="text-slate-800 font-bold uppercase tracking-widest mb-2">Aba em Construção</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest max-w-sm">Este módulo está sendo componentizado.</p>
          </div>
        );
    }
  };

  // Botões de Menu - Tema Light Digital
  const MenuButton = ({ id, icon, label }: { id: any, icon: string, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)} 
        className={`relative w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 rounded-l-lg ml-2 ${
          isActive 
            ? 'bg-[#F0F8FF] text-blue-700 font-black border-r-4 border-orange-500 shadow-sm' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600 font-bold'
        }`}
      >
        <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>{icon}</span>
        <span className="text-[11px] uppercase tracking-widest">{label}</span>
      </button>
    );
  };

  // Trava de carregamento enquanto o Firebase processa o login e o cargo
  if (!myAdminRole) {
    return (
      <div className="min-h-screen bg-[#e0f2fe] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Barreira de segurança final (Kick em quem não é Staff)
  if (myAdminRole === 'player' || myAdminRole === 'vip') {
    return (
      <div className="min-h-screen bg-[#e0f2fe] flex flex-col items-center justify-center">
        <h1 className="text-red-500 font-black text-2xl uppercase tracking-widest mb-2">Acesso Negado</h1>
        <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">Sua conta não tem permissões administrativas.</p>
        <button onClick={handleLogout} className="text-white bg-blue-600 px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors shadow-md">
          Voltar para o Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0f2fe] text-slate-800 font-sans flex relative overflow-hidden">
      
      {/* GRID DIGITAL BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50" 
           style={{ backgroundImage: 'linear-gradient(#ffffff 2px, transparent 2px), linear-gradient(90deg, #ffffff 2px, transparent 2px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* SIDEBAR - Branca e Limpa */}
      <div className="w-72 bg-white border-r-2 border-blue-200 flex flex-col z-10 shadow-xl shrink-0">
        
        {/* LOGO AREA */}
        <div className="p-6 flex items-center gap-3 border-b-2 border-blue-50">
          <div className="w-12 h-12 bg-blue-100 border-2 border-blue-500 rounded-full flex items-center justify-center shadow-inner">
             <span className="text-2xl animate-spin-slow">🌐</span>
          </div>
          <div>
            <h1 className="text-blue-700 font-black tracking-widest uppercase text-lg leading-none drop-shadow-sm">Admin.Sys</h1>
            <p className="text-[9px] text-orange-500 uppercase tracking-widest font-black mt-1">Digital World V2</p>
          </div>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
          
          {(myAdminRole === 'owner' || myAdminRole === 'admin') && (
            <>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 mt-2 pl-6">Inteligência</p>
              <MenuButton id="analytics" icon="📊" label="Métricas Global" />
              
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 mt-4 pl-6">Mundo & Base</p>
              <MenuButton id="digimons" icon="🦖" label="Digi-Dex" />
              <MenuButton id="maps" icon="🗺️" label="Zonas de Caça" />
              <MenuButton id="armory" icon="⚔️" label="Arsenal & Loot" />
              
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 mt-4 pl-6">Live Ops</p>
              <MenuButton id="gamepass" icon="🎟️" label="Temporadas" />
              <MenuButton id="events" icon="⏳" label="Eventos Globais" />
              <MenuButton id="rng" icon="🎲" label="Motor de Gacha" />
            </>
          )}

          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 mt-4 pl-6">Comunidade</p>
          {(myAdminRole === 'owner' || myAdminRole === 'admin') && (
             <MenuButton id="players" icon="👥" label="Jogadores" />
          )}
          <MenuButton id="moderation" icon="🛡️" label="Moderação" />
        </div>

        <div className="p-4 border-t-2 border-blue-50 bg-slate-50">
          <button onClick={handleLogout} className="w-full bg-white border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white py-3 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] shadow-sm">
            Desconectar
          </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden z-10">
         
         {/* HEADER */}
         <div className="h-20 bg-white border-b-2 border-blue-200 flex items-center justify-between px-10 shrink-0 shadow-sm">
           <div>
             <h2 className="text-blue-800 font-black tracking-widest uppercase text-sm">
               {activeTab === 'analytics' && 'Métricas e Economia Global'}
               {activeTab === 'digimons' && 'Gerenciador de Espécies (Digi-Dex)'}
               {activeTab === 'maps' && 'Controle de Zonas e Drops'}
               {activeTab === 'armory' && 'Arsenal, Itens e Equipamentos'}
               {activeTab === 'gamepass' && 'Temporadas e Missões Globais'}
               {activeTab === 'events' && 'Eventos Globais e Multiplicadores'}
               {activeTab === 'rng' && 'Controle de Taxas de Drop (Gacha)'}
               {activeTab === 'players' && 'Gestão de Jogadores e Hierarquia'}
               {activeTab === 'moderation' && 'Auditoria de Chat e Moderação'}
             </h2>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Sistema Operacional Online
             </p>
           </div>
           
           {/* Perfil Header */}
           <div className="flex items-center gap-3 bg-blue-50 border-2 border-blue-100 px-4 py-2 rounded-full">
             <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow-md">
               <span className="text-white text-xs font-black">AD</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest">{user?.displayName || 'Admin'}</span>
               <span className="text-[8px] text-orange-500 font-black uppercase tracking-widest">{myAdminRole}</span>
             </div>
           </div>
         </div>

         {/* CONTEÚDO DAS ABAS */}
         <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {renderActiveTab()}
         </div>
      </div>
    </div>
  );
}