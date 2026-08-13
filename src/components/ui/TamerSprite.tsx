// src/components/ui/TamerSprite.tsx
import React, { useState, useEffect } from 'react';

interface TamerSpriteProps {
  gender?: 'male' | 'female' | string;
  direction?: 'down' | 'up' | 'left' | 'right' | 'dg-esq' | 'dg-dir';
  isMoving?: boolean;
  className?: string;
}

export function TamerSprite({ gender, direction = 'right', isMoving = true, className = '' }: TamerSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Alterna entre os 3 frames da imagem horizontalmente
  useEffect(() => {
    if (!isMoving) {
      setFrameIndex(0); // Fica no primeiro frame quando parado
      return;
    }
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 3);
    }, 200); // Ritmo natural dos passos
    return () => clearInterval(timer);
  }, [isMoving]);

  // Mapeia cada direção para o ficheiro de imagem único correspondente
  const imageMap: Record<string, string> = {
    'down': '/andar-baixo.png',
    'up': '/andar-cima.png',
    'left': '/andar-esq.png',
    'right': '/andar-dir.png',
    'dg-esq': '/andar-dg-esq.png',
    'dg-dir': '/andar-dg-dir.png',
  };

  const activeImage = imageMap[direction] || imageMap['right'];

  // Posições percentuais exatas para recortar cada um dos 3 frames lado a lado
  const positions = ['0%', '50%', '100%'];

  return (
    <div 
      className={`inline-block pixelated ${className}`}
      style={{
        width: '48px',
        height: '48px',
        backgroundImage: `url('${activeImage}')`,
        backgroundSize: '300% 100%', // 3 frames dispostos horizontalmente
        backgroundPosition: `${positions[frameIndex]} 0%`,
        imageRendering: 'pixelated'
      }}
    />
  );
}