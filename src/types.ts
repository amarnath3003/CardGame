export type GameStatus = 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';

export interface Card {
  value: string;
  getRank: () => string;
  getSuit: () => string;
}

export interface PlayerHand {
  id: number;
  name: string;
  cards: string[];
  isHuman: boolean;
}

export interface GameState {
  players: PlayerHand[];
  middleDeck: string[];
  garbageDeck: string[];
  currentPlayer: number;
  turnCounter: number;
  gameStatus: GameStatus;
  selectedCardIdx: number | null;
  roundWinner: number | null;
  highestCard: string | null;
}
