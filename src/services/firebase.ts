// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// O Vite usa import.meta.env para ler as chaves seguras do arquivo .env
const firebaseConfig = {
  apiKey: "AIzaSyD_4QgrtlZrMyBC9pDUtBiQY6ItgQDLr94",
  authDomain: "digi-idle-world.firebaseapp.com",
  projectId: "digi-idle-world",
  storageBucket: "digi-idle-world.firebasestorage.app",
  messagingSenderId: "26683289642",
  appId: "1:26683289642:web:d99bb1f6b0ac984bbf5353"
};

// Inicializa o aplicativo Firebase
export const app = initializeApp(firebaseConfig);

// Inicializa e exporta a Autenticação (Para login e criação de contas)
export const auth = getAuth(app);

// Inicializa e exporta o Banco de Dados (Para salvar os Digimons e o inventário)
export const db = getFirestore(app);

export const storage = getStorage(app);