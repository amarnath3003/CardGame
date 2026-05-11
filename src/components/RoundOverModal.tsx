import React from 'react';
import { motion } from 'framer-motion';

interface RoundOverModalProps {
  winnerName: string;
  highestCard: string;
  onContinue: () => void;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  winnerName,
  highestCard,
  onContinue,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
    >
      <motion.div 
        initial={{ scale: 0.5, y: 100, rotateX: 45 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -50 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-[2rem] p-10 text-center border-[6px] border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.4)] relative"
      >
        
        {/* Magic glow behind trophy */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300 blur-2xl opacity-50 rounded-full" />
        
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 text-7xl drop-shadow-xl"
        >
          🏆
        </motion.div>

        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] mt-8 mb-4 uppercase shrink-0">
          {winnerName} WINS!
        </h1>
        
        <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/20 shadow-inner">
          <p className="text-xl text-blue-100 font-bold uppercase tracking-wider">
            Winning Card
          </p>
          <div className="text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] mt-2">
            {highestCard}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="bg-gradient-to-b from-green-400 to-green-600 text-white font-black text-2xl py-4 px-12 rounded-full shadow-[0_8px_0_#1a73e8,0_15px_20px_rgba(0,0,0,0.4)] border-[3px] border-white active:shadow-[0_0px_0_#1a73e8,0_5px_10px_rgba(0,0,0,0.4)] active:translate-y-[8px] transition-all hover:scale-105"
        >
          NEXT ROUND
        </button>
      </motion.div>
    </motion.div>
  );
};
