// src/store/useAuthStore.ts
import { create } from 'zustand';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthState {
  user: User | null;
  loading: boolean; // Controla a tela de carregamento enquanto o Firebase verifica a sessão
  initAuthListener: () => void;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>; // <-- ADICIONADO AQUI
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

  // Função de Login (Usada pelo Admin e pode ser usada no login normal do jogador tb)
  login: async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    set({ user: userCredential.user }); // <-- A mágica: Força a atualização do Zustand na mesma hora!
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