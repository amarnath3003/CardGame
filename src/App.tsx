import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { PlayAiModal } from './components/PlayAiModal';
import { JoinRoomModal } from './components/JoinRoomModal';
import { LobbyModal } from './components/LobbyModal';
import { OrientationPrompt } from './components/OrientationPrompt';
import { AVATAR_PRESETS } from './data/avatars';
import { AiDifficulty, LobbySlot, LobbyState, Profile } from './types';
import { useMultiplayer } from './contexts/MultiplayerContext';

type Screen = 'home' | 'game';
type ActiveModal = 'play-ai' | 'join-room' | 'lobby' | null;

const ROOM_BASE_URL = 'https://seetuatti.game/room';
const DEFAULT_DIFFICULTY: AiDifficulty = 'Normal';

export default function App() {
  const {
    lobbyState,
    gameState,
    isHost,
    hostCreateLobby,
    clientJoinLobby,
    leaveLobby,
    updateLobbySlot,
    startGame,
    localPlayerId,
    error
  } = useMultiplayer();

  const screen: Screen = gameState ? 'game' : 'home';
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [playAiDifficulty, setPlayAiDifficulty] = useState<AiDifficulty>('Normal');
  const [profile, setProfile] = useState<Profile>({
    name: 'Player One',
    avatarIndex: 0,
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      alert(error);
      setActiveModal(null);
    }
  }, [error]);

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
    const roomId = generateRoomId();
    const slots = Array.from({ length: 4 }, (_, index) => createEmptySlot(index));
    slots[0] = {
      index: 0,
      type: 'human',
      name: profile.name || 'Player One',
      avatarIndex: profile.avatarIndex,
    };
    for (let i = 1; i < 4; i++) {
      slots[i] = {
        index: i,
        type: 'ai',
        name: 'AI Bot',
        avatarIndex: getAiAvatarIndex(i),
        difficulty: playAiDifficulty,
      };
    }
    hostCreateLobby(roomId, createLobby(roomId, slots, 0), true);
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
    hostCreateLobby(roomId, createLobby(roomId, slots, 0));
    setActiveModal('lobby');
  };

  const handleOpenJoinRoom = () => setActiveModal('join-room');

  const handleJoinRoom = async (roomId: string) => {
    try {
      await clientJoinLobby(roomId, profile);
      setActiveModal('lobby');
    } catch (err) {
      console.error(err);
      alert('Failed to join room.');
    }
  };

  const handleLeaveLobby = () => {
    setActiveModal(null);
    leaveLobby();
  };

  const updateLobbySlotHelper = (slotIndex: number, updater: (slot: LobbySlot) => LobbySlot) => {
    if (!lobbyState) return;
    const updatedSlots = lobbyState.slots.map((slot) =>
      slot.index === slotIndex ? updater(slot) : slot
    );
    updateLobbySlot({ ...lobbyState, slots: updatedSlots });
  };

  const handleAddAi = (slotIndex: number) => {
    updateLobbySlotHelper(slotIndex, (slot) => ({
      ...slot,
      type: 'ai',
      name: 'AI Bot',
      avatarIndex: getAiAvatarIndex(slotIndex),
      difficulty: DEFAULT_DIFFICULTY,
    }));
  };

  const handleClearSlot = (slotIndex: number) => {
    updateLobbySlotHelper(slotIndex, () => createEmptySlot(slotIndex));
  };

  const handleUpdateDifficulty = (slotIndex: number, difficulty: AiDifficulty) => {
    updateLobbySlotHelper(slotIndex, (slot) => ({
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
            isOwner={isHost}
            localPlayerId={localPlayerId}
            onClose={handleLeaveLobby}
            onLeave={handleLeaveLobby}
            onStart={() => startGame()}
            onAddAi={handleAddAi}
            onClearSlot={handleClearSlot}
            onUpdateDifficulty={handleUpdateDifficulty}
          />
        )}
      </AnimatePresence>

      <OrientationPrompt />
    </div>
  );
}
