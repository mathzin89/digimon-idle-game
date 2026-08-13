// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-digi-cyan font-bold tracking-widest animate-pulse uppercase">
          Verificando credenciais...
        </div>
      </div>
    );
  }

  // Se não estiver logado, manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // TRAVA DE SEGURANÇA: Se logou, mas não confirmou o e-mail, manda pra tela de aviso
  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}