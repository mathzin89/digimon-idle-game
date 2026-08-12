// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyle = "px-6 py-2 rounded font-bold transition duration-300 uppercase text-sm tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-digi-gold to-yellow-600 text-digi-darker hover:brightness-110 shadow-glow-gold",
    outline: "border border-digi-cyan text-digi-cyan hover:bg-digi-cyan/10 shadow-glow-cyan",
    ghost: "text-slate-400 hover:text-digi-cyan"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}