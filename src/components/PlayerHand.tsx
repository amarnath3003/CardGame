import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { User, Cpu, Sparkles, Rocket } from 'lucide-react';

interface PlayerHandProps {
  playerName: string;
  cards: string[];
  position: 'bottom' | 'top' | 'left' | 'right';
  isCurrentPlayer: boolean;
  isHuman: boolean;
  selectedCardIdx: number | null;
  onCardSelect: (index: number) => void;
}

const getAvatarIcon = (position: string) => {
  switch (position) {
    case 'bottom': return <User className="w-8 h-8 text-blue-500" />;
    case 'top': return <Cpu className="w-8 h-8 text-red-500" />;
    case 'left': return <Sparkles className="w-8 h-8 text-purple-500" />;
    case 'right': return <Rocket className="w-8 h-8 text-orange-500" />;
    default: return <User className="w-8 h-8 text-gray-500" />;
  }
};

export const PlayerHand: React.FC<PlayerHandProps> = ({
  playerName,
  cards,
  position,
  isCurrentPlayer,
  isHuman,
  selectedCardIdx,
  onCardSelect,
}) => {
  const positionClasses = {
    bottom: 'absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center z-40',
    top: 'absolute top-16 left-1/2 transform -translate-x-1/2 flex justify-center rotate-180 z-20',
    left: 'absolute left-24 top-1/2 transform -translate-y-1/2 flex justify-center rotate-90 z-20',
    right: 'absolute right-24 top-1/2 transform -translate-y-1/2 flex justify-center -rotate-90 z-20',
  };

  const avatarClasses = {
    bottom: 'absolute -top-20 left-1/2 transform -translate-x-1/2',
    top: 'absolute -bottom-28 left-1/2 transform -translate-x-1/2 rotate-180',
    left: 'absolute -bottom-28 left-1/2 transform -translate-x-1/2 -rotate-90',
    right: 'absolute -bottom-28 left-1/2 transform -translate-x-1/2 rotate-90',
  };

  const cardCount = isHuman ? cards.length : Math.min(cards.length, 13);
  
  const getFanTransform = (index: number, total: number) => {
    const angleStep = Math.min(7, 60 / total); 
    const startAngle = -((total - 1) * angleStep) / 2;
    const rotation = startAngle + (index * angleStep);
    
    const radius = 300;
    const radian = (rotation * Math.PI) / 180;
    const yOffset = radius - (Math.cos(radian) * radius);
    
    return { rotation, yOffset };
  };

  return (
    <div className={positionClasses[position]}>
      {/* Avatar Plate */}
      <motion.div 
        animate={{ scale: isCurrentPlayer ? 1.1 : 1, y: isCurrentPlayer ? -10 : 0 }}
        className={`${avatarClasses[position]} z-20 flex flex-col items-center pointer-events-none`}
      >
        <div className={`w-16 h-16 rounded-2xl bg-white border-2 shadow-[0_8px_16px_rgba(0,0,0,0.3)] flex items-center justify-center relative ${
          isCurrentPlayer ? 'border-yellow-400 shadow-[0_0_20px_#ffcc00] ring-4 ring-yellow-400/50' : 'border-gray-200'
        }`}>
          {getAvatarIcon(position)}
          
          {isCurrentPlayer && (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute -inset-1 border-2 border-dashed border-yellow-400 rounded-2xl opacity-50"
            />
          )}

          {/* Cards Count Badge for AI */}
          {!isHuman && (
             <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">
                {cards.length}
             </div>
          )}
        </div>
        
        <div className="mt-2 bg-gradient-to-r from-black/80 via-black/60 to-black/80 backdrop-blur-md rounded-full px-4 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-white/20">
          <p className="text-sm font-bold text-white tracking-wide text-center">
            {playerName}
          </p>
        </div>
      </motion.div>

      {/* Cards Area */}
      <div className="relative flex h-32 items-end justify-center pointer-events-auto" style={{ width: `${Math.max(300, cardCount * (isHuman ? 40 : 15))}px` }}>
        <AnimatePresence>
          {Array.from({ length: cardCount }).map((_, idx) => {
            const cardValue = isHuman ? cards[idx] : "";
            const { rotation, yOffset } = getFanTransform(idx, cardCount);
            const xOffset = (idx - (cardCount - 1) / 2) * (isHuman ? 40 : 15);
            
            return (
              <motion.div
                key={isHuman ? cardValue : `back-${idx}`}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  y: yOffset,
                  x: xOffset,
                  rotate: rotation,
                  scale: 1,
                  zIndex: 10 + idx 
                }}
                exit={{ opacity: 0, scale: 0.5, y: -100 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: idx * 0.05 }}
                className="absolute origin-bottom"
                style={{ left: '50%', marginLeft: isHuman ? -56 : -24 }}
              >
                <Card
                  value={cardValue}
                  isBack={!isHuman}
                  isSelected={selectedCardIdx === idx}
                  size={isHuman ? 'lg' : 'sm'}
                  rotation={0}
                  index={idx}
                  onClick={() => isHuman && onCardSelect(idx)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
