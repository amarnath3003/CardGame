import type { GameCard } from './Card';
import type { Suit } from './constants';
import { compareCards } from './helpers';

export class Player {
  id: number;
  name: string;
  isHuman: boolean;
  hand: GameCard[];
  isOut: boolean;

  constructor(id: number, name: string, isHuman: boolean) {
    this.id = id;
    this.name = name;
    this.isHuman = isHuman;
    this.hand = [];
    this.isOut = false;
  }

  setHand(cards: GameCard[]): void {
    this.hand = [...cards].sort(compareCards);
  }

  addCard(card: GameCard): void {
    this.hand.push(card);
    this.hand.sort(compareCards);
  }

  addCards(cards: GameCard[]): void {
    this.hand.push(...cards);
    this.hand.sort(compareCards);
  }

  removeCard(cardId: string): GameCard | null {
    const cardIndex = this.hand.findIndex((card) => card.id === cardId);

    if (cardIndex === -1) {
      return null;
    }

    return this.hand.splice(cardIndex, 1)[0];
  }

  getCard(cardId: string): GameCard | undefined {
    return this.hand.find((card) => card.id === cardId);
  }

  hasSuit(suit: Suit): boolean {
    return this.hand.some((card) => card.suit === suit);
  }

  getCardsOfSuit(suit: Suit): GameCard[] {
    return this.hand.filter((card) => card.suit === suit);
  }
}
