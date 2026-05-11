import { useCallback, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import type { GameState } from '../types';

const CARD_RANK_PRIORITY: Record<string, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
};

export const getCardRank = (card: string): string => card.slice(0, -1);

export const getCardSuit = (card: string): string => card[card.length - 1];

export const getCardPriority = (card: string): number => CARD_RANK_PRIORITY[getCardRank(card)] || 0;

export const useCardGame = () => {
  const engineRef = useRef<GameEngine>(new GameEngine());
  const [gameState, setGameState] = useState<GameState>(() => engineRef.current.initializeGame());

  const syncState = useCallback((selectedCardIdx: number | null = null) => {
    setGameState({
      ...engineRef.current.getState(),
      selectedCardIdx,
    });
  }, []);

  const selectCard = useCallback(
    (index: number) => {
      if (gameState.gameStatus !== 'ROUND_ACTIVE' || gameState.currentPlayer !== 0 || gameState.players[0].isOut) {
        return;
      }

      const humanPlayer = gameState.players[0];
      const cardCode = humanPlayer.cards[index];

      if (!cardCode) {
        return;
      }

      const legalMoves = new Set(humanPlayer.legalMoves);

      if (legalMoves.size > 0 && !legalMoves.has(cardCode)) {
        console.log(`[useCardGame] Illegal selection blocked for human player: ${cardCode}`);
        return;
      }

      const nextSelection = gameState.selectedCardIdx === index ? null : index;
      syncState(nextSelection);
    },
    [gameState, syncState],
  );

  const placeCard = useCallback(() => {
    if (gameState.selectedCardIdx === null || gameState.currentPlayer !== 0) {
      return;
    }

    const humanPlayer = gameState.players[0];
    const selectedCardId = humanPlayer.cardIds[gameState.selectedCardIdx];

    if (!selectedCardId) {
      return;
    }

    const result = engineRef.current.playCard(0, selectedCardId);

    console.log(`[useCardGame] Human play result: ${result.event}. ${result.message}`);
    syncState(null);
  }, [gameState, syncState]);

  const aiPlay = useCallback(() => {
    const state = engineRef.current.getState();

    if (state.currentPlayer === 0 || state.gameStatus !== 'ROUND_ACTIVE') {
      return;
    }

    const currentPlayer = state.players[state.currentPlayer];

    if (!currentPlayer || currentPlayer.isOut) {
      return;
    }

    const legalMoves = engineRef.current.getLegalMoves(currentPlayer.id);

    if (legalMoves.length === 0) {
      return;
    }

    const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    const result = engineRef.current.playCard(currentPlayer.id, chosenMove.id);

    console.log(`[useCardGame] AI play result: ${result.event}. ${result.message}`);
    syncState(null);
  }, [syncState]);

  const nextRound = useCallback(() => {
    if (gameState.gameStatus !== 'ROUND_RESOLVING') {
      return;
    }

    engineRef.current.startNextRound();
    syncState(null);
  }, [gameState.gameStatus, syncState]);

  const restart = useCallback(() => {
    engineRef.current = new GameEngine();
    engineRef.current.initializeGame();
    syncState(null);
  }, [syncState]);

  return {
    gameState,
    legalMoves: gameState.players[0]?.legalMoves ?? [],
    selectCard,
    placeCard,
    aiPlay,
    nextRound,
    restart,
  };
};
