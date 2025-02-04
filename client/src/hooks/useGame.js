import { useState, useEffect } from "react";
import axios from "axios";

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const useGame = (userEmail,isEnabe) => {
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
    if (selectedCategory && userEmail) {
      axios.get(`/api/questions/${selectedCategory}/${userEmail}`)
        .then((res) => {
          // Verificamos si res.data es un array
          const data = Array.isArray(res.data) ? res.data : [];
          console.log("respuestaqqq: ", data)

          // Barajamos las opciones de cada pregunta antes de guardarlas en el estado
          const shuffledQuestions = data.map((q) => {
            const shuffledOptions = shuffleArray(q.options);
            return {
              ...q,
              options: shuffledOptions,
            };
          });

          setQuestions(shuffledQuestions);
          console.log("shufle: ", shuffledQuestions)
          setCurrentQuestion(0);
          setScore(0);
          setGameOver(false);
          setFeedback(null);
        })
        .catch((error) => {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        });
    }
  }, [selectedCategory, userEmail]);


  const handleAnswer = async (selectedOption, responseTime) => {
    const isCorrect = selectedOption === questions[currentQuestion].correct;

    setFeedback({
      isCorrect,
      correctAnswer: questions[currentQuestion].correct,
      details: questions[currentQuestion].feedback,
      nextLevelInfo: null, // Se actualizará más adelante
      randomized: false, // Indica si la pregunta fue elegida aleatoriamente
      nextLevel: null,
    });

    try {
      const response = await axios.post("/api/progress", {
        email: userEmail,
        idQuestion: questions[currentQuestion].id,
        status: isCorrect,
        responseTime: responseTime,
      });

      const nextLevel = response.data?.nextLevel;

      setTimeout(() => {
        setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));

        // Filtrar preguntas restantes
        const remainingQuestions = questions.filter((_, index) => index !== currentQuestion);

        // Buscar preguntas con el nivel `nextLevel`
        let nextQuestionIndex = remainingQuestions.findIndex(q => q.idlevel === nextLevel);
        let randomized = false;

        if (nextQuestionIndex === -1 && remainingQuestions.length > 0) {
          nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
          randomized = true; // Marcar que se seleccionó aleatoriamente
        }else if(!isEnabe){
          nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
        }

        if (remainingQuestions.length > 0 && nextQuestionIndex !== -1) {
          const selectedQuestion = remainingQuestions[nextQuestionIndex];

          setCurrentQuestion(questions.findIndex(q => q.id === selectedQuestion.id));
          setQuestions(remainingQuestions);

          // Actualizar feedback
          setFeedback((prevFeedback) => ({
            ...prevFeedback,
            nextLevelInfo: randomized
              ? `No hay más preguntas del nivel ${nextLevel}, seleccionando una pregunta aleatoria...`
              : `La siguiente pregunta será del nivel ${nextLevel}.`,
            randomized,
            isEnabe,
            nextLevel: selectedQuestion.idlevel,

          }));

          setTimeout(() => {
            setFeedback(null); // Esto permite que el juego continúe
          }, 6000); // Espera 2 segundos antes de ocultar el feedback
        }
      }, 3000);

    } catch (error) {
      console.error("Error al guardar el progreso:", error);
    }
  };

  // const handleAnswer = async (selectedOption, responseTime) => {
  //   const isCorrect = selectedOption === questions[currentQuestion].correct;

  //   setFeedback({
  //     isCorrect,
  //     correctAnswer: questions[currentQuestion].correct,
  //     details: questions[currentQuestion].feedback,
  //     nextLevel: null, // Se actualizará después
  //   });

  //   try {
  //     const response = await axios.post("/api/progress", {
  //       email: userEmail,
  //       idQuestion: questions[currentQuestion].id,
  //       status: isCorrect,
  //       responseTime: responseTime,
  //     });

  //     console.log("response en handleAnswer: ", response);

  //     const nextLevel = response.data?.nextLevel;
  //     console.log("nextLevel:", nextLevel);

  //     setTimeout(() => {
  //       setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));

  //       const remainingQuestions = questions.filter((_, index) => index !== currentQuestion);
  //       let nextQuestionIndex = remainingQuestions.findIndex(q => q.idlevel === nextLevel);

  //       if (nextQuestionIndex === -1 && remainingQuestions.length > 0) {
  //         nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
  //       }

  //       if (remainingQuestions.length > 0 && nextQuestionIndex !== -1) {
  //         const selectedQuestion = remainingQuestions[nextQuestionIndex];

  //         setCurrentQuestion(questions.findIndex(q => q.id === selectedQuestion.id)); 
  //         setQuestions(remainingQuestions); 

  //         setFeedback((prevFeedback) => ({
  //           ...prevFeedback,
  //           nextLevel: selectedQuestion.idlevel,
  //         }));

  //         // 🛑 Aquí agregamos la línea para limpiar el feedback después de mostrarlo
  //         setTimeout(() => {
  //           setFeedback(null); // Esto permite que el juego continúe
  //         }, 2000); // Espera 2 segundos antes de ocultar el feedback
  //       }
  //     }, 3000);


  //   } catch (error) {
  //     console.error("Error al guardar el progreso:", error);
  //   }
  // };


  const restartGame = () => {
    setSelectedTopic(null); // Reinicia el tema seleccionado
    setSelectedCategory(null);
    setQuestions([]);
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
