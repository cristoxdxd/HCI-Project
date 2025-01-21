import { useState, useEffect } from "react";
import axios from "axios";

const useGame = (userEmail, category) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      
      if (!userEmail || !category?.selectedCategory?.id || !category?.selectedSubcategory?.id) {
        return;
      }

      try {
        const response = await axios.get("/api/questions", {
          params: {
            categoryId: category.selectedCategory.id,
            subcategoryId: category.selectedSubcategory.id,
          },
        });
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, [category]);

  const handleAnswer = async (selectedOption, responseTime) => {
    const isCorrect = selectedOption === questions[currentQuestion].correct;
  
    // Guardar el progreso en el backend
    try {
      await axios.post("/api/progress", {

        email: userEmail, // Asegúrate de pasar el email del usuario autenticado
        idQuestion: questions[currentQuestion].id,
        status: isCorrect,
        responseTime: responseTime,
        
      });
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  
    // Actualizar el estado local del juego
    setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
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
