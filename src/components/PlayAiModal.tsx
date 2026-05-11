import React from 'react';
import { ModalShell } from './ModalShell';
import { AiDifficulty } from '../types';

interface PlayAiModalProps {
  difficulty: AiDifficulty;
  onSelectDifficulty: (difficulty: AiDifficulty) => void;
  onStart: () => void;
  onClose: () => void;
}

const DIFFICULTIES: AiDifficulty[] = ['Easy', 'Normal', 'Hard'];

export const PlayAiModal: React.FC<PlayAiModalProps> = ({
  difficulty,
  onSelectDifficulty,
  onStart,
  onClose,
}) => {
  return (
    <ModalShell title="Play with AI" subtitle="Quick Match" size="sm" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm font-semibold text-white/90">
          Pick a difficulty and jump straight into a match.
        </p>
        <div className="grid gap-3">
          {DIFFICULTIES.map((option) => {
            const isActive = option === difficulty;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelectDifficulty(option)}
                className={`flex items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-yellow-200 bg-white/20 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]'
                    : 'border-white/30 bg-white/10 text-white/80 hover:bg-white/15'
                }`}
              >
                <span className="text-base font-bold uppercase tracking-[0.18em]">
                  {option}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                  {isActive ? 'Selected' : 'Select'}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full border-[3px] border-white bg-gradient-to-b from-[#facc15] to-[#f97316] py-3 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#b45309,0_16px_30px_rgba(0,0,0,0.4)] transition hover:scale-[1.02] active:translate-y-[6px] active:shadow-[0_0px_0_#b45309,0_6px_14px_rgba(0,0,0,0.4)]"
        >
          Start Game
        </button>
      </div>
    </ModalShell>
  );
};
