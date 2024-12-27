import React from 'react';

const GameOver = ({ score, restartGame }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Game Over</h2>
      <p className="text-gray-600 mb-4">Your score: <span className="font-semibold">{score}</span></p>
      <button
        onClick={restartGame}
        className="bg-green-500 text-white font-medium py-2 px-4 rounded hover:bg-green-600 transition"
      >
        Restart
      </button>
    </div>
  );
};

export default GameOver;
