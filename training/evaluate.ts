/**
 * Difficulty evaluation + tuning harness.
 *
 * Loads the trained policy (src/game/ai/policy.json) and measures:
 *   1. Skill   — each tier's loss rate as 1 bot vs 3 random players (25% = no skill).
 *   2. Ladder  — tier-vs-tier, to confirm Easy < Normal < Hard in strength.
 *   3. Beatability — a competent-human heuristic playing as 1 player vs 3 of a tier
 *      (and the reverse), so we can confirm "Hard" is challenging but losable.
 *
 * Run with:  npx tsx training/evaluate.ts
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { playGame, mulberry32, Chooser } from './sim';
import { Observation, legalCards, isCutCard } from '../src/game/ai/features';
import { MLPWeights, forward, softmax, argmax } from '../src/game/ai/mlp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const policyPath = resolve(__dirname, '../src/game/ai/policy.json');
const policy = JSON.parse(readFileSync(policyPath, 'utf8')) as {
  weights: MLPWeights;
  tiers: Record<string, { temperature: number; epsilonRandom: number }>;
};
const W = policy.weights;

const rand = mulberry32(20260629);

// ---- Players ------------------------------------------------------------
function tierChooser(temperature: number, epsilon: number): Chooser {
  return (_obs: Observation, X: number[][]) => {
    if (epsilon > 0 && rand() < epsilon) return Math.floor(rand() * X.length);
    const logits = X.map((x) => forward(W, x).logit);
    if (temperature <= 0.02) return argmax(logits);
    const probs = softmax(logits, temperature);
    let r = rand();
    for (let i = 0; i < probs.length; i++) {
      r -= probs[i];
      if (r <= 0) return i;
    }
    return probs.length - 1;
  };
}

const randomChooser: Chooser = (_obs, X) => Math.floor(rand() * X.length);

/**
 * A competent-human stand-in. Plays the obvious sensible strategy:
 *  - Lead low (shed cheap cards).
 *  - When void in the lead suit, cut with your highest card (offload danger).
 *  - When following, duck under the current pile leader with your biggest safe
 *    card; if you cannot stay under, play your lowest (minimize the target).
 */
const heuristicChooser: Chooser = (obs: Observation, _X: number[][]) => {
  const legal = legalCards(obs); // same order as X
  const lead = obs.leadSuit;
  const idxByWeight = (cmp: (a: number, b: number) => boolean) => {
    let best = 0;
    for (let i = 1; i < legal.length; i++) if (cmp(legal[i].weight, legal[best].weight)) best = i;
    return best;
  };
  if (lead === null) return idxByWeight((a, b) => a < b); // lead lowest

  if (isCutCard(obs, legal[0])) return idxByWeight((a, b) => a > b); // cut with highest

  // Following the lead suit: find current highest lead-suit card in the pile.
  let pileHi = 0;
  for (const p of obs.pile) if (!p.isCut && p.suit === lead && p.weight > pileHi) pileHi = p.weight;
  let underIdx = -1;
  let underW = -1;
  for (let i = 0; i < legal.length; i++) {
    if (legal[i].weight < pileHi && legal[i].weight > underW) {
      underW = legal[i].weight;
      underIdx = i;
    }
  }
  if (underIdx !== -1) return underIdx; // biggest card that still ducks under
  return idxByWeight((a, b) => a < b); // forced above: play lowest
};

// ---- Match runner -------------------------------------------------------
function lossRateSeat0(seat0: Chooser, others: Chooser, games: number): number {
  const choosers: Chooser[] = [seat0, others, others, others];
  let losses = 0;
  for (let i = 0; i < games; i++) if (playGame(choosers, rand, false).loser === 0) losses += 1;
  return losses / games;
}

const GAMES = 8000;
const tiers = policy.tiers;
const tierChoosers: Record<string, Chooser> = {};
for (const name of Object.keys(tiers)) {
  tierChoosers[name] = tierChooser(tiers[name].temperature, tiers[name].epsilonRandom);
}

const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

console.log(`\nPolicy: ${policy.tiers ? Object.keys(tiers).join(', ') : ''}`);
console.log('Tier settings:', JSON.stringify(tiers));

console.log('\n=== 1. Skill: tier as 1 player vs 3 RANDOM (25.0% = no skill, lower = stronger) ===');
for (const name of ['Easy', 'Normal', 'Hard']) {
  console.log(`  ${name.padEnd(7)} loss vs random: ${pct(lossRateSeat0(tierChoosers[name], randomChooser, GAMES))}`);
}

console.log('\n=== 2. Ladder: weaker tier (seat 0) vs 3 of the stronger tier (>25% = correctly weaker) ===');
console.log(`  Easy   vs 3x Hard:   ${pct(lossRateSeat0(tierChoosers.Easy, tierChoosers.Hard, GAMES))}`);
console.log(`  Normal vs 3x Hard:   ${pct(lossRateSeat0(tierChoosers.Normal, tierChoosers.Hard, GAMES))}`);
console.log(`  Easy   vs 3x Normal: ${pct(lossRateSeat0(tierChoosers.Easy, tierChoosers.Normal, GAMES))}`);

console.log('\n=== 3. Beatability: competent-human heuristic (seat 0) vs 3 of a tier ===');
console.log('  (25% = even; higher = the tier pressures the human; we want Hard ~25-35%)');
for (const name of ['Easy', 'Normal', 'Hard']) {
  console.log(`  human vs 3x ${name.padEnd(7)}: human loss ${pct(lossRateSeat0(heuristicChooser, tierChoosers[name], GAMES))}`);
}
console.log('\n  Reverse — tier (seat 0) vs 3 heuristic humans (lower = tier beats humans):');
for (const name of ['Easy', 'Normal', 'Hard']) {
  console.log(`  ${name.padEnd(7)} vs 3x human: tier loss ${pct(lossRateSeat0(tierChoosers[name], heuristicChooser, GAMES))}`);
}
console.log('');
