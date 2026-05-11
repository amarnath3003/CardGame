export interface AvatarPreset {
  id: number;
  name: string;
  gradient: string;
  accent: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 0,
    name: 'Sky Burst',
    gradient: 'linear-gradient(135deg, #8fe4ff 0%, #3b82f6 100%)',
    accent: '#dbeafe',
  },
  {
    id: 1,
    name: 'Sun Splash',
    gradient: 'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
    accent: '#fff7d6',
  },
  {
    id: 2,
    name: 'Grass Dash',
    gradient: 'linear-gradient(135deg, #34d399 0%, #22c55e 100%)',
    accent: '#dcfce7',
  },
  {
    id: 3,
    name: 'Cherry Rush',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #ef4444 100%)',
    accent: '#fee2e2',
  },
  {
    id: 4,
    name: 'Ocean Pop',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
    accent: '#dbeafe',
  },
  {
    id: 5,
    name: 'Mango Flip',
    gradient: 'linear-gradient(135deg, #fcd34d 0%, #fb923c 100%)',
    accent: '#ffedd5',
  },
];

export const getAvatarPreset = (index: number): AvatarPreset => {
  const total = AVATAR_PRESETS.length;
  const safeIndex = ((index % total) + total) % total;
  return AVATAR_PRESETS[safeIndex];
};
