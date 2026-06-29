import { GameCard } from './Card';
import { Deck } from './Deck';
import { Player } from './Player';
import { ACE_OF_SPADES_CODE, EVENT_TYPES, type Rank, type Suit } from './constants';
import { cloneCardForState, getCardCode } from './helpers';
import type { GameEvent, GameState, MiddlePileEntry, PlayCardResult, RoundHistoryEntry } from '../types';

const DEFAULT_PLAYER_NAMES = ['You', 'Player 2', 'Player 3', 'Player 4'];

export class GameEngine {
  players: Player[];
  currentPlayerIndex: number;
  startingPlayerIndex: number;
  leadSuit: Suit | null;
  middlePile: MiddlePileEntry[];
  roundHistory: RoundHistoryEntry[];
  gameStarted: boolean;
  gameOver: boolean;
  loser: number | null;
  gameStatus: GameState['gameStatus'];
  roundNumber: number;
  roundActiveCount: number;
  roundWinner: number | null;
  highestCard: string | null;
  roundOutcome: GameState['roundOutcome'];
  nextStarter: number | null;
  cutCard: string | null;
  activePlayers: number[];
  lastEvents: GameEvent[];
  lastMessage: string;
  roundStartAt: number | null;
  roundStartDelayMs: number;

  constructor(players: { name: string; avatarIndex: number }[] = []) {
    if (players.length === 0) {
      this.players = DEFAULT_PLAYER_NAMES.map((name, index) => new Player(index, name, index === 0, index));
    } else {
      this.players = players.map((p, index) => new Player(index, p.name, index === 0, p.avatarIndex));
    }
    this.currentPlayerIndex = 0;
    this.startingPlayerIndex = 0;
    this.leadSuit = null;
    this.middlePile = [];
    this.roundHistory = [];
    this.gameStarted = false;
    this.gameOver = false;
    this.loser = null;
    this.gameStatus = 'WAITING';
    this.roundNumber = 0;
    this.roundActiveCount = 0;
    this.roundWinner = null;
    this.highestCard = null;
    this.roundOutcome = null;
    this.nextStarter = null;
    this.cutCard = null;
    this.activePlayers = [];
    this.lastEvents = [];
    this.lastMessage = '';
    this.roundStartAt = null;
    this.roundStartDelayMs = 5000;
  }

  initializeGame(): GameState {
    console.log('[GameEngine] Initializing game.');

    const deck = new Deck();
    deck.shuffle();
    const dealtHands = deck.deal();

    this.players.forEach((player, index) => {
      player.setHand(dealtHands[index]);
      player.isOut = false;
    });

    const aceOfSpadesOwner = deck.findAceOfSpadesOwner(dealtHands);
    this.middlePile = [];
    this.roundHistory = [];
    this.gameStarted = true;
    this.gameOver = false;
    this.loser = null;
    this.roundNumber = 1;
    this.roundWinner = null;
    this.highestCard = ACE_OF_SPADES_CODE;
    this.roundOutcome = null;
    this.nextStarter = aceOfSpadesOwner.playerIndex;
    this.cutCard = null;
    this.lastEvents = [];
    this.lastMessage = 'Game initialized.';

    this.recomputeActivePlayers();
    this.startingPlayerIndex = aceOfSpadesOwner.playerIndex;
    this.roundActiveCount = this.activePlayers.length;
    this.gameStatus = 'ROUND_ACTIVE';
    this.leadSuit = 'spades';
    this.roundStartAt = Date.now();

    const openingCard = this.players[aceOfSpadesOwner.playerIndex].removeCard(aceOfSpadesOwner.cardId);

    if (!openingCard) {
      throw new Error('Opening Ace of Spades could not be removed from the starting player.');
    }

    this.middlePile.push({
      playerId: aceOfSpadesOwner.playerIndex,
      card: cloneCardForState(openingCard),
      isCut: false,
    });

    this.currentPlayerIndex = this.getNextActivePlayer(aceOfSpadesOwner.playerIndex);
    this.lastEvents = [
      {
        type: EVENT_TYPES.gameInitialized,
        message: `${this.players[aceOfSpadesOwner.playerIndex].name} opened with Ace of Spades.`,
      },
      {
        type: EVENT_TYPES.roundStarted,
        playerId: aceOfSpadesOwner.playerIndex,
        card: ACE_OF_SPADES_CODE,
        message: `Round 1 started. Lead suit is spades.`,
      },
    ];

    console.log(
      `[GameEngine] Round 1 started by player ${aceOfSpadesOwner.playerIndex} with ${ACE_OF_SPADES_CODE}. Next player: ${this.currentPlayerIndex}.`,
    );

    return this.getState();
  }

