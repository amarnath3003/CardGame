# Custom Card Punishment Game — Complete Game Logic Documentation

Version: 1.0  
Type: Multiplayer Trick-Taking / Punishment Card Game  
Players: 4  
Deck: Standard 52-card deck

---

# 1. Game Overview

This is a custom multiplayer card game based on:

- trick-taking mechanics
- forced suit following
- punishment-based pile collection
- elimination gameplay

Unlike traditional trick-taking games where winning tricks is beneficial, this game introduces a reverse-pressure mechanic:

> Having the highest card can become dangerous because a later cut punishes the current highest card holder.

The objective is to:
- get rid of all cards
- avoid becoming the last remaining player with cards

---

# 2. Core Objective

## Winning
A player is considered safe/out when:
- they have 0 cards remaining

They no longer participate in future rounds.

---

## Losing
The game ends when:
- only one player still has cards

That final remaining player:
- loses the game

---

# 3. Players and Deck

## Players
- Exactly 4 players

---

## Deck
- Standard 52-card deck
- No jokers

---

## Distribution
- Shuffle deck
- Distribute evenly
- Each player receives:
  - 13 cards

---

# 4. Card System

## Suits
The game uses the four standard suits:

| Suit | Symbol |
|---|---|
| Spades | ♠ |
| Hearts | ♥ |
| Diamonds | ♦ |
| Clubs | ♣ |

---

# 5. Card Ranking

Suit does NOT determine strength.

Only rank determines strength.

## Rank Order

| Rank | Weight |
|---|---|
| A | 14 |
| K | 13 |
| Q | 12 |
| J | 11 |
| 10 | 10 |
| 9 | 9 |
| 8 | 8 |
| 7 | 7 |
| 6 | 6 |
| 5 | 5 |
| 4 | 4 |
| 3 | 3 |
| 2 | 2 |

---

# 6. First Round Rules

## Mandatory Starting Card
The first round always starts with:

- Ace of Spades (♠A)

The player holding:
- ♠A

must begin the game.

---

## Initial Lead Suit
Since the first card is:
- ♠A

the lead suit for the first round becomes:
- Spades

All other players must follow the spade suit if possible.

---

# 7. Round Structure

Each round consists of:

1. Starting card placement
2. Suit-following turns
3. Optional cut
4. Round resolution
5. Next round initialization

---

# 8. Lead Suit System

The first card played in a round determines:
- the lead suit

Example:
- Player starts with ♥7
- Lead suit becomes:
  - Hearts

All following players must follow hearts if they possess hearts.

---

# 9. Turn Order

Turns move:
- clockwise

After each legal play:
- next active player takes turn

Players who are already out/safe:
- are skipped

---

# 10. Forced Suit Rule

## If Player Has Lead Suit
They MUST play a card matching the lead suit.

Example:
- Lead suit = Diamonds
- Player has ♦ cards

They MUST play:
- a ♦ card

---

## Illegal Move
A player CANNOT:
- intentionally avoid suit
- intentionally cut while possessing lead suit

Such moves are invalid.

---

# 11. Cut Mechanic

## When Can a Player Cut?
A player may cut ONLY IF:
- they do NOT possess any card of the lead suit

---

## What Is a Cut?
A cut means:
- the player plays any card of any suit

Example:
Lead suit:
- ♠

Player has:
- no spades

Player may play:
- ♥K
- ♦2
- ♣A
- etc.

---

# 12. Important Cut Rule

## Cut Immediately Ends Round
The moment a cut occurs:
- the round ends instantly

Remaining players:
- do NOT continue playing

---

# 13. Punishment System

The punishment system is the core mechanic of the game.

---

# 14. Determining Punishment

When a cut occurs:

Determine:
- highest weighted card already present in the middle pile

IMPORTANT:
- ignore the cut card
- only evaluate cards played BEFORE the cut

---

# 15. Punished Player

The player who played:
- the highest card in the middle pile

receives punishment.

---

# 16. Punishment Effect

The punished player must take:
- all cards currently in middle pile
- plus the cut card

back into their hand.

This increases their card count.

---

# 17. Example — Cut Round

## Situation

Middle pile:

- ♠5
- ♠J
- ♠2

Next player:
- has no spades

They cut with:
- ♦A

---

## Resolution

Highest card already in pile:
- ♠J

The player who played:
- ♠J

takes:
- ♠5
- ♠J
- ♠2
- ♦A

into their hand.

---

# 18. Strategic Consequence

