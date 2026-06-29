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

const SUIT_NAMES: Record<string, string> = {
  s: 'Spades',
  c: 'Clubs',
  h: 'Hearts',
  d: 'Diamonds',
};

const RANK_NAMES: Record<string, string> = {
  A: 'Ace',
  K: 'King',
  Q: 'Queen',
  J: 'Jack',
};

export const formatCardName = (card: string): string => {
  if (!card || card === 'Unknown') return card;
  const rank = getCardRank(card);
  const suit = getCardSuit(card);
  
  const rankName = RANK_NAMES[rank] || rank;
  const suitName = SUIT_NAMES[suit] || suit;
  
  return `${rankName} of ${suitName}`;
};

export const useCardGame = () => {
  const { gameState, localPlayerId, playCard: mpPlayCard, nextRound: mpNextRound, buyCards: mpBuyCards } = useMultiplayer();
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  const buyCards = useCallback((targetPlayerId: number) => {
    if (!gameState) return;
    mpBuyCards(targetPlayerId, localPlayerId);
  }, [gameState, localPlayerId, mpBuyCards]);

  const selectCard = useCallback(
    (index: number) => {
      if (!gameState || gameState.gameStatus !== 'ROUND_ACTIVE' || gameState.currentPlayer !== localPlayerId || gameState.players[localPlayerId].isOut) {
        return;
      }

      if (gameState.roundStartAt !== null) {
        const readyAt = gameState.roundStartAt + gameState.roundStartDelayMs;
        if (Date.now() < readyAt) {
          return;
        }
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

      setSelectedCardIdx((prev) => (prev === index ? null : index));
    },
    [gameState, localPlayerId],
  );

  const placeCard = useCallback(() => {
    if (!gameState || selectedCardIdx === null || gameState.currentPlayer !== localPlayerId) {
      return;
    }

    if (gameState.roundStartAt !== null) {
      const readyAt = gameState.roundStartAt + gameState.roundStartDelayMs;
      if (Date.now() < readyAt) {
        return;
      }
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

  return {
    gameState: gameState ? ({ ...gameState, selectedCardIdx } as GameState & { selectedCardIdx: number | null }) : null,
    localPlayerId,
    legalMoves: gameState?.players[localPlayerId]?.legalMoves ?? [],
    selectCard,
    placeCard,
    aiPlay,
    nextRound,
    buyCards,
  };
};
