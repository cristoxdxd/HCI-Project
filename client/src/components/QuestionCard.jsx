import React from 'react';

const QuestionCard = ({ question, handleAnswer }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-5 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-transform transform hover:scale-105"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
