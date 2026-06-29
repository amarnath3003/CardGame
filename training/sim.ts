/**
 * Headless, allocation-light simulator of the punishment card game. It mirrors
 * the rules implemented in src/game/GameEngine.ts exactly, but strips the UI
 * concerns (timers, events, console logging, card ids) so millions of self-play
 * tricks run fast.
 *
 * Rule parity checklist (see GameLogic.md / GameEngine.ts):
 *  - 4 players, 52 cards, 13 each.
 *  - Round 1 forced open with Ace of Spades; lead suit = spades.
 *  - Must follow lead suit if able; otherwise any card (a cut if off-suit).
 *  - A cut ends the trick immediately.
 *  - Normal trick: highest lead-suit card wins, pile discarded, winner leads next.
 *  - Cut trick: highest pre-cut lead-suit card holder takes the whole pile (incl.
 *    the cut card) and leads next.
 *  - A player with 0 cards after resolution is "out" (safe); last with cards loses.
 */

import { Observation, ObsCard, features, legalCards, isCutCard } from '../src/game/ai/features';

export interface SimCard {
  suit: number; // 0=spades,1=hearts,2=diamonds,3=clubs
  weight: number; // 2..14
}

/** A single recorded decision: feature rows for each legal card and the choice. */
export interface Decision {
  seat: number;
  X: number[][]; // legalCount x FEATURE_DIM
  chosen: number; // index into X
}

export interface GameRecord {
  decisions: Decision[];
  /** Per-seat reward in [-1, 1], by finishing order. */
  rewards: number[];
  loser: number;
}

/**
 * Chooser callback: given the observation and the feature rows for each legal
 * card, return the index of the chosen card. Lets the trainer plug in the
 * policy (sampling) and the evaluator plug in policy/heuristic/random players.
 */
export type Chooser = (obs: Observation, X: number[][], seat: number) => number;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dealHands(rand: () => number): SimCard[][] {
  const deck: SimCard[] = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let weight = 2; weight <= 14; weight++) deck.push({ suit, weight });
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  const hands: SimCard[][] = [[], [], [], []];
  for (let i = 0; i < deck.length; i++) hands[i % 4].push(deck[i]);
  return hands;
}

function toObsHand(hand: SimCard[]): ObsCard[] {
  return hand.map((c) => ({ suit: c.suit, weight: c.weight }));
}

/**
 * Play one full game. `choosers[seat]` decides that seat's plays. Records every
 * non-forced decision (the round-1 forced Ace open and any single-legal-move
 * situation are skipped — there is nothing to learn there).
 */
