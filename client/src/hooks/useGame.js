import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const useGame = (userEmail, isIAEnabled) => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentOption, setCurrentOption] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentQuestionRef = useRef(currentQuestion);

  // Sincronizar currentQuestionRef con el estado actual
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const restartGame = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setCurrentOption(0);
    setScore(0);
    setGameOver(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
  };

  const handleAnswer = useCallback(async (selectedOption, responseTime) => {
    const isCorrect = selectedOption === questions[currentQuestionRef.current]?.correct;

    setFeedback({
      isCorrect,
      correctAnswer: questions[currentQuestionRef.current]?.correct,
      details: questions[currentQuestionRef.current]?.feedback,
      nextLevelInfo: null,
      randomized: false,
      nextLevel: null,
    });

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setIncorrectAnswers((prev) => prev + 1);
    }

    try {
      const response = await axios.post("/api/progress", {
        email: userEmail,
        idQuestion: questions[currentQuestionRef.current]?.id,
        status: isCorrect,
        responseTime: responseTime,
      });

      const nextLevel = response.data?.nextLevel;

      setTimeout(() => {
        if (gameOver) return;  // Prevenir actualizaciones después de que el juego termine

        console.log(`Preguntas restantes: ${questions.length - (currentQuestionRef.current + 1)}`);

        let randomized = false;
        let nextQuestionIndex = -1;

        if (isIAEnabled && nextLevel) {
          nextQuestionIndex = questions.findIndex(
            (q, index) => String(q.idlevel) === String(nextLevel) && index > currentQuestionRef.current
          );
        }

        if (nextQuestionIndex === -1 && currentQuestionRef.current + 1 < questions.length) {
          nextQuestionIndex = currentQuestionRef.current + 1;
          randomized = true;
        }

        if (!isIAEnabled && currentQuestionRef.current + 1 < questions.length) {
          nextQuestionIndex = currentQuestionRef.current + 1;
          randomized = true;
        }

        if (nextQuestionIndex !== -1 && nextQuestionIndex < questions.length) {
          setCurrentQuestion(nextQuestionIndex);

          setFeedback((prevFeedback) => ({
            ...prevFeedback,
            nextLevelInfo: randomized
              ? (isIAEnabled
                  ? `No hay más preguntas del nivel ${nextLevel}, seleccionando una aleatoria...`
                  : `Modo aleatorio activado. Seleccionando una pregunta al azar...`)
              : `La siguiente pregunta será del nivel ${nextLevel}.`,
            randomized,
            isIAEnabled,
            nextLevel: questions[nextQuestionIndex].idlevel,
          }));
        } else {
          setGameOver(true);
        }

        if (!gameOver) {
          setTimeout(() => setFeedback(null), 6000);
        }
      }, 4000);
    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  }, [userEmail, isIAEnabled, gameOver]);

  // Cargar tópicos
  useEffect(() => {
    axios.get("/api/topics").then((res) => setTopics(res.data));
  }, []);

  // Cargar categorías cuando se selecciona un tópico
  useEffect(() => {
    if (selectedTopic) {
      axios.get(`/api/categories/${selectedTopic}`).then((res) => setCategories(res.data));
    }
  }, [selectedTopic]);

  // Cargar preguntas cuando se selecciona una categoría
  useEffect(() => {
    if (selectedCategory && userEmail) {
      axios.get(`/api/questions/${selectedCategory}/${userEmail}`).then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const shuffledQuestions = data.map((q) => ({
          ...q,
          options: q.options.sort(() => Math.random() - 0.5),
        }));
        setQuestions(shuffledQuestions);
        setCurrentQuestion(0);
        setScore(0);
        setGameOver(false);
        setFeedback(null);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
      }).catch((error) => console.error("Error fetching questions:", error));
    }
  }, [selectedCategory, userEmail]);

  return {
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
    incorrectAnswers,
    handleAnswer,
    restartGame,
  };
};

export default useGame;
