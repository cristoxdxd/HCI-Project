import React from 'react';

const Score = ({ score, total }) => {
  return (
    <div className="mb-4 text-gray-700">
      <p className="text-md">
        <span className="font-semibold">Score:</span> {score} / {total}
      </p>
    </div>
  );
};

export default Score;
