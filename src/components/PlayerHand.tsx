import React, { useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { CardVisualSize, LayoutMetrics } from '../types';
import { AvatarBadge } from './AvatarBadge';
import { TimerHighlight } from './TimerHighlight';

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
  /** Boolean flag — avoids re-renders on every 100ms countdown tick */
  isCountingDown?: boolean;
  legalMoves?: string[];
  avatarIndex: number;
  roundNumber?: number;
}

const CARD_WIDTHS: Record<CardVisualSize, number> = {
  xs: 32,
  sm: 40,
  md: 64,
  lg: 80,
};

// Pre-computed static position maps — defined once outside the component
// so they're never recreated on render.
const POSITION_CLASSES_COMPACT = {
  bottom: 'absolute bottom-[calc(0.25rem+var(--safe-bottom))] left-1/2 -translate-x-1/2 flex justify-center z-40',
  top: 'absolute top-[calc(1.0rem+var(--safe-top))] left-1/2 -translate-x-1/2 flex justify-center rotate-180 z-20',
  left: 'absolute left-[calc(0.45rem+var(--safe-left))] top-[44%] -translate-y-1/2 z-20',
  right: 'absolute right-[calc(0.45rem+var(--safe-right))] top-[44%] -translate-y-1/2 z-20',
} as const;

const POSITION_CLASSES_NORMAL = {
  bottom: 'absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex justify-center z-40',
  top: 'absolute top-4 md:top-16 left-1/2 -translate-x-1/2 flex justify-center rotate-180 z-20',
  left: 'absolute left-4 md:left-24 top-1/2 -translate-y-1/2 flex justify-center rotate-90 z-20',
  right: 'absolute right-4 md:right-24 top-1/2 -translate-y-1/2 flex justify-center -rotate-90 z-20',
} as const;

const AVATAR_CLASSES_COMPACT = {
  bottom: 'absolute -top-12 left-2 flex flex-col items-center',
  top: 'absolute -top-12 left-24 flex flex-col items-center',
  left: 'absolute -top-10 left-1/2 -translate-x-1/2',
  right: 'absolute -top-10 left-1/2 -translate-x-1/2',
} as const;

const AVATAR_CLASSES_NORMAL = {
  bottom: 'absolute -top-16 left-4 flex flex-col items-center',
  top: 'absolute -bottom-16 left-32 flex flex-col items-center',
  left: 'absolute -bottom-20 left-1/2 -translate-x-1/2',
  right: 'absolute -bottom-20 left-1/2 -translate-x-1/2',
} as const;

// Pre-compute fan transforms to avoid recomputing per render
function getFanTransform(
  index: number,
  total: number,
  compact: boolean,
  position: 'bottom' | 'top' | 'left' | 'right',
) {
  if (total <= 1) return { rotation: 0, yOffset: 0 };

  const centered = index - (total - 1) / 2;
  const normalized = Math.abs(centered) / Math.max(1, total / 2);

  const maxSpread = compact
    ? position === 'bottom' ? 30 : position === 'top' ? 18 : 24
    : position === 'bottom' ? 54 : 26;
  const rotation = centered * (maxSpread / Math.max(1, total - 1));

  const arcDepth = compact
    ? position === 'bottom' ? 24 : position === 'top' ? 10 : 14
    : position === 'bottom' ? 42 : 24;

  return { rotation, yOffset: normalized * normalized * arcDepth };
}

// Shared spring — stable reference, never recreated
const CARD_SPRING = { type: 'spring' as const, stiffness: 200, damping: 20 };
const PLAYER_SCALE_SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 };

