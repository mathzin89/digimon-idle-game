// src/components/ui/TamerSprite.tsx
import React, { useState, useEffect } from 'react';

interface TamerSpriteProps {
  gender?: 'male' | 'female' | 'tai' | 'sora' | string;
  direction?: 'down' | 'up' | 'left' | 'right' | 'dg-esq' | 'dg-dir';
  isMoving?: boolean;
  className?: string;
}

export function TamerSprite({ gender, direction = 'down', isMoving = true, className = '' }: TamerSpriteProps) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Alterna entre os 3 frames da imagem horizontalmente
  useEffect(() => {
    if (!isMoving) {
      setFrameIndex(0); // Fica no primeiro frame quando parado
      return;
    }
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % 3);
    }, 120); // Ritmo natural dos passos (Ajustado para 120ms)
    return () => clearInterval(timer);
  }, [isMoving]);

  // Função para puxar as imagens exatamente com os nomes dos seus arquivos novos
  const getActiveImage = () => {
    const isFemale = gender === 'female' || gender === 'sora';
    
    // Tratamento para diagonais caírem nas sprites laterais
    let mappedDir = direction;
    if (direction === 'dg-esq') mappedDir = 'left';
    if (direction === 'dg-dir') mappedDir = 'right';

    if (isFemale) {
      switch (mappedDir) {
         case 'down': return '/Frente feminina.png';
         case 'up': return '/costas feminina.png';
         case 'left': return '/esquerda feminina.png';
         case 'right': return '/Direita feminina.png';
         default: return '/Frente feminina.png';
      }
    } else {
      switch (mappedDir) {
         case 'down': return '/Frente - masculino.png';
         case 'up': return '/Costas masculina.png';
         case 'left': return '/Esquerda - Masculino.png';
         case 'right': return '/Direita - masculino.png';
         default: return '/Frente - masculino.png';
      }
    }
  };

  const activeImage = getActiveImage();

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