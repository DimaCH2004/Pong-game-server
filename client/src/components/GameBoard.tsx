import React, { useEffect } from 'react';
import Paddle from './Paddle';
import Ball from './Ball';
import { useGame } from '../hooks/useGame';

const GameBoard: React.FC = () => {
  const { gameState, playerId, movePaddle } = useGame();
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Handle keyboard input
  useEffect(() => {
    if (!playerId || !gameState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardRef.current) return;
      
      const boardHeight = boardRef.current.clientHeight;
      const paddleSpeed = 0.02;
      const isPlayer1 = playerId === gameState.player1.id;
      
      if ((isPlayer1 && e.key === 'ArrowUp') || 
          (!isPlayer1 && e.key === 'w')) {
        movePaddle(gameState[isPlayer1 ? 'player1' : 'player2'].position - paddleSpeed);
      } 
      else if ((isPlayer1 && e.key === 'ArrowDown') || 
               (!isPlayer1 && e.key === 's')) {
        movePaddle(gameState[isPlayer1 ? 'player1' : 'player2'].position + paddleSpeed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerId, movePaddle]);

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div 
      ref={boardRef}
      style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        backgroundColor: '#000',
        margin: '0 auto'
      }}
    >
      <Paddle 
        position={gameState.player1.position} 
        isPlayer1={true} 
      />
      <Paddle 
        position={gameState.player2.position} 
        isPlayer1={false} 
      />
      <Ball x={gameState.ball.x} y={gameState.ball.y} />
      
      {/* Score display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#fff',
        fontSize: '24px'
      }}>
        {gameState.player1.score} - {gameState.player2.score}
      </div>
      
      {/* Game status messages */}
      {gameState.status === 'waiting' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff'
        }}>
          Waiting for opponent...
        </div>
      )}
      
      {gameState.status === 'game-over' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h2>Game Over!</h2>
          <p>
            {gameState.player1.score > gameState.player2.score 
              ? 'Player 1 Wins!' 
              : 'Player 2 Wins!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default GameBoard;