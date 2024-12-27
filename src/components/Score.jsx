import React from 'react';

const Score = ({ score, total }) => {
  return (
    <div className="mb-4 text-gray-700 p-4 bg-white shadow-lg rounded-lg">
      <p className="text-lg text-center">
        <span className="font-bold text-blue-600">Score:</span> 
        <span className="text-2xl text-green-500"> {score}</span> / 
        <span className="text-2xl text-gray-500"> {total}</span>
      </p>
    </div>
  );
};

export default Score;
