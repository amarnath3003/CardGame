/**
 * Live in-browser AI opponent.
 *
 * Bridges the running GameEngine to the policy network trained by self-play
 * (see training/). It builds a FAIR observation (own hand + public pile + lead
 * suit + opponents' card counts — never their actual cards), scores every legal
 * move with the shared MLP, and selects a card according to the chosen
 * difficulty tier.
 *
 * Difficulty is realized as (temperature, epsilonRandom) over a single trained
 * policy:
 *   - Easy   — high temperature + frequent random plays (makes plenty of mistakes).
 *   - Normal — near the policy's natural play with occasional slips.
 *   - Hard   — low temperature (near-greedy) but keeps a little randomness so a
 *              competent human can still win a healthy share of games.
 *
 * No ML runtime is bundled — just the small forward-pass loops in mlp.ts.
 */

import type { GameEngine } from '../GameEngine';
import { SUITS } from '../constants';
import { getCardSuitFromCode, getCardWeightFromCode } from '../helpers';
import type { AiDifficulty } from '../../types';
import { features, type Observation, type ObsCard } from './features';
import { forward, softmax, argmax, type MLPWeights } from './mlp';
import policyData from './policy.json';

interface TierConfig {
  temperature: number;
  epsilonRandom: number;
}

interface PolicyFile {
  version: number;
  featureDim: number;
  weights: MLPWeights;
  tiers: Record<string, TierConfig>;
}

const policy = policyData as unknown as PolicyFile;
const WEIGHTS = policy.weights;

const DEFAULT_TIERS: Record<AiDifficulty, TierConfig> = {
  Easy: { temperature: 6.0, epsilonRandom: 0.55 },
  Normal: { temperature: 1.0, epsilonRandom: 0.12 },
  Hard: { temperature: 0.35, epsilonRandom: 0.06 },
};

function tierFor(difficulty: AiDifficulty): TierConfig {
  return policy.tiers?.[difficulty] ?? DEFAULT_TIERS[difficulty] ?? DEFAULT_TIERS.Normal;
}

function suitIndex(suit: string): number {
  const idx = SUITS.indexOf(suit as (typeof SUITS)[number]);
  return idx === -1 ? 0 : idx;
}

/** Build the fair observation for `playerId` from the host engine's state. */
function buildObservation(engine: GameEngine, playerId: number): Observation {
  const me = engine.players[playerId];
  const myHand: ObsCard[] = me.hand.map((c) => ({ suit: suitIndex(c.suit), weight: c.weight }));
  const leadSuit = engine.leadSuit ? suitIndex(engine.leadSuit) : null;
  const pile = engine.middlePile.map((entry) => ({
    playerId: entry.playerId,
    suit: suitIndex(entry.card.suit),
    weight: entry.card.weight,
    isCut: entry.isCut,
  }));
  const activePlayers = engine.players.filter((p) => !p.isOut);
  const numActive = activePlayers.length;
  const oppCounts = activePlayers.filter((p) => p.id !== playerId).map((p) => p.hand.length);

  return {
    myHand,
    leadSuit,
    pile,
    positionsAfter: Math.max(0, numActive - engine.middlePile.length - 1),
    numActive,
    myCount: me.hand.length,
    oppCounts,
  };
}

/**
 * Choose a card id for an AI player at the given difficulty. Returns null if
 * there are no legal moves (the caller should then do nothing).
 */
export function chooseAiCard(
  engine: GameEngine,
  playerId: number,
  difficulty: AiDifficulty,
  rng: () => number = Math.random,
): string | null {
  const moves = engine.getLegalMoves(playerId);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0].id;

  const tier = tierFor(difficulty);

  // ε-random: an outright mistake, keeping every tier beatable.
  if (tier.epsilonRandom > 0 && rng() < tier.epsilonRandom) {
    return moves[Math.floor(rng() * moves.length)].id;
  }

  const obs = buildObservation(engine, playerId);
  const logits = moves.map((m) => {
    const card: ObsCard = {
      suit: suitIndex(getCardSuitFromCode(m.code)),
      weight: getCardWeightFromCode(m.code),
    };
    return forward(WEIGHTS, features(obs, card)).logit;
  });

  // Near-greedy tiers pick the best move; softer tiers sample from the softmax.
  if (tier.temperature <= 0.02) {
    return moves[argmax(logits)].id;
  }
  const probs = softmax(logits, tier.temperature);
  let r = rng();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return moves[i].id;
  }
  return moves[moves.length - 1].id;
}
