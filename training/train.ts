/**
 * Self-play REINFORCE trainer for the card-game policy network.
 *
 * All four seats share the current policy and sample plays from its softmax.
 * The game's rank-based reward (sum to zero across seats each game) provides a
 * naturally centered advantage signal: empty your hand early = positive, be the
 * last player holding cards = negative. We update with policy-gradient + an
 * entropy bonus (to keep exploring) using Adam.
 *
 * Output: src/game/ai/policy.json — the trained weights plus default difficulty
 * tier settings, ready for the browser to load. Run with:  npx tsx training/train.ts
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { playGame, mulberry32, Chooser } from './sim';
import { FEATURE_DIM, Observation } from '../src/game/ai/features';
import { MLPWeights, forward, softmax, argmax, initWeights } from '../src/game/ai/mlp';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---- Hyperparameters (balanced ~2-5 min preset) -------------------------
const H1 = 32;
const H2 = 32;
const BATCH_GAMES = 256;
const ITERATIONS = Number(process.env.ITERS ?? 900);
const LR = 0.01;
const ENTROPY_START = 0.03;
const ENTROPY_END = 0.004;
const ADAM_B1 = 0.9;
const ADAM_B2 = 0.999;
const ADAM_EPS = 1e-8;
const EVAL_EVERY = 100;
const EVAL_GAMES = 3000;
const SEED = Number(process.env.SEED ?? 7);

const rand = mulberry32(SEED);

// ---- Weights + Adam state ----------------------------------------------
const w = initWeights(FEATURE_DIM, H1, H2, rand);

function zerosLike(weights: MLPWeights): MLPWeights {
  return {
    F: weights.F,
    H1: weights.H1,
    H2: weights.H2,
    W1: new Array(weights.W1.length).fill(0),
    b1: new Array(weights.b1.length).fill(0),
    W2: new Array(weights.W2.length).fill(0),
    b2: new Array(weights.b2.length).fill(0),
    W3: new Array(weights.W3.length).fill(0),
    b3: new Array(weights.b3.length).fill(0),
  };
}

const grad = zerosLike(w);
const adamM = zerosLike(w);
const adamV = zerosLike(w);
let adamT = 0;

const PARAM_KEYS: (keyof MLPWeights)[] = ['W1', 'b1', 'W2', 'b2', 'W3', 'b3'];

function clearGrad() {
  for (const k of PARAM_KEYS) (grad[k] as number[]).fill(0);
}

/**
 * Backprop a scalar upstream gradient `g = dObjective/dlogit` for one candidate
 * card through the MLP, accumulating into `grad`. Sign convention: we ASCEND the
 * objective, so `grad` holds the ascent direction.
 */
function accumulate(x: number[], a1: number[], a2: number[], g: number) {
  const { F } = w;
  // Output layer.
  for (let k = 0; k < H2; k++) grad.W3[k] += g * a2[k];
  grad.b3[0] += g;
  // Hidden 2.
  const dz2 = new Array<number>(H2);
  for (let k = 0; k < H2; k++) {
    const da2 = g * w.W3[k];
    dz2[k] = da2 * (1 - a2[k] * a2[k]);
  }
  for (let k = 0; k < H2; k++) {
    const base = k * H1;
    const d = dz2[k];
    for (let j = 0; j < H1; j++) grad.W2[base + j] += d * a1[j];
    grad.b2[k] += d;
  }
  // Hidden 1.
  const dz1 = new Array<number>(H1);
  for (let j = 0; j < H1; j++) {
    let da1 = 0;
    for (let k = 0; k < H2; k++) da1 += dz2[k] * w.W2[k * H1 + j];
    dz1[j] = da1 * (1 - a1[j] * a1[j]);
  }
  for (let j = 0; j < H1; j++) {
    const base = j * F;
    const d = dz1[j];
    for (let m = 0; m < F; m++) grad.W1[base + m] += d * x[m];
    grad.b1[j] += d;
  }
}

function adamStep(scale: number) {
  adamT += 1;
  const bc1 = 1 - Math.pow(ADAM_B1, adamT);
  const bc2 = 1 - Math.pow(ADAM_B2, adamT);
  for (const k of PARAM_KEYS) {
    const p = w[k] as number[];
    const gArr = grad[k] as number[];
    const m = adamM[k] as number[];
    const v = adamV[k] as number[];
    for (let i = 0; i < p.length; i++) {
      // Ascent: loss-gradient = -objective-gradient.
      const gi = -gArr[i] * scale;
      m[i] = ADAM_B1 * m[i] + (1 - ADAM_B1) * gi;
      v[i] = ADAM_B2 * v[i] + (1 - ADAM_B2) * gi * gi;
      const mh = m[i] / bc1;
      const vh = v[i] / bc2;
      p[i] -= LR * (mh / (Math.sqrt(vh) + ADAM_EPS));
    }
  }
}

