import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { GameState } from '@shared/types';

const SERVER_URL = 'http://localhost:4000';

export function useGame() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setPlayerId(newSocket.id ?? null);
    });

    // Game state updates
    newSocket.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    // Handle game full
    newSocket.on('game-full', () => {
      alert('Game is full! Try again later.');
      newSocket.disconnect();
      setPlayerId(null);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setPlayerId(null);
    };
  }, []);

  const movePaddle = (position: number) => {
    if (socket) {
      socket.emit('move-paddle', position);
    }
  };

  const resetGame = () => {
    if (socket) {
      socket.emit('reset-game');
      // Clear the game state temporarily to trigger re-render
      setGameState(null);
    }
  };

  return { gameState, playerId, movePaddle, resetGame };
}