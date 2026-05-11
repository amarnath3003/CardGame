import React, { useEffect, useState } from 'react';
import { useCardGame } from './hooks/useCardGame';
import { PlayerHand } from './components/PlayerHand';
import { MiddleDeck } from './components/MiddleDeck';
import { RoundOverModal } from './components/RoundOverModal';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play } from 'lucide-react';

export default function App() {
  const { gameState, selectCard, placeCard, aiPlay, nextRound, restart } = useCardGame();

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

  const isLandscape = viewport.width > viewport.height;

  // AI turn timer
  useEffect(() => {
    if (gameState.gameStatus !== 'PLAYING' || gameState.currentPlayer === 0) {
      return;
    }

    const timer = setTimeout(() => {
      aiPlay();
    }, 1500);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameState.gameStatus, aiPlay]);

  const playerPositions = [
    { index: 0, position: 'bottom' as const },
    { index: 1, position: 'top' as const },
    { index: 2, position: 'left' as const },
    { index: 3, position: 'right' as const },
  ];

  return (
    <div className={`game-root ${isLandscape ? 'landscape-tight' : ''} min-h-[100dvh] w-full relative overflow-hidden bg-gradient-to-b from-[#1a8cff] via-[#4dd2ff] to-[#aadd00]`}>
      {/* Decorative planet / world base */}
      <div className="absolute -bottom-[60vh] left-1/2 -translate-x-1/2 w-[200vw] h-[120vh] bg-gradient-to-b from-[#88e633] to-[#44aa00] rounded-[100%] border-t-[12px] border-[#aaff55]/50 shadow-[inset_0_40px_80px_rgba(0,100,0,0.4)] pointer-events-none" />
      
      {/* Dynamic Clouds */}
      <motion.div animate={{ x: [-100, viewport.width + 100] }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute top-10 md:top-20 left-0 w-36 h-12 md:w-48 md:h-16 bg-white/40 rounded-full blur-md pointer-events-none" />
      <motion.div animate={{ x: [-200, viewport.width + 200] }} transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: 10 }} className="absolute top-24 md:top-40 right-0 w-48 h-14 md:w-64 md:h-20 bg-white/30 rounded-full blur-xl pointer-events-none" />

      {/* Header Info */}
      <div className="game-header absolute top-3 left-3 md:top-6 md:left-6 z-30 bg-white/20 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full border-2 border-white/50 shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex items-center gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">CARD GAME</h1>
        <div className="h-8 w-[2px] bg-white/30" />
        <p className="text-base md:text-xl font-bold text-yellow-300 drop-shadow-md">ROUND {gameState.turnCounter + 1}</p>
      </div>

      {/* Settings / Restart (Top Right) */}
      <div className="game-restart absolute top-3 right-3 md:top-6 md:right-6 z-30">
        <button
          onClick={restart}
          className="bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-3 md:p-4 rounded-full shadow-[0_6px_0_#990000,0_10px_20px_rgba(0,0,0,0.3)] active:shadow-[0_0px_0_#990000,0_5px_10px_rgba(0,0,0,0.3)] active:translate-y-[6px] transition-all border-2 border-white"
          title="Restart Game"
        >
          <RotateCcw strokeWidth={3} size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      {/* Central Action Button for Human Player */}
      <AnimatePresence>
        {gameState.currentPlayer === 0 && gameState.selectedCardIdx !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="play-button absolute bottom-28 md:bottom-56 left-1/2 transform -translate-x-1/2 z-50"
          >
            <button
              onClick={placeCard}
              className="group relative bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-2xl md:text-3xl py-3 md:py-4 px-8 md:px-12 rounded-full shadow-[0_8px_0_#b35900,0_15px_30px_rgba(0,0,0,0.4)] border-[4px] border-white active:shadow-[0_0px_0_#b35900,0_5px_10px_rgba(0,0,0,0.4)] active:translate-y-[8px] transition-all hover:scale-110 flex items-center gap-3"
            >
              <span>PLAY</span>
              <Play className="w-8 h-8 fill-current group-hover:scale-125 transition-transform" />
              
              {/* Shine effect */}
              <div className="absolute inset-0 w-full h-full overflow-hidden rounded-full rounded-b-none pointer-events-none">
                <div className="absolute w-[200%] h-[50%] bg-white/30 top-0 left-[-50%] transform -rotate-12 translate-y-[-50%]" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Players' Hands */}
      {playerPositions.map(({ index, position }) => (
        <PlayerHand
          key={index}
          playerName={gameState.players[index].name}
          cards={gameState.players[index].cards}
          position={position}
          isCurrentPlayer={gameState.currentPlayer === index}
          isHuman={gameState.players[index].isHuman}
          selectedCardIdx={gameState.selectedCardIdx}
          onCardSelect={(idx) => selectCard(idx)}
        />
      ))}

      {/* Middle Deck */}
      <MiddleDeck cards={gameState.middleDeck} />

      {/* Round Over Modal */}
      <AnimatePresence>
        {gameState.gameStatus === 'ROUND_OVER' && gameState.roundWinner !== null && (
          <RoundOverModal
            winnerName={gameState.players[gameState.roundWinner].name}
            highestCard={gameState.highestCard || 'Unknown'}
            onContinue={nextRound}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Controls */}
      <KeyboardControls onPlaceCard={placeCard} />
    </div>
  );
}

function KeyboardControls({ onPlaceCard }: { onPlaceCard: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onPlaceCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlaceCard]);

  return null;
}
