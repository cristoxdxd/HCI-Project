import React, { useState } from 'react';
import QuestionCard from './components/QuestionCard';
import Score from './components/Score';
import GameOver from './components/GameOver';
import Login from './components/Login';
import useGame from './hooks/useGame';

const App = () => {
  const {
    questions,
    currentQuestion,
    score,
    gameOver,
    correctAnswers,
    handleAnswer,
    restartGame,
  } = useGame();

  // Estado para manejar si el usuario ha iniciado sesión
  const [isLoggedIn, setIsLoggedIn] = useState(false);

   // Función para manejar el inicio de sesión
   const handleLogin = (email, password) => {
    // Aquí puedes agregar lógica para validar las credenciales
    console.log('Email:', email);
    console.log('Password:', password);

    // Simulamos que el inicio de sesión es exitoso
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">Linux</h1>
      {!isLoggedIn ? (
        // Mostrar el formulario de inicio de sesión si el usuario no está autenticado
        <Login handleLogin={handleLogin} />
      ) :gameOver ? (
        <GameOver score={score} correctAnswers={correctAnswers} restartGame={restartGame} />
      ) : (
        <>
          <Score score={score} total={questions.length} />
          {questions.length > 0 && (
            <QuestionCard
              question={questions[currentQuestion]}
              handleAnswer={handleAnswer}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;