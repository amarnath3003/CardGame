import React from 'react';
import { motion } from 'framer-motion';
import { getCardRank, getCardSuit } from '../hooks/useCardGame';
import { CardVisualSize } from '../types';

const SUIT_SYMBOLS: { [key: string]: string } = {
  's': '♠', 'c': '♣', 'h': '♥', 'd': '♦',
};

const SUIT_COLORS: { [key: string]: string } = {
  's': 'text-gray-800', 
  'c': 'text-green-600', 
  'h': 'text-red-500', 
  'd': 'text-blue-500',
};

const CARD_BG_COLORS: { [key: string]: string } = {
  's': 'from-gray-100 to-gray-300',
  'c': 'from-green-100 to-green-300',
  'h': 'from-red-100 to-red-300',
  'd': 'from-blue-100 to-blue-300',
};

interface CardProps {
  value: string;
  onClick?: () => void;
  isSelected?: boolean;
  isBack?: boolean;
  size?: CardVisualSize;
  rotation?: number;
  index?: number;
  selectedLift?: number;
  hoverLift?: number;
}

export const Card: React.FC<CardProps> = ({
  value,
  onClick,
  isSelected = false,
  isBack = false,
  size = 'md',
  rotation = 0,
  index = 0,
  selectedLift = 25,
  hoverLift = 20,
}) => {
  const sizeClasses = {
    xs: 'w-8 h-12 text-[10px] border-2 rounded-lg',
    sm: 'w-10 h-14 text-xs border-2 md:w-12 md:h-16',
    md: 'w-16 h-24 text-base border-[3px] md:w-20 md:h-32 md:text-lg',
    lg: 'w-20 h-32 text-xl border-[4px] md:w-28 md:h-44 md:text-2xl',
  };

  if (isBack) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1, rotate: rotation, y: isSelected ? -selectedLift : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`${sizeClasses[size]} relative rounded-xl border-white shadow-[0_8px_16px_rgba(0,0,0,0.4)] cursor-pointer flex items-center justify-center overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #2b32b2, #1488cc)',
          transformOrigin: 'bottom center'
        }}
      >
        <div className="absolute inset-2 border-2 border-white/30 rounded-lg flex items-center justify-center">
           <div className="w-12 h-12 rounded-full border-[3px] border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/20 blur-[1px]" />
           </div>
        </div>
        {/* Gloss wrap */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 pointer-events-none" />
      </motion.div>
    );
  }

  const rank = getCardRank(value);
  const suit = getCardSuit(value);
  const suitSymbol = SUIT_SYMBOLS[suit] || '';
  const suitColor = SUIT_COLORS[suit] || 'text-black';
  const bgGradient = CARD_BG_COLORS[suit] || 'from-white to-gray-200';

  return (
    <motion.div
      layoutId={value}
      initial={{ opacity: 0, y: 50, scale: 0.5 }}
      animate={{ opacity: 1, y: isSelected ? -selectedLift : 0, scale: isSelected ? 1.05 : 1, rotate: rotation }}
      whileHover={onClick ? { scale: 1.1, y: -hoverLift, zIndex: 50 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br ${bgGradient} border-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.5)]
        flex flex-col items-center justify-center
        cursor-pointer
        ${isSelected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''}
        relative overflow-hidden
      `}
      style={{ transformOrigin: 'bottom center' }}
    >
      {/* Central ellipse backdrop */}
      <div className="absolute w-[120%] h-[120%] rounded-full bg-white/80 scale-[0.6] rotate-12 shadow-inner" />
      
      {/* Central big suit symbol */}
      <span className={`absolute z-10 font-normal drop-shadow-sm ${suitColor} ${
        size === 'xs'
          ? 'pb-1 text-2xl'
          : size === 'sm'
            ? 'pb-2 text-3xl md:text-4xl'
            : size === 'md'
              ? 'pb-3 text-5xl md:text-6xl'
              : 'pb-3 md:pb-4 text-5xl md:text-7xl'
      }`}>
        {suitSymbol}
      </span>

      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent h-1/2 pointer-events-none z-20" />

      {/* Top Left Corner */}
      <div className={`absolute z-20 text-center ${suitColor} ${
        size === 'xs' ? 'top-1 left-1' : 'top-2 left-2'
      }`}>
        <div className={`${size === 'xs' ? 'text-[8px]' : 'text-xs md:text-sm'} font-black leading-none drop-shadow-sm`}>{rank}</div>
        <div className={`${size === 'xs' ? 'text-[8px]' : 'text-xs md:text-sm'} leading-none drop-shadow-sm`}>{suitSymbol}</div>
      </div>
      
      {/* Bottom Right Corner */}
      <div className={`absolute z-20 rotate-180 text-center ${suitColor} ${
        size === 'xs' ? 'bottom-1 right-1' : 'bottom-2 right-2'
      }`}>
        <div className={`${size === 'xs' ? 'text-[8px]' : 'text-xs md:text-sm'} font-black leading-none drop-shadow-sm`}>{rank}</div>
        <div className={`${size === 'xs' ? 'text-[8px]' : 'text-xs md:text-sm'} leading-none drop-shadow-sm`}>{suitSymbol}</div>
      </div>
    </motion.div>
  );
};
