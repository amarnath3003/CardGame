export type GameStatus = 'WAITING' | 'ROUND_ACTIVE' | 'ROUND_RESOLVING' | 'GAME_OVER';
export type RoundOutcome = 'NORMAL' | 'CUT';
export type LayoutMode = 'default' | 'compactLandscape';
export type CardVisualSize = 'xs' | 'sm' | 'md' | 'lg';

export interface Card {
  value: string;
  getRank: () => string;
  getSuit: () => string;
}

export interface PlayerHand {
  id: number;
  name: string;
  cards: string[];
  cardIds: string[];
  cardCount: number;
  isHuman: boolean;
  isOut: boolean;
  legalMoves: string[];
}

export interface StateCard {
  id: string;
  suit: string;
  rank: string;
  weight: number;
  code: string;
}

export interface MiddlePileEntry {
  playerId: number;
  card: StateCard;
  isCut: boolean;
}

export interface RoundHistoryEntry {
  roundNumber: number;
  outcome: RoundOutcome;
  starterPlayerId: number;
  winnerPlayerId: number | null;
  punishedPlayerId: number | null;
  highestCard: string | null;
  cutCard: string | null;
  pileCards: string[];
}

export interface GameEvent {
  type: string;
  playerId?: number;
  card?: string;
  message: string;
}

export interface PlayCardResult {
  success: boolean;
  event: string;
  updatedState: GameState;
  message: string;
  events: GameEvent[];
}

export interface GameState {
  players: PlayerHand[];
  middleDeck: string[];
  middlePile: MiddlePileEntry[];
  currentPlayer: number;
  startingPlayer: number;
  turnCounter: number;
  gameStatus: GameStatus;
  selectedCardIdx: number | null;
  roundWinner: number | null;
  highestCard: string | null;
  requiredSuit: string | null;
  leadSuit: string | null;
  roundNumber: number;
  roundActiveCount: number;
  trickPlays: { card: string; playerId: number; isCut: boolean }[];
  roundOutcome: RoundOutcome | null;
  nextStarter: number | null;
  cutCard: string | null;
  gameLoser: number | null;
  gameStarted: boolean;
  gameOver: boolean;
  loser: number | null;
  activePlayers: number[];
  roundHistory: RoundHistoryEntry[];
  events: GameEvent[];
  message: string;
}

export interface LayoutMetrics {
  mode: LayoutMode;
  viewportWidth: number;
  viewportHeight: number;
  isCompactLandscape: boolean;
}
