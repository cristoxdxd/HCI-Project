import React, { useEffect, useState } from 'react';

const QuestionCard = ({ question, handleAnswer }) => {
  
  const [timeLeft, setTimeLeft] = useState(60); // 10 segundos iniciales
  const [startTime, setStartTime] = useState(Date.now()); // Tiempo de inicio

  useEffect(() => {
    
    setTimeLeft(60);
    setStartTime(Date.now());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(null, Math.floor((Date.now() - startTime) / 1000)); // Enviar tiempo agotado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Limpiar el temporizador al desmontar
  }, [question, startTime, handleAnswer])

  const handleUserAnswer = (option) => {
    const responseTime = ((Date.now() - startTime) / 1000).toFixed(2); // Calcular el tiempo en segundos con 2 decimales
    console.log("Tiempo de respuesta (segundos):", responseTime); // Verificamos el tiempo calculado
    handleAnswer(option, responseTime); // Enviar tiempo al backend
  };

  const progressBarWidth = (timeLeft / 60) * 100;
    
  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
        <div
          style={{ width: `${progressBarWidth}%` }}
          className="h-full bg-red-600 transition-all duration-1000"
        />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleUserAnswer(option)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-[22px] text-white font-semibold py-3 px-5 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-transform transform hover:scale-105"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
