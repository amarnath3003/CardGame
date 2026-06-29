# Card-Game AI — Reinforcement Learning Pipeline

The in-game AI opponent is a small neural-network policy trained by **self-play
reinforcement learning** (REINFORCE / policy gradient). Everything runs in
Node/TypeScript so the simulator, feature extractor, and network forward pass are
**shared** between offline training and the live browser game — no rule drift and
no ML runtime shipped to users (the deployed AI is just a few `for` loops over a
JSON of weights).

## Files

| File | Role |
|------|------|
| `../src/game/ai/features.ts` | **Shared.** Turns a fair observation (own hand, public pile, lead suit, opponents' *counts* only) + a candidate card into a feature vector. |
| `../src/game/ai/mlp.ts` | **Shared.** Tiny MLP (22 → 32 → 32 → 1) forward pass + softmax. |
| `../src/game/ai/aiAgent.ts` | **Browser.** Builds the observation from the live `GameEngine` and picks a card for the chosen difficulty. |
| `../src/game/ai/policy.json` | **Output.** Trained weights + difficulty-tier settings. |
| `sim.ts` | Headless, rule-exact game simulator (mirrors `GameEngine.ts`). |
| `train.ts` | Self-play training loop. Writes `policy.json`. |
| `tune.ts` | Sets the difficulty-tier (temperature, ε-random) values. |
| `evaluate.ts` | Benchmarks tier strength + beatability. |

## Usage

```bash
npm run ai:train   # self-play training (~3-5 min) -> src/game/ai/policy.json
npm run ai:tune    # write difficulty-tier settings into policy.json
npm run ai:eval    # benchmark the tiers (skill, ladder, beatability)
```

`ITERS=160 SEED=7 npm run ai:train` overrides defaults.

## How it learns

- **Reward** is rank-based and sums to zero across the four seats each game:
  empty your hand first = `+1`, be the last player holding cards (the loser) =
  `-1`. This is the game's actual objective, so the agent learns real strategy:
  shed low cards safely, avoid being the highest card when a cut is likely, and
  cut to offload dangerous high cards onto the round leader.
- **Self-play**: all four seats share the current policy and sample plays from
  its softmax; an entropy bonus keeps exploration alive.
- Against random opponents the trained policy's loss rate drops from the 25%
  baseline to ~6%.

## Difficulty tiers

One trained policy is exposed at three settings (see `tune.ts`):

- **Easy** — high temperature + frequent random plays (lots of mistakes).
- **Normal** — solid but fallible; randomness pulls it toward an even match.
- **Hard** — near-greedy on the trained policy, with a little randomness so a
  competent human still wins a healthy share. It is intentionally **not**
  unbeatable: it plays a strong-but-imperfect policy near-greedily rather than
  searching, so good human play beats it regularly.
