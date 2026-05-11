import { useState, useCallback } from 'react';
import { GameState, GameStatus } from '../types';

const ALL_CARDS = [
  "As","2s","3s","4s","5s","6s","7s","8s","9s","10s","Ks","Qs","Js",
  "Ac","2c","3c","4c","5c","6c","7c","8c","9c","10c","Kc","Qc","Jc",
  "Ah","2h","3h","4h","5h","6h","7h","8h","9h","10h","Kh","Qh","Jh",
  "Ad","2d","3d","4d","5d","6d","7d","8d","9d","10d","Kd","Qd","Jd"
];

const CARD_RANK_PRIORITY: { [key: string]: number } = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5,
  '4': 4, '3': 3, '2': 2
};

export const getCardRank = (card: string): string => {
  return card.slice(0, -1);
};

export const getCardSuit = (card: string): string => {
  return card[card.length - 1];
};

export const getCardPriority = (card: string): number => {
  const rank = getCardRank(card);
  return CARD_RANK_PRIORITY[rank] || 0;
};

export const dealCards = () => {
  const playerHands: string[][] = [[], [], [], []];
  const available = ALL_CARDS.slice();

  for (let i = 0; i < 13; i++) {
    for (let p = 0; p < 4; p++) {
      const idx = Math.floor(Math.random() * available.length);
      playerHands[p].push(available[idx]);
      available.splice(idx, 1);
    }
  }

  return playerHands;
};

export const useCardGame = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const playerHands = dealCards();
    let currentPlayer = 0;
    const middleDeck: string[] = [];

    // Start with Ace of Spades
    for (let p = 0; p < 4; p++) {
      const asIdx = playerHands[p].indexOf('As');
      if (asIdx !== -1) {
        middleDeck.push('As');
        playerHands[p].splice(asIdx, 1);
        currentPlayer = (p + 1) % 4;
        break;
      }
    }

    return {
      players: [
        { id: 0, name: 'You', cards: playerHands[0], isHuman: true },
        { id: 1, name: 'Player 2', cards: playerHands[1], isHuman: false },
        { id: 2, name: 'Player 3', cards: playerHands[2], isHuman: false },
        { id: 3, name: 'Player 4', cards: playerHands[3], isHuman: false },
      ],
      middleDeck,
      garbageDeck: [],
      currentPlayer,
      turnCounter: 0,
      gameStatus: 'PLAYING' as GameStatus,
      selectedCardIdx: null,
      roundWinner: null,
      highestCard: null,
    };
  });

  const selectCard = useCallback((index: number) => {
    if (gameState.gameStatus === 'PLAYING' && gameState.currentPlayer === 0) {
      setGameState(prev => ({
        ...prev,
        selectedCardIdx: prev.selectedCardIdx === index ? null : index,
      }));
    }
  }, [gameState.gameStatus, gameState.currentPlayer]);

  const placeCard = useCallback(() => {
    if (gameState.selectedCardIdx === null || gameState.currentPlayer !== 0) return;

    setGameState(prev => {
      const newState = { ...prev };
      const card = newState.players[0].cards[newState.selectedCardIdx!];
      
      newState.middleDeck.push(card);
      newState.players[0].cards.splice(newState.selectedCardIdx!, 1);
      newState.turnCounter += 1;
      newState.selectedCardIdx = null;
      newState.currentPlayer = (newState.currentPlayer + 1) % 4;

      if (newState.turnCounter === 4) {
        endRound(newState);
      }

      return newState;
    });
  }, [gameState.selectedCardIdx, gameState.currentPlayer]);

  const endRound = (state: GameState) => {
    let maxPriority = -1;
    let winner = -1;
    let highestCard = '';

    state.middleDeck.forEach((card) => {
      const priority = getCardPriority(card);
      if (priority > maxPriority) {
        maxPriority = priority;
        highestCard = card;
        winner = state.middleDeck.indexOf(card) % 4;
      }
    });

    state.garbageDeck.push(...state.middleDeck);
    state.middleDeck = [];
    state.gameStatus = 'ROUND_OVER';
    state.roundWinner = winner;
    state.highestCard = highestCard;

    // Add cards to losers
    for (let i = 0; i < 4; i++) {
      if (i !== winner) {
        const cardsToAdd = Math.min(5, state.garbageDeck.length);
        for (let j = 0; j < cardsToAdd; j++) {
          const idx = Math.floor(Math.random() * state.garbageDeck.length);
          state.players[i].cards.push(state.garbageDeck[idx]);
          state.garbageDeck.splice(idx, 1);
        }
      }
    }
  };

  const aiPlay = useCallback(() => {
    if (gameState.currentPlayer === 0 || gameState.gameStatus !== 'PLAYING') return;

    setGameState(prev => {
      const newState = { ...prev };
      const playerHand = newState.players[newState.currentPlayer].cards;

      if (playerHand.length > 0) {
        const cardIdx = Math.floor(Math.random() * playerHand.length);
        const card = playerHand[cardIdx];
        
        newState.middleDeck.push(card);
        playerHand.splice(cardIdx, 1);
        newState.turnCounter += 1;
        newState.currentPlayer = (newState.currentPlayer + 1) % 4;

        if (newState.turnCounter === 4) {
          endRound(newState);
        }
      }

      return newState;
    });
  }, [gameState.currentPlayer, gameState.gameStatus]);

  const nextRound = useCallback(() => {
    if (gameState.gameStatus === 'ROUND_OVER') {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'PLAYING',
        currentPlayer: (prev.roundWinner! + 1) % 4,
        turnCounter: 0,
        selectedCardIdx: null,
      }));
    }
  }, [gameState.gameStatus]);

  const restart = useCallback(() => {
    const playerHands = dealCards();
    let currentPlayer = 0;
    const middleDeck: string[] = [];

    for (let p = 0; p < 4; p++) {
      const asIdx = playerHands[p].indexOf('As');
      if (asIdx !== -1) {
        middleDeck.push('As');
        playerHands[p].splice(asIdx, 1);
        currentPlayer = (p + 1) % 4;
        break;
      }
    }

    setGameState({
      players: [
        { id: 0, name: 'You', cards: playerHands[0], isHuman: true },
        { id: 1, name: 'Player 2', cards: playerHands[1], isHuman: false },
        { id: 2, name: 'Player 3', cards: playerHands[2], isHuman: false },
        { id: 3, name: 'Player 4', cards: playerHands[3], isHuman: false },
      ],
      middleDeck,
      garbageDeck: [],
      currentPlayer,
      turnCounter: 0,
      gameStatus: 'PLAYING',
      selectedCardIdx: null,
      roundWinner: null,
      highestCard: null,
    });
  }, []);

  return {
    gameState,
    selectCard,
    placeCard,
    aiPlay,
    nextRound,
    restart,
  };
};
