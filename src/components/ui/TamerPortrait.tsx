// src/components/ui/TamerPortrait.tsx
import React from 'react';

interface TamerPortraitProps {
  gender?: 'male' | 'female' | 'tai' | 'sora' | string;
  className?: string;
}

export function TamerPortrait({ gender = 'tai', className = '' }: TamerPortraitProps) {
  // Lê se é a Sora (menina) ou o Tai (menino) e puxa as imagens padronizadas novas
  const isFemale = gender === 'female' || gender === 'sora';
  const imgSrc = isFemale ? '/Rosto normal feminino.png' : '/Rosto 1 - Normal.png';

  return (
    <div 
      className={`inline-block pixelated overflow-hidden ${className}`}
      style={{
        width: '96px',
        height: '96px',
        backgroundImage: `url('${imgSrc}')`,
        backgroundSize: 'contain', 
        backgroundPosition: 'center', 
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    />
  );
}