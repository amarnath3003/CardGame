import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { GameState, LobbyState, Profile } from '../types';
import { GameEngine } from '../game/GameEngine';

export type MultiplayerMessage = 
  | { type: 'JOIN'; profile: Profile }
  | { type: 'LOBBY_UPDATE'; lobby: LobbyState }
  | { type: 'START_GAME'; gameState: GameState }
  | { type: 'GAME_STATE_UPDATE'; gameState: GameState }
  | { type: 'PLAY_CARD'; cardId: string; playerId: number }
  | { type: 'NEXT_ROUND'; playerId: number }
  | { type: 'BUY_CARDS'; targetPlayerId: number; buyerId: number };

interface MultiplayerContextValue {
  isHost: boolean;
  peerId: string | null;
  localPlayerId: number;
  lobbyState: LobbyState | null;
  gameState: GameState | null;
  hostCreateLobby: (roomId: string, lobby: LobbyState, autoStart?: boolean) => void;
  clientJoinLobby: (roomId: string, profile: Profile) => Promise<void>;
  leaveLobby: () => void;
  updateLobbySlot: (lobby: LobbyState) => void; // Host only
  startGame: () => void; // Host only
  playCard: (playerId: number, cardId: string) => void;
  nextRound: (playerId: number) => void;
  buyCards: (targetPlayerId: number, buyerId: number) => void;

