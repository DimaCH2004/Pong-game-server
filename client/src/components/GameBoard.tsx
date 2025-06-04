import React, { useEffect, useState, useRef } from 'react';
import { GameState } from '@shared/types';
import { useGame } from '../hooks/useGame';
import './GameBoard.css';

const GameBoard: React.FC = () => {
  const { gameState, playerId, movePaddle, resetGame } = useGame();
  const boardRef = useRef<HTMLDivElement>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [smoothPaddle1, setSmoothPaddle1] = useState(0.5);
  const [smoothPaddle2, setSmoothPaddle2] = useState(0.5);
  
  // Calculate player role
  const isPlayer1 = playerId === gameState?.player1.id;
  const isPlayer2 = playerId === gameState?.player2.id;
  const isSpectator = !isPlayer1 && !isPlayer2;
  
  // Handle keyboard input
  useEffect(() => {
    if (!playerId || !gameState || isSpectator) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!boardRef.current) return;
      
      const boardHeight = boardRef.current.clientHeight;
      const paddleSpeed = 0.02;
      const isCurrentPlayer1 = isPlayer1;
      
      if ((isCurrentPlayer1 && e.key === 'ArrowUp') || 
          (!isCurrentPlayer1 && e.key === 'w')) {
        movePaddle(gameState[isCurrentPlayer1 ? 'player1' : 'player2'].position - paddleSpeed);
      } 
      else if ((isCurrentPlayer1 && e.key === 'ArrowDown') || 
               (!isCurrentPlayer1 && e.key === 's')) {
        movePaddle(gameState[isCurrentPlayer1 ? 'player1' : 'player2'].position + paddleSpeed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, playerId, movePaddle, isPlayer1, isSpectator]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) {
        const width = Math.min(window.innerWidth - 40, 800);
        const height = Math.min(window.innerHeight - 200, 600);
        setDimensions({ width, height });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth paddle positions
  useEffect(() => {
    if (gameState) {
      setSmoothPaddle1(prev => lerp(prev, gameState.player1.position, 0.2));
      setSmoothPaddle2(prev => lerp(prev, gameState.player2.position, 0.2));
    } else {
      // Reset paddles to center when game is resetting
      setSmoothPaddle1(0.5);
      setSmoothPaddle2(0.5);
    }
  }, [gameState]);

  // Linear interpolation function
  const lerp = (start: number, end: number, amt: number): number => {
    return (1 - amt) * start + amt * end;
  };

  if (!gameState || gameState.status === 'resetting') {
    return (
      <div className="game-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>
            {gameState?.status === 'resetting' 
              ? "Resetting game..." 
              : "Connecting to game server..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {controlsVisible && (
        <div className="controls-info">
          <div className="player-controls">
            <h3>Player 1: <span className={isPlayer1 ? "highlight" : ""}>YOU</span></h3>
            <p>Use <kbd>↑</kbd> <kbd>↓</kbd> arrow keys</p>
          </div>
          <div className="player-controls">
            <h3>Player 2: <span className={isPlayer2 ? "highlight" : ""}>YOU</span></h3>
            <p>Use <kbd>W</kbd> <kbd>S</kbd> keys</p>
          </div>
          <button 
            className="close-btn"
            onClick={() => setControlsVisible(false)}
          >
            ×
          </button>
        </div>
      )}
      
      <div 
        ref={boardRef}
        className="game-board"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`
        }}
      >
        {/* Center line */}
        <div className="center-line"></div>
        
        {/* Player 1 Paddle */}
        <div 
          className={`paddle ${isPlayer1 ? "player-you" : ""}`}
          style={{
            left: '1%',
            top: `${smoothPaddle1 * 100}%`,
            height: `${20}%`,
          }}
        />
        
        {/* Player 2 Paddle */}
        <div 
          className={`paddle ${isPlayer2 ? "player-you" : ""}`}
          style={{
            left: '97%',
            top: `${smoothPaddle2 * 100}%`,
            height: `${20}%`,
          }}
        />
        
        {/* Ball */}
        <div 
          className="ball"
          style={{
            left: `${gameState.ball.x * 100}%`,
            top: `${gameState.ball.y * 100}%`,
          }}
        />
        
        {/* Score display */}
        <div className="score player1-score">
          {gameState.player1.score}
        </div>
        <div className="score player2-score">
          {gameState.player2.score}
        </div>
      </div>
      
      {/* Game status messages */}
      {gameState.status === 'waiting' && (
        <div className="game-status waiting">
          <div className="pulse-animation"></div>
          <p>Waiting for opponent to join...</p>
          <p>Share this link: <code>{window.location.href}</code></p>
        </div>
      )}
      
      {gameState.status === 'game-over' && (
        <div className="game-status game-over">
          <h2>Game Over!</h2>
          <p className="winner">
            {gameState.player1.score > gameState.player2.score 
              ? 'Player 1 Wins!' 
              : 'Player 2 Wins!'}
          </p>
          <button 
            className="restart-btn"
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      )}
      
      {isSpectator && (
        <div className="spectator-notice">
          You are spectating. Refresh to join the next game.
        </div>
      )}
      
      {!controlsVisible && (
        <button 
          className="show-controls-btn"
            onClick={() => setControlsVisible(true)}
          >
            Show Controls
          </button>
        )}
      </div>
    );
  };
  
  export default GameBoard;