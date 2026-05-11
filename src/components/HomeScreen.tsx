import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, DoorOpen } from 'lucide-react';
import { AvatarBadge } from './AvatarBadge';
import { ProfilePopover } from './ProfilePopover';
import { Profile } from '../types';

interface HomeScreenProps {
  profile: Profile;
  onPlayAi: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onProfileChange: (profile: Profile) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onPlayAi,
  onCreateRoom,
  onJoinRoom,
  onProfileChange,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileName = (name: string) => {
    onProfileChange({ ...profile, name });
  };

  const handleAvatarChange = (avatarIndex: number) => {
    onProfileChange({ ...profile, avatarIndex });
  };

  return (
    <div className="home-root relative min-h-[100dvh] w-full overflow-hidden text-white">
      <motion.div
        animate={{ x: [-120, 120], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute left-[-10%] top-[12%] h-24 w-48 rounded-full bg-white/20 blur-2xl"
      />
      <motion.div
        animate={{ x: [120, -160], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute right-[-10%] top-[26%] h-32 w-56 rounded-full bg-white/15 blur-3xl"
      />

      <div className="absolute right-[calc(1rem+var(--safe-right))] top-[calc(1rem+var(--safe-top))] z-40">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-3 rounded-2xl border-2 border-white/60 bg-white/10 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/20"
        >
          <AvatarBadge avatarIndex={profile.avatarIndex} label={profile.name} size="sm" />
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/70">Player</p>
            <p className="text-sm font-semibold text-white">{profile.name || 'Player One'}</p>
          </div>
        </button>
      </div>

      <div className="absolute inset-0 flex -translate-y-6 flex-col items-center justify-center px-4 text-center md:-translate-y-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-4xl uppercase tracking-[0.18em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)] sm:text-5xl md:text-7xl"
        >
          Seetu Atti
        </motion.h1>
        <p className="mt-3 max-w-md text-sm font-semibold text-white/80 sm:text-base">
          Shuffle up, launch rooms, and deal the action.
        </p>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAi}
            className="group flex items-center justify-center gap-3 rounded-full border-[3px] border-white bg-gradient-to-b from-[#facc15] to-[#f97316] px-6 py-3 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#b45309,0_16px_30px_rgba(0,0,0,0.4)] transition hover:scale-[1.02] active:translate-y-[6px] active:shadow-[0_0px_0_#b45309,0_6px_14px_rgba(0,0,0,0.4)]"
          >
            <Play className="h-5 w-5" />
            Play with AI
          </button>
          <button
            type="button"
            onClick={onCreateRoom}
            className="group flex items-center justify-center gap-3 rounded-full border-[3px] border-white/80 bg-white/10 px-6 py-3 text-base font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_rgba(15,23,42,0.6),0_16px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/20 active:translate-y-[6px]"
          >
            <Users className="h-5 w-5" />
            Create Room
          </button>
          <button
            type="button"
            onClick={onJoinRoom}
            className="group flex items-center justify-center gap-3 rounded-full border-[3px] border-white/80 bg-white/10 px-6 py-3 text-base font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_rgba(15,23,42,0.6),0_16px_30px_rgba(0,0,0,0.35)] transition hover:bg-white/20 active:translate-y-[6px]"
          >
            <DoorOpen className="h-5 w-5" />
            Join Room
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isProfileOpen && (
          <ProfilePopover
            profile={profile}
            onClose={() => setIsProfileOpen(false)}
            onChangeName={handleProfileName}
            onChangeAvatar={handleAvatarChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
