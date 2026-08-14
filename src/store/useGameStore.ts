// src/store/useGameStore.ts
import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DigimonStats { level: number; exp: number; maxExp: number; hp: number; maxHp: number; }
interface MapTarget { instanceId: string; id: string; name: string; level: number; hp: number; maxHp: number; image: string; rarity: 'Normal' | 'Elite' | 'Chefe' | 'Divino'; x: number; y: number; }
interface CaptureLogEntry { name: string; level: number; timestamp: string; }
interface LootResult { exp: number; bits: number; item: string | null; leveledUp: boolean; }

interface GameState {
  tamerName: string;
  bits: number;
  gems: number;
  avatar: string;
  equippedOutfit: string;
  ownedOutfits: string[];
  captureLog: CaptureLogEntry[];
  mapTargets: MapTarget[];
  currentHuntType: { id: string; name: string; level: number; image: string; rarity: 'Normal' | 'Elite' | 'Chefe' | 'Divino' } | null;
  scanningTarget: MapTarget | null;
  fragments: Record<string, number>;
  ownedDigimons: string[];
  myDigimons: Record<string, DigimonStats>;
  activeDigimon: string;
  items: Record<string, number>;
  isDataLoaded: boolean;
  hasCompletedTutorial: boolean;
  
  soundEnabled: boolean;
  ownedGear: string[];
  equippedGear: string | null;
  incubatingEgg: { digimonId: string, hatchTime: number } | null;

  toggleSound: () => void;
  equipGear: (gearId: string) => void;
  startIncubation: (id: string) => void;
  hatchEgg: () => void;
  sellFragmentForGems: (id: string, amount: number) => void;
  
  setMapHunt: (id: string, name: string, level: number, image: string, rarity?: 'Normal' | 'Elite' | 'Chefe' | 'Divino') => void;
  spawnSingleTarget: () => void;
  attackMapTarget: (targetInstanceId: string, damage: number) => void;
  takeDamage: (damage: number) => boolean; 
  finishDNAScan: (target: MapTarget) => LootResult; 
  synthesizeDigimon: (id: string) => void;
  setActiveDigimon: (id: string) => void;
  buyItem: (itemId: string, cost: number, currency: 'bits' | 'gems', amount: number) => void;
  useItem: (itemId: string) => void;
  equipOutfit: (outfitId: string) => void;
  buyOutfit: (outfitId: string, cost: number) => boolean;
  addCaptureLog: (name: string, level: number) => void;
  completeTutorial: (uid: string, gender: 'male' | 'female', starterId: string) => Promise<void>;
  loadProgress: (uid: string) => Promise<void>;
  saveProgress: (uid: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  tamerName: 'Tamer', bits: 500, gems: 50, avatar: 'tai', equippedOutfit: 'default', ownedOutfits: ['default'],
  captureLog: [], mapTargets: [], currentHuntType: null, scanningTarget: null, fragments: {},
  ownedDigimons: [], myDigimons: {}, activeDigimon: '', items: { meat: 5, scan: 2, potion: 3 },
  isDataLoaded: false, hasCompletedTutorial: false,
  
  soundEnabled: true,
  ownedGear: [],
  equippedGear: null,
  incubatingEgg: null,

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
  equipGear: (gearId) => set({ equippedGear: gearId === get().equippedGear ? null : gearId }),
  
  startIncubation: (id) => {
    const { fragments, incubatingEgg } = get();
    if (!incubatingEgg && (fragments[id] || 0) >= 50) {
      set({ fragments: { ...fragments, [id]: fragments[id] - 50 }, incubatingEgg: { digimonId: id, hatchTime: Date.now() + 60000 } });
    }
  },

  hatchEgg: () => {
    const { incubatingEgg, ownedDigimons, myDigimons } = get();
    if (incubatingEgg && Date.now() >= incubatingEgg.hatchTime) {
      const id = incubatingEgg.digimonId;
      set({ incubatingEgg: null, ownedDigimons: [...ownedDigimons, id], myDigimons: { ...myDigimons, [id]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100 } }, activeDigimon: get().activeDigimon || id });
    }
  },

  sellFragmentForGems: (id, amount) => {
    const { fragments, gems } = get();
    if ((fragments[id] || 0) >= amount) {
      set({ fragments: { ...fragments, [id]: fragments[id] - amount }, gems: gems + (amount * 2) });
    }
  },

  setMapHunt: (id, name, level, image, rarity = 'Normal') => {
    set({ currentHuntType: { id, name, level, image, rarity }, mapTargets: [], scanningTarget: null });
    for (let i = 0; i < 4; i++) get().spawnSingleTarget();
  },

