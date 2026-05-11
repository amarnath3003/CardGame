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
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameState.gameStatus, aiPlay]);

  const playerPositions = [
    { index: 0, position: 'bottom' as const },
    { index: 1, position: 'top' as const },
    { index: 2, position: 'left' as const },
    { index: 3, position: 'right' as const },
  ];

  return (
    <div className="w-screen h-screen bg-table-green relative overflow-hidden">
      {/* Title and Score */}
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-white">4-Player Card Game</h1>
        <p className="text-sm text-yellow-300">Round {gameState.turnCounter}</p>
      </div>

      {/* Current Turn Indicator */}
      <div className="absolute top-4 right-4 z-10 text-center">
        <p className="text-2xl font-bold text-yellow-300">
          {gameState.players[gameState.currentPlayer].name}'s Turn
        </p>
      </div>

      {/* Game Control Buttons */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        {gameState.currentPlayer === 0 && gameState.selectedCardIdx !== null && (
          <button
            onClick={placeCard}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Place Card (SPACE)
          </button>
        )}
        <button
          onClick={restart}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Restart Game
        </button>
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
