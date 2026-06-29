import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { LayoutMetrics } from '../types';

interface MiddleDeckProps {
  cards: string[];
  layout: LayoutMetrics;
}

export const MiddleDeck: React.FC<MiddleDeckProps> = ({ cards, layout }) => {
  const visibleCards = useMemo(() => {
    const displayedCards = cards.slice(-5);

    return displayedCards.map((card, index) => {
      const centeredIndex = index - (displayedCards.length - 1) / 2;

      return {
        card,
        id: `${card}-${cards.length - displayedCards.length + index}`,
        rotation: centeredIndex * 12,
        xOffset: centeredIndex * 35,
        yOffset: Math.abs(centeredIndex) * 8 - (index * 2),
      };
    });
  }, [cards]);

  const compact = layout.isCompactLandscape;
  const deckSize = compact ? 'md' : 'lg';
  const centerTop = compact ? 'top-[48%]' : 'top-1/2';

  return (
    <div
      className={`absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none ${centerTop}`}
      style={{
        width: compact ? 'clamp(160px, 28vw, 240px)' : 'clamp(200px, 35vw, 340px)',
        height: compact ? 'clamp(160px, 26vw, 230px)' : 'clamp(240px, 42vw, 380px)',
      }}
    >
      
      {/* Mystical Drop Zone Background */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className={`absolute rounded-full border-dashed border-white/20 bg-black/5 ${
          compact ? 'h-24 w-24 border-[3px]' : 'h-36 w-36 border-4 md:h-56 md:w-56'
        }`}
      />
      <div className={`absolute rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 ${
        compact ? 'h-20 w-20 blur-lg' : 'h-28 w-28 blur-xl md:h-40 md:w-40'
      }`} />
      
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence>
          {visibleCards.map(({ card, rotation, xOffset, yOffset, id }, idx) => (
            <motion.div
              key={id}
              initial={{ scale: 1.4, opacity: 0, y: -60 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                x: xOffset,
                y: yOffset,
                rotate: rotation,
                zIndex: idx 
              }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute drop-shadow-2xl"
            >
              <Card value={card} size={deckSize} selectedLift={compact ? 10 : 25} hoverLift={compact ? 8 : 20} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      

    </div>
  );
};
