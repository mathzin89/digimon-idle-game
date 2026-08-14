// src/utils/digimonVisuals.tsx
import React from 'react';

export const digimonDict: Record<string, { name: string, img: string, menuImg: string, isSprite?: boolean, menuFrames?: number }> = {
  'koromon': { name: 'Koromon', img: '/koromon-esq.png', menuImg: '/koromon-esq.png', isSprite: true, menuFrames: 3 },
  'agumon': { name: 'Agumon', img: '/agu-anima.png', menuImg: '/agu-dg-esquerda.png', isSprite: true, menuFrames: 3 },
  'gabumon': { name: 'Gabumon', img: '/gabumon.png', menuImg: '/gabumon.png', isSprite: true, menuFrames: 3 },
  'palmon': { name: 'Palmon', img: '/palmon.png', menuImg: '/palmon.png', isSprite: true, menuFrames: 3 },
  'greymon': { name: 'Greymon', img: '/greymon.png', menuImg: '/greymon.png', isSprite: true, menuFrames: 3 },
  'metalgreymon': { name: 'MetalGreymon', img: '/metalgreymon.png', menuImg: '/metalgreymon.png', isSprite: true, menuFrames: 3 },
  'wargreymon': { name: 'WarGreymon', img: '/wargreymon.png', menuImg: '/wargreymon.png', isSprite: true, menuFrames: 3 },
  'patamon': { name: 'Patamon', img: '/patamon.png', menuImg: '/patamon.png', isSprite: true, menuFrames: 3 },
  'angemon': { name: 'Angemon', img: '/angemon.png', menuImg: '/angemon.png', isSprite: true, menuFrames: 3 }
};

export const getDigimonVisuals = (baseId: string, level: number, isPlayer: boolean = false) => {
  if (isPlayer && baseId === 'agumon') {
    if (level < 30) return { name: 'Koromon', img: '/koromon-esq.png', menuImg: '/koromon-esq.png', isSprite: true, menuFrames: 3 };
    if (level < 100) return { name: 'Agumon', img: '/agu-anima.png', menuImg: '/agu-dg-esquerda.png', isSprite: true, menuFrames: 3 };
    if (level < 300) return { name: 'Greymon', img: '/greymon.png', menuImg: '/greymon.png', isSprite: true, menuFrames: 3 };
    if (level < 600) return { name: 'MetalGreymon', img: '/metalgreymon.png', menuImg: '/metalgreymon.png', isSprite: true, menuFrames: 3 };
    return { name: 'WarGreymon', img: '/wargreymon.png', menuImg: '/wargreymon.png', isSprite: true, menuFrames: 3 };
  }
  
  const data = digimonDict[baseId];
  if (data) return data;
  
  return { name: baseId, img: `/${baseId}.png`, menuImg: `/${baseId}.png`, isSprite: true, menuFrames: 3 };
};

export const MenuSprite = ({ visual, className }: { visual: any, className: string }) => {
  if (visual.isSprite && visual.menuFrames) {
    return (
      <div 
        className={`pixelated ${className}`}
        style={{
          backgroundImage: `url('${visual.menuImg}')`,
          backgroundSize: `${visual.menuFrames * 100}% 100%`,
          backgroundPosition: '0% 0%',
          backgroundRepeat: 'no-repeat'
        }}
      />
    );
  }
  return <img src={visual.menuImg} alt={visual.name} className={`object-contain pixelated ${className}`} onError={(e) => { e.currentTarget.style.display = 'none'; }} />;
};