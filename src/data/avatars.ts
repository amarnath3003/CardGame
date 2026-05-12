export interface AvatarPreset {
  id: number;
  name: string;
  type: 'doomer' | 'thug' | 'laser' | 'sad' | 'smug' | 'brainlet' | 'galaxy' | 'hype';
  gradient: string;
  accent: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 0,
    name: 'The Doomer',
    type: 'doomer',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    accent: '#374151',
  },
  {
    id: 1,
    name: 'Thug Life',
    type: 'thug',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    accent: '#fde68a',
  },
  {
    id: 2,
    name: 'Laser Focus',
    type: 'laser',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
    accent: '#fee2e2',
  },
  {
    id: 3,
    name: 'Sad Wojak',
    type: 'sad',
    gradient: 'linear-gradient(135deg, #9ca3af 0%, #4b5563 100%)',
    accent: '#f3f4f6',
  },
  {
    id: 4,
    name: 'Smug Pepe',
    type: 'smug',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
    accent: '#dcfce7',
  },
  {
    id: 5,
    name: 'Brainlet',
    type: 'brainlet',
    gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    accent: '#fee2e2',
  },
  {
    id: 6,
    name: 'Galaxy Brain',
    type: 'galaxy',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)',
    accent: '#e0e7ff',
  },
  {
    id: 7,
    name: 'Hype Beast',
    type: 'hype',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
    accent: '#fce7f3',
  },
];

export const getAvatarPreset = (index: number): AvatarPreset => {
  const total = AVATAR_PRESETS.length;
  const safeIndex = ((index % total) + total) % total;
  return AVATAR_PRESETS[safeIndex];
};
