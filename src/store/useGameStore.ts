// src/store/useGameStore.ts
import { create } from 'zustand';

interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  image: string;
  rarity: 'Normal' | 'Elite' | 'Chefe';
}

interface MyDigimon {
  level: number;
  exp: number;
  maxExp: number;
}

interface GameState {
  tamerName: string;
  bits: number;
  gems: number;
  currentEnemy: Enemy | null;
  
  fragments: Record<string, number>; 
  ownedDigimons: string[]; 
  myDigimons: Record<string, MyDigimon>; // Guarda o Nível e EXP de cada monstro seu
  activeDigimon: string; // Quem está batalhando agora
  items: Record<string, number>; // Quantidade de Carnes, Poções, etc.
  
  setHunt: (id: string, name: string, level: number, image: string) => void;
  dealDamage: (amount: number) => void;
  synthesizeDigimon: (id: string) => void;
  setActiveDigimon: (id: string) => void; // Trocar o líder
  buyItem: (itemId: string, cost: number, currency: 'bits' | 'gems', amount: number) => void;
  useItem: (itemId: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  tamerName: 'Matheus',
  bits: 5000, // Começamos com Bits para você testar a Loja
  gems: 0,
  currentEnemy: null,
  fragments: {}, 
  ownedDigimons: ['agumon'], 
  myDigimons: {
    'agumon': { level: 1, exp: 0, maxExp: 100 }
  },
  activeDigimon: 'agumon',
  items: { meat: 5, scan: 2, potion: 3 }, // Inventário inicial

  setHunt: (id, name, level, image) => set({
    currentEnemy: { id, name, level, hp: 100 * level, maxHp: 100 * level, image, rarity: 'Normal' }
  }),

  // Define quem vai lutar
  setActiveDigimon: (id) => set({ activeDigimon: id }),

  // Lógica da Loja (Desconta moedas e adiciona itens)
  buyItem: (itemId, cost, currency, amount) => set((state) => {
    if (currency === 'bits' && state.bits >= cost) {
      return { bits: state.bits - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } };
    }
    if (currency === 'gems' && state.gems >= cost) {
      return { gems: state.gems - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } };
    }
    return state; // Retorna sem fazer nada se não tiver dinheiro
  }),

  // Lógica das Hotkeys (Consome o item da mochila)
  useItem: (itemId) => set((state) => {
    if ((state.items[itemId] || 0) > 0) {
      console.log(`Usou o item: ${itemId}`);
      return { items: { ...state.items, [itemId]: state.items[itemId] - 1 } };
    }
    return state;
  }),

  // Converter fragmentos em um Digimon nível 1
  synthesizeDigimon: (id) => set((state) => {
    const currentFrags = state.fragments[id] || 0;
    if (currentFrags >= 50 && !state.ownedDigimons.includes(id)) {
      return {
        fragments: { ...state.fragments, [id]: currentFrags - 50 },
        ownedDigimons: [...state.ownedDigimons, id],
        myDigimons: { ...state.myDigimons, [id]: { level: 1, exp: 0, maxExp: 100 } }
      };
    }
    return state;
  }),

  dealDamage: (amount) => set((state) => {
    if (!state.currentEnemy) return state;
    const newHp = state.currentEnemy.hp - amount;

    if (newHp <= 0) {
      // 1. Drop de Fragmento
      let newFragments = { ...state.fragments };
      if (Math.random() > 0.80) {
        newFragments[state.currentEnemy.id] = (newFragments[state.currentEnemy.id] || 0) + 1;
      }

      // 2. RNG do Próximo Monstro
      const spawnRoll = Math.random();
      let rarity: 'Normal' | 'Elite' | 'Chefe' = 'Normal';
      let multiplier = 1;
      if (spawnRoll > 0.98) { rarity = 'Chefe'; multiplier = 10; }
      else if (spawnRoll > 0.90) { rarity = 'Elite'; multiplier = 3; }

      const nextMaxHp = 100 * state.currentEnemy.level * multiplier;
      const bitsReward = 15 * state.currentEnemy.level * multiplier;
      
      // 3. Sistema de EXP e Level UP
      const expReward = 35 * state.currentEnemy.level * multiplier;
      let updatedMyDigimons = { ...state.myDigimons };
      let activeStats = { ...updatedMyDigimons[state.activeDigimon] };
      
      activeStats.exp += expReward;
      if (activeStats.exp >= activeStats.maxExp) {
        activeStats.level += 1;
        activeStats.exp = 0; // Zera a EXP (ou subtrai)
        activeStats.maxExp = Math.floor(activeStats.maxExp * 1.5); // Próximo nível mais difícil
      }
      updatedMyDigimons[state.activeDigimon] = activeStats;

      return {
        bits: state.bits + bitsReward,
        fragments: newFragments,
        myDigimons: updatedMyDigimons,
        currentEnemy: { ...state.currentEnemy, hp: nextMaxHp, maxHp: nextMaxHp, rarity }
      };
    }
    return { currentEnemy: { ...state.currentEnemy, hp: newHp } };
  })
}));