import { RANK_TO_WEIGHT, type Rank, type Suit } from './constants';
import { getCardCode } from './helpers';

export class GameCard {
  id: string;
  suit: Suit;
  rank: Rank;
  weight: number;

  constructor(id: string, suit: Suit, rank: Rank) {
    this.id = id;
    this.suit = suit;
    this.rank = rank;
    this.weight = RANK_TO_WEIGHT[rank];
  }

  toCode(): string {
    return getCardCode(this);
  }
}
