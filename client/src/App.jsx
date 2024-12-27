import React from 'react';
import QuestionCard from './components/QuestionCard';
import Score from './components/Score';
import GameOver from './components/GameOver';
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">Questions Game</h1>
      {gameOver ? (
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