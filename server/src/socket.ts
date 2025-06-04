import { Server } from 'socket.io';
import { PongGame } from './game';

export function setupSocket(io: Server) {
  const game = new PongGame();
  const gameUpdateInterval = 16; // ≈60fps

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Add player to game
    const playerCount = game.addPlayer(socket.id);
    
    if (playerCount === -1) {
      socket.emit('game-full');
      socket.disconnect();
      return;
    }

    // Send initial game state
    socket.emit('game-state', game.getState());

    // Handle paddle movement
    socket.on('move-paddle', (position: number) => {
      game.movePaddle(socket.id, position);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      game.removePlayer(socket.id);
      io.emit('player-disconnected', socket.id);
    });
  });

  // Game state updates
  setInterval(() => {
    game.update();
    io.emit('game-state', game.getState());
  }, gameUpdateInterval);
}