  spawnSingleTarget: () => {
    const { currentHuntType, mapTargets } = get();
    if (!currentHuntType || mapTargets.length >= 7) return;

    const x = Math.floor(Math.random() * 50) + 25; 
    const y = Math.floor(Math.random() * 30) + 40; 

    const rand = Math.random();
    let { id, name, image, level, rarity } = currentHuntType;

    if (rand > 0.98 && id === 'patamon') {
       id = 'angemon'; name = 'Angemon'; image = 'https://wikimon.net/images/c/ce/Angemon_b_ds.gif'; level += 30; rarity = 'Divino';
    } else if (rand > 0.92) { rarity = 'Chefe'; level += 10; } 
    else if (rand > 0.80) { rarity = 'Elite'; level += 5; }

    const hpMultiplier = rarity === 'Divino' ? 150 : rarity === 'Chefe' ? 100 : rarity === 'Elite' ? 50 : 30;
    
    set({ mapTargets: [...get().mapTargets, { instanceId: `${id}_${Date.now()}_${Math.random()}`, id, name, level, hp: level * hpMultiplier, maxHp: level * hpMultiplier, image, rarity, x, y }] });
  },

  attackMapTarget: (targetInstanceId, damage) => {
    const { mapTargets } = get();
    const updated = mapTargets.map(t => t.instanceId === targetInstanceId ? { ...t, hp: t.hp - damage } : t);
    const defeated = updated.find(t => t.instanceId === targetInstanceId && t.hp <= 0);

    if (defeated) {
      set({ mapTargets: updated.filter(t => t.instanceId !== targetInstanceId), scanningTarget: defeated });
      setTimeout(() => get().spawnSingleTarget(), 800);
    } else {
      set({ mapTargets: updated });
    }
  },

  takeDamage: (damage) => {
    const { myDigimons, activeDigimon } = get();
    const stats = myDigimons[activeDigimon];
    if (!stats) return false;

    let newHp = stats.hp - damage;
    let isDead = false;

    if (newHp <= 0) {
      newHp = stats.maxHp; 
      isDead = true;
    }

    set({ myDigimons: { ...myDigimons, [activeDigimon]: { ...stats, hp: newHp } } });
    return isDead;
  },

  finishDNAScan: (target) => {
    const { myDigimons, activeDigimon, addCaptureLog, items, ownedGear } = get();
    addCaptureLog(target.name, target.level);
    
    const currentStats = myDigimons[activeDigimon] || { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100 };
    
    const rarityExpMult = target.rarity === 'Divino' ? 10 : target.rarity === 'Chefe' ? 5 : target.rarity === 'Elite' ? 2 : 1;
    const earnedExp = target.level * 20 * rarityExpMult;
    const newExp = currentStats.exp + earnedExp;
    
    let newLevel = currentStats.level;
    let newMaxExp = currentStats.maxExp;
    let newMaxHp = currentStats.maxHp;
    let finalExp = newExp;
    let leveledUp = false;

    if (newExp >= newMaxExp) {
      newLevel += 1;
      finalExp = newExp - newMaxExp;
      newMaxExp = Math.floor(newMaxExp * 1.5);
      newMaxHp = newLevel * 100;
      leveledUp = true;
    }

    const earnedBits = target.level * 25 * rarityExpMult;
    let droppedItem = null;
    let droppedGear = null;
    
    const randItem = Math.random();
    if (randItem > 0.95) droppedItem = 'scan';
    else if (randItem > 0.85) droppedItem = 'potion';
    else if (randItem > 0.70) droppedItem = 'meat';

    if ((target.rarity === 'Chefe' || target.rarity === 'Divino') && Math.random() > 0.8) {
      if (!ownedGear.includes('garra_combate')) droppedGear = 'garra_combate';
    }

    const newItems = { ...items };
    if (droppedItem) newItems[droppedItem] = (newItems[droppedItem] || 0) + 1;

    set((state) => ({
      bits: state.bits + earnedBits,
      items: newItems,
      ownedGear: droppedGear ? [...state.ownedGear, droppedGear] : state.ownedGear,
      fragments: { ...state.fragments, [target.id]: (state.fragments[target.id] || 0) + 15 },
      myDigimons: { 
        ...state.myDigimons, 
        [activeDigimon]: { ...currentStats, level: newLevel, exp: finalExp, maxExp: newMaxExp, maxHp: newMaxHp, hp: leveledUp ? newMaxHp : currentStats.hp } 
      },
      scanningTarget: null
    }));

    return { exp: earnedExp, bits: earnedBits, item: droppedGear ? 'Garra de Combate' : droppedItem, leveledUp };
  },

