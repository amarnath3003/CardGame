import React from 'react';
import { getCardRank, getCardSuit } from '../hooks/useCardGame';

const SUIT_SYMBOLS: { [key: string]: string } = {
  's': '♠',
  'c': '♣',
  'h': '♥',
  'd': '♦',
};

const SUIT_COLORS: { [key: string]: string } = {
  's': 'text-black',
  'c': 'text-black',
  'h': 'text-uno-red',
  'd': 'text-uno-red',
};

const CARD_BG_COLORS: { [key: string]: string } = {
  's': 'bg-white',
  'c': 'bg-white',
  'h': 'bg-white',
  'd': 'bg-white',
};

interface CardProps {
  value: string;
  onClick?: () => void;
  isSelected?: boolean;
  isBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
  cardCount?: number;
  rotation?: number;
}

export const Card: React.FC<CardProps> = ({
  value,
  onClick,
  isSelected = false,
  isBack = false,
  size = 'md',
  cardCount,
  rotation = 0,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-xs border-[1.5px]',
    md: 'w-16 h-24 text-base border-2',
    lg: 'w-24 h-36 text-xl border-[3px]',
  };

  const transformStyle = {
    transform: `rotate(${rotation}deg) ${isSelected ? 'translateY(-15px) scale(1.1)' : ''}`,
    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  };

  if (isBack) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-uno-red to-red-800 border-white rounded-lg flex items-center justify-center cursor-pointer shadow-card`}
        style={transformStyle}
      >
        {cardCount && (
          <span className="text-white font-black text-shadow-sm">{cardCount}</span>
        )}
      </div>
    );
  }

  const rank = getCardRank(value);
  const suit = getCardSuit(value);
  const suitSymbol = SUIT_SYMBOLS[suit] || '';
  const suitColor = SUIT_COLORS[suit] || 'text-black';
  const bgColor = CARD_BG_COLORS[suit] || 'bg-white';

  return (
    <div
      onClick={onClick}
      style={transformStyle}
      className={`
        ${sizeClasses[size]}
        ${bgColor} border-white rounded-lg shadow-card
        flex flex-col items-center justify-center
        card cursor-pointer
        ${isSelected ? 'ring-4 ring-uno-yellow ring-offset-2' : ''}
        relative overflow-hidden
      `}
    >
      {/* Central big symbol */}
      <span className={`text-4xl opacity-20 absolute ${suitColor}`}>{suitSymbol}</span>

      <div className={`absolute top-1 left-1 text-center ${suitColor}`}>
        <div className="font-black leading-none">{rank}</div>
        <div className="leading-none">{suitSymbol}</div>
      </div>
      <div className={`absolute bottom-1 right-1 text-center ${suitColor} rotate-180`}>
        <div className="font-black leading-none">{rank}</div>
        <div className="leading-none">{suitSymbol}</div>
      </div>
    </div>
  );
};