  getState(): GameState {
    return {
      players: this.players.map((player) => ({
        id: player.id,
        name: player.name,
        avatarIndex: player.avatarIndex,
        cards: player.hand.map((card) => getCardCode(card)),
        cardIds: player.hand.map((card) => card.id),
        cardCount: player.hand.length,
        isHuman: player.isHuman,
        isOut: player.isOut,
        legalMoves:
          this.gameStatus === 'ROUND_ACTIVE' && this.currentPlayerIndex === player.id
            ? this.getLegalMoves(player.id).map((card) => card.code)
            : [],
      })),
      middleDeck: this.middlePile.map((entry) => entry.card.code),
      middlePile: this.middlePile.map((entry) => ({
        playerId: entry.playerId,
        card: { ...entry.card },
        isCut: entry.isCut,
      })),
      currentPlayer: this.currentPlayerIndex,
      startingPlayer: this.startingPlayerIndex,
      turnCounter: this.middlePile.length,
      gameStatus: this.gameStatus,
      selectedCardIdx: null,
      roundWinner: this.roundWinner,
      highestCard: this.highestCard,
      requiredSuit: this.leadSuit,
      leadSuit: this.leadSuit,
      roundNumber: this.roundNumber,
      roundStartAt: this.roundStartAt,
      roundStartDelayMs: this.roundStartDelayMs,
      roundActiveCount: this.roundActiveCount,
      trickPlays: this.middlePile.map((entry) => ({
        playerId: entry.playerId,
        card: entry.card.code,
        isCut: entry.isCut,
      })),
      roundOutcome: this.roundOutcome,
      nextStarter: this.nextStarter,
      cutCard: this.cutCard,
      gameLoser: this.loser,
      gameStarted: this.gameStarted,
      gameOver: this.gameOver,
      loser: this.loser,
      activePlayers: [...this.activePlayers],
      roundHistory: this.roundHistory.map((entry) => ({ ...entry })),
      events: this.lastEvents.map((event) => ({ ...event })),
      message: this.lastMessage,
    };
  }

  getPlayer(playerId: number): Player {
    const player = this.players[playerId];

    if (!player) {
      throw new Error(`Player ${playerId} does not exist.`);
    }

    return player;
  }

  getLegalMoves(playerId: number): Array<{ id: string; code: string }> {
    const player = this.getPlayer(playerId);

    if (player.isOut) {
      return [];
    }

    if (!this.leadSuit) {
      return player.hand.map((card) => ({ id: card.id, code: getCardCode(card) }));
    }

    const suitedCards = player.getCardsOfSuit(this.leadSuit);
    const playableCards = suitedCards.length > 0 ? suitedCards : player.hand;

    return playableCards.map((card) => ({ id: card.id, code: getCardCode(card) }));
  }

  canPlayerPlayCard(playerId: number, cardId: string): { valid: boolean; message: string } {
    if (!this.gameStarted) {
      return { valid: false, message: 'Game has not started.' };
    }

    if (this.gameOver || this.gameStatus === 'GAME_OVER') {
      return { valid: false, message: 'Game is already over.' };
    }

    if (this.gameStatus !== 'ROUND_ACTIVE') {
      return { valid: false, message: 'Round is not ready for a new play yet.' };
    }

    if (this.roundStartAt !== null) {
      const readyAt = this.roundStartAt + this.roundStartDelayMs;
      if (Date.now() < readyAt) {
        return { valid: false, message: 'Round countdown in progress.' };
      }
    }

    if (playerId !== this.currentPlayerIndex) {
      return { valid: false, message: 'It is not this player\'s turn.' };
    }

    const player = this.getPlayer(playerId);

    if (player.isOut) {
      return { valid: false, message: 'This player has already gone out.' };
    }

    const card = player.getCard(cardId);

    if (!card) {
      return { valid: false, message: 'Card is not in the player hand.' };
    }

    if (this.leadSuit && player.hasSuit(this.leadSuit) && card.suit !== this.leadSuit) {
      return {
        valid: false,
        message: `${player.name} must follow ${this.leadSuit}.`,
      };
    }

    return { valid: true, message: 'Card play is legal.' };
  }

