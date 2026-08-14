// src/utils/audioManager.ts
export const playSound = (type: 'hit' | 'loot' | 'levelup', enabled: boolean) => {
  if (!enabled) return;
  
  try {
    const audio = new Audio(`/${type}.mp3`);
    if (type === 'hit') audio.volume = 0.2;
    if (type === 'loot') audio.volume = 0.4;
    if (type === 'levelup') audio.volume = 0.6;
    audio.play().catch(() => {
      // Ignora erro silenciosamente se o navegador bloquear ou o arquivo não existir
    });
  } catch (error) {
    console.log('Erro no áudio:', error);
  }
};