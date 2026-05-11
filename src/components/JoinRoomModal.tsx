import React, { useState } from 'react';
import { ModalShell } from './ModalShell';

interface JoinRoomModalProps {
  onJoin: (roomId: string) => void;
  onClose: () => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({ onJoin, onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const trimmed = roomId.trim();
    if (!trimmed) {
      setError('Enter a room id to continue.');
      return;
    }
    setError('');
    onJoin(trimmed.toUpperCase());
  };

  return (
    <ModalShell title="Join Room" subtitle="Enter Code" size="sm" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm font-semibold text-white/90">
          Paste a room code to connect with your friends.
        </p>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
            Room ID
          </label>
          <input
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleJoin();
              }
            }}
            className="w-full rounded-2xl border-2 border-white/50 bg-white/10 px-4 py-3 text-lg font-semibold tracking-[0.18em] text-white outline-none transition focus:border-yellow-200 focus:bg-white/20"
            placeholder="AB12CD"
          />
          {error && <p className="text-sm font-semibold text-yellow-200">{error}</p>}
        </div>
        <button
          type="button"
          onClick={handleJoin}
          className="w-full rounded-full border-[3px] border-white bg-gradient-to-b from-[#22c55e] to-[#16a34a] py-3 text-lg font-black uppercase tracking-[0.2em] text-white shadow-[0_8px_0_#166534,0_16px_30px_rgba(0,0,0,0.4)] transition hover:scale-[1.02] active:translate-y-[6px] active:shadow-[0_0px_0_#166534,0_6px_14px_rgba(0,0,0,0.4)]"
        >
          Join Room
        </button>
      </div>
    </ModalShell>
  );
};
