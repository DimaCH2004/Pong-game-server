import React from 'react';
import GameBoard from './components/GameBoard';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 style={{ textAlign: 'center' }}>Multiplayer Pong</h1>
      <GameBoard />
    </div>
  );
};

export default App;