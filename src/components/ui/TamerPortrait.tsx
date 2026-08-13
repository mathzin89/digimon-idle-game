// src/components/ui/TamerPortrait.tsx
import React from 'react';

interface TamerPortraitProps {
  gender: 'male' | 'female';
  className?: string;
}

export function TamerPortrait({ gender, className = '' }: TamerPortraitProps) {
  const imgSrc = gender === 'female' ? '/face-2.png' : '/Face-tamer.png';

  return (
    <div 
      className={`inline-block pixelated overflow-hidden ${className}`}
      style={{
        width: '96px',
        height: '96px',
        backgroundImage: `url('${imgSrc}')`,
        backgroundSize: '400% auto', 
        backgroundPosition: 'left center', 
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }}
    />
  );
}