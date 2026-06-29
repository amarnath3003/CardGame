import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, LogOut } from 'lucide-react';
import { useCardGame, formatCardName } from '../hooks/useCardGame';
import { useMultiplayer } from '../contexts/MultiplayerContext';
import { PlayerHand } from './PlayerHand';
import { MiddleDeck } from './MiddleDeck';
import { RoundOverModal } from './RoundOverModal';
import { LayoutMetrics } from '../types';

// ─── Countdown isolated in its own component ────────────────────────────────
// Keeping the 100ms interval INSIDE this component means only this tiny
// component re-renders on every tick, not the entire GameScreen tree.
const RoundCountdown = memo(function RoundCountdown({
  roundStartAt,
  roundStartDelayMs,
  gameStatus,
  roundNumber,
  compact,
}: {
  roundStartAt: number | null;
  roundStartDelayMs: number;
  gameStatus: string;
  roundNumber: number;
  compact: boolean;
}) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (gameStatus !== 'ROUND_ACTIVE' || roundStartAt === null) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      const readyAt = roundStartAt + roundStartDelayMs;
      setRemainingMs(Math.max(0, readyAt - Date.now()));
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [roundStartAt, roundStartDelayMs, gameStatus, roundNumber]);

  const sec = Math.ceil(remainingMs / 1000);

  return (
    <AnimatePresence>
      {remainingMs > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <svg
              className="absolute"
              width={compact ? '140' : '220'}
              height={compact ? '140' : '220'}
              viewBox="0 0 220 220"
            >
              <circle
                cx="110"
                cy="110"
                r="100"
                fill="rgba(0, 0, 0, 0.7)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="3"
              />
            </svg>
            <div className="relative flex flex-col items-center justify-center">
              <span
                className={`font-black text-white drop-shadow-lg ${compact ? 'text-4xl' : 'text-6xl md:text-7xl'
                  }`}
              >
                {sec}
              </span>
              <span
                className={`font-bold text-white/90 drop-shadow-md tracking-widest ${compact ? 'mt-1 text-xs' : 'mt-2 text-lg md:text-xl'
                  }`}
              >
                STARTS IN
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// ─── Play button isolated so it doesn't re-render with the whole screen ──────
const PlayButton = memo(function PlayButton({
  show,
  compact,
  onPlace,
}: {
  show: boolean;
  compact: boolean;
  onPlace: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`play-button absolute z-50 ${compact
              ? 'bottom-[calc(5.2rem+var(--safe-bottom))] right-[calc(1rem+var(--safe-right))]'
              : 'bottom-20 left-1/2 -translate-x-1/2 md:bottom-48'
            }`}
        >
          <button
            onClick={onPlace}
            className={`group relative flex items-center justify-center rounded-full border-white bg-gradient-to-b from-yellow-400 to-orange-500 font-black text-white transition-all hover:scale-110 active:translate-y-[6px] active:shadow-[0_2px_0_#b35900,0_4px_8px_rgba(0,0,0,0.3)] ${compact
                ? 'gap-2 border-[3px] px-6 py-3 text-base shadow-[0_6px_0_#b35900,0_10px_16px_rgba(0,0,0,0.35)] min-w-[140px]'
                : 'gap-3 border-[4px] px-10 py-4 text-2xl shadow-[0_8px_0_#b35900,0_14px_28px_rgba(0,0,0,0.4)] md:px-12 md:py-5 md:text-3xl md:gap-4'
              }`}
          >
            <span>PLAY</span>
            <Play
              className={`${compact ? 'h-5 w-5' : 'h-7 w-7'} fill-current transition-transform group-hover:scale-125 md:h-8 md:w-8`}
            />
            <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full rounded-b-none pointer-events-none">
              <div className="absolute left-[-50%] top-0 h-[50%] w-[200%] -rotate-12 translate-y-[-50%] bg-white/20" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

function KeyboardControls({ onPlaceCard }: { onPlaceCard: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPlaceCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlaceCard]);
  return null;
}

// ─── Viewport hook ───────────────────────────────────────────────────────────
function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  useEffect(() => {
    let rafId: number;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      // Debounce via rAF — avoids resize storm hammering state
      rafId = requestAnimationFrame(() => {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return viewport;
}

// ─── Main GameScreen ──────────────────────────────────────────────────────────
export const GameScreen: React.FC = () => {
  const { gameState, selectCard, placeCard, nextRound, buyCards, localPlayerId } =
    useCardGame();
  const { leaveLobby } = useMultiplayer();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [buyTargetId, setBuyTargetId] = useState<number | null>(null);

  const viewport = useViewport();

  const layout = useMemo<LayoutMetrics>(() => {
    const isLandscape = viewport.width > viewport.height;
    const isCompactLandscape = isLandscape && viewport.height <= 500;
    return {
      mode: isCompactLandscape ? 'compactLandscape' : 'default',
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      isCompactLandscape,
    };
  }, [viewport.height, viewport.width]);

  const compact = layout.isCompactLandscape;

  // Stable callbacks — avoid re-creating on every render
  const handleLeave = useCallback(() => leaveLobby(), [leaveLobby]);
  const handleBuy = useCallback(
    (targetId: number) => {
      buyCards(targetId);
      setBuyTargetId(null);
    },
    [buyCards],
  );

  // Countdown is now read by RoundCountdown only — no state here
  // We still need to know if countdown is active for the PLAY button
  const [isCountingDown, setIsCountingDown] = useState(false);
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'ROUND_ACTIVE' || gameState.roundStartAt === null) {
      setIsCountingDown(false);
      return;
    }
    const readyAt = gameState.roundStartAt + gameState.roundStartDelayMs;
    if (Date.now() >= readyAt) {
      setIsCountingDown(false);
      return;
    }
    setIsCountingDown(true);
    const id = setTimeout(() => setIsCountingDown(false), readyAt - Date.now());
    return () => clearTimeout(id);
  }, [gameState?.roundStartAt, gameState?.roundStartDelayMs, gameState?.roundNumber, gameState?.gameStatus]);

  if (!gameState) return null;

  const showPlayButton =
    gameState.gameStatus === 'ROUND_ACTIVE' &&
    gameState.currentPlayer === localPlayerId &&
    gameState.selectedCardIdx !== null &&
    !isCountingDown;

  const positions = ['bottom', 'left', 'top', 'right'] as const;
  const playerPositions = gameState.players.map((_, index) => {
    const offset = (index - localPlayerId + 4) % 4;
    return { index, position: positions[offset] };
  });

  return (
    <div
      className={`game-root ${compact ? 'compact-landscape' : ''} min-h-[100dvh] w-full relative overflow-hidden bg-gradient-to-b from-[#1a8cff] via-[#4dd2ff] to-[#aadd00]`}
    >
      {/* Table felt */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-[100%] border-[#aaff55]/50 bg-gradient-to-b from-[#88e633] to-[#44aa00] shadow-[inset_0_40px_80px_rgba(0,100,0,0.4)] pointer-events-none z-0 ${compact
            ? '-bottom-[65vh] h-[120vh] w-[210vw] border-t-[8px]'
            : '-bottom-[55vh] h-[115vh] w-[190vw] border-t-[12px]'
          }`}
      />

      {/* Exit button */}
      <div className="absolute left-[calc(1rem+var(--safe-left))] top-[calc(1rem+var(--safe-top))] z-40">
        <button
          onClick={() => setShowExitConfirm(true)}
          className={`group flex items-center justify-center rounded-full border-3 border-white bg-gray-900 hover:bg-red-600 text-white transition-all ${compact ? 'p-2.5 min-w-[44px] min-h-[44px]' : 'p-3 min-w-[48px] min-h-[48px] md:p-4 md:min-w-[56px] md:min-h-[56px]'
            }`}
          title="Leave Game"
        >
          <LogOut
            className={`${compact ? 'h-5 w-5' : 'h-6 w-6 md:h-7 md:w-7'} transition-transform group-hover:-translate-x-1`}
          />
          {!compact && (
            <span className="ml-2 hidden text-xs font-bold tracking-widest md:block">EXIT</span>
          )}
        </button>
      </div>

      {/* Round badge */}
      <div
        className={`game-header absolute right-[calc(1rem+var(--safe-right))] top-[calc(1rem+var(--safe-top))] z-30 flex items-center rounded-full border-3 border-white bg-gray-900 shadow-[0_8px_20px_rgba(0,0,0,0.3)] ${compact ? 'px-4 py-2 min-w-[100px]' : 'px-6 py-2.5 md:py-3.5 md:px-8'
          }`}
      >
        <p
          className={`font-black text-yellow-300 drop-shadow-md text-center ${compact ? 'text-sm' : 'text-base md:text-lg'}`}
        >
          ROUND {gameState.roundNumber}
        </p>
      </div>

      {/* ── Countdown — fully isolated, only this re-renders on tick ── */}
      <RoundCountdown
        roundStartAt={gameState.roundStartAt}
        roundStartDelayMs={gameState.roundStartDelayMs}
        gameStatus={gameState.gameStatus}
        roundNumber={gameState.roundNumber}
        compact={compact}
      />

      {/* ── Play button — isolated ── */}
      <PlayButton show={showPlayButton} compact={compact} onPlace={placeCard} />

      {/* Player hands */}
      {playerPositions.map(({ index, position }) => (
        <PlayerHand
          key={index}
          playerName={gameState.players[index].name}
          avatarIndex={gameState.players[index].avatarIndex}
          cards={gameState.players[index].cards}
          position={position}
          isCurrentPlayer={gameState.currentPlayer === index}
          isHuman={gameState.players[index].isHuman}
          isOut={gameState.players[index].isOut}
          isLocalPlayer={index === localPlayerId}
          selectedCardIdx={index === localPlayerId ? gameState.selectedCardIdx : null}
          legalMoves={index === localPlayerId ? gameState.players[index].legalMoves : []}
          onCardSelect={(idx) => {
            if (index === localPlayerId) selectCard(idx);
          }}
          onBuyPlayer={() => {
            if (
              index !== localPlayerId &&
              !gameState.players[index].isOut &&
              gameState.gameStatus === 'ROUND_ACTIVE' &&
              gameState.middlePile.length === 0
            ) {
              setBuyTargetId(index);
            }
          }}
          // Pass boolean only — avoids PlayerHand re-rendering on every 100ms tick
          isCountingDown={isCountingDown}
          layout={layout}
          roundNumber={gameState.roundNumber}
        />
      ))}

      <MiddleDeck cards={gameState.middleDeck} layout={layout} />

      {/* Round over modal */}
      <AnimatePresence>
        {gameState.gameStatus === 'ROUND_RESOLVING' && gameState.roundWinner !== null && (
          <RoundOverModal
            title={
              gameState.roundOutcome === 'CUT'
                ? `${gameState.players[gameState.roundWinner].name} TAKES THE PILE`
                : `${gameState.players[gameState.roundWinner].name} WINS THE ROUND`
            }
            message={gameState.message}
            detailLabel={gameState.roundOutcome === 'CUT' ? 'CUT CARD' : 'HIGHEST CARD'}
            detailValue={formatCardName(
              gameState.roundOutcome === 'CUT'
                ? gameState.cutCard || 'Unknown'
                : gameState.highestCard || 'Unknown',
            )}
            buttonLabel={localPlayerId === 0 ? 'NEXT ROUND' : 'WAITING FOR HOST...'}
            outcome={gameState.roundOutcome || 'NORMAL'}
            onContinue={localPlayerId === 0 ? nextRound : () => { }}
            layout={layout}
          />
        )}
      </AnimatePresence>

      {/* Game over modal */}
      <AnimatePresence>
        {gameState.gameStatus === 'GAME_OVER' && gameState.gameLoser !== null && gameState.players[gameState.gameLoser] && (
          <RoundOverModal
            title="GAME OVER"
            message={`${gameState.players[gameState.gameLoser].name} is the last player still holding cards.`}
            detailLabel="Loser"
            detailValue={gameState.players[gameState.gameLoser].name}
            buttonLabel=""
            outcome="GAME_OVER"
            onContinue={() => { }}
            onExit={handleLeave}
            layout={layout}
          />
        )}
      </AnimatePresence>

      {/* Exit confirm */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-[2rem] border-4 border-white/20 bg-gray-900 p-8 text-center shadow-2xl"
            >
              <h2 className="mb-4 text-3xl font-black text-white uppercase tracking-tight">
                Leave Match?
              </h2>
              <p className="mb-8 text-lg font-medium text-gray-400">
                Are you sure you want to quit? Your progress in this round will be lost.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLeave}
                  className="w-full rounded-full bg-red-500 py-4 text-xl font-black text-white transition-all hover:bg-red-600 active:scale-95"
                >
                  YES, LEAVE
                </button>
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full rounded-full bg-white/10 py-3 text-lg font-bold text-white transition-all hover:bg-white/20"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy cards confirm */}
      <AnimatePresence>
        {buyTargetId !== null && gameState.players[buyTargetId] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm rounded-[2rem] border-4 border-white/20 bg-gray-900 p-8 text-center shadow-2xl"
            >
              <h2 className="mb-4 text-3xl font-black text-white uppercase tracking-tight">
                Buy Cards?
              </h2>
              <p className="mb-8 text-lg font-medium text-gray-400">
                Buy all cards from {gameState.players[buyTargetId].name}? They will immediately
                be SAFE and out of this game.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleBuy(buyTargetId)}
                  className="w-full rounded-full bg-blue-500 py-4 text-xl font-black text-white transition-all hover:bg-blue-600 active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.6)] border-2 border-blue-400"
                >
                  BUY CARDS
                </button>
                <button
                  onClick={() => setBuyTargetId(null)}
                  className="w-full rounded-full bg-white/10 py-3 text-lg font-bold text-white transition-all hover:bg-white/20"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <KeyboardControls onPlaceCard={placeCard} />
    </div>
  );
};