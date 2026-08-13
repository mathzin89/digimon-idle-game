// src/store/useAuthStore.ts
import { create } from 'zustand';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean; // Controla a tela de carregamento enquanto o Firebase verifica a sessão
  initAuthListener: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // Começa como true para não piscar a tela de login na cara de quem já está logado

  // Inicia o "escutador" do Firebase
  initAuthListener: () => {
    onAuthStateChanged(auth, (currentUser) => {
      set({ user: currentUser, loading: false });
    });
  },

  // Função para deslogar
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  }
}));