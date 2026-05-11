import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ModalShell } from './ModalShell';
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
    <ModalShell title="Player Profile" subtitle="Edit Details" size="sm" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-xl md:rounded-2xl border border-white/30 bg-white/10 p-3">
          <AvatarBadge avatarIndex={profile.avatarIndex} label={profile.name} size="md" />
          <div className="flex-1">
            <label className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Display Name
            </label>
            <input
              value={profile.name}
              onChange={(event) => onChangeName(event.target.value)}
              className="mt-1 md:mt-2 w-full rounded-lg md:rounded-xl border border-white/50 bg-white/10 px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base font-semibold text-white outline-none transition focus:border-yellow-200"
            />
          </div>
        </div>

        <div className="rounded-xl md:rounded-2xl border border-white/30 bg-white/10 p-3 md:p-4">
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            Profile Photo
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleCycle(-1)}
              className="rounded-full border border-white/70 bg-white/10 p-2 md:p-3 text-white transition hover:bg-white/20"
              aria-label="Previous avatar"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <div className="flex flex-col items-center gap-1">
              <AvatarBadge avatarIndex={profile.avatarIndex} label={currentPreset?.name || 'Player'} size="lg" />
              <p className="text-xs md:text-sm font-semibold text-white/80 mt-1">{currentPreset?.name || 'Preset'}</p>
            </div>
            <button
              type="button"
              onClick={() => handleCycle(1)}
              className="rounded-full border border-white/70 bg-white/10 p-2 md:p-3 text-white transition hover:bg-white/20"
              aria-label="Next avatar"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
