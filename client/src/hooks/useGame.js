import { useState, useEffect } from "react";
import axios from "axios";

const useGame = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("/api/questions");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (selectedOption) => {
    if (selectedOption === questions[currentQuestion].correct) {
      setScore((prevScore) => prevScore + 1);
      setCorrectAnswers((prevAnswers) => [
        ...prevAnswers,
        questions[currentQuestion].correct,
      ]);
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
    setCorrectAnswers([]);
  };

  return {
    questions,
    currentQuestion,
    score,
    gameOver,
    correctAnswers,
    handleAnswer,
    restartGame,
  };
};

export default useGame;