  isCut(card: GameCard, player: Player): boolean {
    if (!this.leadSuit) {
      return false;
    }

    const hasLeadSuit = player.hasSuit(this.leadSuit);
    return !hasLeadSuit && card.suit !== this.leadSuit;
  }

  playCard(playerId: number, cardId: string): PlayCardResult {
    const validation = this.canPlayerPlayCard(playerId, cardId);

    if (!validation.valid) {
      console.log(`[GameEngine] Rejected play from player ${playerId}: ${validation.message}`);

      return {
        success: false,
        event: 'INVALID_PLAY',
        updatedState: this.getState(),
        message: validation.message,
        events: [],
      };
    }

    const player = this.getPlayer(playerId);
    const card = player.removeCard(cardId);

    if (!card) {
      return {
        success: false,
        event: 'INVALID_PLAY',
        updatedState: this.getState(),
        message: 'Card could not be removed from the hand.',
        events: [],
      };
    }

    if (!this.leadSuit) {
      this.leadSuit = card.suit;
      this.startingPlayerIndex = playerId;
      console.log(`[GameEngine] Round ${this.roundNumber} lead suit set to ${this.leadSuit} by player ${playerId}.`);
    }

    const cut = this.isCut(card, player);
    const cardCode = getCardCode(card);

    console.log(
      `[GameEngine] Player ${playerId} plays ${cardCode}. Lead suit: ${this.leadSuit}. Cut: ${cut}.`,
    );

    this.lastEvents = [
      {
        type: EVENT_TYPES.cardPlayed,
        playerId,
        card: cardCode,
        message: `${player.name} played ${cardCode}.`,
      },
    ];

    this.middlePile.push({
      playerId,
      card: cloneCardForState(card),
      isCut: cut,
    });

    if (cut) {
      this.lastEvents.push({
        type: EVENT_TYPES.cutOccurred,
        playerId,
        card: cardCode,
        message: `${player.name} cut because they could not follow ${this.leadSuit}.`,
      });

      return this.resolveRound(true);
    }

    if (this.middlePile.length >= this.roundActiveCount) {
      return this.resolveRound(false);
    }

    this.currentPlayerIndex = this.getNextActivePlayer(playerId);
    this.lastMessage = `${player.name} played ${cardCode}. ${this.players[this.currentPlayerIndex].name} is up next.`;

    return {
      success: true,
      event: EVENT_TYPES.cardPlayed,
      updatedState: this.getState(),
      message: this.lastMessage,
      events: this.lastEvents,
    };
  }

  getHighestMiddleCard(): { playerId: number; card: MiddlePileEntry['card'] } {
    const eligiblePlays = this.middlePile.filter(
      (entry) => !entry.isCut && (!!this.leadSuit ? entry.card.suit === this.leadSuit : true),
    );

    if (eligiblePlays.length === 0) {
      throw new Error('No eligible cards are available to resolve the round.');
    }

    return eligiblePlays.reduce((highest, current) => (current.card.weight > highest.card.weight ? current : highest));
  }

  getNextRoundStarter(preferredPlayerId: number): number {
    const preferredPlayer = this.getPlayer(preferredPlayerId);

    if (!preferredPlayer.isOut) {
      return preferredPlayerId;
    }

    return this.getNextActivePlayer(preferredPlayerId);
  }

