import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, DoorOpen, Sparkles, Star, Heart, Diamond, Spade, Club } from 'lucide-react';
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




      <div className="fixed right-4 top-4 z-50 md:right-6 md:top-6">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="relative flex items-center justify-center rounded-full border-[3px] border-white bg-gray-800 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)]"
        >
          <AvatarBadge avatarIndex={profile.avatarIndex} label={profile.name} size="sm" />
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1e40af] bg-green-400" />
        </button>
      </div>

      <div className="absolute inset-0 flex flex-col landscape:flex-row items-center justify-center px-4 text-center z-30 overflow-y-auto custom-scrollbar pt-20 pb-8 landscape:pt-4 landscape:pb-4 landscape:gap-12 md:gap-16">
        <div className="flex flex-col items-center justify-center shrink-0">
          {/* Main Title */}
          <div className="relative mb-8 landscape:mb-4">

            <h1 className="text-3d font-display text-5xl uppercase tracking-[0.1em] text-[#facc15] sm:text-6xl md:text-8xl">
              Seetu
            </h1>
            <div className="absolute -right-8 -top-8 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
               <Star className="w-12 h-12 fill-current" />
            </div>
          </div>

          {/* Card Suit Logo - ATTI (overlapping deck) */}
          <div className="flex justify-center items-center mb-8 landscape:mb-0 h-36 md:h-48 pl-8 md:pl-12">
            {/* Card Configs */}
            {[
              { rank: 'A', suit: 'h', icon: Heart, color: 'text-red-500', bg: 'from-red-100 to-red-300', rot: -15, y: 12 },
              { rank: 'T', suit: 'd', icon: Diamond, color: 'text-blue-500', bg: 'from-blue-100 to-blue-300', rot: -5, y: -4 },
              { rank: 'T', suit: 'c', icon: Club, color: 'text-green-600', bg: 'from-green-100 to-green-300', rot: 5, y: -4 },
              { rank: 'I', suit: 's', icon: Spade, color: 'text-gray-800', bg: 'from-gray-100 to-gray-300', rot: 15, y: 12 },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
              <div
                key={i}
                className={`relative -ml-8 md:-ml-12 w-20 h-32 md:w-28 md:h-44 text-xl md:text-2xl bg-gradient-to-br ${c.bg} border-white rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-[4px] overflow-hidden`}
                style={{ 
                  transformOrigin: 'bottom center', 
                  zIndex: i,
                  transform: `rotate(${c.rot}deg) translateY(${c.y}px)`
                }}
              >
                {/* Central ellipse backdrop - made more solid */}
                <div className="absolute w-[120%] h-[120%] rounded-full bg-white scale-[0.6] rotate-12 shadow-inner" />
                
                {/* Central big suit symbol */}
                <div className={`absolute z-10 drop-shadow-md pb-3 md:pb-4 ${c.color}`}>
                  <Icon className="w-12 h-12 md:w-16 md:h-16 fill-current" />
                </div>

                {/* Gloss reflection overlay - REMOVED */}

                {/* Top Left Corner */}
                <div className={`absolute z-20 text-center top-2 left-2 md:top-2 md:left-2 ${c.color}`}>
                  <div className="text-sm md:text-lg font-black leading-none drop-shadow-sm">{c.rank}</div>
                  <div className="flex justify-center mt-0.5">
                    <Icon className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  </div>
                </div>
                
                {/* Bottom Right Corner */}
                <div className={`absolute z-20 rotate-180 text-center bottom-2 right-2 md:bottom-2 md:right-2 ${c.color}`}>
                  <div className="text-sm md:text-lg font-black leading-none drop-shadow-sm">{c.rank}</div>
                  <div className="flex justify-center mt-0.5">
                    <Icon className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        {/* Buttons Menu */}
        <div className="mt-10 landscape:mt-0 flex w-full max-w-sm flex-col gap-5 p-6 rounded-[2rem] border-4 border-white bg-gray-900 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(255,255,255,0.05)] lg:max-w-md shrink-0">
          <button
            type="button"
            onClick={onPlayAi}
            className="relative flex w-full items-center justify-center gap-3 rounded-full border-[4px] border-yellow-200 bg-gradient-to-b from-[#facc15] via-[#f97316] to-[#ea580c] px-6 py-4 text-xl font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#9a3412,0_15px_25px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.6)] landscape:py-3"
          >
            <Play className="h-7 w-7 text-3d-button fill-current drop-shadow-md" />
            <span className="text-3d-button drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Play with AI</span>
          </button>

          <button
            type="button"
            onClick={onCreateRoom}
            className="relative flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-[#60a5fa] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] px-6 py-3.5 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_0_#1e3a8a,0_12px_20px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.4)] landscape:py-2.5"
          >
            <Users className="h-6 w-6 text-3d-button drop-shadow-md" />
            <span className="text-3d-button">Create Room</span>
          </button>
          
          <button
            type="button"
            onClick={onJoinRoom}
            className="relative flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-[#34d399] bg-gradient-to-b from-[#10b981] to-[#16a34a] px-6 py-3.5 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_0_#14532d,0_12px_20px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.4)] landscape:py-2.5"
          >
            <DoorOpen className="h-6 w-6 text-3d-button drop-shadow-md" />
            <span className="text-3d-button">Join Room</span>
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
