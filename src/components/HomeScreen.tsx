import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, DoorOpen, Sparkles, Star } from 'lucide-react';
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

const FloatingElement = ({ delay, duration, x, y, scale, rotate, children }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3], 
      y: [y, y - 30, y], 
      x: [x, x + 15, x],
      rotate: [rotate, rotate + 15, rotate - 15, rotate],
      scale: [scale, scale * 1.1, scale]
    }}
    transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    className="absolute pointer-events-none"
  >
    {children}
  </motion.div>
);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", bounce: 0.5 }
    }
  };

  return (
    <div className="home-root relative min-h-[100dvh] w-full overflow-hidden text-white">
      {/* Dynamic Background FX */}
      <motion.div
        animate={{ x: [-120, 120], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute left-[-10%] top-[12%] h-32 w-64 rounded-full bg-white/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [120, -160], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute right-[-10%] top-[36%] h-40 w-72 rounded-full bg-[#facc15]/20 blur-[60px]"
      />
      <motion.div
        animate={{ y: [0, -100, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="pointer-events-none absolute left-[40%] bottom-[-10%] h-48 w-48 rounded-full bg-[#34d399]/20 blur-[50px]"
      />

      {/* Floating Decorative Elements */}
      <FloatingElement delay={0} duration={8} x={50} y={150} scale={1.2} rotate={15}>
        <div className="w-16 h-24 rounded-xl border-4 border-white/20 bg-gradient-to-br from-white/10 to-transparent shadow-lg backdrop-blur-sm" />
      </FloatingElement>
      <FloatingElement delay={2} duration={9} x={window.innerWidth - 150} y={100} scale={0.9} rotate={-20}>
        <div className="w-12 h-16 rounded-lg border-2 border-[#facc15]/40 bg-gradient-to-br from-[#facc15]/20 to-transparent shadow-[0_0_15px_rgba(250,204,21,0.3)] backdrop-blur-sm" />
      </FloatingElement>
      <FloatingElement delay={1.5} duration={11} x={window.innerWidth - 100} y={window.innerHeight - 250} scale={1.4} rotate={35}>
         <div className="w-20 h-28 rounded-2xl border-4 border-[#ff2222]/20 bg-gradient-to-br from-[#ff2222]/10 to-transparent shadow-xl backdrop-blur-md flex items-center justify-center">
            <Star className="text-[#ff2222]/50 w-8 h-8" />
         </div>
      </FloatingElement>
      <FloatingElement delay={3} duration={10} x={80} y={window.innerHeight - 200} scale={1} rotate={-10}>
        <div className="w-16 h-20 rounded-xl border-2 border-white/10 bg-white/5 backdrop-blur shadow-md flex items-center justify-center">
             <Sparkles className="text-white/30 w-6 h-6" />
        </div>
      </FloatingElement>

      {/* Profile Button - Top Right */}
      <div className="fixed right-4 top-4 z-50 md:right-6 md:top-6">
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="group flex items-center gap-3 rounded-[24px] border-[3px] border-white/40 bg-white/10 p-2 pr-5 shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 hover:border-yellow-200/60 active:scale-95"
        >
          <div className="relative">
             <AvatarBadge avatarIndex={profile.avatarIndex} label={profile.name} size="sm" />
             <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1e40af] bg-green-400" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300 drop-shadow-md">Player</p>
            <p className="text-sm font-bold text-white drop-shadow-sm line-clamp-1 max-w-[100px]">{profile.name}</p>
          </div>
        </motion.button>
      </div>

      <div className="absolute inset-0 flex -translate-y-6 flex-col items-center justify-center px-4 text-center z-30 md:-translate-y-10">
        {/* Main Title */}
        <motion.div
           initial={{ opacity: 0, scale: 0.5, y: -50 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
           className="relative mb-2"
        >
          <div className="absolute -inset-8 bg-yellow-400/20 blur-3xl rounded-full" />
          <h1 className="text-3d font-display text-5xl uppercase tracking-[0.1em] text-[#facc15] sm:text-6xl md:text-8xl">
            Seetu Atti
          </h1>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-8 -top-8 text-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]"
          >
             <Star className="w-12 h-12 fill-current" />
          </motion.div>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 max-w-md text-sm font-bold text-blue-100 tracking-wider drop-shadow-md sm:text-base md:text-lg rounded-full bg-black/20 px-6 py-2 border border-white/10 backdrop-blur-sm"
        >
          Shuffle up, launch rooms, and deal the action.
        </motion.p>

        {/* Buttons Menu */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-10 flex w-full max-w-sm flex-col gap-5 p-6 rounded-[2rem] border-4 border-white/20 bg-black/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-lg lg:max-w-md"
        >
          <motion.button
            variants={itemVariants}
            type="button"
            onClick={onPlayAi}
            className="group relative flex w-full items-center justify-center gap-3 rounded-full border-[4px] border-yellow-200 bg-gradient-to-b from-[#facc15] via-[#f97316] to-[#ea580c] px-6 py-4 text-xl font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#9a3412,0_15px_25px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.6)] transition-all hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_12px_0_#9a3412,0_20px_35px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.8)] active:translate-y-[8px] active:shadow-[0_0px_0_#9a3412,0_5px_10px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.4)]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Play className="h-7 w-7 text-3d-button fill-current drop-shadow-md" />
            <span className="text-3d-button drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">Play with AI</span>
          </motion.button>

          <motion.button
            variants={itemVariants}
            type="button"
            onClick={onCreateRoom}
            className="group relative flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-[#60a5fa] bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] px-6 py-3.5 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_0_#1e3a8a,0_12px_20px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.4)] transition-all hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_8px_0_#1e3a8a,0_16px_25px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(255,255,255,0.5)] active:translate-y-[6px] active:shadow-[0_0px_0_#1e3a8a,0_4px_8px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Users className="h-6 w-6 text-3d-button drop-shadow-md" />
            <span className="text-3d-button">Create Room</span>
          </motion.button>
          
          <motion.button
            variants={itemVariants}
            type="button"
            onClick={onJoinRoom}
            className="group relative flex w-full items-center justify-center gap-3 rounded-full border-[3px] border-[#34d399] bg-gradient-to-b from-[#10b981] to-[#16a34a] px-6 py-3.5 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_6px_0_#14532d,0_12px_20px_rgba(0,0,0,0.4),inset_0_2px_8px_rgba(255,255,255,0.4)] transition-all hover:brightness-110 hover:-translate-y-1 hover:shadow-[0_8px_0_#14532d,0_16px_25px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(255,255,255,0.5)] active:translate-y-[6px] active:shadow-[0_0px_0_#14532d,0_4px_8px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <DoorOpen className="h-6 w-6 text-3d-button drop-shadow-md" />
            <span className="text-3d-button">Join Room</span>
          </motion.button>
        </motion.div>
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