  error: string | null;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export const useMultiplayer = () => {
  const ctx = useContext(MultiplayerContext);
  if (!ctx) throw new Error('useMultiplayer must be used within MultiplayerProvider');
  return ctx;
};

export const MultiplayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHost, setIsHost] = useState(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const [lobbyState, setLobbyState] = useState<LobbyState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const hostEngineRef = useRef<GameEngine | null>(null);

  // Connection lookup: connection.peer -> playerId
  const playerConnectionMap = useRef<Map<string, number>>(new Map());

  const cleanup = () => {
    connectionsRef.current.forEach(conn => conn.close());
    connectionsRef.current.clear();
    playerConnectionMap.current.clear();
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setLobbyState(null);
    setGameState(null);
    setIsHost(false);
    setPeerId(null);
    setError(null);
    hostEngineRef.current = null;
  };

  const broadcast = (msg: MultiplayerMessage) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) conn.send(msg);
    });
  };

  const syncEngineState = () => {
    if (!hostEngineRef.current) return;
    const state = hostEngineRef.current.getState();
    setGameState(state);
    broadcast({ type: 'GAME_STATE_UPDATE', gameState: state });
  };

  const hostCreateLobby = (roomId: string, initialLobby: LobbyState, autoStart: boolean = false) => {
    cleanup();
    setIsHost(true);
    setLobbyState(initialLobby);
    
    const peer = new Peer(roomId);
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
    });

    if (autoStart) {
      const names = initialLobby.slots.map(s => s.type === 'empty' ? 'AI Bot' : s.name);
      hostEngineRef.current = new GameEngine(names);
      const initialGameState = hostEngineRef.current.initializeGame();
      
      initialGameState.players.forEach((p, idx) => {
        p.isHuman = initialLobby.slots[idx].type === 'human';
      });

      setGameState(initialGameState);
      // No need to broadcast as peer isn't connected to anyone yet
    }

    peer.on('connection', (conn) => {
      connectionsRef.current.set(conn.peer, conn);

      conn.on('data', (data: any) => {
        const msg = data as MultiplayerMessage;
        if (msg.type === 'JOIN') {
          let joinedSlotIndex = -1;
          setLobbyState(prev => {
            if (!prev) return prev;
            const newLobby = { ...prev };
            // Find empty or AI slot
            const slotIndex = newLobby.slots.findIndex(s => s.type === 'empty' || s.type === 'ai');
            if (slotIndex !== -1) {
              joinedSlotIndex = slotIndex;
              newLobby.slots[slotIndex] = {
                index: slotIndex,
                type: 'human',
                name: msg.profile.name,
                avatarIndex: msg.profile.avatarIndex,
                peerId: conn.peer
              };
              playerConnectionMap.current.set(conn.peer, slotIndex);
            }
            // Send update to all
            broadcast({ type: 'LOBBY_UPDATE', lobby: newLobby });
            return newLobby;
          });
          
          // Send current game state to the joining player if game already started
          if (hostEngineRef.current && joinedSlotIndex !== -1) {
            const player = hostEngineRef.current.players[joinedSlotIndex];
            if (player) {
              player.isHuman = true;
              player.name = msg.profile.name;
            }
            syncEngineState();
            conn.send({ type: 'START_GAME', gameState: hostEngineRef.current.getState() });
          }
        } 
        else if (msg.type === 'PLAY_CARD' && hostEngineRef.current) {
          hostEngineRef.current.playCard(msg.playerId, msg.cardId);
          syncEngineState();
        }
        else if (msg.type === 'NEXT_ROUND' && hostEngineRef.current) {
          hostEngineRef.current.startNextRound();
          syncEngineState();
        }
        else if (msg.type === 'BUY_CARDS' && hostEngineRef.current) {
          hostEngineRef.current.buyAllCards(msg.buyerId, msg.targetPlayerId);
          syncEngineState();
        }

      });

      conn.on('close', () => {
        connectionsRef.current.delete(conn.peer);
        const pId = playerConnectionMap.current.get(conn.peer);
        if (pId !== undefined) {
          playerConnectionMap.current.delete(conn.peer);
          setLobbyState(prev => {
            if (!prev) return prev;
            const newLobby = { ...prev };
            
            // If game is active, replace with AI bot to prevent game from getting stuck
            const isGameActive = hostEngineRef.current !== null;
            
            newLobby.slots[pId] = {
              index: pId,
              type: isGameActive ? 'ai' : 'empty',
              name: isGameActive ? 'AI Bot (Replaced)' : 'Open Slot',
              avatarIndex: isGameActive ? (pId + 2) % 10 : null,
              difficulty: 'Normal'
            };
            
            // If game is active, we should also update the player type in GameEngine
            if (isGameActive && hostEngineRef.current) {
               const player = hostEngineRef.current.players[pId];
               if (player) {
                  player.isHuman = false;
                  player.name = 'AI Bot (Replaced)';
               }
               syncEngineState();
            }

            broadcast({ type: 'LOBBY_UPDATE', lobby: newLobby });
            return newLobby;
          });
        }
      });
    });

    peer.on('error', (err) => {
      setError(err.message);
    });
  };

  const clientJoinLobby = (roomId: string, profile: Profile): Promise<void> => {
    return new Promise((resolve, reject) => {
      cleanup();
      setIsHost(false);
      
      const peer = new Peer();
      peerRef.current = peer;

      peer.on('open', (id) => {
        setPeerId(id);
        const conn = peer.connect(roomId);
        connectionsRef.current.set('host', conn);

        conn.on('open', () => {
          conn.send({ type: 'JOIN', profile });
          resolve();
        });

        conn.on('data', (data: any) => {
          const msg = data as MultiplayerMessage;
          if (msg.type === 'LOBBY_UPDATE') {
            setLobbyState(msg.lobby);
          } else if (msg.type === 'START_GAME') {
            setGameState(msg.gameState);
          } else if (msg.type === 'GAME_STATE_UPDATE') {
            setGameState(msg.gameState);
          }
        });

        conn.on('close', () => {
          setError('Disconnected from host.');
          setLobbyState(null);
          setGameState(null);
        });
      });

      peer.on('error', (err) => {
        setError(err.message);
        reject(err);
      });
    });
  };

  const leaveLobby = () => {
    cleanup();
  };

  const updateLobbySlot = (newLobby: LobbyState) => {
    if (isHost) {
      setLobbyState(newLobby);
      broadcast({ type: 'LOBBY_UPDATE', lobby: newLobby });
    }
  };

  const startGame = () => {
    if (isHost && lobbyState) {
      const names = lobbyState.slots.map(s => s.type === 'empty' ? 'AI Bot' : s.name);
      // Ensure empty slots act as AI temporarily if they weren't explicitly added
      hostEngineRef.current = new GameEngine(names);
      const initialGameState = hostEngineRef.current.initializeGame();
      
      // Update human vs AI tags in the engine state based on the lobby
      initialGameState.players.forEach((p, idx) => {
        p.isHuman = lobbyState.slots[idx].type === 'human';
      });

      setGameState(initialGameState);
      broadcast({ type: 'START_GAME', gameState: initialGameState });
    }
  };

  const playCard = (playerId: number, cardId: string) => {
    if (isHost && hostEngineRef.current) {
      hostEngineRef.current.playCard(playerId, cardId);
      syncEngineState();
    } else {
      const conn = connectionsRef.current.get('host');
      if (conn?.open) {
        conn.send({ type: 'PLAY_CARD', playerId, cardId });
      }
    }
  };

  const nextRound = (playerId: number) => {
    if (isHost && hostEngineRef.current) {
      hostEngineRef.current.startNextRound();
      syncEngineState();
    } else {
      const conn = connectionsRef.current.get('host');
      if (conn?.open) {
        conn.send({ type: 'NEXT_ROUND', playerId });
      }
    }
  };

  const buyCards = (targetPlayerId: number, buyerId: number) => {
    if (isHost && hostEngineRef.current) {
      hostEngineRef.current.buyAllCards(buyerId, targetPlayerId);
      syncEngineState();
    } else {
      const conn = connectionsRef.current.get('host');
      if (conn?.open) {
        conn.send({ type: 'BUY_CARDS', targetPlayerId, buyerId });
      }
    }
  };



  // Auto AI Play for Host
  useEffect(() => {
    if (!isHost || !hostEngineRef.current || !gameState) return;
    if (gameState.gameStatus !== 'ROUND_ACTIVE') return;

    const currentSlot = lobbyState?.slots[gameState.currentPlayer];
    if (currentSlot && currentSlot.type === 'ai') {
      const timer = setTimeout(() => {
        if (hostEngineRef.current) {
          const legalMoves = hostEngineRef.current.getLegalMoves(gameState.currentPlayer);
          if (legalMoves.length > 0) {
            const chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            hostEngineRef.current.playCard(gameState.currentPlayer, chosenMove.id);
            syncEngineState();
          }
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isHost, gameState, lobbyState]);

  const localPlayerId = isHost ? 0 : (lobbyState?.slots.findIndex(s => s.peerId === peerId) ?? 0);

  return (
    <MultiplayerContext.Provider value={{
      isHost,
      peerId,
      localPlayerId: Math.max(0, localPlayerId),
      lobbyState,
      gameState,
      hostCreateLobby,
      clientJoinLobby,
      leaveLobby,
      updateLobbySlot,
      startGame,
      playCard,
      nextRound,
      buyCards,

      error
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};
