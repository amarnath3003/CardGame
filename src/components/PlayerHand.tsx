import React from 'react';
import { Card } from './Card';

interface PlayerHandProps {
  playerName: string;
  cards: string[];
  position: 'bottom' | 'top' | 'left' | 'right';
  isCurrentPlayer: boolean;
  isHuman: boolean;
  selectedCardIdx: number | null;
  onCardSelect: (index: number) => void;
}

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
    bottom: 'flex flex-row justify-center gap-2 absolute bottom-4 left-1/2 transform -translate-x-1/2',
    top: 'flex flex-row justify-center gap-1 absolute top-4 left-1/2 transform -translate-x-1/2',
    left: 'flex flex-col justify-center gap-1 absolute left-4 top-1/2 transform -translate-y-1/2',
    right: 'flex flex-col justify-center gap-1 absolute right-4 top-1/2 transform -translate-y-1/2',
  };

  const labelPositions = {
    bottom: 'absolute -bottom-8 left-1/2 transform -translate-x-1/2',
    top: 'absolute -top-8 left-1/2 transform -translate-x-1/2',
    left: 'absolute -left-16 top-1/2 transform -translate-y-1/2 w-14',
    right: 'absolute -right-16 top-1/2 transform -translate-y-1/2 w-14',
  };

  return (
    <div className={positionClasses[position]}>
      <div className={labelPositions[position]}>
        <p className={`text-sm font-bold text-white text-center ${isCurrentPlayer ? 'text-yellow-300' : ''}`}>
          {playerName}
        </p>
        {isCurrentPlayer && <p className="text-xs text-yellow-300 text-center">Turn</p>}
      </div>

      {position === 'bottom' && isHuman ? (
        // Human player - show all cards
        <div className="flex flex-row gap-2 flex-wrap justify-center max-w-2xl">
          {cards.map((card, idx) => (
            <div key={idx} onClick={() => onCardSelect(idx)}>
              <Card
                value={card}
                isSelected={selectedCardIdx === idx}
                size="md"
              />
            </div>
          ))}
        </div>
      ) : (
        // AI players - show card backs with count
        <div className="flex flex-row gap-1">
          {cards.slice(0, 8).map((_, idx) => (
            <Card
              key={idx}
              value=""
              isBack={true}
              size={position === 'bottom' ? 'md' : 'sm'}
            />
          ))}
          {cards.length > 8 && (
            <div className="flex items-center justify-center w-12 h-16 text-white font-bold">
              +{cards.length - 8}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