export function playGame(choosers: Chooser[], rand: () => number, record = true): GameRecord {
  const hands = dealHands(rand);
  const out = [false, false, false, false];
  const finishOrder: number[] = []; // seats in the order they emptied their hands

  // Round 1 starts with the Ace of Spades holder.
  let starter = hands.findIndex((h) => h.some((c) => c.suit === 0 && c.weight === 14));
  let firstRound = true;
  const decisions: Decision[] = [];

  const activeCount = () => out.reduce((n, o) => n + (o ? 0 : 1), 0);
  const nextActive = (from: number): number => {
    for (let off = 1; off <= 4; off++) {
      const cand = (from + off) % 4;
      if (!out[cand]) return cand;
    }
    return from;
  };

  let guard = 0;
  while (activeCount() > 1) {
    if (guard++ > 2000) throw new Error('Simulator trick guard tripped — possible rule bug.');

    const numActive = activeCount();
    let leadSuit: number | null = null;
    const pile: { playerId: number; suit: number; weight: number; isCut: boolean }[] = [];
    let cutOccurred = false;

    // Walk the trick starting at `starter`, then clockwise over active players.
    let seat = starter;
    for (let played = 0; played < numActive; played++) {
      // Skip out players (starter is always active here).
      while (out[seat]) seat = (seat + 1) % 4;

      const hand = hands[seat];
      const obs: Observation = {
        myHand: toObsHand(hand),
        leadSuit,
        pile: pile.map((p) => ({ ...p })),
        positionsAfter: numActive - pile.length - 1,
        numActive,
        myCount: hand.length,
        oppCounts: hands
          .map((h, s) => ({ h, s }))
          .filter(({ s }) => s !== seat && !out[s])
          .map(({ h }) => h.length),
      };

      // Determine the legal cards (as ObsCard) and the matching hand indices.
      const legalObs = legalCards(obs);
      const legalHandIdx: number[] = [];
      for (const lc of legalObs) {
        const idx = hand.findIndex(
          (c, i) => c.suit === lc.suit && c.weight === lc.weight && !legalHandIdx.includes(i),
        );
        legalHandIdx.push(idx);
      }

      let chosenLegal: number;
      if (firstRound && played === 0) {
        // Forced Ace-of-Spades open: pick it explicitly, no decision recorded.
        chosenLegal = legalObs.findIndex((c) => c.suit === 0 && c.weight === 14);
        if (chosenLegal === -1) chosenLegal = 0;
      } else if (legalObs.length === 1) {
        chosenLegal = 0; // no real choice
      } else {
        const X = legalObs.map((c) => features(obs, c));
        chosenLegal = choosers[seat](obs, X, seat);
        if (chosenLegal < 0 || chosenLegal >= X.length) chosenLegal = 0;
        if (record) decisions.push({ seat, X, chosen: chosenLegal });
      }

      const card = legalObs[chosenLegal];
      const isCut = isCutCard(obs, card);

      if (leadSuit === null) leadSuit = card.suit;

      // Remove the played card from the hand.
      const handIdx = legalHandIdx[chosenLegal];
      hands[seat].splice(handIdx, 1);

      pile.push({ playerId: seat, suit: card.suit, weight: card.weight, isCut });

      if (isCut) {
        cutOccurred = true;
        break;
      }
      seat = (seat + 1) % 4;
    }

    firstRound = false;

    // Resolve the trick: highest non-cut lead-suit card.
    let hiSeat = pile[0].playerId;
    let hiWeight = -1;
    for (const p of pile) {
      if (!p.isCut && p.suit === leadSuit && p.weight > hiWeight) {
        hiWeight = p.weight;
        hiSeat = p.playerId;
      }
    }

    if (cutOccurred) {
      // Highest pre-cut card holder takes the whole pile back.
      for (const p of pile) hands[hiSeat].push({ suit: p.suit, weight: p.weight });
    }
    // Normal trick: pile discarded permanently (no hand changes besides the plays).

    // Mark newly emptied hands as out (after resolution).
    for (let s = 0; s < 4; s++) {
      if (!out[s] && hands[s].length === 0) {
        out[s] = true;
        finishOrder.push(s);
      }
    }

    if (activeCount() <= 1) break;

    // Next trick is led by the resolution seat (or next active if it went out).
    starter = out[hiSeat] ? nextActive(hiSeat) : hiSeat;
  }

  // The single remaining active seat (if any) is the loser; otherwise everyone
  // emptied simultaneously and the last resolution winner loses.
  let loser = -1;
  for (let s = 0; s < 4; s++) if (!out[s]) loser = s;
  if (loser === -1) loser = finishOrder.length ? finishOrder[finishOrder.length - 1] : 0;

  // Rank-based reward: earlier you empty your hand, the better. Loser worst.
  // finishOrder lists seats best-first; the loser is appended last.
  const rankOrder = finishOrder.slice();
  if (!rankOrder.includes(loser)) rankOrder.push(loser);
  const rewards = [0, 0, 0, 0];
  const n = rankOrder.length;
  for (let r = 0; r < n; r++) {
    // Map rank 0..n-1 to +1..-1 linearly.
    const seat = rankOrder[r];
    rewards[seat] = n > 1 ? 1 - (2 * r) / (n - 1) : 0;
  }

  return { decisions, rewards, loser };
}
