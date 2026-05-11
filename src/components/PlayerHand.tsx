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

const getAvatarEmoji = (position: string) => {
  switch (position) {
    case 'bottom': return '😎';
    case 'top': return '🤖';
    case 'left': return '👩‍🎤';
    case 'right': return '👨‍🚀';
    default: return '👤';
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
    bottom: 'absolute bottom-8 left-1/2 transform -translate-x-1/2 flex justify-center',
    top: 'absolute top-16 left-1/2 transform -translate-x-1/2 flex justify-center rotate-180',
    left: 'absolute left-24 top-1/2 transform -translate-y-1/2 flex justify-center rotate-90',
    right: 'absolute right-24 top-1/2 transform -translate-y-1/2 flex justify-center -rotate-90',
  };

  const avatarClasses = {
    bottom: 'absolute -top-16 left-1/2 transform -translate-x-1/2',
    top: 'absolute -bottom-24 left-1/2 transform -translate-x-1/2 rotate-180',
    left: 'absolute -bottom-24 left-1/2 transform -translate-x-1/2 -rotate-90',
    right: 'absolute -bottom-24 left-1/2 transform -translate-x-1/2 rotate-90',
  };

  // Calculate fan effect
  const cardCount = isHuman ? cards.length : Math.min(cards.length, 13);
  const getFanRotation = (index: number, total: number) => {
    const angleStep = 4; // degrees between cards
    const startAngle = -((total - 1) * angleStep) / 2;
    return startAngle + (index * angleStep);
  };

  const getFanYOffset = (index: number, total: number) => {
    const middle = (total - 1) / 2;
    const distFromMiddle = Math.abs(index - middle);
    return distFromMiddle * distFromMiddle * 1.5; // curved upward arc
  };

  return (
    <div className={positionClasses[position]}>
      {/* Avatar Plate */}
      <div className={`${avatarClasses[position]} z-20 flex flex-col items-center`}>
        <div className={`w-16 h-16 rounded-2xl bg-white border-[3px] shadow-avatar flex items-center justify-center text-3xl mb-1 ${isCurrentPlayer ? 'border-uno-yellow ring-4 ring-uno-yellow shadow-[0_0_15px_#ffcc00]' : 'border-gray-300'}`}>
          {getAvatarEmoji(position)}
        </div>
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 shadow-md border border-white/20 whitespace-nowrap">
          <p className="text-sm font-bold text-white text-center">
            {playerName}
          </p>
        </div>
      </div>

      {position === 'bottom' && isHuman ? (
        // Human player - fan cards out
        <div className="relative flex h-24 items-end" style={{ width: `${Math.max(300, cards.length * 35)}px` }}>
          {cards.map((card, idx) => {
            const rot = getFanRotation(idx, cards.length);
            const yOffset = getFanYOffset(idx, cards.length);
            return (
              <div 
                key={idx} 
                className="absolute origin-bottom transition-all duration-300 hover:z-50"
                style={{ 
                  left: `calc(50% + ${(idx - (cards.length-1)/2) * 35}px)`,
                  transform: `translateX(-50%) translateY(${yOffset}px)`,
                  zIndex: 10 + idx
                }}
              >
                <Card
                  value={card}
                  isSelected={selectedCardIdx === idx}
                  size="lg"
                  rotation={rot}
                  onClick={() => onCardSelect(idx)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        // AI players - show card backs fanned
        <div className="relative flex h-16 items-end" style={{ width: `${Math.max(120, cardCount * 15)}px` }}>
          {Array.from({ length: cardCount }).map((_, idx) => {
            const rot = getFanRotation(idx, cardCount);
            const yOffset = getFanYOffset(idx, cardCount) * 0.5;
            return (
              <div 
                key={idx}
                className="absolute origin-bottom transition-all duration-300"
                style={{ 
                  left: `calc(50% + ${(idx - (cardCount-1)/2) * 15}px)`,
                  transform: `translateX(-50%) translateY(${yOffset}px)`,
                  zIndex: 10 + idx
                }}
              >
                <Card
                  value=""
                  isBack={true}
                  size="sm"
                  rotation={rot}
                />
              </div>
            );
          })}
          {cards.length > cardCount && (
            <div className="absolute -right-10 top-0 bg-uno-red text-white font-black rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg z-50">
              +{cards.length - cardCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
