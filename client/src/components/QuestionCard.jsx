import React, { useEffect, useState } from "react";

const QuestionCard = ({ question, handleAnswer, currentOption }) => {
  if (!question) {
    return <div className="text-white">Cargando...</div>;
  }

  console.log("Rendering QuestionCard with:", { question, currentOption });

  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds initial
  const [startTime, setStartTime] = useState(Date.now()); // Start time

  useEffect(() => {
    setTimeLeft(30);
    setStartTime(Date.now());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(null, Math.floor((Date.now() - startTime) / 1000)); // Send timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Clear timer on unmount
  }, [question, startTime, handleAnswer]);

  const handleUserAnswer = (option) => {
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2); // Calculate time in seconds with 2 decimals
    console.log("Response time (seconds):", responseTime); // Verify calculated time
    handleAnswer(option, responseTime); // Send time to backend
  };

  const progressBarWidth = (timeLeft / 30) * 100;

  const getButtonClasses = (index) =>
    `${
      index === currentOption
        ? "bg-gradient-to-r from-orange-600 to-orange-600 scale-105"
        : "bg-gradient-to-r from-orange-500 to-orange-400"
    } text-[22px] text-white font-semibold py-3 px-5 rounded-lg  
       transition-transform transform hover:scale-105`;

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {question.question}
      </h2>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
        <div
          style={{ width: `${progressBarWidth}%` }}
          className="h-full bg-red-600 transition-all duration-1000"
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleUserAnswer(option)}
            className={getButtonClasses(index)}
            aria-label={`Option ${index + 1}: ${option}`}
            autoFocus={index === currentOption}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
