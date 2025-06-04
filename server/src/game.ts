import { Ball, GameState, Player, PlayerID } from '@shared/types';

const PADDLE_HEIGHT = 0.2;
const BALL_RADIUS = 0.015;
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

  resetGame(): void {
    this.state = {
      player1: {
        id: this.state.player1.id,
        position: 0.5,
        score: 0
      },
      player2: {
        id: this.state.player2.id,
        position: 0.5,
        score: 0
      },
      ball: {
        x: 0.5,
        y: 0.5,
        velocityX: Math.random() > 0.5 ? 1 : -1,
        velocityY: (Math.random() - 0.5) * 2,
        speed: INITIAL_BALL_SPEED
      },
      status: 'playing'
    };
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

    // Paddle collisions with predictive collision detection
    const hitPaddle1 = this.checkPaddleCollision(
      this.state.player1.position,
      true
    );
    
    const hitPaddle2 = this.checkPaddleCollision(
      this.state.player2.position,
      false
    );

    if (hitPaddle1 || hitPaddle2) {
      // Calculate bounce angle based on hit position
      const paddleY = hitPaddle1 ? 
        this.state.player1.position : 
        this.state.player2.position;
      
      const relativeY = (this.state.ball.y - paddleY) / PADDLE_HEIGHT;
      const bounceAngle = relativeY * (Math.PI/3) - Math.PI/6; // -30° to 30°
      
      // Update ball velocity
      this.state.ball.velocityX *= -1;
      this.state.ball.velocityY = Math.sin(bounceAngle);
      
      // Normalize velocity
      const magnitude = Math.sqrt(
        this.state.ball.velocityX ** 2 + 
        this.state.ball.velocityY ** 2
      );
      
      this.state.ball.velocityX /= magnitude;
      this.state.ball.velocityY /= magnitude;
      
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

  private checkPaddleCollision(position: number, isLeft: boolean): boolean {
    const PADDLE_MARGIN = 0.01;
    const paddleX = isLeft ? 0.02 : 0.98;
    const paddleTop = position;
    const paddleBottom = position + PADDLE_HEIGHT;
    
    // Calculate ball edges with prediction
    const nextX = this.state.ball.x + this.state.ball.velocityX * this.state.ball.speed;
    const nextY = this.state.ball.y + this.state.ball.velocityY * this.state.ball.speed;
    
    const ballLeft = Math.min(this.state.ball.x, nextX) - BALL_RADIUS;
    const ballRight = Math.max(this.state.ball.x, nextX) + BALL_RADIUS;
    const ballTop = Math.min(this.state.ball.y, nextY) - BALL_RADIUS;
    const ballBottom = Math.max(this.state.ball.y, nextY) + BALL_RADIUS;
    
    // Check collision with paddle
    const horizontalCollision = isLeft 
      ? ballLeft <= paddleX + PADDLE_MARGIN
      : ballRight >= paddleX - PADDLE_MARGIN;
      
    const verticalCollision = 
      ballBottom >= paddleTop - PADDLE_MARGIN && 
      ballTop <= paddleBottom + PADDLE_MARGIN;
    
    // Additional check for corner cases
    if (horizontalCollision && verticalCollision) {
      // Ensure ball is moving toward the paddle
      const isMovingTowardPaddle = isLeft 
        ? this.state.ball.velocityX < 0
        : this.state.ball.velocityX > 0;
      
      return isMovingTowardPaddle;
    }
    
    return false;
  }

  private resetBall(): void {
    // Random angle between -45° and 45° relative to horizontal
    const angle = (Math.random() * Math.PI/2) - Math.PI/4;
    const speed = INITIAL_BALL_SPEED;
    
    // Randomize direction toward the player who just scored
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    this.state.ball = {
      x: 0.5,
      y: 0.5,
      velocityX: Math.cos(angle) * direction,
      velocityY: Math.sin(angle),
      speed: speed
    };
  }

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state));
  }
}