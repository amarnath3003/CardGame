/**
 * Writes the difficulty-tier (temperature, epsilonRandom) settings into the
 * trained policy.json without retraining the network. Tiers are tuned so that:
 *   Easy   << Normal < Hard  in strength, and
 *   Hard stays beatable by a competent human (it is near-greedy on a policy
 *   that itself is not perfect, so it cannot be unbeatable).
 *
 * Run training/evaluate.ts after this to confirm the ladder. Usage: npx tsx training/tune.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const policyPath = resolve(__dirname, '../src/game/ai/policy.json');

const TIERS = {
  // High temperature + frequent random plays: makes obvious mistakes.
  Easy: { temperature: 8.0, epsilonRandom: 0.65 },
  // Solid but clearly fallible — randomness pulls it toward an even match.
  Normal: { temperature: 1.8, epsilonRandom: 0.22 },
  // Near-greedy on the trained policy; a little randomness keeps it losable.
  Hard: { temperature: 0.12, epsilonRandom: 0.04 },
};

const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
policy.tiers = TIERS;
writeFileSync(policyPath, JSON.stringify(policy));
console.log('[tune] updated tiers in', policyPath);
console.log(JSON.stringify(TIERS, null, 2));
