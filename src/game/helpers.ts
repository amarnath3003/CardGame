import { CODE_TO_SUIT, RANK_TO_WEIGHT, SUIT_TO_CODE, type Rank, type Suit } from './constants';

export interface CardDefinition {
  id: string;
  suit: Suit;
  rank: Rank;
  weight: number;
}

const SUIT_ORDER: Record<Suit, number> = {
  spades: 0,
  hearts: 1,
  diamonds: 2,
  clubs: 3,
};

export const getCardCode = (card: Pick<CardDefinition, 'rank' | 'suit'>): string =>
  `${card.rank}${SUIT_TO_CODE[card.suit]}`;

export const getCardRankFromCode = (code: string): Rank => code.slice(0, -1) as Rank;

export const getCardSuitFromCode = (code: string): Suit => CODE_TO_SUIT[code.slice(-1)];

export const getCardWeightFromCode = (code: string): number => RANK_TO_WEIGHT[getCardRankFromCode(code)];

export const createCardId = (code: string, index: number): string => `${code}-${index}`;

export const compareCards = (left: CardDefinition, right: CardDefinition): number => {
  if (left.suit !== right.suit) {
    return SUIT_ORDER[left.suit] - SUIT_ORDER[right.suit];
  }

  return right.weight - left.weight;
};

export const cloneCardForState = (card: CardDefinition) => ({
  id: card.id,
  suit: card.suit,
  rank: card.rank,
  weight: card.weight,
  code: getCardCode(card),
});
