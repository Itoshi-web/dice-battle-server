import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// ... existing interfaces remain the same ...

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useGameStore = create(
  persist<GameStore>(
    (set, get) => ({
      socket: null,
      connected: false,
      currentRoom: null,
      username: '',
      error: null,
      gameHistory: null,
      emotesMuted: false,
      previousScreen: null as 'initial' | 'create' | 'join' | 'game' | null,

      connect: () => {
        socket.on('connect', () => {
          set({ connected: true, socket });
          console.log('Connected to server');
          
          // Attempt to rejoin room if disconnected
          const { currentRoom, username } = get();
          if (currentRoom && username) {
            socket.emit('rejoinRoom', { 
              roomId: currentRoom.id,
              username 
            });
          }
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          set({ error: 'Failed to connect to server. Please try again.' });
        });

        socket.on('disconnect', () => {
          set({ connected: false });
          console.log('Disconnected from server');
          toast.error('Disconnected from server. Attempting to reconnect...');
        });

        socket.on('error', ({ message }) => {
          set({ error: message });
          toast.error(message);
        });

        socket.on('roomCreated', ({ room }) => {
          set({ currentRoom: room, previousScreen: 'game' });
          toast.success('Room created successfully!');
        });

        socket.on('playerJoined', ({ room }) => {
          set({ currentRoom: room });
          toast.success(`${room.players[room.players.length - 1].username} joined the game!`);
        });

        socket.on('roomUpdated', ({ room }) => {
          set({ currentRoom: room });
        });

        socket.on('playerLeft', ({ room, username }) => {
          set({ currentRoom: room });
          toast.error(`${username} left the game`);
        });

        socket.on('gameStarted', ({ gameState }) => {
          set(state => ({
            currentRoom: state.currentRoom ? {
              ...state.currentRoom,
              started: true,
              gameState
            } : null
          }));
          toast.success('Game started!');
        });

        socket.on('gameStateUpdated', ({ gameState }) => {
          set(state => ({
            currentRoom: state.currentRoom ? {
              ...state.currentRoom,
              gameState
            } : null
          }));
        });

        socket.on('gameEnded', ({ history }) => {
          set({ gameHistory: history });
          toast.success(`${history.winner} won the game!`);
        });

        socket.on('rejoinSuccess', ({ room }) => {
          set({ currentRoom: room, previousScreen: 'game' });
          toast.success('Successfully rejoined the game!');
        });

        socket.on('emote', ({ username, emote }) => {
          const { emotesMuted } = get();
          if (!emotesMuted) {
            toast(emote, {
              icon: '💬',
              duration: 3000,
            });
          }
        });

        socket.connect();
      },

      createRoom: (maxPlayers, password) => {
        const { username } = get();
        if (!username) {
          set({ error: 'Please set a username first' });
          return;
        }
        socket.emit('createRoom', { maxPlayers, password, username });
      },

      joinRoom: (roomId, password) => {
        const { username } = get();
        if (!username) {
          set({ error: 'Please set a username first' });
          return;
        }
        socket.emit('joinRoom', { roomId, password, username });
      },

      quickMatch: () => {
        const { username } = get();
        if (!username) {
          set({ error: 'Please set a username first' });
          return;
        }
        socket.emit('quickMatch', { username });
      },

      setUsername: (username) => {
        set({ username });
      },

      toggleReady: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          socket.emit('toggleReady', { roomId: currentRoom.id });
        }
      },

      startGame: () => {
        const { currentRoom } = get();
        if (currentRoom) {
          socket.emit('startGame', { roomId: currentRoom.id });
        }
      },

      performGameAction: (action, data) => {
        const { currentRoom } = get();
        if (currentRoom) {
          socket.emit('gameAction', {
            roomId: currentRoom.id,
            action,
            data
          });
        }
      },

      sendEmote: (emote) => {
        const { currentRoom } = get();
        if (currentRoom) {
          socket.emit('sendEmote', {
            roomId: currentRoom.id,
            emote
          });
        }
      },

      toggleEmotes: () => {
        set(state => ({ emotesMuted: !state.emotesMuted }));
      },

      leaveRoom: () => {
        socket.emit('leaveRoom');
        set({ 
          currentRoom: null,
          gameHistory: null,
          previousScreen: 'initial'
        });
      },

      navigateBack: () => {
        const { previousScreen } = get();
        if (previousScreen === 'initial') {
          set({ 
            currentRoom: null,
            gameHistory: null,
            previousScreen: null
          });
        } else if (previousScreen === 'game') {
          set({ previousScreen: 'initial' });
        }
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'dice-battle-storage',
      partialize: (state) => ({
        username: state.username,
        currentRoom: state.currentRoom,
        emotesMuted: state.emotesMuted,
        previousScreen: state.previousScreen
      })
    }
  )
);