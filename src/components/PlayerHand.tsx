import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Cpu, Sparkles, Rocket } from 'lucide-react';
import { Card } from './Card';
import { CardVisualSize, LayoutMetrics } from '../types';

interface PlayerHandProps {
  playerName: string;
  cards: string[];
  position: 'bottom' | 'top' | 'left' | 'right';
  isCurrentPlayer: boolean;
  isHuman: boolean;
  isOut: boolean;
  isLocalPlayer: boolean;
  selectedCardIdx: number | null;
  onCardSelect: (index: number) => void;
  layout: LayoutMetrics;
  onBuyPlayer?: () => void;
  roundCountdownMs?: number;
}

const CARD_WIDTHS: Record<CardVisualSize, number> = {
  xs: 32,
  sm: 40,
  md: 64,
  lg: 80,
};

const getAvatarIcon = (position: string, compact = false) => {
  const sizeClass = compact ? 'w-4 h-4' : 'w-8 h-8';

  switch (position) {
    case 'bottom':
      return <User className={`${sizeClass} text-blue-500`} />;
    case 'top':
      return <Cpu className={`${sizeClass} text-red-500`} />;
    case 'left':
      return <Sparkles className={`${sizeClass} text-purple-500`} />;
    case 'right':
      return <Rocket className={`${sizeClass} text-orange-500`} />;
    default:
      return <User className={`${sizeClass} text-gray-500`} />;
  }
};

const TimerHighlight: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const pathData = "M 50 5 L 25 5 A 20 20 0 0 0 5 25 L 5 75 A 20 20 0 0 0 25 95 L 75 95 A 20 20 0 0 0 95 75 L 95 25 A 20 20 0 0 0 75 5 Z";
  
  return (
    <svg 
      className="absolute inset-0 h-full w-full pointer-events-none z-10" 
      viewBox="0 0 100 100" 
      style={{ 
        overflow: 'visible', 
        transform: compact ? 'scale(1.35)' : 'scale(1.25)' 
      }}
    >
      {/* Background Track for the timer */}
      <path
        d={pathData}
        fill="none"
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={compact ? "9" : "7"}
        strokeLinecap="round"
      />
      
      {/* Outer Glow Path (pulsing) */}
      <motion.path
        d={pathData}
        fill="none"
        strokeWidth={compact ? "14" : "12"}
        strokeLinecap="round"
        initial={{ pathLength: 1, stroke: "#4ade80", opacity: 0.4 }}
        animate={{ 
          pathLength: 0,
          stroke: ["#4ade80", "#facc15", "#ef4444"],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ 
          pathLength: { duration: 15, ease: "linear" },
          stroke: { duration: 15, ease: "linear" },
          opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ filter: 'blur(5px)' }}
      />

      {/* Main Animated Path */}
      <motion.path
        d={pathData}
        fill="none"
        strokeWidth={compact ? "8" : "6"}
        strokeLinecap="round"
        initial={{ pathLength: 1, stroke: "#4ade80" }}
        animate={{ 
          pathLength: 0,
          stroke: ["#4ade80", "#facc15", "#ef4444"]
        }}
        transition={{ duration: 15, ease: "linear" }}
        style={{ 
          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))'
        }}
      />
    </svg>
  );
};