  resolveRound(cutOccurred: boolean): PlayCardResult {
    this.gameStatus = 'ROUND_RESOLVING';

    const highestPlay = this.getHighestMiddleCard();
    this.roundWinner = highestPlay.playerId;
    this.highestCard = highestPlay.card.code;
    this.roundOutcome = cutOccurred ? 'CUT' : 'NORMAL';
    this.cutCard = cutOccurred ? this.middlePile[this.middlePile.length - 1].card.code : null;
    this.nextStarter = highestPlay.playerId;

    console.log(
      `[GameEngine] Resolving round ${this.roundNumber}. Highest pre-resolution card: ${this.highestCard} by player ${highestPlay.playerId}.`,
    );

    if (cutOccurred) {
      const punishedPlayer = this.getPlayer(highestPlay.playerId);
      const returnedCards = this.middlePile.map((entry) => entry.card.code);

      punishedPlayer.addCards(
        this.middlePile.map((entry) => new GameCard(entry.card.id, entry.card.suit as Suit, entry.card.rank as Rank)),
      );

      console.log(
        `[GameEngine] Cut punishment: player ${highestPlay.playerId} takes back ${returnedCards.join(', ')} and starts next round.`,
      );

      this.lastEvents.push({
        type: EVENT_TYPES.punishmentApplied,
        playerId: highestPlay.playerId,
        card: this.highestCard,
        message: `${punishedPlayer.name} takes the pile after the cut.`,
      });

      this.lastMessage = `${punishedPlayer.name} takes the pile and will lead the next round.`;
    } else {
      console.log(`[GameEngine] Normal round win: player ${highestPlay.playerId} starts next round.`);

      this.lastEvents.push({
        type: EVENT_TYPES.roundWon,
        playerId: highestPlay.playerId,
        card: this.highestCard,
        message: `${this.players[highestPlay.playerId].name} won the round with ${this.highestCard}.`,
      });

      this.lastMessage = `${this.players[highestPlay.playerId].name} won the round with ${this.highestCard}.`;
    }

    this.roundHistory.push(this.buildRoundHistoryEntry(highestPlay.playerId));
    this.updatePlayerStatus();
    this.recomputeActivePlayers();

    if (this.checkGameOver()) {
      return {
        success: true,
        event: EVENT_TYPES.gameOver,
        updatedState: this.getState(),
        message: this.lastMessage,
        events: this.lastEvents,
      };
    }

    this.nextStarter = this.getNextRoundStarter(highestPlay.playerId);
    this.currentPlayerIndex = this.nextStarter;
    console.log(
      `[GameEngine] Next round starter resolved to player ${this.nextStarter} after elimination checks.`,
    );

    return {
      success: true,
      event: cutOccurred ? EVENT_TYPES.cutOccurred : EVENT_TYPES.roundWon,
      updatedState: this.getState(),
      message: this.lastMessage,
      events: this.lastEvents,
    };
  }

  startNextRound(): GameState {
    if (this.gameStatus === 'GAME_OVER') {
      return this.getState();
    }

    if (this.nextStarter === null) {
      return this.getState();
    }

    this.roundNumber += 1;
    this.startingPlayerIndex = this.getNextRoundStarter(this.nextStarter);
    this.currentPlayerIndex = this.startingPlayerIndex;
    this.middlePile = [];
    this.leadSuit = null;
    this.roundWinner = null;
    this.highestCard = null;
    this.roundOutcome = null;
    this.cutCard = null;
    this.gameStatus = 'ROUND_ACTIVE';
    this.roundActiveCount = this.activePlayers.length;
    this.roundStartAt = Date.now();
    this.lastEvents = [
      {
        type: EVENT_TYPES.roundStarted,
        playerId: this.startingPlayerIndex,
        message: `Round ${this.roundNumber} started. ${this.players[this.startingPlayerIndex].name} leads.`,
      },
    ];
    this.lastMessage = `${this.players[this.startingPlayerIndex].name} starts round ${this.roundNumber}.`;

    console.log(
      `[GameEngine] Starting round ${this.roundNumber}. Starter: player ${this.startingPlayerIndex}. Active players: ${this.activePlayers.join(', ')}.`,
    );

    return this.getState();
  }

  getNextActivePlayer(fromPlayerId: number): number {
    if (fromPlayerId < 0 || fromPlayerId >= this.players.length) {
      console.warn(`[GameEngine] Invalid player ID ${fromPlayerId}, defaulting to 0`);
      return 0;
    }

    for (let offset = 1; offset <= this.players.length; offset += 1) {
      const candidateId = (fromPlayerId + offset) % this.players.length;

      if (!this.players[candidateId].isOut) {
        return candidateId;
      }
    }

    return fromPlayerId;
  }

