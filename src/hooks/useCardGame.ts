import { useCallback, useState } from 'react';
import { useMultiplayer } from '../contexts/MultiplayerContext';
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
  const { gameState, localPlayerId, playCard: mpPlayCard, nextRound: mpNextRound, restartGame: mpRestartGame } = useMultiplayer();
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  const selectCard = useCallback(
    (index: number) => {
      if (!gameState || gameState.gameStatus !== 'ROUND_ACTIVE' || gameState.currentPlayer !== localPlayerId || gameState.players[localPlayerId].isOut) {
        return;
      }

      const humanPlayer = gameState.players[localPlayerId];
      const cardCode = humanPlayer.cards[index];

      if (!cardCode) {
        return;
      }

      const legalMoves = new Set(humanPlayer.legalMoves);

      if (legalMoves.size > 0 && !legalMoves.has(cardCode)) {
        console.log(`[useCardGame] Illegal selection blocked for human player: ${cardCode}`);
        return;
      }

      const nextSelection = selectedCardIdx === index ? null : index;
      setSelectedCardIdx(nextSelection);
    },
    [gameState, localPlayerId, selectedCardIdx],
  );

  const placeCard = useCallback(() => {
    if (!gameState || selectedCardIdx === null || gameState.currentPlayer !== localPlayerId) {
      return;
    }

    const humanPlayer = gameState.players[localPlayerId];
    const selectedCardId = humanPlayer.cardIds[selectedCardIdx];

    if (!selectedCardId) {
      return;
    }

    mpPlayCard(localPlayerId, selectedCardId);
    setSelectedCardIdx(null);
  }, [gameState, localPlayerId, selectedCardIdx, mpPlayCard]);

  const aiPlay = useCallback(() => {
    // Handled by host in MultiplayerContext automatically
  }, []);

  const nextRound = useCallback(() => {
    if (gameState?.gameStatus !== 'ROUND_RESOLVING') {
      return;
    }

    mpNextRound(localPlayerId);
  }, [gameState, localPlayerId, mpNextRound]);

  const restart = useCallback(() => {
    mpRestartGame(localPlayerId);
  }, [localPlayerId, mpRestartGame]);

  return {
    // @ts-ignore
    gameState: gameState ? { ...gameState, selectedCardIdx } : null,
    localPlayerId,
    legalMoves: gameState?.players[localPlayerId]?.legalMoves ?? [],
    selectCard,
    placeCard,
    aiPlay,
    nextRound,
    restart,
  };
};
