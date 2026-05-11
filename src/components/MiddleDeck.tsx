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
  const pileLabelClass = compact
    ? 'absolute -bottom-8 rounded-full border-2 border-white/40 bg-gray-900/82 px-3 py-1 text-xs font-black tracking-[0.18em] text-white shadow-[0_0_12px_rgba(255,255,255,0.18)] backdrop-blur-md'
    : 'absolute -bottom-9 md:-bottom-12 rounded-full border-[3px] border-white/40 bg-gray-900/80 px-4 py-1.5 md:px-5 md:py-2 text-sm font-black tracking-widest text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] backdrop-blur-md md:text-lg';

  return (
    <div
      className={`absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center pointer-events-none ${
        compact ? 'top-[45%]' : 'top-1/2'
      }`}
      style={{
        width: compact ? 'clamp(148px, 26vw, 220px)' : 'clamp(180px, 32vw, 320px)',
        height: compact ? 'clamp(150px, 24vw, 210px)' : 'clamp(220px, 40vw, 360px)',
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
      
      {cards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${pileLabelClass} flex items-center gap-2`}
        >
          <div className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} rounded-full bg-green-400 animate-pulse`} />
          <p className={`leading-none ${compact ? 'pt-0.5' : 'pt-1'}`}>
            PILE: {cards.length}
          </p>
        </motion.div>
      )}
    </div>
  );
};
