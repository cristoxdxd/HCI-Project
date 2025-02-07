import React, { useEffect, useState } from "react";

const FeedbackCard = ({ feedback }) => {
  const [showNextLevelMessage, setShowNextLevelMessage] = useState(false);
  const [showRandomSelectionMessage, setShowRandomSelectionMessage] = useState(false);
  const [showFinalNextLevel, setShowFinalNextLevel] = useState(false);

  useEffect(() => {
    if (feedback.nextLevelInfo) {
      // Muestra el mensaje del siguiente nivel después de un retraso de 1.5 segundos
      setTimeout(() => setShowNextLevelMessage(true), 1500);

      // Si la selección es aleatoria, muestra ese mensaje después de 2 segundos
      if (feedback.randomized) {
        setTimeout(() => setShowRandomSelectionMessage(true), 2000);
      }

      // Muestra el mensaje final del siguiente nivel después de 3.5 segundos
      setTimeout(() => setShowFinalNextLevel(true), 3500);
    }
  }, [feedback.nextLevelInfo, feedback.randomized]);

  return (
    <div className="bg-white max-w-md mx-auto p-6 rounded-xl shadow-xl border border-gray-200 relative flex flex-col items-center text-center">
      {/* Título */}
      <div className="mb-4">
        <h2
          className={`${feedback.isCorrect ? "text-green-500" : "text-red-500"
            } font-extrabold text-4xl`}
        >
          <audio autoPlay>
            <source
              src={feedback.isCorrect ? "/muy_bien.mp3" : "/no_acertaste.mp3"}
              type="audio/mpeg"
            />
          </audio>
          {feedback.isCorrect ? "¡Muy bien!" : "¡No acertaste!"}
        </h2>
      </div>

      {/* Respuesta correcta y detalles */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-700">
          Respuesta correcta: {" "}
          <span className="text-orange-500">{feedback.correctAnswer}</span>
        </p>
        <p className="mt-4 text-gray-800 text-lg leading-relaxed">
          {feedback.details}
        </p>
      </div>

      {/* Texto motivador */}
      <div className="mt-2">
        <p className="text-lg text-gray-500 italic">
          {feedback.isCorrect
            ? "¡Sigue así! Estás aprendiendo cada vez más."
            : "No pasa nada, equivocarse es parte del aprendizaje."}
        </p>
      </div>

      {/* Mensaje sobre el siguiente nivel */}
      {showNextLevelMessage && feedback.nextLevelInfo && (
        <p className="text-blue-600 font-semibold mt-3">
          {feedback.randomized
            ? (feedback.isIAEnabled
              ? "No hay más preguntas del nivel, seleccionando una aleatoria..."
              : "Modo aleatorio activado. Seleccionando una pregunta al azar...")
            : feedback.nextLevelInfo}
        </p>
      )}

      {/* Imagen */}
      <div className="mt-6">
        <img src="/tux-logo.jpg" alt="Tux Mascot" />
      </div>
    </div>
  );
};

export default FeedbackCard;
