import React, { useState } from 'react';
import Login from './components/Login';
import QuestionCard from './components/QuestionCard';
import Score from './components/Score';
import GameOver from './components/GameOver';
import useGame from './hooks/useGame';

const App = () => {
  const [user, setUser] = useState(null);
  const {
    questions,
    currentQuestion,
    score,
    gameOver,
    correctAnswers,
    handleAnswer,
    restartGame,
  } = useGame(user);

  const handleLogin = (email) => {
    setUser(email);  // Guardar el email del usuario autenticado
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">Linux</h1>
      
      {user ? (
        gameOver ? (
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
      )  
      ) : (
        <Login handleLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;