  synthesizeDigimon: (id) => {
    const { fragments, ownedDigimons, myDigimons } = get();
    const count = fragments[id] || 0;
    if (count >= 50 && !ownedDigimons.includes(id)) {
      set({
        fragments: { ...fragments, [id]: count - 50 },
        ownedDigimons: [...ownedDigimons, id],
        myDigimons: { ...myDigimons, [id]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100 } },
        activeDigimon: get().activeDigimon || id
      });
    }
  },

  setActiveDigimon: (id) => { if (get().ownedDigimons.includes(id)) set({ activeDigimon: id }); },
  
  buyItem: (itemId, cost, currency, amount) => {
    const state = get();
    if (currency === 'bits' && state.bits >= cost) set({ bits: state.bits - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } });
    else if (currency === 'gems' && state.gems >= cost) set({ gems: state.gems - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } });
  },
  
  useItem: (itemId) => {
    const { items, myDigimons, activeDigimon } = get();
    if ((items[itemId] || 0) > 0) {
      const stats = myDigimons[activeDigimon];
      if (!stats) return;

      let heal = 0;
      if (itemId === 'meat') heal = 30;
      if (itemId === 'potion') heal = 100;

      if (heal > 0) {
        const newHp = Math.min(stats.maxHp, stats.hp + heal);
        set({ items: { ...items, [itemId]: items[itemId] - 1 }, myDigimons: { ...myDigimons, [activeDigimon]: { ...stats, hp: newHp } } });
      } else {
        set({ items: { ...items, [itemId]: items[itemId] - 1 } });
      }
    }
  },
  
  equipOutfit: (outfitId) => set({ equippedOutfit: outfitId }),
  
  buyOutfit: (outfitId, cost) => {
    const { gems, ownedOutfits } = get();
    if (gems >= cost && !ownedOutfits.includes(outfitId)) {
      set({ gems: gems - cost, ownedOutfits: [...ownedOutfits, outfitId], equippedOutfit: outfitId });
      return true;
    }
    return false;
  },
  
  addCaptureLog: (name, level) => {
    const newEntry = { name, level, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    set((state) => ({ captureLog: [newEntry, ...state.captureLog.slice(0, 49)] }));
  },
  
  completeTutorial: async (uid, gender, starterId) => {
    const newState = { avatar: gender === 'female' ? 'sora' : 'tai', hasCompletedTutorial: true, ownedDigimons: [starterId], activeDigimon: starterId, myDigimons: { [starterId]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100 } } };
    set(newState);
    get().setMapHunt('koromon', 'Koromon', 1, '/koromon-esq.png', 'Normal'); 
    try { await setDoc(doc(db, 'users', uid), { ...newState, bits: get().bits, gems: get().gems, items: get().items, equippedOutfit: get().equippedOutfit, ownedOutfits: get().ownedOutfits, captureLog: get().captureLog, ownedGear: get().ownedGear, equippedGear: get().equippedGear, soundEnabled: get().soundEnabled }, { merge: true }); } catch (error) { console.error('Erro', error); }
  },
  
  loadProgress: async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({
          bits: data.bits ?? 500, gems: data.gems ?? 50, avatar: data.avatar ?? 'tai', equippedOutfit: data.equippedOutfit ?? 'default', ownedOutfits: data.ownedOutfits ?? ['default'],
          captureLog: data.captureLog ?? [], fragments: data.fragments ?? {}, ownedDigimons: data.ownedDigimons ?? [], myDigimons: data.myDigimons ?? {}, activeDigimon: data.activeDigimon ?? '',
          items: data.items ?? { meat: 5, scan: 2, potion: 3 }, hasCompletedTutorial: data.hasCompletedTutorial ?? false, ownedGear: data.ownedGear ?? [], equippedGear: data.equippedGear ?? null,
          incubatingEgg: data.incubatingEgg ?? null, soundEnabled: data.soundEnabled ?? true, isDataLoaded: true
        });
        
        if (data.hasCompletedTutorial && !get().currentHuntType) {
           get().setMapHunt('koromon', 'Koromon', 1, '/koromon-esq.png', 'Normal');
        }
      } else { set({ isDataLoaded: true, hasCompletedTutorial: false }); }
    } catch (error) { set({ isDataLoaded: true }); }
  },
  
  saveProgress: async (uid) => {
    try {
      const state = get();
      await setDoc(doc(db, 'users', uid), { bits: state.bits, gems: state.gems, avatar: state.avatar, equippedOutfit: state.equippedOutfit, ownedOutfits: state.ownedOutfits, captureLog: state.captureLog, fragments: state.fragments, ownedDigimons: state.ownedDigimons, myDigimons: state.myDigimons, activeDigimon: state.activeDigimon, items: state.items, hasCompletedTutorial: state.hasCompletedTutorial, ownedGear: state.ownedGear, equippedGear: state.equippedGear, incubatingEgg: state.incubatingEgg, soundEnabled: state.soundEnabled }, { merge: true });
    } catch (error) { console.error('Erro', error); }
  }
}));