import React, { useEffect } from 'react';
import { useCardGame } from './hooks/useCardGame';
import { Card } from './components/Card';
import { PlayerHand } from './components/PlayerHand';
import { MiddleDeck } from './components/MiddleDeck';
import { RoundOverModal } from './components/RoundOverModal';

export default function App() {
  const { gameState, selectCard, placeCard, aiPlay, nextRound, restart } = useCardGame();

  // AI turn timer
  useEffect(() => {
    if (gameState.gameStatus !== 'PLAYING' || gameState.currentPlayer === 0) {
      return;
    }

    const timer = setTimeout(() => {
      aiPlay();
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameState.gameStatus, aiPlay]);

  const playerPositions = [
    { index: 0, position: 'bottom' as const },
    { index: 1, position: 'top' as const },
    { index: 2, position: 'left' as const },
    { index: 3, position: 'right' as const },
  ];

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gradient-to-b from-[#40c9ff] to-[#aadd00]">
      {/* Decorative planet curve */}
      <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-b from-[#88e633] to-[#44aa00] rounded-t-[100%] scale-150 transform origin-bottom border-t-[8px] border-[#aaff55]/50 shadow-[inset_0_20px_50px_rgba(0,0,0,0.1)] -z-10"></div>
      
      {/* Clouds effect */}
      <div className="absolute top-10 left-20 w-32 h-10 bg-white/40 rounded-full blur-sm -z-10"></div>
      <div className="absolute top-32 right-32 w-48 h-14 bg-white/30 rounded-full blur-md -z-10"></div>

      {/* Header Info */}
      <div className="absolute top-6 left-6 z-10 bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 shadow-lg">
        <h1 className="text-xl font-black text-white italic tracking-wider drop-shadow-md">VS CARD</h1>
        <p className="text-sm font-bold text-uno-yellow text-center drop-shadow-md">ROUND {gameState.turnCounter + 1}</p>
      </div>

      {/* Settings / Config (Top Right) */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button
          onClick={restart}
          className="bg-uno-red hover:bg-red-500 text-white font-bold p-3 rounded-full shadow-[0_4px_0_#990000] active:shadow-[0_0px_0_#990000] active:translate-y-1 transition-all border-2 border-white/50"
          title="Restart Game"
        >
          🔄
        </button>
      </div>

      {/* Central Action Button */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 z-30">
        {gameState.currentPlayer === 0 && gameState.selectedCardIdx !== null && (
          <button
            onClick={placeCard}
            className="animate-bounce bg-gradient-to-b from-uno-yellow to-orange-500 text-white font-black text-2xl py-3 px-10 rounded-full shadow-[0_6px_0_#b35900] border-[4px] border-white active:shadow-[0_0px_0_#b35900] active:translate-y-[6px] transition-all hover:scale-105"
          >
            PLAY CARD
          </button>
        )}
      </div>

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
      {gameState.gameStatus === 'ROUND_OVER' && gameState.roundWinner !== null && (
        <RoundOverModal
          winnerName={gameState.players[gameState.roundWinner].name}
          highestCard={gameState.highestCard || 'Unknown'}
          onContinue={nextRound}
        />
      )}

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
