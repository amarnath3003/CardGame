---
version: alpha
name: Sky Table Showdown
description: Bright, arcade-style card table set against a playful sky-and-horizon backdrop with glossy, toy-like surfaces.
colors:
  primary: "#1A8CFF"
  secondary: "#4DD2FF"
  tertiary: "#AADD00"
  sky-deep: "#1A8CFF"
  sky-mid: "#4DD2FF"
  sky-light: "#AADD00"
  grass-500: "#44AA00"
  grass-300: "#88E633"
  grass-200: "#AAFF55"
  sun-400: "#FFCC00"
  orange-500: "#F97316"
  red-500: "#FF2222"
  blue-600: "#0055FF"
  violet-500: "#8B5CF6"
  pink-500: "#EC4899"
  white: "#FFFFFF"
  black: "#000000"
  ink: "#0B1324"
  glass-10: "#FFFFFF1A"
  glass-20: "#FFFFFF33"
  glass-40: "#FFFFFF66"
  overlay-60: "#00000099"
  overlay-80: "#000000CC"
typography:
  display:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 900
    lineHeight: "1.1"
    letterSpacing: "0.08em"
  title:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: "1.2"
    letterSpacing: "0.04em"
  body:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5"
  label-caps:
    fontFamily: "system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: "1.2"
    letterSpacing: "0.2em"
rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  4xl: 64px
shadows:
  card: "0 8px 20px rgba(0,0,0,0.5)"
  avatar: "0 8px 16px rgba(0,0,0,0.3)"
  button: "0 8px 0 #B35900, 0 15px 30px rgba(0,0,0,0.4)"
  button-pressed: "0 0 0 #B35900, 0 5px 10px rgba(0,0,0,0.4)"
  glass: "0 8px 16px rgba(0,0,0,0.2)"
  modal: "0 20px 50px rgba(0,0,0,0.5)"
  glow: "0 0 18px #FFCC00"
elevation:
  level-1:
    shadow: "{shadows.glass}"
  level-2:
    shadow: "{shadows.card}"
  level-3:
    shadow: "{shadows.modal}"
motion:
  duration-fast: "150ms"
  duration-med: "200ms"
  duration-slow: "400ms"
  easing-standard: "cubic-bezier(0.2, 0.8, 0.2, 1)"
  easing-linear: "linear"
  spring-bouncy: "spring(1, 300, 25)"
components:
  background-sky:
    backgroundColor: "{colors.primary}"
  horizon-planet:
    backgroundColor: "{colors.grass-500}"
  header-chip:
    backgroundColor: "{colors.glass-20}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "{spacing.sm}"
  button-primary:
    backgroundColor: "{colors.sun-400}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "{spacing.lg}"
  button-primary-hover:
    backgroundColor: "{colors.orange-500}"
    textColor: "{colors.white}"
  button-primary-active:
    backgroundColor: "{colors.orange-500}"
    textColor: "{colors.white}"
  modal-shell:
    backgroundColor: "{colors.violet-500}"
    textColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "{spacing.2xl}"
  card-face:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
  card-back:
    backgroundColor: "{colors.blue-600}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
  avatar-badge:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

## Overview
A high-energy, arcade card table set in a cheerful sky. The interface feels like toy plastic and glossy enamel: bold, saturated colors, pill-shaped controls, and thick shadows that make everything feel pressable and physical. Motion is springy and playful, with drifting cloud elements to add life.

## Colors
The palette is a bright sky gradient with a grassy horizon, punctuated by bold primary accents for action states.

- Primary sky tones drive the background and ambient energy.
- Lime and grass greens form the horizon and grounding surface.
- Sunshine yellow and orange highlight primary actions and victory moments.
- Strong suit colors (red, blue, green, yellow) keep card identity instantly legible.
- Glass whites and dark overlays provide readability over the saturated backdrop.

## Typography
Typography is loud and legible: heavy weights, uppercased labels, and generous tracking to evoke a bold game-show vibe.

- Display text is uppercase and tightly stacked, with noticeable letter spacing.
- Body text is bold rather than regular to hold contrast over gradients.
- Label text is caps with wide tracking for badges and chips.

## Layout & Spacing
The layout is full-bleed and centered, with the play area anchored around a circular focal point. Spacing is compact but consistent, using a 4px base scale.

- The central play area remains visually dominant at all sizes.
- Safe-area padding is respected for buttons and chips.
- Player zones wrap around the center, maintaining symmetry in portrait and landscape.

## Elevation & Depth
Depth is created with strong, graphic shadows and layered gradients rather than subtle realism.

- Cards and buttons cast deep shadows to feel physical and movable.
- Glassy UI chips float above the scene with a faint blur and soft edges.
- Modals sit in a higher tier with heavy drop shadows and a vibrant gradient shell.

## Shapes
The shape language is round and toy-like: pill buttons, rounded cards, and chunky badges.

- Cards use large corner radii to read as modern and friendly.
- Buttons and chips are fully rounded pills.
- Modals and dialog shells use oversized rounded rectangles.

## Components
Key components should preserve the bold, playful character.

- Primary buttons are yellow-to-orange, heavy-weight, and bounce on press.
- Cards are high-contrast, with a glossy face and a dramatic back pattern.
- Player badges sit in rounded chips with glass-like translucency.
- The central pile sits on a subtle glowing ring to imply a drop zone.

## Do's and Don'ts
- Do keep colors saturated and cheerful; avoid muted palettes.
- Do use thick shadows and clear separation between layers.
- Do keep text bold and highly legible over gradients.
- Do keep motion springy and slightly exaggerated.
- Don't introduce thin, delicate outlines or low-contrast text.
- Don't flatten the scene with flat grays or minimalist shadows.
