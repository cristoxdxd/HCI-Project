import React from 'react';

const GameOver = ({ score, correctAnswers, restartGame }) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 shadow-2xl rounded-lg p-10 w-full max-w-md text-center transform transition duration-500 hover:scale-105">
      <h2 className="text-3xl font-extrabold text-white mb-8">Game Over</h2>
      <p className="text-white text-xl mb-8">Your score: <span className="font-semibold">{score}</span></p>
      <button
        onClick={restartGame}
        className="bg-white text-purple-700 font-bold py-3 px-8 rounded-full hover:bg-purple-800 hover:text-white transition duration-300 transform hover:scale-110"
      >
        Restart
      </button>
    </div>
  );
};

export default GameOver;
