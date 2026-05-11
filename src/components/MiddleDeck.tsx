import React, { useMemo } from 'react';
import { Card } from './Card';

interface MiddleDeckProps {
  cards: string[];
}

export const MiddleDeck: React.FC<MiddleDeckProps> = ({ cards }) => {
  // Memoize random rotations so they don't change constantly
  const cardsWithRotation = useMemo(() => {
    // A simple deterministic hash based on string to get a consistent "random" angle
    const getHashRot = (str: string, index: number) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return ((hash + index * 13) % 40) - 20; // Between -20 and +20
    };

    return cards.map((c, i) => ({
      card: c,
      rotation: getHashRot(c, i),
      idx: i,
    })).slice(-5); // Show last 5 cards for a nice pile
  }, [cards]);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-48 h-48 flex items-center justify-center">
      
      {/* Background ring representing placement area */}
      <div className="absolute w-40 h-40 rounded-full border-4 border-white/20 bg-black/10"></div>
      
      <div className="relative flex items-center justify-center w-full h-full">
        {cardsWithRotation.map(({ card, rotation, idx }) => (
          <div
            key={`${card}-${idx}`}
            className="absolute transition-all duration-300 ease-out"
            style={{
              zIndex: idx,
              transform: `rotate(${rotation}deg) scale(1.1) translateY(${idx * 2 - 4}px)`,
              opacity: idx === cardsWithRotation.length - 1 ? 1 : 0.85
            }}
          >
            <Card value={card} size="lg" />
          </div>
        ))}
      </div>
      
      <div className="absolute -bottom-16 bg-black/50 backdrop-blur-md rounded-full px-4 py-1 border border-white/30">
        <p className="text-white font-black drop-shadow-md tracking-wider">PILE: {cards.length}</p>
      </div>
    </div>
  );
};
