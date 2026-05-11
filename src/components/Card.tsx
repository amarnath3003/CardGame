import React from 'react';
import { motion } from 'framer-motion';
import { getCardRank, getCardSuit } from '../hooks/useCardGame';
import { CardVisualSize } from '../types';

import { Heart, Diamond, Spade, Club } from 'lucide-react';

const SUIT_ICONS: { [key: string]: React.FC<any> } = {
  's': Spade, 'c': Club, 'h': Heart, 'd': Diamond,
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
  const SuitIcon = SUIT_ICONS[suit] || Spade;
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
      <span className={`absolute z-10 drop-shadow-sm flex items-center justify-center ${suitColor} ${
        size === 'xs'
          ? 'w-5 h-5 pb-1'
          : size === 'sm'
            ? 'w-6 h-6 pb-1 md:w-8 md:h-8'
            : size === 'md'
              ? 'w-10 h-10 pb-2 md:w-12 md:h-12'
              : 'w-12 h-12 pb-2 md:w-16 md:h-16 md:pb-3'
      }`}>
        <SuitIcon className="w-full h-full fill-current stroke-current" strokeWidth={1} />
      </span>

      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent h-1/2 pointer-events-none z-20" />

      {/* Top Left Corner */}
      <div className={`absolute z-20 flex flex-col items-center ${suitColor} ${
        size === 'xs' ? 'top-1 left-1' : size === 'sm' ? 'top-1.5 left-1.5 md:top-2 md:left-2' : size === 'md' ? 'top-2 left-2 md:top-2.5 md:left-2.5' : 'top-2.5 left-2.5 md:top-3.5 md:left-3.5'
      }`}>
        <div className={`${size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-[10px] md:text-xs' : size === 'md' ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-black leading-none drop-shadow-sm`}>{rank}</div>
        <div className="mt-0.5"><SuitIcon className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5 md:w-3 md:h-3' : size === 'md' ? 'w-3 h-3 md:w-3.5 md:h-3.5' : 'w-3.5 h-3.5 md:w-4 md:h-4'} fill-current stroke-current drop-shadow-sm`} strokeWidth={1} /></div>
      </div>
      
      {/* Bottom Right Corner */}
      <div className={`absolute z-20 rotate-180 flex flex-col items-center ${suitColor} ${
        size === 'xs' ? 'bottom-1 right-1' : size === 'sm' ? 'bottom-1.5 right-1.5 md:bottom-2 md:right-2' : size === 'md' ? 'bottom-2 right-2 md:bottom-2.5 md:right-2.5' : 'bottom-2.5 right-2.5 md:bottom-3.5 md:right-3.5'
      }`}>
        <div className={`${size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-[10px] md:text-xs' : size === 'md' ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-black leading-none drop-shadow-sm`}>{rank}</div>
        <div className="mt-0.5"><SuitIcon className={`${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5 md:w-3 md:h-3' : size === 'md' ? 'w-3 h-3 md:w-3.5 md:h-3.5' : 'w-3.5 h-3.5 md:w-4 md:h-4'} fill-current stroke-current drop-shadow-sm`} strokeWidth={1} /></div>
      </div>
    </motion.div>
  );
};