// ---- Choosers -----------------------------------------------------------
/** Training chooser: sample from the current policy's softmax (temperature 1). */
const sampleChooser: Chooser = (_obs: Observation, X: number[][]) => {
  const logits = X.map((x) => forward(w, x).logit);
  const probs = softmax(logits, 1);
  let r = rand();
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i];
    if (r <= 0) return i;
  }
  return probs.length - 1;
};

const greedyChooser: Chooser = (_obs: Observation, X: number[][]) =>
  argmax(X.map((x) => forward(w, x).logit));

const randomChooser: Chooser = (_obs: Observation, X: number[][]) => Math.floor(rand() * X.length);

// ---- Evaluation: policy (seat 0, greedy) vs 3 random --------------------
function evalVsRandom(games: number): number {
  const choosers: Chooser[] = [greedyChooser, randomChooser, randomChooser, randomChooser];
  let seat0Losses = 0;
  for (let i = 0; i < games; i++) {
    const g = playGame(choosers, rand, false);
    if (g.loser === 0) seat0Losses += 1;
  }
  return seat0Losses / games; // < 0.25 means better than random; lower is stronger
}

// ---- Training loop ------------------------------------------------------
console.log(
  `[train] arch ${FEATURE_DIM}->${H1}->${H2}->1  batch=${BATCH_GAMES} iters=${ITERATIONS} lr=${LR}`,
);
const t0 = Date.now();
let totalGames = 0;

for (let iter = 0; iter < ITERATIONS; iter++) {
  const frac = iter / Math.max(1, ITERATIONS - 1);
  const entropyBeta = ENTROPY_START + (ENTROPY_END - ENTROPY_START) * frac;

  clearGrad();
  let decisionCount = 0;

  for (let gi = 0; gi < BATCH_GAMES; gi++) {
    const choosers: Chooser[] = [sampleChooser, sampleChooser, sampleChooser, sampleChooser];
    const game = playGame(choosers, rand, true);
    totalGames += 1;

    for (const d of game.decisions) {
      const advantage = game.rewards[d.seat]; // rewards are mean-zero across seats
      // Recompute forward for each candidate (params unchanged within the batch).
      const caches = d.X.map((x) => forward(w, x));
      const probs = softmax(
        caches.map((c) => c.logit),
        1,
      );
      let entropy = 0;
      for (const p of probs) entropy += p > 0 ? -p * Math.log(p) : 0;

      for (let i = 0; i < d.X.length; i++) {
        const indicator = i === d.chosen ? 1 : 0;
        const pgGrad = advantage * (indicator - probs[i]);
        const entGrad = entropyBeta * (-probs[i] * (Math.log(probs[i] + 1e-12) + entropy));
        accumulate(d.X[i], caches[i].a1, caches[i].a2, pgGrad + entGrad);
      }
      decisionCount += 1;
    }
  }

  // Average the accumulated gradient over decisions in the batch.
  adamStep(decisionCount > 0 ? 1 / decisionCount : 0);

  if ((iter + 1) % EVAL_EVERY === 0 || iter === ITERATIONS - 1) {
    const lossRate = evalVsRandom(EVAL_GAMES);
    const secs = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(
      `[train] iter ${iter + 1}/${ITERATIONS}  games=${totalGames}  ` +
        `vs-random loss=${(lossRate * 100).toFixed(1)}% (random=25%)  entropy_beta=${entropyBeta.toFixed(
          3,
        )}  t=${secs}s`,
    );
  }
}

const finalLoss = evalVsRandom(8000);
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`[train] done in ${elapsed}s. final vs-random loss=${(finalLoss * 100).toFixed(1)}%`);

// ---- Export -------------------------------------------------------------
const policy = {
  version: 1,
  featureDim: FEATURE_DIM,
  arch: { H1, H2 },
  weights: w,
  // Default tiers; evaluate.ts measures and may retune these in place.
  tiers: {
    Easy: { temperature: 6.0, epsilonRandom: 0.55 },
    Normal: { temperature: 1.0, epsilonRandom: 0.12 },
    Hard: { temperature: 0.35, epsilonRandom: 0.06 },
  },
  trainedGames: totalGames,
  metrics: { vsRandomLoss: finalLoss },
};

const outPath = resolve(__dirname, '../src/game/ai/policy.json');
writeFileSync(outPath, JSON.stringify(policy));
console.log(`[train] wrote ${outPath} (${totalGames} self-play games)`);
