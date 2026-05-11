import React from 'react';
import { getAvatarPreset } from '../data/avatars';

interface AvatarBadgeProps {
  avatarIndex: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AvatarBadgeProps['size']>, string> = {
  sm: 'h-8 w-8 landscape:h-8 landscape:w-8 text-xs md:h-10 md:w-10 md:text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
};

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatarIndex,
  label,
  size = 'md',
  highlight = false,
}) => {
  const preset = getAvatarPreset(avatarIndex);
  const initial = label.trim().slice(0, 2).toUpperCase() || 'P';

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border-2 ${
        highlight ? 'border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-white/40'
      } ${SIZE_CLASSES[size]}`}
      style={{ backgroundImage: preset.gradient }}
      title={preset.name}
    >
      <div className="absolute inset-0 rounded-2xl bg-white/10" />
      <div className="absolute inset-2 rounded-xl border border-white/20" />
      <span className="relative z-10 font-black uppercase text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
        {initial}
      </span>
    </div>
  );
};
