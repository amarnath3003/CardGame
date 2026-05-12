import React, { useState } from 'react';
import { Copy, UserPlus, UserX } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { AvatarBadge } from './AvatarBadge';
import { AiDifficulty, LobbyState } from '../types';

interface LobbyModalProps {
  lobby: LobbyState;
  isOwner: boolean;
  localPlayerId: number;
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
  localPlayerId,
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
      {/* Outer wrapper — tighter vertical rhythm in landscape */}
      <div className="flex flex-col gap-2 landscape:gap-1.5 md:gap-4">

        {/* ── Share link bar ── */}
        <div className="flex items-center gap-2 rounded-xl border border-white bg-gray-800 p-2 landscape:py-1.5 md:rounded-2xl md:p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 shrink-0">Share</p>
          <div className="truncate rounded-lg border border-white bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white/90 flex-1 landscape:py-0.5">
            {lobby.roomLink}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white bg-gray-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gray-600 landscape:py-0.5"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* ── Players label — hidden in landscape to save vertical space ── */}
        <div className="hidden md:flex items-center justify-between">
          <p className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] text-white/80">
            Players {playersJoined}/4
          </p>
          <span className="rounded-full border border-white bg-gray-800 px-3 py-1 text-[8px] md:text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {isOwner ? 'Host Controls' : 'Waiting'}
          </span>
        </div>

        {/* ── 2×2 player grid ── */}
        <div className="grid grid-cols-2 gap-1.5 landscape:gap-1 md:gap-3">
          {lobby.slots.map((slot) => {
            const isOwnerSlot = lobby.ownerIndex === slot.index;
            const isLocalPlayer = localPlayerId === slot.index;
            const isEmpty = slot.type === 'empty';
            const isAi = slot.type === 'ai';

            return (
              <div
                key={slot.index}
                className={`flex flex-col gap-1.5 landscape:gap-1 md:gap-2 rounded-xl md:rounded-2xl border-2 p-2 landscape:p-1.5 md:p-3 ${
                  isLocalPlayer
                    ? 'border-green-400 bg-green-900'
                    : isOwnerSlot
                    ? 'border-yellow-200 bg-yellow-900'
                    : 'border-white bg-gray-800'
                }`}
              >
                {/* Avatar + name row */}
                <div className="flex items-center gap-2 landscape:gap-1.5">
                  <AvatarBadge
                    avatarIndex={slot.avatarIndex ?? 0}
                    label={slot.type === 'empty' ? 'Open' : slot.name}
                    size="sm"
                    highlight={isOwnerSlot || isLocalPlayer}
                    isAi={isAi}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="truncate text-xs font-bold text-white">
                        {slot.type === 'empty' ? 'Open' : slot.name}
                      </p>
                      {isLocalPlayer && (
                        <span className="rounded-full bg-green-400 px-1.5 py-0 text-[9px] font-black uppercase tracking-[0.1em] text-[#064e3b]">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/60">
                      Slot {slot.index + 1}
                    </p>
                  </div>
                </div>

                {/* AI difficulty select */}
                {isAi && (
                  <select
                    value={slot.difficulty}
                    onChange={(event) =>
                      onUpdateDifficulty(slot.index, event.target.value as AiDifficulty)
                    }
                    disabled={!isOwner}
                    className="w-full rounded-lg border border-white bg-gray-900 px-2 py-0.5 text-[10px] font-semibold text-white outline-none transition focus:border-yellow-200 disabled:cursor-not-allowed disabled:opacity-70 md:rounded-xl md:border-2 md:px-3 md:py-2 md:text-sm"
                  >
                    {DIFFICULTIES.map((level) => (
                      <option key={level} value={level} className="text-slate-900">
                        {level}
                      </option>
                    ))}
                  </select>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  {isEmpty && isOwner && (
                    <button
                      type="button"
                      onClick={() => onAddAi(slot.index)}
                      className="inline-flex items-center gap-1 rounded-full border border-white bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gray-600 md:border-2 md:px-3 md:py-1.5 md:text-xs"
                    >
                      <UserPlus className="h-3 w-3" />
                      Add AI
                    </button>
                  )}
                  {isAi && isOwner && (
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.index)}
                      className="inline-flex items-center gap-1 rounded-full border border-white bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gray-600 md:border-2 md:px-3 md:py-1.5 md:text-xs"
                    >
                      <UserX className="h-3 w-3" />
                      Remove AI
                    </button>
                  )}
                  {slot.type === 'human' && isOwner && !isOwnerSlot && (
                    <button
                      type="button"
                      onClick={() => onClearSlot(slot.index)}
                      className="inline-flex items-center gap-1 rounded-full border border-white bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-gray-600 md:border-2 md:px-3 md:py-1.5 md:text-xs"
                    >
                      <UserX className="h-3 w-3" />
                      Kick
                    </button>
                  )}
                  {isEmpty && !isOwner && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/50">
                      Waiting...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 pt-1.5 landscape:pt-1 md:pt-4">
          <p className="hidden text-sm font-semibold text-white/80 lg:block">
            Room status updates are shared locally.
          </p>
          {/* In landscape, show players count inline in footer */}
          <p className="text-[10px] font-semibold text-white/60 landscape:block hidden md:hidden">
            {playersJoined}/4 players
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onLeave}
              className="rounded-full border border-white bg-gray-800 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-gray-700 md:border-2 md:px-5 md:py-2 md:text-xs"
            >
              Leave
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={onStart}
                className="rounded-full border-2 border-white bg-gradient-to-b from-[#22c55e] to-[#16a34a] px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_2px_0_#166534] transition hover:scale-[1.02] active:translate-y-[2px] active:shadow-none md:border-[3px] md:px-8 md:py-2.5 md:text-sm md:shadow-[0_4px_0_#166534]"
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
