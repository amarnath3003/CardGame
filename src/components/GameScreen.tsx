import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { useCardGame } from '../hooks/useCardGame';
import { PlayerHand } from './PlayerHand';
import { MiddleDeck } from './MiddleDeck';
import { RoundOverModal } from './RoundOverModal';
import { LayoutMetrics } from '../types';

export const GameScreen: React.FC = () => {
  const { gameState, selectCard, placeCard, aiPlay, nextRound, localPlayerId } = useCardGame();

  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'ROUND_ACTIVE' || gameState.currentPlayer === localPlayerId) {
      return;
    }

    // Handled in MultiplayerContext
  }, [gameState?.currentPlayer, gameState?.gameStatus, localPlayerId]);

  if (!gameState) {
    return null;
  }

  // Rotate player positions based on localPlayerId
  const positions = ['bottom', 'left', 'top', 'right'] as const;
  const playerPositions = gameState.players.map((_, index) => {
    const offset = (index - localPlayerId + 4) % 4;
    return { index, position: positions[offset] };
  });

  return (
    <div
      className={`game-root ${
        layout.isCompactLandscape ? 'compact-landscape' : ''
      } min-h-[100dvh] w-full relative overflow-hidden bg-gradient-to-b from-[#1a8cff] via-[#4dd2ff] to-[#aadd00]`}
    >
      <div
        className={`absolute left-1/2 -translate-x-1/2 rounded-[100%] border-[#aaff55]/50 bg-gradient-to-b from-[#88e633] to-[#44aa00] shadow-[inset_0_40px_80px_rgba(0,100,0,0.4)] pointer-events-none ${
          layout.isCompactLandscape
            ? '-bottom-[70vh] h-[125vh] w-[220vw] border-t-[10px]'
            : '-bottom-[60vh] h-[120vh] w-[200vw] border-t-[12px]'
        }`}
      />

      <motion.div
        animate={{ x: [-100, viewport.width + 100] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className={`absolute left-0 rounded-full bg-white/40 blur-md pointer-events-none ${
          layout.isCompactLandscape ? 'top-6 h-8 w-24' : 'top-10 h-12 w-36 md:top-20 md:h-16 md:w-48'
        }`}
      />
      <motion.div
        animate={{ x: [-200, viewport.width + 200] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: 10 }}
        className={`absolute right-0 rounded-full bg-white/30 pointer-events-none ${
          layout.isCompactLandscape ? 'top-12 h-9 w-32 blur-lg' : 'top-24 h-14 w-48 blur-xl md:top-40 md:h-20 md:w-64'
        }`}
      />

      <div
        className={`game-header absolute left-[calc(0.75rem+var(--safe-left))] top-[calc(0.75rem+var(--safe-top))] z-30 flex items-center rounded-full border-2 border-white/50 bg-white/20 backdrop-blur-md shadow-[0_8px_16px_rgba(0,0,0,0.2)] ${
          layout.isCompactLandscape ? 'px-4 py-1.5' : 'px-6 py-2 md:py-3'
        }`}
      >
        <p className={`font-bold text-yellow-300 drop-shadow-md ${layout.isCompactLandscape ? 'text-sm' : 'text-base md:text-xl'}`}>
          ROUND {gameState.roundNumber}
        </p>
      </div>



      <AnimatePresence>
        {gameState.gameStatus === 'ROUND_ACTIVE' &&
          gameState.currentPlayer === localPlayerId &&
          gameState.selectedCardIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              className={`play-button absolute z-50 ${
                layout.isCompactLandscape
                  ? 'bottom-[calc(4.9rem+var(--safe-bottom))] right-[calc(0.75rem+var(--safe-right))]'
                  : 'bottom-28 left-1/2 -translate-x-1/2 md:bottom-56'
              }`}
            >
              <button
                onClick={placeCard}
                className={`group relative flex items-center rounded-full border-white bg-gradient-to-b from-yellow-400 to-orange-500 font-black text-white transition-all hover:scale-110 active:translate-y-[8px] active:shadow-[0_0px_0_#b35900,0_5px_10px_rgba(0,0,0,0.4)] ${
                  layout.isCompactLandscape
                    ? 'gap-2 border-[3px] px-5 py-2.5 text-lg shadow-[0_6px_0_#b35900,0_12px_20px_rgba(0,0,0,0.35)]'
                    : 'gap-3 border-[4px] px-8 py-3 text-2xl shadow-[0_8px_0_#b35900,0_15px_30px_rgba(0,0,0,0.4)] md:px-12 md:py-4 md:text-3xl'
                }`}
              >
                <span>PLAY</span>
                <Play className={`${layout.isCompactLandscape ? 'h-5 w-5' : 'h-8 w-8'} fill-current transition-transform group-hover:scale-125`} />
                <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full rounded-b-none pointer-events-none">
                  <div className="absolute left-[-50%] top-0 h-[50%] w-[200%] -rotate-12 translate-y-[-50%] bg-white/30" />
                </div>
              </button>
            </motion.div>
          )}
      </AnimatePresence>

      {playerPositions.map(({ index, position }) => (
        <PlayerHand
          key={index}
          playerName={gameState.players[index].name}
          cards={gameState.players[index].cards}
          position={position}
          isCurrentPlayer={gameState.currentPlayer === index}
          isHuman={gameState.players[index].isHuman}
          isOut={gameState.players[index].isOut}
          isLocalPlayer={index === localPlayerId}
          selectedCardIdx={index === localPlayerId ? gameState.selectedCardIdx : null}
          onCardSelect={(idx) => {
            if (index === localPlayerId) {
               selectCard(idx);
            }
          }}
          layout={layout}
        />
      ))}

      <MiddleDeck cards={gameState.middleDeck} layout={layout} />

      <AnimatePresence>
        {gameState.gameStatus === 'ROUND_RESOLVING' && gameState.roundWinner !== null && (
          <RoundOverModal
            title={
              gameState.roundOutcome === 'CUT'
                ? `${gameState.players[gameState.roundWinner].name} TAKES THE PILE`
                : `${gameState.players[gameState.roundWinner].name} WINS THE ROUND`
            }
            message={
              gameState.roundOutcome === 'CUT'
                ? `${gameState.players[gameState.roundWinner].name} held the highest pre-cut card and is punished with the pile.`
                : `${gameState.players[gameState.roundWinner].name} played the top card of the trick and leads again.`
            }
            detailLabel={gameState.roundOutcome === 'CUT' ? 'Punishment Trigger' : 'Winning Card'}
            detailValue={gameState.roundOutcome === 'CUT' ? gameState.cutCard || 'Unknown' : gameState.highestCard || 'Unknown'}
            buttonLabel={localPlayerId === 0 ? "NEXT ROUND" : "WAITING FOR HOST..."}
            outcome={gameState.roundOutcome || 'NORMAL'}
            onContinue={localPlayerId === 0 ? nextRound : () => {}}
            layout={layout}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.gameStatus === 'GAME_OVER' && gameState.gameLoser !== null && (
          <RoundOverModal
            title="GAME OVER"
            message={`${gameState.players[gameState.gameLoser].name} is the last player still holding cards.`}
            detailLabel="Loser"
            detailValue={gameState.players[gameState.gameLoser].name}
            buttonLabel=""
            outcome="GAME_OVER"
            onContinue={() => {}}
            layout={layout}
          />
        )}
      </AnimatePresence>

      <KeyboardControls onPlaceCard={placeCard} />
    </div>
  );
};

function KeyboardControls({ onPlaceCard }: { onPlaceCard: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        onPlaceCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlaceCard]);

  return null;
}
