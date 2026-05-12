import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trophy } from 'lucide-react';
import { LayoutMetrics, RoundOutcome } from '../types';

interface RoundOverModalProps {
  title: string;
  message: string;
  detailLabel: string;
  detailValue: string;
  buttonLabel: string;
  outcome?: RoundOutcome | 'GAME_OVER';
  onContinue: () => void;
  onExit?: () => void;
  layout: LayoutMetrics;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  title,
  message,
  detailLabel,
  detailValue,
  buttonLabel,
  outcome = 'NORMAL',
  onContinue,
  onExit,
  layout,
}) => {
  const compact = layout.isCompactLandscape;
  const isGameOver = outcome === 'GAME_OVER';
  const isCut = outcome === 'CUT';
  const iconClass = compact ? 'h-10 w-10' : 'h-16 w-16';
  const Icon = isGameOver || isCut ? AlertTriangle : Trophy;
  const iconColor = isGameOver ? 'text-red-100' : isCut ? 'text-orange-100' : 'text-yellow-100';
  const titleGradient = isGameOver
    ? 'from-red-200 to-red-500'
    : isCut
      ? 'from-orange-100 to-yellow-400'
      : 'from-yellow-200 to-yellow-500';
  const shellGradient = isGameOver
    ? 'from-red-600 via-rose-700 to-orange-600'
    : isCut
      ? 'from-orange-500 via-amber-600 to-red-500'
      : 'from-indigo-500 via-purple-600 to-pink-500';
  const buttonGradient = isGameOver ? 'from-sky-400 to-blue-600' : 'from-green-400 to-green-600';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-4 py-4"
    >
      <motion.div
        initial={{ scale: 0.5, y: 100, rotateX: 45 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -50 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className={`relative w-full overflow-y-auto custom-scrollbar text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.4)] flex flex-col ${
          compact
            ? `max-w-[min(92vw,28rem)] rounded-[1.75rem] border-4 border-white/80 bg-gradient-to-br ${shellGradient} px-5 pb-5 pt-6`
            : `max-w-2xl rounded-[2rem] border-[6px] border-white/80 bg-gradient-to-br ${shellGradient} p-10`
        }`}
        style={{ maxHeight: compact ? 'min(88dvh, 24rem)' : 'min(90dvh, 42rem)' }}
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
          <Icon className={`${iconClass} ${iconColor}`} />
        </motion.div>

        <h1
          className={`shrink-0 bg-gradient-to-b ${titleGradient} bg-clip-text font-black uppercase text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] ${
            compact ? 'mb-3 mt-5 text-2xl leading-tight' : 'mb-4 mt-8 text-5xl'
          }`}
        >
          {title}
        </h1>

        <div className={`rounded-2xl border border-white/40 bg-gray-900 shadow-inner ${compact ? 'mb-5 px-4 py-3' : 'mb-8 p-6'}`}>
          <p className={`font-bold text-blue-100 ${compact ? 'mb-2 text-sm' : 'mb-3 text-lg'}`}>
            {message}
          </p>
          <p className={`font-bold uppercase text-blue-100 ${compact ? 'text-sm tracking-[0.2em]' : 'text-xl tracking-wider'}`}>
            {detailLabel}
          </p>
          <div className={`mt-2 font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.5)] ${compact ? 'text-3xl' : 'text-5xl'}`}>
            {detailValue}
          </div>
        </div>

        <div className={`flex flex-col gap-3 ${compact ? 'mt-auto' : 'mt-4'}`}>
          {buttonLabel && (
            <button
              onClick={onContinue}
              className={`rounded-full border-white bg-gradient-to-b ${buttonGradient} font-black text-white transition-all hover:scale-105 active:translate-y-[8px] active:shadow-[0_0px_0_#1a73e8,0_5px_10px_rgba(0,0,0,0.4)] ${
                compact
                  ? 'border-2 px-7 py-3 text-lg shadow-[0_6px_0_#1a73e8,0_12px_18px_rgba(0,0,0,0.35)]'
                  : 'border-[3px] px-12 py-4 text-2xl shadow-[0_8px_0_#1a73e8,0_15px_20px_rgba(0,0,0,0.4)]'
              }`}
            >
              {buttonLabel}
            </button>
          )}

          {onExit && (
            <button
              onClick={onExit}
              className={`rounded-full border-white bg-white/20 font-black text-white transition-all hover:bg-white/30 hover:scale-105 active:translate-y-[4px] ${
                compact
                  ? 'border-2 px-5 py-2 text-sm uppercase tracking-widest'
                  : 'border-[3px] px-10 py-3 text-lg uppercase tracking-[0.2em] md:text-xl'
              }`}
            >
              LEAVE GAME
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
