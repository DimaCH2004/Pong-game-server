import React from 'react';

interface BallProps {
  x: number; // 0-1
  y: number; // 0-1
}

const Ball: React.FC<BallProps> = ({ x, y }) => {
  const ballStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${y * 100}%`,
    left: `${x * 100}%`,
    width: '2%',
    height: '2%',
    backgroundColor: '#fff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)'
  };

  return <div style={ballStyle} />;
};

export default Ball;