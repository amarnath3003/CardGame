import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';

interface MiddleDeckProps {
  cards: string[];
}

export const MiddleDeck: React.FC<MiddleDeckProps> = ({ cards }) => {
  const cardsWithRotation = useMemo(() => {
    const getHashRot = (str: string, index: number) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return ((hash + index * 17) % 60) - 30; // Random looking spread
    };

    return cards.map((c, i) => ({
      card: c,
      rotation: getHashRot(c, i),
      id: `${c}-${i}`, // Unique ID for AnimatePresence
    })).slice(-5); // Only display top 5 to keep DOM light
  }, [cards]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-64 h-64 flex items-center justify-center pointer-events-none">
      
      {/* Mystical Drop Zone Background */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.05, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute w-56 h-56 rounded-full border-4 border-dashed border-white/20 bg-black/5"
      />
      <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-xl" />
      
      <div className="relative w-28 h-44 flex items-center justify-center">
        <AnimatePresence>
          {cardsWithRotation.map(({ card, rotation, id }, idx) => (
            <motion.div
              layoutId={card} // Magical fly-in from hand!
              key={id}
              initial={{ scale: 2, opacity: 0, y: -100 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                y: 0,
                rotate: rotation,
                zIndex: idx 
              }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute drop-shadow-2xl"
            >
              <Card value={card} size="lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {cards.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-12 bg-gray-900/80 backdrop-blur-md rounded-full px-5 py-2 border-[3px] border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-2"
        >
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <p className="text-white font-black text-lg tracking-widest leading-none pt-1">
            PILE: {cards.length}
          </p>
        </motion.div>
      )}
    </div>
  );
};