// ─── Compact side stack (left/right on small screens) ─────────────────────────
const CompactSideStack = memo(function CompactSideStack({
  playerName,
  avatarIndex,
  cards,
  position,
  isCurrentPlayer,
  isHuman,
  isOut,
  isCountingDown,
  onBuyPlayer,
  isLocalPlayer,
  roundNumber,
}: Pick<
  PlayerHandProps,
  | 'playerName'
  | 'avatarIndex'
  | 'cards'
  | 'position'
  | 'isCurrentPlayer'
  | 'isHuman'
  | 'isOut'
  | 'isCountingDown'
  | 'onBuyPlayer'
  | 'isLocalPlayer'
  | 'roundNumber'
>) {
  const posClass = POSITION_CLASSES_COMPACT[position];

  return (
    <div className={`${posClass} player-hand player-hand-${position}`}>
      <motion.div
        animate={{ scale: isCurrentPlayer ? [1.06, 1.12, 1.06] : 1 }}
        transition={
          isCurrentPlayer
            ? { scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }
            : { duration: 0.3 }
        }
        className="flex flex-col items-center gap-2"
      >
        <div
          className={`relative h-10 w-10 flex items-center justify-center rounded-2xl border shadow-[0_6px_14px_rgba(0,0,0,0.28)] ${isCurrentPlayer ? 'border-yellow-400' : 'border-white'
            }`}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center">
            <AvatarBadge
              avatarIndex={avatarIndex}
              label={playerName}
              size="sm"
              highlight={isCurrentPlayer}
              isAi={!isHuman}
            />
          </div>
          {isCurrentPlayer && <TimerHighlight compact key={`timer-${roundNumber ?? 0}`} />}
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

        <div className="rounded-full border border-white bg-gray-900 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
          {isOut ? 'SAFE' : playerName.replace('Player ', 'P')}
        </div>

        {!isLocalPlayer && !isOut && onBuyPlayer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuyPlayer();
            }}
            disabled={isCountingDown}
            className={`pointer-events-auto mt-1 rounded-lg px-2 py-1 text-white text-[9px] font-bold shadow-md transition-colors uppercase ${!isCountingDown
              ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.9)]'
              : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
          >
            BUY
          </button>
        )}
      </motion.div>
    </div>
  );
});

// ─── Main PlayerHand ──────────────────────────────────────────────────────────
export const PlayerHand = memo(function PlayerHand({
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
  isCountingDown = false,
  legalMoves = [],
  avatarIndex,
  roundNumber,
}: PlayerHandProps) {
  const compact = layout.isCompactLandscape;
  const isSideSeat = position === 'left' || position === 'right';
  const useCompactSideStack = compact && isSideSeat && !isLocalPlayer;
  const cardCount = isLocalPlayer ? cards.length : Math.min(cards.length, 13);

  const cardSize: CardVisualSize = useMemo(() => {
    if (!compact) return isLocalPlayer ? 'lg' : 'sm';
    if (isLocalPlayer) return 'md';
    return 'xs';
  }, [compact, isLocalPlayer]);

  const cardWidth = CARD_WIDTHS[cardSize];

  const positionClasses = compact ? POSITION_CLASSES_COMPACT : POSITION_CLASSES_NORMAL;
  const avatarClasses = compact ? AVATAR_CLASSES_COMPACT : AVATAR_CLASSES_NORMAL;

  const cardsAreaWidth = useMemo(() => {
    if (useCompactSideStack) return 56;
    if (position === 'bottom' || position === 'top') {
      const reservedSideSpace = compact ? (position === 'bottom' ? 220 : 180) : 96;
      return Math.max(220, layout.viewportWidth - reservedSideSpace);
    }
    return compact ? 190 : 280;
  }, [compact, layout.viewportWidth, position, useCompactSideStack]);

  const spacing = useMemo(() => {
    if (cardCount <= 1 || useCompactSideStack) return 0;
    const available = Math.max(cardWidth, cardsAreaWidth) - cardWidth;
    if (position === 'bottom') {
      return Math.max(compact ? 16 : 22, Math.min(compact ? 28 : 40, available / (cardCount - 1)));
    }
    if (position === 'top') {
      return Math.max(compact ? 10 : 12, Math.min(compact ? 18 : 15, available / (cardCount - 1)));
    }
    return Math.max(compact ? 10 : 12, Math.min(compact ? 16 : 15, available / (cardCount - 1)));
  }, [cardCount, cardWidth, cardsAreaWidth, compact, position, useCompactSideStack]);

  const handHeight = compact
    ? position === 'bottom' ? 88 : position === 'top' ? 62 : 74
    : isLocalPlayer ? 132 : 92;

  const selectedLift = compact ? 12 : 25;
  const hoverLift = compact ? 10 : 20;

  // Stable card select handler
  const handleCardSelect = useCallback(
    (idx: number) => {
      if (isLocalPlayer) onCardSelect(idx);
    },
    [isLocalPlayer, onCardSelect],
  );

  if (useCompactSideStack) {
    return (
      <CompactSideStack
        playerName={playerName}
        avatarIndex={avatarIndex}
        cards={cards}
        position={position}
        isCurrentPlayer={isCurrentPlayer}
        isHuman={isHuman}
        isOut={isOut}
        isCountingDown={isCountingDown}
        onBuyPlayer={onBuyPlayer}
        isLocalPlayer={isLocalPlayer}
        roundNumber={roundNumber}
      />
    );
  }

  const avatarRotation =
    position === 'top' ? 180 : position === 'left' ? -90 : position === 'right' ? 90 : 0;

  return (
    <div className={`${positionClasses[position]} player-hand player-hand-${position}`}>
      {/* Avatar area */}
      <motion.div
        animate={{
          scale: isCurrentPlayer ? [1.08, 1.15, 1.08] : 1,
          y: isCurrentPlayer && !compact ? -12 : 0,
          rotate: avatarRotation,
        }}
        transition={
          isCurrentPlayer
            ? {
              scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              y: PLAYER_SCALE_SPRING,
            }
            : { duration: 0.3 }
        }
        className={`${avatarClasses[position]} z-20 flex flex-col items-center pointer-events-none`}
      >
        <div
          className={`relative flex items-center justify-center rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.3)] ${compact ? 'h-11 w-11' : 'h-16 w-16'
            } ${isLocalPlayer
              ? 'ring-2 ring-green-400/45 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
              : isCurrentPlayer
                ? 'shadow-[0_0_25px_rgba(250,204,21,0.6)] ring-4 ring-yellow-400/30'
                : ''
            }`}
        >
          <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center">
            <AvatarBadge
              avatarIndex={avatarIndex}
              label={playerName}
              size={compact ? 'sm' : 'md'}
              highlight={isCurrentPlayer}
              isAi={!isHuman}
            />
          </div>

          {isLocalPlayer && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-white shadow-md z-30">
              YOU
            </div>
          )}

          {isCurrentPlayer && <TimerHighlight compact={compact} key={`timer-${roundNumber ?? 0}`} />}

          {!isHuman && (
            <div
              className={`absolute rounded-full border-2 border-white bg-red-500 font-black text-white shadow-sm z-40 ${compact ? '-bottom-1.5 -right-1.5 px-1.5 py-0.5 text-[10px]' : '-bottom-2 -right-2 px-2 py-1 text-xs'
                }`}
            >
              {cards.length}
            </div>
          )}
        </div>

        {/* Name tag + buy button */}
        <div className="relative flex items-center justify-center mt-2 pointer-events-none">
          <div
            className={`flex items-center justify-center rounded-full border border-white bg-gray-900 px-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-auto ${compact ? 'py-1' : 'py-1.5'
              }`}
          >
            <p
              className={`text-center font-bold text-white ${compact ? 'text-[10px] tracking-[0.18em]' : 'text-sm tracking-wide'
                }`}
            >
              {isOut ? `${playerName} • SAFE` : playerName}
            </p>
          </div>

          {!isLocalPlayer && !isOut && onBuyPlayer && (
            <div className="absolute left-full ml-1.5 md:ml-2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyPlayer();
                }}
                disabled={isCountingDown}
                className={`rounded-lg px-2 text-white shadow-md transition-colors font-bold uppercase whitespace-nowrap ${compact ? 'text-[9px] py-0.5' : 'text-xs py-1'
                  } ${!isCountingDown
                    ? 'bg-yellow-500 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.9)]'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                  }`}
              >
                BUY
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cards area */}
      <div
        className="relative flex items-end justify-center overflow-visible pointer-events-auto"
        style={{ width: `${cardsAreaWidth}px`, height: `${handHeight}px` }}
      >
        <AnimatePresence>
          {Array.from({ length: cardCount }).map((_, idx) => {
            const cardValue = isLocalPlayer ? cards[idx] : '';
            const { rotation, yOffset } = getFanTransform(idx, cardCount, compact, position);
            const xOffset = (idx - (cardCount - 1) / 2) * spacing;

            return (
              <motion.div
                key={isLocalPlayer ? cardValue || `local-${idx}` : `back-${playerName}-${idx}`}
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
                transition={{ ...CARD_SPRING, delay: idx * 0.02 }}
                className="absolute origin-bottom"
                style={{ left: '50%', marginLeft: -cardWidth / 2 }}
              >
                <Card
                  value={cardValue}
                  isBack={!isLocalPlayer}
                  isSelected={isLocalPlayer && selectedCardIdx === idx}
                  isIllegal={
                    isLocalPlayer &&
                    isCurrentPlayer &&
                    legalMoves.length > 0 &&
                    !legalMoves.includes(cardValue)
                  }
                  size={cardSize}
                  rotation={0}
                  index={idx}
                  selectedLift={selectedLift}
                  hoverLift={hoverLift}
                  onClick={() => handleCardSelect(idx)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
});