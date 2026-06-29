/**
 * Tiny multilayer perceptron used as the card-scoring policy network.
 *
 * Architecture: F -> H1 (tanh) -> H2 (tanh) -> 1 (linear logit).
 * Each legal card is scored independently; a softmax over the resulting logits
 * gives the play distribution.
 *
 * The forward pass here is shared between training and the browser. It has no
 * dependencies, so the deployed bundle needs no ML runtime — just these loops.
 */

export interface MLPWeights {
  F: number;
  H1: number;
  H2: number;
  W1: number[]; // H1 x F, row-major
  b1: number[]; // H1
  W2: number[]; // H2 x H1, row-major
  b2: number[]; // H2
  W3: number[]; // 1 x H2
  b3: number[]; // 1
}

export interface ForwardCache {
  a1: number[];
  a2: number[];
  logit: number;
}

export function forward(w: MLPWeights, x: number[]): ForwardCache {
  const { F, H1, H2 } = w;
  const a1 = new Array<number>(H1);
  for (let i = 0; i < H1; i++) {
    let s = w.b1[i];
    const base = i * F;
    for (let j = 0; j < F; j++) s += w.W1[base + j] * x[j];
    a1[i] = Math.tanh(s);
  }
  const a2 = new Array<number>(H2);
  for (let k = 0; k < H2; k++) {
    let s = w.b2[k];
    const base = k * H1;
    for (let j = 0; j < H1; j++) s += w.W2[base + j] * a1[j];
    a2[k] = Math.tanh(s);
  }
  let logit = w.b3[0];
  for (let k = 0; k < H2; k++) logit += w.W3[k] * a2[k];
  return { a1, a2, logit };
}

export function logit(w: MLPWeights, x: number[]): number {
  return forward(w, x).logit;
}

/** Numerically stable softmax over an array of logits, with temperature. */
export function softmax(logits: number[], temperature = 1): number[] {
  const t = temperature <= 1e-6 ? 1e-6 : temperature;
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
}

/** Argmax index of an array (ties resolved to the first occurrence). */
export function argmax(arr: number[]): number {
  let best = 0;
  for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
  return best;
}

/** Xavier-ish random initialization. Caller supplies an RNG in [0,1). */
export function initWeights(F: number, H1: number, H2: number, rand: () => number): MLPWeights {
  const fill = (n: number, fanIn: number) => {
    const scale = Math.sqrt(1 / fanIn);
    const a = new Array<number>(n);
    for (let i = 0; i < n; i++) a[i] = (rand() * 2 - 1) * scale;
    return a;
  };
  return {
    F,
    H1,
    H2,
    W1: fill(H1 * F, F),
    b1: new Array(H1).fill(0),
    W2: fill(H2 * H1, H1),
    b2: new Array(H2).fill(0),
    W3: fill(H2, H2),
    b3: [0],
  };
}
