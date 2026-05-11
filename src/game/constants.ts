export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export const SUIT_TO_CODE: Record<Suit, string> = {
  spades: 's',
  hearts: 'h',
  diamonds: 'd',
  clubs: 'c',
};

export const CODE_TO_SUIT: Record<string, Suit> = {
  s: 'spades',
  h: 'hearts',
  d: 'diamonds',
  c: 'clubs',
};

export const RANK_TO_WEIGHT: Record<Rank, number> = {
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

export const PLAYER_COUNT = 4;
export const CARDS_PER_PLAYER = 13;
export const ACE_OF_SPADES_CODE = 'As';

export const EVENT_TYPES = {
  gameInitialized: 'GAME_INITIALIZED',
  roundStarted: 'ROUND_STARTED',
  cardPlayed: 'CARD_PLAYED',
  cutOccurred: 'CUT_OCCURRED',
  roundWon: 'ROUND_WON',
  punishmentApplied: 'PUNISHMENT_APPLIED',
  playerEliminated: 'PLAYER_ELIMINATED',
  gameOver: 'GAME_OVER',
} as const;
