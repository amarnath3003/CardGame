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
  'h': 'text-red-600',
  'd': 'text-red-600',
};

interface CardProps {
  value: string;
  onClick?: () => void;
  isSelected?: boolean;
  isBack?: boolean;
  size?: 'sm' | 'md' | 'lg';
  cardCount?: number;
}

export const Card: React.FC<CardProps> = ({
  value,
  onClick,
  isSelected = false,
  isBack = false,
  size = 'md',
  cardCount,
}) => {
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-16 h-24',
    lg: 'w-20 h-28',
  };

  if (isBack) {
    return (
      <div
        className={`${sizeClasses[size]} bg-blue-800 border-2 border-black rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow`}
      >
        {cardCount && (
          <span className="text-white font-bold text-sm">{cardCount}</span>
        )}
      </div>
    );
  }

  const rank = getCardRank(value);
  const suit = getCardSuit(value);
  const suitSymbol = SUIT_SYMBOLS[suit] || '';
  const suitColor = SUIT_COLORS[suit] || 'text-black';

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        bg-white border-2 border-black rounded-lg
        flex flex-col items-center justify-center
        card cursor-pointer
        ${isSelected ? 'card-selected' : ''}
        relative overflow-hidden
      `}
    >
      <div className={`absolute top-1 left-1 text-center ${suitColor}`}>
        <div className="font-bold text-xs leading-none">{rank}</div>
        <div className="text-sm leading-none">{suitSymbol}</div>
      </div>
      <div className={`absolute bottom-1 right-1 text-center ${suitColor} rotate-180`}>
        <div className="font-bold text-xs leading-none">{rank}</div>
        <div className="text-sm leading-none">{suitSymbol}</div>
      </div>
    </div>
  );
};