export const PlayerHand: React.FC<PlayerHandProps> = ({
  playerName,
  cards,
  position,
  isCurrentPlayer,
  isHuman,
  isOut,
  isLocalPlayer,
  selectedCardIdx,
  onCardSelect,
  layout,
  onBuyPlayer,
  roundCountdownMs = 0,
}) => {
  const compact = layout.isCompactLandscape;
  const isSideSeat = position === 'left' || position === 'right';
  const useCompactSideStack = compact && isSideSeat && !isLocalPlayer;
  const cardCount = isLocalPlayer ? cards.length : Math.min(cards.length, 13);

  const cardSize: CardVisualSize = useMemo(() => {
    if (!compact) {
      return isLocalPlayer ? 'lg' : 'sm';
    }

    if (isLocalPlayer) {
      return 'md';
    }

    if (position === 'top') {
      return 'xs';
    }

    return 'xs';
  }, [compact, isLocalPlayer, position]);

  const cardWidth = CARD_WIDTHS[cardSize];

  const positionClasses = useMemo(() => {
    if (compact) {
      return {
        bottom: 'absolute bottom-[calc(0.25rem+var(--safe-bottom))] left-1/2 -translate-x-1/2 flex justify-center z-40',
        top: 'absolute top-[calc(1.0rem+var(--safe-top))] left-1/2 -translate-x-1/2 flex justify-center rotate-180 z-20',
        left: 'absolute left-[calc(0.45rem+var(--safe-left))] top-[44%] -translate-y-1/2 z-20',
        right: 'absolute right-[calc(0.45rem+var(--safe-right))] top-[44%] -translate-y-1/2 z-20',
      };
    }

    return {
      bottom: 'absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-40',
      top: 'absolute top-4 md:top-16 left-1/2 -translate-x-1/2 flex justify-center rotate-180 z-20',
      left: 'absolute left-4 md:left-24 top-1/2 -translate-y-1/2 flex justify-center rotate-90 z-20',
      right: 'absolute right-4 md:right-24 top-1/2 -translate-y-1/2 flex justify-center -rotate-90 z-20',
    };
  }, [compact]);

  const avatarClasses = useMemo(() => {
    if (compact) {
      return {
        bottom: 'absolute -top-12 left-2 flex flex-col items-center',
        top: 'absolute -top-12 left-24 flex flex-col items-center',
        left: 'absolute -top-10 left-1/2 -translate-x-1/2',
        right: 'absolute -top-10 left-1/2 -translate-x-1/2',
      };
    }

    return {
      bottom: 'absolute -top-16 left-4 flex flex-col items-center',
      top: 'absolute -bottom-16 left-32 flex flex-col items-center',
      left: 'absolute -bottom-20 left-1/2 -translate-x-1/2',
      right: 'absolute -bottom-20 left-1/2 -translate-x-1/2',
    };
  }, [compact]);

  const cardsAreaWidth = useMemo(() => {
    if (useCompactSideStack) {
      return 56;
    }

    if (position === 'bottom' || position === 'top') {
      const reservedSideSpace = compact ? (position === 'bottom' ? 220 : 180) : 96;
      return Math.max(220, layout.viewportWidth - reservedSideSpace);
    }

    return compact ? 190 : 280;
  }, [compact, layout.viewportWidth, position, useCompactSideStack]);

  const spacing = useMemo(() => {
    if (cardCount <= 1 || useCompactSideStack) {
      return 0;
    }

    const available = Math.max(cardWidth, cardsAreaWidth) - cardWidth;

    if (position === 'bottom') {
      const minSpacing = compact ? 16 : 22;
      const maxSpacing = compact ? 28 : 40;
      return Math.max(minSpacing, Math.min(maxSpacing, available / (cardCount - 1)));
    }

    if (position === 'top') {
      const minSpacing = compact ? 10 : 12;
      const maxSpacing = compact ? 18 : 15;
      return Math.max(minSpacing, Math.min(maxSpacing, available / (cardCount - 1)));
    }

    const minSpacing = compact ? 10 : 12;
    const maxSpacing = compact ? 16 : 15;
    return Math.max(minSpacing, Math.min(maxSpacing, available / (cardCount - 1)));
  }, [cardCount, cardWidth, cardsAreaWidth, compact, position, useCompactSideStack]);

  const handHeight = compact
    ? position === 'bottom'
      ? 88
      : position === 'top'
        ? 62
        : 74
    : isLocalPlayer
      ? 132
      : 92;

  const selectedLift = compact ? 12 : 25;
  const hoverLift = compact ? 10 : 20;

  const getFanTransform = (index: number, total: number) => {
    if (total <= 1) {
      return { rotation: 0, yOffset: 0 };
    }

    const centered = index - (total - 1) / 2;
    const normalized = Math.abs(centered) / Math.max(1, total / 2);

    const maxSpread = compact
      ? position === 'bottom'
        ? 30
        : position === 'top'
          ? 18
          : 24
      : position === 'bottom'
        ? 54
        : 26;
    const angleStep = maxSpread / Math.max(1, total - 1);
    const rotation = centered * angleStep;

    const arcDepth = compact
      ? position === 'bottom'
        ? 24
        : position === 'top'
          ? 10
          : 14
      : position === 'bottom'
        ? 42
        : 24;

    return {
      rotation,
      yOffset: normalized * normalized * arcDepth,
    };
  };

  if (useCompactSideStack) {
    return (
      <div className={`${positionClasses[position]} player-hand player-hand-${position}`}>
        <motion.div
          animate={{ scale: isCurrentPlayer ? [1.06, 1.12, 1.06] : 1 }}
          transition={{ 
            scale: isCurrentPlayer ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.3 }
          }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border bg-white/95 shadow-[0_6px_14px_rgba(0,0,0,0.28)] ${
              isCurrentPlayer ? 'border-yellow-400' : 'border-white/70'
            }`}
          >
            {getAvatarIcon(position, true)}
            {isCurrentPlayer && <TimerHighlight compact={true} />}
          </div>

          <div className="relative h-24 w-14">
            {Array.from({ length: Math.min(4, cards.length) }).map((_, idx) => (
              <motion.div
                key={`${playerName}-compact-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: idx * 3,
                  x: idx * (position === 'left' ? 2 : -2),
                  rotate: position === 'left' ? -6 + idx * 4 : 6 - idx * 4,
                }}
                className="absolute left-1/2 top-0 -translate-x-1/2 origin-center"
              >
                <Card value="" isBack size="xs" />
              </motion.div>
            ))}

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/50 bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
              {cards.length}
            </div>
          </div>

          <div className="rounded-full border border-white/30 bg-black/65 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
            {isOut ? 'SAFE' : playerName.replace('Player ', 'P')}
          </div>
          
          {!isLocalPlayer && !isOut && onBuyPlayer && (
            <button
              onClick={(e) => { e.stopPropagation(); onBuyPlayer(); }}
              className={`pointer-events-auto mt-1 rounded-lg px-2 py-1 text-white text-[9px] font-bold shadow-md transition-colors uppercase ${
                roundCountdownMs > 0
                  ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.9)]'
                  : 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60'
              }`}
              title="Buy Cards"
              disabled={roundCountdownMs === 0}
            >
              BUY
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const avatarRotation = position === 'top' ? 180 : position === 'left' ? -90 : position === 'right' ? 90 : 0;

  return (
    <div className={`${positionClasses[position]} player-hand player-hand-${position}`}>
      <motion.div
        animate={{ 
          scale: isCurrentPlayer ? [1.08, 1.15, 1.08] : 1, 
          y: isCurrentPlayer && !compact ? -12 : 0,
          rotate: avatarRotation
        }}
        transition={{
          scale: isCurrentPlayer ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0.3 },
          y: { type: 'spring', stiffness: 300, damping: 20 }
        }}
        className={`${avatarClasses[position]} z-20 flex flex-col items-center pointer-events-none`}
      >
        <div
          className={`relative flex items-center justify-center rounded-2xl bg-white shadow-[0_8px_16px_rgba(0,0,0,0.3)] ${
            compact ? 'h-11 w-11 border' : 'h-16 w-16 border-2'
          } ${
            isLocalPlayer ? 'border-green-400 ring-2 ring-green-400/45 shadow-[0_0_15px_rgba(74,222,128,0.5)]' :
            isCurrentPlayer ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)] ring-4 ring-yellow-400/30' : 'border-gray-200'
          }`}
        >
          {getAvatarIcon(position, compact)}

          {isLocalPlayer && (
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-md z-30`}>
              YOU
            </div>
          )}

          {isCurrentPlayer && <TimerHighlight compact={compact} />}

          {!isHuman && (
            <div
              className={`absolute rounded-full border-2 border-white bg-red-500 font-black text-white shadow-sm ${
                compact ? '-bottom-1.5 -right-1.5 px-1.5 py-0.5 text-[10px]' : '-bottom-2 -right-2 px-2 py-1 text-xs'
              }`}
            >
              {cards.length}
            </div>
          )}
        </div>

        <div
          className={`flex items-center gap-2 mt-2 rounded-full border border-white/20 bg-gradient-to-r from-black/80 via-black/60 to-black/80 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md pointer-events-auto ${
            compact ? 'py-1' : 'py-1.5'
          }`}
        >
          <p className={`text-center font-bold text-white ${compact ? 'text-[10px] tracking-[0.18em]' : 'text-sm tracking-wide'}`}>
            {isOut ? `${playerName} • SAFE` : playerName}
          </p>
          {!isLocalPlayer && !isOut && onBuyPlayer && (
            <button
              onClick={(e) => { e.stopPropagation(); onBuyPlayer(); }}
              className={`rounded-lg px-2 text-white shadow-md transition-colors font-bold uppercase ${
                compact ? 'text-[9px] py-0.5' : 'text-xs py-1'
              } ${
                roundCountdownMs > 0
                  ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.9)]'
                  : 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60'
              }`}
              title="Buy Cards"
              disabled={roundCountdownMs === 0}
            >
              BUY
            </button>
          )}
        </div>
      </motion.div>

      <div
        className={`relative flex items-end justify-center pointer-events-auto ${
          compact ? 'overflow-visible' : 'overflow-visible'
        } ${!compact && (position === 'left' || position === 'right') && !isLocalPlayer ? 'mb-24' : ''}`}
        style={{ width: `${cardsAreaWidth}px`, height: `${handHeight}px` }}
      >
        <AnimatePresence>
          {Array.from({ length: cardCount }).map((_, idx) => {
            const cardValue = isLocalPlayer ? cards[idx] : '';
            const { rotation, yOffset } = getFanTransform(idx, cardCount);
            const xOffset = (idx - (cardCount - 1) / 2) * spacing;

            return (
              <motion.div
                key={isLocalPlayer ? cardValue : `back-${playerName}-${idx}`}
                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  y: yOffset,
                  x: xOffset,
                  rotate: rotation,
                  scale: 1,
                  zIndex: 10 + idx,
                }}
                exit={{ opacity: 0, scale: 0.5, y: -100 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: idx * 0.02 }}
                className="absolute origin-bottom"
                style={{ left: '50%', marginLeft: -cardWidth / 2 }}
              >
                <Card
                  value={cardValue}
                  isBack={!isLocalPlayer}
                  isSelected={isLocalPlayer && selectedCardIdx === idx}
                  size={cardSize}
                  rotation={0}
                  index={idx}
                  selectedLift={selectedLift}
                  hoverLift={hoverLift}
                  onClick={() => isLocalPlayer && onCardSelect(idx)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
