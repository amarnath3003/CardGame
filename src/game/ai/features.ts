/**
 * Shared, dependency-free feature extraction for the card-game AI.
 *
 * This module is imported by BOTH the offline self-play trainer (training/*)
 * and the live in-browser AI (src/game/ai/aiAgent.ts). Keeping a single source
 * of truth guarantees the network sees the exact same inputs at train time and
 * play time — no drift between simulator and deployment.
 *
 * Only FAIR information is encoded: the agent's own hand, the public middle
 * pile, the lead suit, turn position, and opponents' CARD COUNTS. It never sees
 * the actual contents of opponents' hands.
 *
 * Suit indices match the engine's SUIT_ORDER: spades=0, hearts=1, diamonds=2,
 * clubs=3. Rank weight is 2..14 (2..10, J=11, Q=12, K=13, A=14).
 */

export interface ObsCard {
  suit: number; // 0..3
  weight: number; // 2..14
}

export interface PileCard {
  playerId: number;
  suit: number;
  weight: number;
  isCut: boolean;
}

export interface Observation {
  /** The acting player's hand. */
  myHand: ObsCard[];
  /** Lead suit of the current trick, or null when this player is leading (free choice). */
  leadSuit: number | null;
  /** Cards already played in the current trick, in play order. */
  pile: PileCard[];
  /** Active players who still act AFTER this player in the current trick. */
  positionsAfter: number;
  /** Number of players still in the game (not yet out). */
  numActive: number;
  /** This player's hand size. */
  myCount: number;
  /** Hand sizes of the OTHER active players. */
  oppCounts: number[];
}

/** Length of the feature vector produced by {@link features}. Must stay in sync. */
export const FEATURE_DIM = 22;

export function haveLeadSuit(obs: Observation): boolean {
  if (obs.leadSuit === null) return false;
  const lead = obs.leadSuit;
  return obs.myHand.some((c) => c.suit === lead);
}

/** Would playing `card` constitute a cut (off-suit while void in the lead suit)? */
export function isCutCard(obs: Observation, card: ObsCard): boolean {
  if (obs.leadSuit === null) return false;
  return !haveLeadSuit(obs) && card.suit !== obs.leadSuit;
}

/**
 * Legal candidate cards, mirroring GameEngine.getLegalMoves: if a lead suit is
 * set and the player holds it, only those cards are legal; otherwise the whole
 * hand is legal (free lead, or a cut when void).
 */
export function legalCards(obs: Observation): ObsCard[] {
  if (obs.leadSuit === null) return obs.myHand;
  const lead = obs.leadSuit;
  const suited = obs.myHand.filter((c) => c.suit === lead);
  return suited.length > 0 ? suited : obs.myHand;
}

function pileHighestLeadWeight(obs: Observation): number {
  if (obs.leadSuit === null) return 0;
  const lead = obs.leadSuit;
  let hi = 0;
  for (const p of obs.pile) {
    if (!p.isCut && p.suit === lead && p.weight > hi) hi = p.weight;
  }
  return hi;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Produce the fixed-length feature vector describing the situation that results
 * from the acting player choosing `card`. The network scores every legal card
 * with this and a softmax selects among them.
 */
export function features(obs: Observation, card: ObsCard): number[] {
  const legal = legalCards(obs);
  const myCount = obs.myCount || obs.myHand.length;
  const oppN = obs.oppCounts.length;
  const avgOpp = oppN > 0 ? obs.oppCounts.reduce((a, b) => a + b, 0) / oppN : myCount;
  const minOpp = oppN > 0 ? Math.min(...obs.oppCounts) : myCount;

  const pileHi = pileHighestLeadWeight(obs);
  const leading = obs.leadSuit === null;
  const haveLead = haveLeadSuit(obs);
  const cut = isCutCard(obs, card);
  const w = card.weight;

  // Per-suit holdings.
  let suitCount = 0;
  let lowerInSuit = 0;
  let totalInSuit = 0;
  const suitTotals = [0, 0, 0, 0];
  let highCards = 0;
  for (const c of obs.myHand) {
    suitTotals[c.suit] += 1;
    if (c.weight >= 11) highCards += 1;
    if (c.suit === card.suit) {
      suitCount += 1;
      totalInSuit += 1;
      if (c.weight < w) lowerInSuit += 1;
    }
  }
  // Shortest non-empty suit length (for void-creation when leading).
  let minSuitLen = 99;
  for (const t of suitTotals) {
    if (t > 0 && t < minSuitLen) minSuitLen = t;
  }

  const legalWeights = legal.map((c) => c.weight);
  const legalMin = Math.min(...legalWeights);
  const legalMax = Math.max(...legalWeights);

  // Visible lead-suit cards (mine + pile) — informs how likely opponents are void.
  let visibleLead = 0;
  if (!leading && obs.leadSuit !== null) {
    const lead = obs.leadSuit;
    for (const c of obs.myHand) if (c.suit === lead) visibleLead += 1;
    for (const p of obs.pile) if (p.suit === lead) visibleLead += 1;
  }

  const f = new Array<number>(FEATURE_DIM);
  f[0] = myCount / 13;
  f[1] = clamp((myCount - avgOpp) / 13, -1, 1);
  f[2] = minOpp / 13;
  f[3] = obs.pile.length / 4;
  f[4] = pileHi / 14;
  f[5] = clamp(obs.positionsAfter / 3, 0, 1);
  f[6] = leading ? 1 : 0;
  f[7] = haveLead ? 1 : 0;
  f[8] = obs.numActive / 4;
  f[9] = highCards / Math.max(1, myCount);
  f[10] = w / 14;
  f[11] = cut ? 1 : 0;
  // Becomes the punishment target: highest lead-suit card so far while following.
  f[12] = !cut && !leading && w > pileHi ? 1 : 0;
  f[13] = !cut && !leading ? clamp((w - pileHi) / 14, -1, 1) : 0;
  f[14] = w === legalMin ? 1 : 0;
  f[15] = w === legalMax ? 1 : 0;
  f[16] = suitCount / 13;
  // Leading from the shortest suit helps void a suit (enables future cuts).
  f[17] = leading && totalInSuit === minSuitLen ? 1 : 0;
  f[18] = totalInSuit > 1 ? lowerInSuit / (totalInSuit - 1) : 0;
  f[19] = !leading ? visibleLead / 13 : 0;
  // Someone already higher than me is the target instead of me — safe to follow.
  f[20] = !cut && !leading && pileHi > w ? 1 : 0;
  // If I cut, the size of the punishment I inflict (bigger = better for me).
  f[21] = cut ? pileHi / 14 : 0;
  return f;
}