  buyAllCards(buyerId: number, targetId: number): void {
    if (this.gameStatus !== 'ROUND_ACTIVE' || this.middlePile.length > 0) {
      console.log('[GameEngine] Cannot buy cards mid-round or outside active round.');
      return;
    }

    // ✅ Add countdown guard matching canPlayerPlayCard
    if (this.roundStartAt !== null) {
      const readyAt = this.roundStartAt + this.roundStartDelayMs;
      if (Date.now() < readyAt) {
        console.log('[GameEngine] Cannot buy cards during round countdown.');
        return;
      }
    }

    const buyer = this.getPlayer(buyerId);
    const target = this.getPlayer(targetId);

    if (buyer.isOut || target.isOut) {
      console.log('[GameEngine] Cannot buy cards if either player is out.');
      return;
    }

    const cardsToTransfer = [...target.hand];
    target.hand = [];
    buyer.addCards(cardsToTransfer);

    console.log(`[GameEngine] Player ${buyerId} bought all cards from player ${targetId}.`);

    this.lastEvents.push({
      type: EVENT_TYPES.cardPlayed, // or a new type but string is fine
      playerId: buyerId,
      message: `${buyer.name} bought all cards from ${target.name}.`,
    });

    this.lastMessage = `${buyer.name} bought all cards from ${target.name}. ${target.name} is safe!`;

    // Target player has 0 cards now, so this will mark them as isOut = true and safe
    this.updatePlayerStatus();
    this.recomputeActivePlayers();

    if (this.currentPlayerIndex === targetId && !this.gameOver) {
      this.currentPlayerIndex = this.getNextActivePlayer(targetId);
      this.lastMessage = `${target.name} is safe. ${this.players[this.currentPlayerIndex].name} is up next.`;
    }

    if (this.checkGameOver()) {
      return;
    }
  }

  updatePlayerStatus(): void {
    const newlyEliminated: number[] = [];

    this.players.forEach((player) => {
      const shouldBeOut = player.hand.length === 0;

      if (shouldBeOut && !player.isOut) {
        newlyEliminated.push(player.id);
      }

      player.isOut = shouldBeOut;
    });

    if (newlyEliminated.length > 0) {
      newlyEliminated.forEach((playerId) => {
        console.log(`[GameEngine] Player ${playerId} is now safe/out.`);
        this.lastEvents.push({
          type: EVENT_TYPES.playerEliminated,
          playerId,
          message: `${this.players[playerId].name} is safe and out.`,
        });
      });
    }
  }

  recomputeActivePlayers(): void {
    this.activePlayers = this.players.filter((player) => !player.isOut).map((player) => player.id);
  }

  checkGameOver(): boolean {
    if (this.activePlayers.length === 0) {
      this.gameOver = true;
      this.gameStatus = 'GAME_OVER';
      // ✅ roundWinner played the highest card, so they "won" the last round
      // and are the most deserving loser by game rules — keep but clarify comment
      this.loser = this.roundWinner;
      this.lastEvents.push({
        type: EVENT_TYPES.gameOver,
        playerId: this.loser ?? undefined,
        message: `${this.loser !== null ? this.players[this.loser].name : 'Unknown'} loses as the round winner when all players emptied hands simultaneously.`,
      });
      this.lastMessage =
        this.loser !== null
          ? `${this.players[this.loser].name} loses — they won the final round but everyone finished simultaneously.`
          : 'Game over.';

      console.log('[GameEngine] Game over on simultaneous finish tie-break.');

      return true;
    }

    if (this.activePlayers.length !== 1) {
      return false;
    }

    this.gameOver = true;
    this.gameStatus = 'GAME_OVER';
    this.loser = this.activePlayers[0];
    this.lastEvents.push({
      type: EVENT_TYPES.gameOver,
      playerId: this.loser,
      message: `${this.players[this.loser].name} is the last player with cards and loses the game.`,
    });
    this.lastMessage = `${this.players[this.loser].name} loses the game.`;

    console.log(`[GameEngine] Game over. Losing player: ${this.loser}.`);

    return true;
  }

  buildRoundHistoryEntry(resolutionPlayerId: number): RoundHistoryEntry {
    return {
      roundNumber: this.roundNumber,
      outcome: this.roundOutcome ?? 'NORMAL',
      starterPlayerId: this.startingPlayerIndex,
      winnerPlayerId: this.roundOutcome === 'NORMAL' ? resolutionPlayerId : null,
      punishedPlayerId: this.roundOutcome === 'CUT' ? resolutionPlayerId : null,
      highestCard: this.highestCard,
      cutCard: this.cutCard,
      pileCards: this.middlePile.map((entry) => entry.card.code),
    };
  }
}
