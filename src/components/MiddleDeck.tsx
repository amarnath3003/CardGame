import React from 'react';
import { Card } from './Card';

interface MiddleDeckProps {
  cards: string[];
}

export const MiddleDeck: React.FC<MiddleDeckProps> = ({ cards }) => {
  const cardsToShow = cards.slice(-3);

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-24 h-32">
        {cardsToShow.map((card, idx) => (
          <div
            key={idx}
            className="absolute"
            style={{
              transform: `translateX(${idx * 8}px) translateY(${idx * 8}px)`,
              zIndex: idx,
            }}
          >
            <Card value={card} size="lg" />
          </div>
        ))}
      </div>
      <div className="mt-32 text-center text-white font-bold">
        <p>Pile: {cards.length}</p>
      </div>
    </div>
  );
};
