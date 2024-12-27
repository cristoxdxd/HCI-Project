import React, { useState } from 'react';
import QuestionCard from './components/QuestionCard';
import Score from './components/Score';
import GameOver from './components/GameOver';

const questions = [
  {
    question: 'What is the capital of France?',
    options: ['Paris', 'Berlin', 'Madrid', 'Rome'],
    correct: 0,
  },
  {
    question: 'Who wrote "To Kill a Mockingbird"?',
    options: ['Harper Lee', 'J.K. Rowling', 'Ernest Hemingway', 'Mark Twain'],
    correct: 0,
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct: 1,
  },
];

const App = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleAnswer = (index) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setGameOver(true);
    }
  };

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">Questions Game</h1>
      {gameOver ? (
        <GameOver score={score} restartGame={restartGame} />
      ) : (
        <>
          <Score score={score} total={questions.length} />
          <QuestionCard
            question={questions[currentQuestion]}
            handleAnswer={handleAnswer}
          />
        </>
      )}
    </div>
  );
};

export default App;
