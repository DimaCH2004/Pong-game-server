import React from 'react';
import GameBoard from './components/GameBoard';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <header>
        <h1>Multiplayer Pong</h1>
        <p>A real-time multiplayer game powered by React and Socket.IO</p>
      </header>
      <main>
        <GameBoard />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} - Pong Game Project</p>
      </footer>
    </div>
  );
};

export default App;