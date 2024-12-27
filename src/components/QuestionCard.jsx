import React from 'react';

const QuestionCard = ({ question, handleAnswer }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h2>
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
