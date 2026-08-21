// src/store/useGameStore.ts
import { create } from 'zustand';
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface DigimonStats { level: number; exp: number; maxExp: number; hp: number; maxHp: number; atk: number; }
interface MapTarget { instanceId: string; id: string; name: string; level: number; hp: number; maxHp: number; image: string; rarity: 'Normal' | 'Elite' | 'Chefe' | 'Divino'; x: number; y: number; dir?: 'down'|'up'|'left'|'right'; }
interface CaptureLogEntry { name: string; level: number; timestamp: string; rarity: string; }
interface LootResult { exp: number; bits: number; item: string | null; leveledUp: boolean; }
interface AutoHelperSettings { autoPotion: boolean; potionThreshold: number; autoScan: boolean; }
interface HuntSessionStats { defeated: number; expGained: number; bitsGained: number; potionsUsed: number; scansUsed: number; timeStart: number; }

// Interfaces do CMS e Mercado P2P
interface ServerDigimon { id: string; name: string; hp: number; atk: number; evolvesTo: string; evolveLevel: number; rarity: string; menuImg: string; portraitImg: string; sprites?: { down: string; up: string; left: string; right: string; attack: string; }; }
interface ServerMap { id: string; name: string; bgImg: string; minLevel: number; spawns: string; }
interface ServerSettings { globalExpMultiplier: number; globalDropMultiplier: number; isEventActive: boolean; rngRates: { normal: number; elite: number; chefe: number; divino: number }; }
interface MarketListing { id: string; sellerId: string; sellerName: string; itemId: string; amount: number; price: number; currency: 'bits' | 'gems'; createdAt: number; }

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

  autoHelper: AutoHelperSettings;
  huntSession: HuntSessionStats;

  bpp: number;
  isPremium: boolean;
  gamePassMissions: { id: string, targetId: string, desc: string, target: number, current: number, reward: number, claimed: boolean }[];

  // INTEGRAÇÃO CMS E LIVE OPS
  serverDigimons: Record<string, ServerDigimon>;
  serverMaps: Record<string, ServerMap>;
  activeMapId: string | null;
  role: string;
  serverSettings: ServerSettings;
  storeItems: any[];
  marketListings: MarketListing[]; 

  fetchServerData: () => Promise<void>;
  initServerData: () => void;
  changeMap: (mapId: string) => void;

  toggleSound: () => void;
  equipGear: (gearId: string) => void;
  startIncubation: (id: string) => void;
  hatchEgg: () => void;
  sellFragmentForGems: (id: string, amount: number) => void;
  
  updateAutoHelper: (settings: Partial<AutoHelperSettings>) => void;
  resetHuntSession: () => void;
  evolveDigimon: (id: string) => void; 
  
  createListing: (uid: string, sellerName: string, itemId: string, amount: number, price: number, currency: 'bits' | 'gems') => Promise<void>;
  buyListing: (uid: string, listingId: string) => Promise<void>;

  claimMission: (id: string) => void;
  buyPremium: () => void;

  setMapHunt: (id: string, name: string, level: number, image: string, rarity?: 'Normal' | 'Elite' | 'Chefe' | 'Divino') => void;
  spawnSingleTarget: () => void;
  attackMapTarget: (targetInstanceId: string, damage: number) => void;
  takeDamage: (damage: number) => boolean; 
  finishDNAScan: (target: MapTarget) => LootResult; 
  synthesizeDigimon: (id: string) => void;
  setActiveDigimon: (id: string) => void;
  buyItem: (itemId: string, cost: number, currency: 'bits' | 'gems', amount: number) => void;
  useItem: (itemId: string, isAuto?: boolean) => void;
  equipOutfit: (outfitId: string) => void;
  buyOutfit: (outfitId: string, cost: number) => boolean;
  addCaptureLog: (name: string, level: number, rarity: string) => void;
  completeTutorial: (uid: string, gender: 'male' | 'female', starterId: string) => Promise<void>;
  loadProgress: (uid: string) => Promise<void>;
  saveProgress: (uid: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  tamerName: 'Tamer', bits: 500, gems: 50, avatar: 'tai', equippedOutfit: 'default', ownedOutfits: ['default'],
  captureLog: [], mapTargets: [], currentHuntType: null, scanningTarget: null, fragments: {},
  ownedDigimons: [], myDigimons: {}, activeDigimon: '', items: { meat: 5, scan: 10, potion: 20 },
  isDataLoaded: false, hasCompletedTutorial: false,
  
  soundEnabled: true, ownedGear: [], equippedGear: null, incubatingEgg: null,
  autoHelper: { autoPotion: false, potionThreshold: 50, autoScan: false },
  huntSession: { defeated: 0, expGained: 0, bitsGained: 0, potionsUsed: 0, scansUsed: 0, timeStart: Date.now() },

  bpp: 0, isPremium: false,
  gamePassMissions: [
    { id: 'm1', targetId: 'koromon', desc: 'Derrote 50 Koromon', target: 50, current: 0, reward: 10, claimed: false },
    { id: 'm2', targetId: 'agumon', desc: 'Derrote 50 Agumon', target: 50, current: 0, reward: 20, claimed: false },
  ],

  // CMS STATES E MERCADO
  serverDigimons: {},
  serverMaps: {},
  activeMapId: null,
  role: 'player',
  serverSettings: { globalExpMultiplier: 1, globalDropMultiplier: 1, isEventActive: false, rngRates: { normal: 70, elite: 20, chefe: 8, divino: 2 } },
  storeItems: [],
  marketListings: [],

  fetchServerData: async () => {
    try {
      const digimonsSnap = await getDocs(collection(db, 'digimons'));
      const sDigis: Record<string, ServerDigimon> = {};
      digimonsSnap.forEach(d => { sDigis[d.id] = { ...d.data(), id: d.id } as ServerDigimon; });

      const mapsSnap = await getDocs(collection(db, 'maps'));
      const sMaps: Record<string, ServerMap> = {};
      mapsSnap.forEach(d => { sMaps[d.id] = { ...d.data(), id: d.id } as ServerMap; });

      set({ serverDigimons: sDigis, serverMaps: sMaps });
    } catch (e) { console.error("Erro ao puxar dados do CMS:", e); }
  },

  initServerData: () => {
    onSnapshot(doc(db, 'server', 'settings'), (docSnap) => {
      if (docSnap.exists()) set({ serverSettings: docSnap.data() as ServerSettings });
    });
    getDocs(collection(db, 'items')).then((snap) => {
      set({ storeItems: snap.docs.map(d => ({ id: d.id, ...d.data() })) });
    });
    // Escuta o Mercado Global P2P ao Vivo
    onSnapshot(collection(db, 'market'), (snap) => {
      const listings = snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketListing));
      set({ marketListings: listings.sort((a, b) => b.createdAt - a.createdAt) });
    });
  },

  changeMap: (mapId: string) => {
    const cleanMapId = mapId.toLowerCase(); // Força a leitura sempre em minúsculo
    get().resetHuntSession();
    set({ activeMapId: cleanMapId, mapTargets: [], scanningTarget: null, currentHuntType: null });
    for (let i = 0; i < 4; i++) get().spawnSingleTarget();
  },

  toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
  equipGear: (gearId) => set({ equippedGear: gearId === get().equippedGear ? null : gearId }),
  updateAutoHelper: (settings) => set(state => ({ autoHelper: { ...state.autoHelper, ...settings } })),
  resetHuntSession: () => set({ huntSession: { defeated: 0, expGained: 0, bitsGained: 0, potionsUsed: 0, scansUsed: 0, timeStart: Date.now() } }),

  // MOTOR DE EVOLUÇÃO REAL
  evolveDigimon: (id) => { 
    const state = get();
    const sDigi = state.serverDigimons[id];
    const stats = state.myDigimons[id];

    if (!sDigi || !stats || !sDigi.evolvesTo || stats.level < sDigi.evolveLevel) return;

    const targetId = sDigi.evolvesTo;
    const targetServerData = state.serverDigimons[targetId];
    if (!targetServerData) { alert("Dados da evolução não encontrados no servidor."); return; }

    const newOwned = state.ownedDigimons.map(d => d === id ? targetId : d);
    const newMyDigimons = { ...state.myDigimons };
    delete newMyDigimons[id];

    newMyDigimons[targetId] = {
      level: 1,
      exp: 0,
      maxExp: 100,
      hp: targetServerData.hp || 100,
      maxHp: targetServerData.hp || 100,
      atk: targetServerData.atk || 10
    };

    const newActive = state.activeDigimon === id ? targetId : state.activeDigimon;

    set({
      ownedDigimons: newOwned,
      myDigimons: newMyDigimons,
      activeDigimon: newActive
    });

    alert(`✨ Incrível! O seu ${sDigi.name} evoluiu para ${targetServerData.name}!`);
  },

  // FUNÇÕES DO MERCADO P2P
  createListing: async (uid, sellerName, itemId, amount, price, currency) => {
    const state = get();
    if ((state.fragments[itemId] || 0) < amount) { alert("Fragmentos insuficientes para vender."); return; }
    
    set({ fragments: { ...state.fragments, [itemId]: state.fragments[itemId] - amount } });

    try {
      await addDoc(collection(db, 'market'), {
        sellerId: uid,
        sellerName,
        itemId,
        amount,
        price,
        currency,
        createdAt: Date.now()
      });
      alert("Sua oferta foi listada no mercado global!");
    } catch (e) {
      console.error(e);
      alert("Erro ao criar oferta.");
    }
  },

  buyListing: async (uid, listingId) => {
    const state = get();
    const listing = state.marketListings.find(l => l.id === listingId);
    if (!listing) return;
    if (listing.sellerId === uid) { alert("Você não pode comprar sua própria oferta."); return; }

    if (listing.currency === 'gems' && state.gems < listing.price) { alert("Gemas insuficientes."); return; }
    if (listing.currency === 'bits' && state.bits < listing.price) { alert("Bits insuficientes."); return; }

    const newGems = listing.currency === 'gems' ? state.gems - listing.price : state.gems;
    const newBits = listing.currency === 'bits' ? state.bits - listing.price : state.bits;
    
    set({ 
      gems: newGems, 
      bits: newBits,
      fragments: { ...state.fragments, [listing.itemId]: (state.fragments[listing.itemId] || 0) + listing.amount }
    });

    try {
      await deleteDoc(doc(db, 'market', listingId));
      
      const sellerRef = doc(db, 'users', listing.sellerId);
      const sellerSnap = await getDoc(sellerRef);
      if (sellerSnap.exists()) {
        const sData = sellerSnap.data();
        await updateDoc(sellerRef, {
          [listing.currency]: (sData[listing.currency] || 0) + listing.price
        });
      }
      alert(`Compra de ${listing.amount}x ${listing.itemId} realizada com sucesso!`);
    } catch (e) {
      console.error(e);
      alert("Erro ao processar compra.");
    }
  },

  claimMission: (id) => {
    const { gamePassMissions, bpp } = get();
    const mission = gamePassMissions.find(m => m.id === id);
    if (mission && mission.current >= mission.target && !mission.claimed) {
      set({ bpp: bpp + mission.reward, gamePassMissions: gamePassMissions.map(m => m.id === id ? { ...m, claimed: true } : m) });
    }
  },

  buyPremium: () => {
    const { gems } = get();
    if (gems >= 15 && !get().isPremium) { set({ gems: gems - 15, isPremium: true }); } 
    else { alert('Gemas insuficientes!'); }
  },

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
      set({ incubatingEgg: null, ownedDigimons: [...ownedDigimons, id], myDigimons: { ...myDigimons, [id]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100, atk: 10 } }, activeDigimon: get().activeDigimon || id });
    }
  },

  sellFragmentForGems: (id, amount) => {
    const { fragments, gems } = get();
    if ((fragments[id] || 0) >= amount) {
      set({ fragments: { ...fragments, [id]: fragments[id] - amount }, gems: gems + (amount * 2) });
    }
  },

  setMapHunt: (id, name, level, image, rarity = 'Normal') => {
    get().resetHuntSession();
    set({ currentHuntType: { id, name, level, image, rarity }, mapTargets: [], scanningTarget: null, activeMapId: null });
    for (let i = 0; i < 4; i++) get().spawnSingleTarget();
  },

  // 🔥 MOTOR DE SPAWN BLINDADO CONTRA FANTASMAS
  spawnSingleTarget: () => {
    const state = get();
    const { activeMapId, serverMaps, serverDigimons, mapTargets, serverSettings } = state;
    if (mapTargets.length >= 7) return;

    let targetBase = state.currentHuntType;

    if (activeMapId && serverMaps[activeMapId]) {
      const spawns = serverMaps[activeMapId].spawns.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      if (spawns.length > 0) {
        const randomSpawnId = spawns[Math.floor(Math.random() * spawns.length)];
        const sDigi = serverDigimons[randomSpawnId];
        
        if (sDigi) {
          targetBase = { id: sDigi.id, name: sDigi.name, level: serverMaps[activeMapId].minLevel, image: sDigi.menuImg, rarity: sDigi.rarity as any };
        } else {
          // SE O BANCO NÃO ACHAR O MONSTRO (O Efeito Fantasma), ELE CRIA UM GENÉRICO NA HORA PARA NÃO TRAVAR:
          targetBase = { id: randomSpawnId, name: randomSpawnId, level: serverMaps[activeMapId].minLevel, image: '', rarity: 'Normal' };
        }
      }
    }

    if (!targetBase) return;

    const x = Math.floor(Math.random() * 50) + 25; 
    const y = Math.floor(Math.random() * 30) + 40; 
    
    const randRarity = Math.random() * 100;
    let { id, name, image, level } = targetBase;
    let rarity: 'Normal' | 'Elite' | 'Chefe' | 'Divino' = 'Normal';
    
    let cumulative = 0;
    if (randRarity <= (cumulative += serverSettings.rngRates.divino)) { rarity = 'Divino'; level += 20; }
    else if (randRarity <= (cumulative += serverSettings.rngRates.chefe)) { rarity = 'Chefe'; level += 10; }
    else if (randRarity <= (cumulative += serverSettings.rngRates.elite)) { rarity = 'Elite'; level += 5; }

    let sDigi = serverDigimons[id];
    let baseHp = sDigi ? sDigi.hp : level * 10;
    const hpMultiplier = rarity === 'Divino' ? 10 : rarity === 'Chefe' ? 5 : rarity === 'Elite' ? 2 : 1;
    const finalHp = baseHp * hpMultiplier;
    
    set({ mapTargets: [...get().mapTargets, { instanceId: `${id}_${Date.now()}_${Math.random()}`, id, name, level, hp: finalHp, maxHp: finalHp, image, rarity, x, y, dir: 'down' }] });
  },

  attackMapTarget: (targetInstanceId, damage) => {
    const { mapTargets, huntSession, gamePassMissions } = get();
    const updated = mapTargets.map(t => t.instanceId === targetInstanceId ? { ...t, hp: t.hp - damage } : t);
    const defeated = updated.find(t => t.instanceId === targetInstanceId && t.hp <= 0);

    if (defeated) {
      const newMissions = gamePassMissions.map(m => m.targetId === defeated.id && m.current < m.target ? { ...m, current: m.current + 1 } : m);
      set({ 
        mapTargets: updated.filter(t => t.instanceId !== targetInstanceId), 
        scanningTarget: defeated,
        huntSession: { ...huntSession, defeated: huntSession.defeated + 1 },
        gamePassMissions: newMissions
      });
      setTimeout(() => get().spawnSingleTarget(), 800);
    } else {
      set({ mapTargets: updated });
    }
  },

  takeDamage: (damage) => {
    const { myDigimons, activeDigimon, autoHelper, items, useItem } = get();
    const stats = myDigimons[activeDigimon];
    if (!stats) return false;

    let newHp = stats.hp - damage;
    let isDead = false;

    if (newHp <= 0) {
      newHp = stats.maxHp; 
      isDead = true;
    } else if (autoHelper.autoPotion && (newHp / stats.maxHp) * 100 <= autoHelper.potionThreshold) {
      if (items.potion && items.potion > 0) {
        newHp = Math.min(stats.maxHp, newHp + 100);
        useItem('potion', true);
      }
    }

    set({ myDigimons: { ...myDigimons, [activeDigimon]: { ...stats, hp: newHp } } });
    return isDead;
  },

  finishDNAScan: (target) => {
    const { myDigimons, activeDigimon, addCaptureLog, items, ownedGear, huntSession, autoHelper, useItem, serverSettings } = get();
    addCaptureLog(target.name, target.level, target.rarity);
    
    const currentStats = myDigimons[activeDigimon] || { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100 };
    const rarityExpMult = target.rarity === 'Divino' ? 10 : target.rarity === 'Chefe' ? 5 : target.rarity === 'Elite' ? 2 : 1;
    
    const earnedExp = Math.floor(target.level * 20 * rarityExpMult * serverSettings.globalExpMultiplier);
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

    const earnedBits = Math.floor(target.level * 25 * rarityExpMult * serverSettings.globalDropMultiplier);
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

    if (autoHelper.autoScan && newItems.scan > 0) { useItem('scan', true); }

    set((state) => ({
      bits: state.bits + earnedBits,
      items: newItems,
      ownedGear: droppedGear ? [...state.ownedGear, droppedGear] : state.ownedGear,
      fragments: { ...state.fragments, [target.id]: (state.fragments[target.id] || 0) + 15 },
      myDigimons: { 
        ...state.myDigimons, 
        [activeDigimon]: { ...currentStats, level: newLevel, exp: finalExp, maxExp: newMaxExp, maxHp: newMaxHp, hp: leveledUp ? newMaxHp : currentStats.hp } 
      },
      huntSession: {
        ...state.huntSession,
        expGained: state.huntSession.expGained + earnedExp,
        bitsGained: state.huntSession.bitsGained + earnedBits
      },
      scanningTarget: null
    }));

    return { exp: earnedExp, bits: earnedBits, item: droppedGear ? 'Garra de Combate' : droppedItem, leveledUp };
  },

  synthesizeDigimon: (id) => {
    const { fragments, ownedDigimons, myDigimons } = get();
    const count = fragments[id] || 0;
    if (count >= 50 && !ownedDigimons.includes(id)) {
      set({ fragments: { ...fragments, [id]: count - 50 }, ownedDigimons: [...ownedDigimons, id], myDigimons: { ...myDigimons, [id]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100, atk: 10 } }, activeDigimon: get().activeDigimon || id });
    }
  },

  setActiveDigimon: (id) => { if (get().ownedDigimons.includes(id)) set({ activeDigimon: id }); },
  
  buyItem: (itemId, cost, currency, amount) => {
    const state = get();
    if (currency === 'bits' && state.bits >= cost) set({ bits: state.bits - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } });
    else if (currency === 'gems' && state.gems >= cost) set({ gems: state.gems - cost, items: { ...state.items, [itemId]: (state.items[itemId] || 0) + amount } });
  },
  
  useItem: (itemId, isAuto = false) => {
    const { items, myDigimons, activeDigimon, huntSession, storeItems } = get();
    if ((items[itemId] || 0) > 0) {
      const stats = myDigimons[activeDigimon];
      if (!stats) return;

      let heal = 0;
      if (itemId === 'meat') heal = 30;
      else if (itemId === 'potion') heal = 100;
      else {
        const customItem = storeItems.find(i => i.id === itemId);
        if (customItem && customItem.type === 'consumable') heal = customItem.effectValue;
      }

      const updatedSession = { ...huntSession };
      if (isAuto && itemId === 'potion') updatedSession.potionsUsed += 1;
      if (isAuto && itemId === 'scan') updatedSession.scansUsed += 1;

      if (heal > 0) {
        const newHp = Math.min(stats.maxHp, stats.hp + heal);
        set({ items: { ...items, [itemId]: items[itemId] - 1 }, myDigimons: { ...myDigimons, [activeDigimon]: { ...stats, hp: newHp } }, huntSession: updatedSession });
      } else {
        set({ items: { ...items, [itemId]: items[itemId] - 1 }, huntSession: updatedSession });
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
  
  addCaptureLog: (name, level, rarity) => {
    const newEntry = { name, level, rarity, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
    set((state) => ({ captureLog: [newEntry, ...state.captureLog.slice(0, 49)] }));
  },
  
  completeTutorial: async (uid, gender, starterId) => {
    const newState = { avatar: gender === 'female' ? 'sora' : 'tai', hasCompletedTutorial: true, ownedDigimons: [starterId], activeDigimon: starterId, myDigimons: { [starterId]: { level: 1, exp: 0, maxExp: 100, hp: 100, maxHp: 100, atk: 10 } } };
    set(newState);
    get().changeMap('floresta'); 
    try { await updateDoc(doc(db, 'users', uid), { ...newState, bits: get().bits, gems: get().gems, items: get().items, equippedOutfit: get().equippedOutfit, ownedOutfits: get().ownedOutfits, captureLog: get().captureLog, ownedGear: get().ownedGear, equippedGear: get().equippedGear, soundEnabled: get().soundEnabled, bpp: get().bpp, isPremium: get().isPremium }); } catch (error) { console.error('Erro', error); }
  },
  
  loadProgress: async (uid) => {
    try {
      await get().fetchServerData();
      get().initServerData();

      onSnapshot(doc(db, 'users', uid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          set({
            bits: data.bits ?? 500, gems: data.gems ?? 50, avatar: data.avatar ?? 'tai', equippedOutfit: data.equippedOutfit ?? 'default', ownedOutfits: data.ownedOutfits ?? ['default'],
            captureLog: data.captureLog ?? [], fragments: data.fragments ?? {}, ownedDigimons: data.ownedDigimons ?? [], myDigimons: data.myDigimons ?? {}, activeDigimon: data.activeDigimon ?? '',
            items: data.items ?? { meat: 5, scan: 10, potion: 20 }, hasCompletedTutorial: data.hasCompletedTutorial ?? false, ownedGear: data.ownedGear ?? [], equippedGear: data.equippedGear ?? null,
            incubatingEgg: data.incubatingEgg ?? null, soundEnabled: data.soundEnabled ?? true, bpp: data.bpp ?? 0, isPremium: data.isPremium ?? false, isDataLoaded: true,
            role: data.role || 'player'
          });
          
          if (data.hasCompletedTutorial && !get().activeMapId && !get().currentHuntType) {
             get().changeMap('floresta');
          }
        } else { set({ isDataLoaded: true, hasCompletedTutorial: false }); }
      });
    } catch (error) { set({ isDataLoaded: true }); }
  },
  
  saveProgress: async (uid) => {
    try {
      const state = get();
      await updateDoc(doc(db, 'users', uid), { bits: state.bits, gems: state.gems, avatar: state.avatar, equippedOutfit: state.equippedOutfit, ownedOutfits: state.ownedOutfits, captureLog: state.captureLog, fragments: state.fragments, ownedDigimons: state.ownedDigimons, myDigimons: state.myDigimons, activeDigimon: state.activeDigimon, items: state.items, hasCompletedTutorial: state.hasCompletedTutorial, ownedGear: state.ownedGear, equippedGear: state.equippedGear, incubatingEgg: state.incubatingEgg, soundEnabled: state.soundEnabled, bpp: state.bpp, isPremium: state.isPremium });
    } catch (error) { console.error('Erro', error); }
  }
}));