import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import QuestionCard from "./components/QuestionCard";
import Score from "./components/Score";
import GameOver from "./components/GameOver";
import FeedbackCard from "./components/FeedbackCard";
import useGame from './hooks/useGame';
import ToggleSwitch from "./components/ToggleSwitch"; 

const App = () => {
  const [user, setUser] = useState(null);
  const [isIAEnabled, setIsIAEnabled] = useState(false);

  const {
    topics,
    categories,
    questions,
    selectedTopic,
    setSelectedTopic,
    selectedCategory,
    setSelectedCategory,
    currentQuestion,
    currentOption,
    score,
    gameOver,
    feedback,
    correctAnswers,
    handleAnswer,
    restartGame,
  } = useGame(user,isIAEnabled);

  const handleLogin = (email) => {
    setUser(email); // Save the authenticated user's email
  };

  useEffect(() => {
    console.log("App state updated:", {
      currentQuestion,
      currentOption,
      score,
      gameOver,
    });
  }, [currentQuestion, currentOption, score, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-gray-800 flex flex-col items-center justify-center text-center p-5">
      <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-lg">TuxLab</h1>
      {user && (
        <div className="mb-4">
          <ToggleSwitch
            isEnabled={isIAEnabled}
            onToggle={() => setIsIAEnabled((prev) => !prev)}
          />
        </div>
      )}

      {user ? (
        selectedCategory ? (
          <React.Fragment>
            {gameOver ? (
              <GameOver
                score={score}
                correctAnswers={correctAnswers}
                restartGame={restartGame}
              />
            ) : feedback ? (
              <FeedbackCard feedback={feedback} />
            ) : questions.length > 0 ? (
              <>
                <Score score={score} total={questions.length} />
                <QuestionCard
                  question={questions[currentQuestion]}
                  handleAnswer={handleAnswer}
                  currentOption={currentOption}
                />
              </>
            ) : (
              <div className="text-white">Cargando preguntas..</div>
            )}
          </React.Fragment>
        ) : (
          <>
            <label className="text-lg font-semibold mb-2 text-white">
              Selecciona un tema:
            </label>
            <div className="w-64 mb-4">
              <select
                className="w-full p-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {topics.map((topic) => (
                  <option key={topic.idtopic} value={topic.idtopic}>
                    {topic.topic}
                  </option>
                ))}
              </select>
            </div>

            {selectedTopic && (
              <>
                <label className="text-lg font-semibold mb-2 text-white">
                  Selecciona una categoría:
                </label>
                <div className="w-64 mb-4">
                  <select
                    className="w-full p-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">-- Seleccionar --</option>
                    {categories.map((category) => (
                      <option
                        key={category.idcategory}
                        value={category.idcategory}
                      >
                        {category.category}
                      </option>
                    ))}
                  </select>
                </div>
              </>
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
