import React from "react";

const FeedbackCard = ({ feedback }) => {
  return (
    <div className="bg-white max-w-md mx-auto p-6 rounded-xl shadow-xl border border-gray-200 relative flex flex-col items-center text-center">
      {/* Título */}
      <div className="mb-4">
        <h2
          className={`${
            feedback.isCorrect ? "text-green-500" : "text-red-500"
          } font-extrabold text-4xl`}
        >
          {feedback.isCorrect ? "¡Muy bien!" : "¡No acertaste!"}
        </h2>
      </div>

      {/* Respuesta correcta y detalles */}
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-700">
          Respuesta correcta:{" "}
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

      {/* Imagen */}
      <div className="mt-6">
        <img
          src="./public/tux-logo.jpg"
          alt="Tux Mascot"
        />
      </div>
    </div>
  );
};

export default FeedbackCard;
