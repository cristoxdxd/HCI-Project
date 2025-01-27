import { useState, useEffect } from "react";
import axios from "axios";

const useGame = (userEmail, category) => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    axios.get("/api/topics").then((res) => setTopics(res.data));
  }, []);

  useEffect(() => {
    axios.get("/api/topics")
      .then((res) => setTopics(res.data))
      .catch((error) => console.error("Error al obtener topics:", error));
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      axios.get(`/api/categories/${selectedTopic}`)
        .then((res) => setCategories(res.data))
        .catch((error) => console.error("Error al obtener categories:", error));
    }
  }, [selectedTopic]);

  // Obtener preguntas cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory) {
      axios.get(`/api/questions/${selectedCategory}`)
        .then((res) => {
          setQuestions(Array.isArray(res.data) ? res.data : []);
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        });
    }
  }, [selectedCategory]);

  const handleAnswer = async (selectedOption, responseTime) => {
    
    const isCorrect = selectedOption === questions[currentQuestion].correct;

    setFeedback({
      isCorrect,
      correctAnswer: questions[currentQuestion].correct, // Respuesta correcta
      details: questions[currentQuestion].feedback, // Detalle adicional
    });
    

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

    setTimeout(() => {
    // Actualizar el estado local del juego
    setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setGameOver(true);
    }
    setFeedback(null); // Limpiar el feedback al pasar a la siguiente pregunta
    }, 5000); // 2 segundos para mostrar el feedback
  };
  

  const restartGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setGameOver(false);
    setCorrectAnswers([]);
  };

  return {
    topics,
    categories,
    questions,
    selectedTopic,
    setSelectedTopic,
    selectedCategory,
    setSelectedCategory,
    currentQuestion,
    score,
    gameOver,
    feedback,
    correctAnswers,
    handleAnswer,
    restartGame,
  };
};

export default useGame;
