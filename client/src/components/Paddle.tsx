import React from 'react';

interface PaddleProps {
  position: number; // 0-1 (relative to game height)
  isPlayer1: boolean;
}

const Paddle: React.FC<PaddleProps> = ({ position, isPlayer1 }) => {
  const paddleStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position * 100}%`,
    left: isPlayer1 ? '1%' : '97%',
    width: '2%',
    height: '20%',
    backgroundColor: '#fff',
    transform: 'translateY(-50%)'
  };

  return <div style={paddleStyle} />;
};

export default Paddle;