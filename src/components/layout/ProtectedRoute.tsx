// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  // Enquanto o Firebase decide se o cara tem login ou não, mostramos uma tela preta básica
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-digi-cyan font-bold tracking-widest animate-pulse uppercase">
          Carregando Digi-World...
        </div>
      </div>
    );
  }

  // Se carregou e NÃO tem usuário, redireciona para o login (substitua '/login' pela sua rota exata)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se passou pelas barreiras, renderiza a rota filha (O Dashboard)
  return <Outlet />;
}