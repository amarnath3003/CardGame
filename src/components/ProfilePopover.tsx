import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AvatarBadge } from './AvatarBadge';
import { AVATAR_PRESETS } from '../data/avatars';
import { Profile } from '../types';

interface ProfilePopoverProps {
  profile: Profile;
  onClose: () => void;
  onChangeName: (name: string) => void;
  onChangeAvatar: (index: number) => void;
}

export const ProfilePopover: React.FC<ProfilePopoverProps> = ({
  profile,
  onClose,
  onChangeName,
  onChangeAvatar,
}) => {
  const handleCycle = (direction: -1 | 1) => {
    const total = AVATAR_PRESETS.length;
    const next = (profile.avatarIndex + direction + total) % total;
    onChangeAvatar(next);
  };

  const currentPreset = AVATAR_PRESETS[profile.avatarIndex % AVATAR_PRESETS.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.96 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        className="absolute right-[calc(1rem+var(--safe-right))] top-[calc(5.5rem+var(--safe-top))] w-[min(90vw,22rem)] rounded-2xl border-2 border-white/60 bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] max-h-[calc(100dvh-6rem)] overflow-y-auto custom-scrollbar"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">Profile</p>
        <div className="mt-3 flex items-center gap-4">
          <AvatarBadge avatarIndex={profile.avatarIndex} label={profile.name} size="md" />
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
              Display Name
            </label>
            <input
              value={profile.name}
              onChange={(event) => onChangeName(event.target.value)}
              className="mt-2 w-full rounded-xl border-2 border-white/50 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-yellow-200"
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-white/30 bg-white/10 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
            Profile Photo
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleCycle(-1)}
              className="rounded-full border-2 border-white/70 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Previous avatar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex flex-col items-center gap-1">
              <AvatarBadge avatarIndex={profile.avatarIndex} label={currentPreset?.name || 'Player'} size="lg" />
              <p className="text-xs font-semibold text-white/80">{currentPreset?.name || 'Preset'}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCycle(1)}
              className="rounded-full border-2 border-white/70 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Next avatar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
