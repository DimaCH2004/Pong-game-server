import { Ball, GameState, Player, PlayerID } from '@shared/types';

const PADDLE_HEIGHT = 0.2;
const BALL_SIZE = 0.02;
const INITIAL_BALL_SPEED = 0.01;

export class PongGame {
  private state: GameState = {
    player1: { id: '', position: 0.5, score: 0 },
    player2: { id: '', position: 0.5, score: 0 },
    ball: {
      x: 0.5,
      y: 0.5,
      velocityX: Math.random() > 0.5 ? 1 : -1,
      velocityY: (Math.random() - 0.5) * 2,
      speed: INITIAL_BALL_SPEED
    },
    status: 'waiting'
  };

  private players: PlayerID[] = [];

  addPlayer(playerId: PlayerID): number {
    if (this.players.length >= 2) return -1;
    
    this.players.push(playerId);
    if (this.players.length === 1) {
      this.state.player1.id = playerId;
    } else {
      this.state.player2.id = playerId;
      this.state.status = 'playing';
    }
    return this.players.length;
  }

  removePlayer(playerId: PlayerID): void {
    this.players = this.players.filter(id => id !== playerId);
    this.state.status = 'waiting';
  }

  movePaddle(playerId: PlayerID, position: number): void {
    if (playerId === this.state.player1.id) {
      this.state.player1.position = Math.max(0, Math.min(1 - PADDLE_HEIGHT, position));
    } else if (playerId === this.state.player2.id) {
      this.state.player2.position = Math.max(0, Math.min(1 - PADDLE_HEIGHT, position));
    }
  }

  update(): void {
    if (this.state.status !== 'playing') return;

    // Update ball position
    this.state.ball.x += this.state.ball.velocityX * this.state.ball.speed;
    this.state.ball.y += this.state.ball.velocityY * this.state.ball.speed;

    // Wall collisions (top/bottom)
    if (this.state.ball.y <= 0 || this.state.ball.y >= 1) {
      this.state.ball.velocityY *= -1;
      this.state.ball.y = Math.max(0, Math.min(1, this.state.ball.y));
    }

    // Paddle collisions
    const hitPaddle1 = (
      this.state.ball.x <= 0.02 &&
      this.state.ball.y >= this.state.player1.position &&
      this.state.ball.y <= this.state.player1.position + PADDLE_HEIGHT
    );

    const hitPaddle2 = (
      this.state.ball.x >= 0.98 &&
      this.state.ball.y >= this.state.player2.position &&
      this.state.ball.y <= this.state.player2.position + PADDLE_HEIGHT
    );

    if (hitPaddle1 || hitPaddle2) {
      // Calculate bounce angle based on hit position
      const paddleY = hitPaddle1 ? 
        this.state.player1.position : 
        this.state.player2.position;
      
      const relativeY = (this.state.ball.y - paddleY) / PADDLE_HEIGHT;
      const bounceAngle = relativeY * Math.PI - Math.PI / 2;
      
      // Update ball velocity
      this.state.ball.velocityX *= -1;
      this.state.ball.velocityY = Math.sin(bounceAngle);
      this.state.ball.speed *= 1.05; // Increase speed after hit
    }

    // Scoring
    if (this.state.ball.x < 0) {
      this.state.player2.score++;
      this.resetBall();
    } else if (this.state.ball.x > 1) {
      this.state.player1.score++;
      this.resetBall();
    }

    // Game over condition
    if (this.state.player1.score >= 5 || this.state.player2.score >= 5) {
      this.state.status = 'game-over';
    }
  }

  private resetBall(): void {
    this.state.ball = {
      x: 0.5,
      y: 0.5,
      velocityX: Math.random() > 0.5 ? 1 : -1,
      velocityY: (Math.random() - 0.5) * 2,
      speed: INITIAL_BALL_SPEED
    };
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }
}