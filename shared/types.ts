export type PlayerID = string;

export interface Player {
  id: PlayerID;
  position: number;
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  status: 'waiting' | 'playing' | 'game-over';
}