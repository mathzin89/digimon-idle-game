// src/components/layout/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user } = useAuthStore();
  
  // COLOQUE O SEU EMAIL DE LOGIN AQUI! 
  // Ninguém mais além desse email vai conseguir ver o CMS, mesmo que tenha conta no jogo.
  const ADMIN_EMAIL = "mathzin89@gmail.com"; 

  // Se não estiver logado ou o email não for o seu, chuta de volta pro login do admin
  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}