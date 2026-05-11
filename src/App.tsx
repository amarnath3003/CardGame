import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { PlayAiModal } from './components/PlayAiModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { LobbyModal } from './components/LobbyModal';
import { AVATAR_PRESETS } from './data/avatars';
import { AiDifficulty, LobbySlot, LobbyState, Profile } from './types';

type Screen = 'home' | 'game';
type ActiveModal = 'play-ai' | 'join-room' | 'lobby' | null;

const ROOM_BASE_URL = 'https://seetuatti.game/room';
const DEFAULT_DIFFICULTY: AiDifficulty = 'Normal';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [playAiDifficulty, setPlayAiDifficulty] = useState<AiDifficulty>('Normal');
  const [profile, setProfile] = useState<Profile>({
    name: 'Player One',
    avatarIndex: 0,
  });
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [isLobbyOwner, setIsLobbyOwner] = useState(false);

  const getAiAvatarIndex = (slotIndex: number) =>
    (slotIndex + 2) % Math.max(1, AVATAR_PRESETS.length);

  const createEmptySlot = (index: number): LobbySlot => ({
    index,
    type: 'empty',
    name: 'Open Slot',
    avatarIndex: null,
  });

  const createRoomLink = (roomId: string) => `${ROOM_BASE_URL}/${roomId}`;

  const createLobby = (roomId: string, slots: LobbySlot[], ownerIndex: number): LobbyState => ({
    roomId,
    roomLink: createRoomLink(roomId),
    ownerIndex,
    slots,
  });

  const generateRoomId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  const handleOpenPlayAi = () => setActiveModal('play-ai');

  const handleStartPlayAi = () => {
    setActiveModal(null);
    setScreen('game');
  };

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    const slots = Array.from({ length: 4 }, (_, index) => createEmptySlot(index));
    slots[0] = {
      index: 0,
      type: 'human',
      name: profile.name || 'Player One',
      avatarIndex: profile.avatarIndex,
    };
    setLobbyState(createLobby(roomId, slots, 0));
    setIsLobbyOwner(true);
    setActiveModal('lobby');
  };

  const handleOpenJoinRoom = () => setActiveModal('join-room');

  const handleJoinRoom = (roomId: string) => {
    const slots = Array.from({ length: 4 }, (_, index) => createEmptySlot(index));
    slots[0] = {
      index: 0,
      type: 'human',
      name: 'Room Host',
      avatarIndex: getAiAvatarIndex(0),
    };
    slots[1] = {
      index: 1,
      type: 'human',
      name: profile.name || 'Player One',
      avatarIndex: profile.avatarIndex,
    };
    setLobbyState(createLobby(roomId, slots, 0));
    setIsLobbyOwner(false);
    setActiveModal('lobby');
  };

  const handleLeaveLobby = () => {
    setActiveModal(null);
    setLobbyState(null);
    setIsLobbyOwner(false);
  };

  const updateLobbySlot = (slotIndex: number, updater: (slot: LobbySlot) => LobbySlot) => {
    setLobbyState((prev) => {
      if (!prev) {
        return prev;
      }
      const updatedSlots = prev.slots.map((slot) =>
        slot.index === slotIndex ? updater(slot) : slot
      );
      return { ...prev, slots: updatedSlots };
    });
  };

  const handleAddAi = (slotIndex: number) => {
    updateLobbySlot(slotIndex, (slot) => ({
      ...slot,
      type: 'ai',
      name: 'AI Bot',
      avatarIndex: getAiAvatarIndex(slotIndex),
      difficulty: DEFAULT_DIFFICULTY,
    }));
  };

  const handleClearSlot = (slotIndex: number) => {
    updateLobbySlot(slotIndex, () => createEmptySlot(slotIndex));
  };

  const handleUpdateDifficulty = (slotIndex: number, difficulty: AiDifficulty) => {
    updateLobbySlot(slotIndex, (slot) => ({
      ...slot,
      difficulty,
    }));
  };

  const homeContent = (
    <HomeScreen
      profile={profile}
      onPlayAi={handleOpenPlayAi}
      onCreateRoom={handleCreateRoom}
      onJoinRoom={handleOpenJoinRoom}
      onProfileChange={setProfile}
    />
  );

  return (
    <div className="min-h-[100dvh] w-full">
      <AnimatePresence mode="wait">
        {screen === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {homeContent}
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {screen === 'home' && activeModal === 'play-ai' && (
          <PlayAiModal
            difficulty={playAiDifficulty}
            onSelectDifficulty={setPlayAiDifficulty}
            onStart={handleStartPlayAi}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {screen === 'home' && activeModal === 'join-room' && (
          <JoinRoomModal onJoin={handleJoinRoom} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {screen === 'home' && activeModal === 'lobby' && lobbyState && (
          <LobbyModal
            lobby={lobbyState}
            isOwner={isLobbyOwner}
            onClose={handleLeaveLobby}
            onLeave={handleLeaveLobby}
            onAddAi={handleAddAi}
            onClearSlot={handleClearSlot}
            onUpdateDifficulty={handleUpdateDifficulty}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
