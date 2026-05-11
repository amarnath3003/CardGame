import { ACE_OF_SPADES_CODE, CARDS_PER_PLAYER, PLAYER_COUNT, RANKS, SUITS, SUIT_TO_CODE } from './constants';
import { GameCard } from './Card';
import { createCardId } from './helpers';

export class Deck {
  cards: GameCard[];

  constructor() {
    this.cards = [];
    let index = 0;

    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const code = `${rank}${SUIT_TO_CODE[suit]}`;
        this.cards.push(new GameCard(createCardId(code, index), suit, rank));
        index += 1;
      }
    }
  }

  shuffle(): void {
    for (let index = this.cards.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [this.cards[index], this.cards[swapIndex]] = [this.cards[swapIndex], this.cards[index]];
    }
  }

  deal(): GameCard[][] {
    if (this.cards.length !== PLAYER_COUNT * CARDS_PER_PLAYER) {
      throw new Error('Deck is not ready for dealing.');
    }

    const hands = Array.from({ length: PLAYER_COUNT }, () => [] as GameCard[]);

    for (let round = 0; round < CARDS_PER_PLAYER; round += 1) {
      for (let playerIndex = 0; playerIndex < PLAYER_COUNT; playerIndex += 1) {
        const nextCard = this.cards.pop();

        if (!nextCard) {
          throw new Error('Deck ran out of cards while dealing.');
        }

        hands[playerIndex].push(nextCard);
      }
    }

    return hands;
  }

  findAceOfSpadesOwner(hands: GameCard[][]): { playerIndex: number; cardId: string } {
    for (let playerIndex = 0; playerIndex < hands.length; playerIndex += 1) {
      const aceOfSpades = hands[playerIndex].find((card) => card.toCode() === ACE_OF_SPADES_CODE);

      if (aceOfSpades) {
        return { playerIndex, cardId: aceOfSpades.id };
      }
    }

    throw new Error('Ace of Spades was not found in the dealt hands.');
  }
}