High cards are dangerous.

A player currently leading the pile:
- risks punishment if a later player cuts

This creates:
- reverse-pressure gameplay
- risk management
- strategic low-card dumping

---

# 19. No-Cut Round

If all active players successfully follow suit:
- no cut occurs

Then:
- middle pile is discarded permanently

Nobody receives cards.

---

# 20. Determining Round Winner

If no cut occurs:
- highest weighted card of lead suit wins the round

That player:
- starts the next round

---

# 21. Example — Normal Round

Lead:
- ♦4

Other plays:
- ♦10
- ♦K
- ♦2

No cuts occurred.

Highest card:
- ♦K

That player:
- starts next round

Pile:
- discarded permanently

---

# 22. Starting Next Round

## After Normal Round
Player with highest lead-suit card:
- starts next round

---

## After Cut Round
Punished player:
- starts next round

---

# 23. Starting Card Freedom

After the first round:
- starting player may begin with ANY card

The suit of that card becomes:
- lead suit for the round

---

# 24. Elimination System

A player becomes:
- safe/out

when they have:
- 0 cards

---

# 25. Out Players

Out players:
- no longer take turns
- cannot receive cards
- are skipped permanently

---

# 26. Important Elimination Edge Case

Win checking must occur:
- AFTER round resolution

Reason:
A player may temporarily reach:
- 0 cards

but later receive punishment cards during cut resolution.

Such players are:
- NOT considered safe yet

---

# 27. Game End Condition

The game ends when:
- only one active player still possesses cards

That player:
- loses the game

---

# 28. Middle Pile Structure

The middle pile stores:
- play order
- cards
- cut status

Example structure:

```json
[
  {
    "playerId": 1,
    "card": "♠5",
    "isCut": false
  },
  {
    "playerId": 2,
    "card": "♠K",
    "isCut": false
  },
  {
    "playerId": 3,
    "card": "♦A",
    "isCut": true
  }
]
```

---

# 29. Recommended Internal Game State

```json
{
  "players": [],
  "currentPlayerIndex": 0,
  "startingPlayerIndex": 0,
  "leadSuit": null,
  "middlePile": [],
  "gameOver": false,
  "loser": null
}
```

---

# 30. Recommended Event Types

For UI integration and animation:

## Events

### CARD_PLAYED
```json
{
  "type": "CARD_PLAYED"
}
```

---

### CUT_OCCURRED
```json
{
  "type": "CUT_OCCURRED"
}
```

---

### ROUND_RESOLVED
```json
{
  "type": "ROUND_RESOLVED"
}
```

---

### PLAYER_ELIMINATED
```json
{
  "type": "PLAYER_ELIMINATED"
}
```

---

### GAME_OVER
```json
{
  "type": "GAME_OVER"
}
```

---

# 31. Recommended Game Flow

## Game Initialization
1. Create deck
2. Shuffle
3. Distribute cards
4. Find ♠A holder
5. Start first round

---

## Per Round
1. Starting player places card
2. Lead suit established
3. Players follow suit
4. If cut:
   - resolve punishment
5. Else:
   - determine highest card
6. Determine next starting player
7. Check eliminations
8. Check game over

---

# 32. Important Logic Rules Summary

## Rule 1
Players MUST follow suit if possible.

---

## Rule 2
Cut only allowed if no lead suit exists in hand.

---

## Rule 3
Cut immediately ends round.

---

## Rule 4
Cut card does NOT participate in highest-card evaluation.

---

## Rule 5
Highest lead-suit card holder receives punishment.

---

## Rule 6
Punished player starts next round.

---

## Rule 7
If no cut:
- pile discarded
- highest card starts next round

---

## Rule 8
Last remaining player loses.

---

# 33. Strategic Depth

The game creates unique strategy because:
- winning tricks is risky
- high cards attract punishment
- suit management matters
- cuts radically shift momentum

Players must balance:
- reducing hand size
- avoiding dangerous high-card leads
- forcing others into punishment

---

# 34. Future Expansion Possibilities

The game architecture supports:
- online multiplayer
- AI bots
- replay systems
- animations
- ranked mode
- power cards
- custom rules
- mobile adaptation

---

# 35. Final Summary

This game is a:
- trick-taking
- reverse-punishment
- shedding
- elimination-based
multiplayer card game.

Core gameplay revolves around:
- forced suit following
- strategic cuts
- punishment redistribution
- survival until others are eliminated.

The central tension is:
> the strongest card can become the most dangerous card.