import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { LayoutMetrics } from '../types';

interface RoundOverModalProps {
  winnerName: string;
  highestCard: string;
  onContinue: () => void;
  layout: LayoutMetrics;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  winnerName,
  highestCard,
  onContinue,
  layout,
}) => {
  const compact = layout.isCompactLandscape;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, rotateX: 45 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -50 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className={`relative w-full overflow-hidden text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.4)] ${
          compact
            ? 'max-w-[min(92vw,28rem)] rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 px-5 pb-5 pt-6'
            : 'max-w-2xl rounded-[2rem] border-[6px] border-white/80 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-10'
        }`}
        style={{ maxHeight: compact ? 'min(88dvh, 22rem)' : 'min(90dvh, 42rem)' }}
      >
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-yellow-300 opacity-50 ${
            compact ? '-top-10 h-20 w-20 blur-xl' : '-top-16 h-32 w-32 blur-2xl'
          }`}
        />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute left-1/2 -translate-x-1/2 drop-shadow-xl ${
            compact ? '-top-8 text-4xl' : '-top-16 text-7xl'
          }`}
        >
          <Trophy className={`${compact ? 'h-10 w-10' : 'h-16 w-16'} text-yellow-100`} />
        </motion.div>

        <h1
          className={`shrink-0 bg-gradient-to-b from-yellow-200 to-yellow-500 bg-clip-text font-black uppercase text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] ${
            compact ? 'mb-3 mt-5 text-2xl leading-tight' : 'mb-4 mt-8 text-5xl'
          }`}
        >
          {winnerName} WINS!
        </h1>

        <div className={`rounded-2xl border border-white/20 bg-black/40 shadow-inner ${compact ? 'mb-5 px-4 py-3' : 'mb-8 p-6'}`}>
          <p className={`font-bold uppercase text-blue-100 ${compact ? 'text-sm tracking-[0.2em]' : 'text-xl tracking-wider'}`}>
            Winning Card
          </p>
          <div className={`mt-2 font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] ${compact ? 'text-3xl' : 'text-5xl'}`}>
            {highestCard}
          </div>
        </div>

        <button
          onClick={onContinue}
          className={`rounded-full border-white bg-gradient-to-b from-green-400 to-green-600 font-black text-white transition-all hover:scale-105 active:translate-y-[8px] active:shadow-[0_0px_0_#1a73e8,0_5px_10px_rgba(0,0,0,0.4)] ${
            compact
              ? 'border-2 px-7 py-3 text-lg shadow-[0_6px_0_#1a73e8,0_12px_18px_rgba(0,0,0,0.35)]'
              : 'border-[3px] px-12 py-4 text-2xl shadow-[0_8px_0_#1a73e8,0_15px_20px_rgba(0,0,0,0.4)]'
          }`}
        >
          NEXT ROUND
        </button>
      </motion.div>
    </motion.div>
  );
};
