import React, { useState } from 'react';
import { Copy, UserPlus, UserX } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { AvatarBadge } from './AvatarBadge';
import { AiDifficulty, LobbyState } from '../types';

interface LobbyModalProps {
  lobby: LobbyState;
  isOwner: boolean;
  onClose: () => void;
  onLeave: () => void;
  onStart: () => void;
  onAddAi: (slotIndex: number) => void;
  onClearSlot: (slotIndex: number) => void;
  onUpdateDifficulty: (slotIndex: number, difficulty: AiDifficulty) => void;
}

const DIFFICULTIES: AiDifficulty[] = ['Easy', 'Normal', 'Hard'];

export const LobbyModal: React.FC<LobbyModalProps> = ({
  lobby,
  isOwner,
  onClose,
  onLeave,
  onStart,
  onAddAi,
  onClearSlot,
  onUpdateDifficulty,
}) => {
  const [copied, setCopied] = useState(false);

  const playersJoined = lobby.slots.filter((slot) => slot.type !== 'empty').length;

  const handleCopyLink = async () => {
    let success = false;

    try {
      await navigator.clipboard.writeText(lobby.roomLink);
      success = true;
    } catch (error) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = lobby.roomLink;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch (fallbackError) {
        success = false;
      }
    }

    setCopied(success);
    if (success) {
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <ModalShell title="Room Lobby" subtitle={`Room ${lobby.roomId}`} size="lg" onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-2xl border-2 border-white/30 bg-white/10 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Share Link</p>
              <div className="mt-2 rounded-2xl border-2 border-white/40 bg-white/5 px-4 py-2 font-semibold text-white/90">
                {lobby.roomLink}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 bg-white/15 px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
            >
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-white/80">
            Players {playersJoined}/4
          </p>
          <span className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            {isOwner ? 'Host Controls' : 'Waiting'}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {lobby.slots.map((slot) => {
            const isOwnerSlot = lobby.ownerIndex === slot.index;
            const isEmpty = slot.type === 'empty';
            const isAi = slot.type === 'ai';

            return (
              <div
                key={slot.index}
                className={`flex flex-col gap-3 rounded-2xl border-2 p-4 ${
                  isOwnerSlot
                    ? 'border-yellow-200 bg-yellow-200/10'
                    : 'border-white/30 bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <AvatarBadge
                    avatarIndex={slot.avatarIndex ?? 0}
                    label={slot.type === 'empty' ? 'Open' : slot.name}
                    size="sm"
                    highlight={isOwnerSlot}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-white">
                        {slot.type === 'empty' ? 'Open Slot' : slot.name}
                      </p>
                      {isOwnerSlot && (
                        <span className="rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#1f2937]">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Slot {slot.index + 1}
                    </p>
                  </div>
                </div>

                {isAi && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.26em] text-white/70">
                      AI Difficulty
                    </label>
                    <select
                      value={slot.difficulty}
                      onChange={(event) =>
                        onUpdateDifficulty(slot.index, event.target.value as AiDifficulty)
                      }
                      disabled={!isOwner}
                      className="rounded-xl border-2 border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none transition focus:border-yellow-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {DIFFICULTIES.map((level) => (
                        <option key={level} value={level} className="text-slate-900">
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  {isEmpty && isOwner && (
                    <button
                      type="button"
                      onClick={() => onAddAi(slot.index)}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add AI
                    </button>
                  )}
                  {isAi && isOwner && (
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.index)}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                    >
                      <UserX className="h-4 w-4" />
                      Remove AI
                    </button>
                  )}
                  {slot.type === 'human' && isOwner && !isOwnerSlot && (
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.index)}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
                    >
                      <UserX className="h-4 w-4" />
                      Kick
                    </button>
                  )}
                  {isEmpty && !isOwner && (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Waiting for player
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white/80">
            Room status updates are shared locally.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLeave}
              className="rounded-full border-2 border-white/70 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
            >
              Leave Room
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={onStart}
                className="rounded-full border-[3px] border-white bg-gradient-to-b from-[#22c55e] to-[#16a34a] px-6 py-2 text-sm font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_0_#166534] transition hover:scale-[1.02] active:translate-y-[4px] active:shadow-none"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
