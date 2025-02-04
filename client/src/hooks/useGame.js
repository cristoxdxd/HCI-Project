import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const useGame = (userEmail, isEnabled) => {
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentOption, setCurrentOption] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isRandomActive, setIsRandomActive] = useState(false);

  const [forceUpdate, setForceUpdate] = useState(false);

  // Refs para estados actuales
  const currentOptionRef = useRef(currentOption);
  const currentQuestionRef = useRef(currentQuestion);

  useEffect(() => {
    currentOptionRef.current = currentOption;
  }, [currentOption]);

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  const restartGame = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setCurrentOption(0);
    setScore(0);
    setGameOver(false);
    setCorrectAnswers([]);
  };

  const handleAnswer = useCallback(
    async (selectedOption, responseTime) => {
      const isCorrect = selectedOption === questions[currentQuestionRef.current].correct;
      console.log("veamos: ", isEnabled)
      setFeedback({
        isCorrect,
        correctAnswer: questions[currentQuestionRef.current].correct,
        details: questions[currentQuestionRef.current].feedback,
        nextLevelInfo: null,
        randomized: false,
        nextLevel: null,
        isEnabled,
      });
      
      try {
        const response = await axios.post("/api/progress", {
          email: userEmail,
          idQuestion: questions[currentQuestionRef.current].id,
          status: isCorrect,
          responseTime: responseTime,
        });
        
        const nextLevel = response?.data?.nextLevel || null;
        console.log("next: ", nextLevel)
        
        setTimeout(() => {
          let randomized = false;
          const remainingQuestions = questions.filter(
            (_, index) => index !== currentQuestionRef.current
          );
          console.log("preguntas restantes", remainingQuestions)
          
          let nextQuestionIndex = -1;
          
          if (isEnabled && nextLevel) {
            console.log("ia")
            nextQuestionIndex = remainingQuestions.findIndex(
              (q) => String(q.idlevel) === String(nextLevel)
            );
          }
          
          if (nextQuestionIndex === -1 && remainingQuestions.length > 0) {
            nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
            randomized = true;
          }
          
          if (remainingQuestions.length > 0 && nextQuestionIndex !== -1) {
            const selectedQuestion = remainingQuestions[nextQuestionIndex];
            setCurrentQuestion((prev) => prev + 1);
            
            setFeedback((prevFeedback) => ({
              ...prevFeedback,
              nextLevelInfo: isEnabled
                ? randomized
                  ? `No hay más preguntas del nivel ${nextLevel}, seleccionando una aleatoriamente...`
                  : `La siguiente pregunta será del nivel ${nextLevel}.`
                : "Selección Aleatoria Activada",
              randomized,
              nextLevel: selectedQuestion.idlevel,
            }));
            
            setQuestions(remainingQuestions);
          } else {
            setGameOver(true);
          }
          
          setTimeout(() => {
            setFeedback(null);
          }, 6000);
        }, 4000);
      } catch (error) {
        console.error("Error al guardar el progreso:", error);
      }
    },
    [questions, userEmail, isEnabled]
  ); 
  

  // Handle button press event from WebSocket message
  const handleButtonPress = useCallback(
    (buttonState) => {
      if (questions.length === 0 || gameOver) return;
      console.log("Raw Button state received:", buttonState);
      // Normalizar el valor de buttonState si es un objeto o string con formato diferente
      let normalizedState = buttonState.trim().toLowerCase();
      // Match the button state to a simpler format
      if (normalizedState.includes("up")) {
        normalizedState = "ArrowUp";
      } else if (normalizedState.includes("down")) {
        normalizedState = "ArrowDown";
      } else if (
        normalizedState.includes("x") ||
        normalizedState.includes("pressed")
      ) {
        normalizedState = "Enter";
      }
      console.log("Normalized Button state:", normalizedState);
      // setForceUpdate((prev) => !prev);
      switch (normalizedState) {
        case "ArrowUp":
          setCurrentOption((prevOption) => {
            const newOption = prevOption > 0 ? prevOption - 1 : prevOption;
            console.log("Updated currentOption (ArrowUp):", newOption);
            return newOption;
          });
          break;
        case "ArrowDown":
          setCurrentOption((prevOption) => {
            const newOption =
              prevOption <
                questions[currentQuestionRef.current].options.length - 1
                ? prevOption + 1
                : prevOption;
            console.log("Updated currentOption (ArrowDown):", newOption);
            return newOption;
          });
          break;
        case "Enter":
          console.log("Selecting answer:", currentOptionRef.current);
          handleAnswer(currentOptionRef.current);
          break;
        default:
          console.log("Unhandled button state:", buttonState);
          break;
      }
    },
    [questions, gameOver, handleAnswer]
  );

  // Set up WebSocket connection
  useEffect(() => {
    const socket = io(
      "wss://automatic-chainsaw-x4gq7qxq7vwh67xx-3001.app.github.dev/"
    );
    socket.on("connect", () => {
      console.log("WebSocket connected!");
    });
    socket.on("buttonState", (buttonState) => {
      console.log("Button received from WebSocket:", buttonState);
      handleButtonPress(buttonState);
    });
    socket.on("disconnect", () => {
      console.log("WebSocket disconnected.");
    });
    return () => {
      socket.disconnect();
    };
  }, [handleButtonPress]);

  useEffect(() => {
    axios.get("/api/topics").then((res) => setTopics(res.data));
  }, []);

  useEffect(() => {
    axios
      .get("/api/topics")
      .then((res) => setTopics(res.data))
      .catch((error) => console.error("Error al obtener topics:", error));
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      axios
        .get(`/api/categories/${selectedTopic}`)
        .then((res) => setCategories(res.data))
        .catch((error) => console.error("Error al obtener categories:", error));
    }
  }, [selectedTopic]);

  // Obtener preguntas cuando cambia la categoría seleccionada
  useEffect(() => {
    if (selectedCategory && userEmail) {
      axios
        .get(`/api/questions/${selectedCategory}/${userEmail}`)
        .then((res) => {
          // Verificamos si res.data es un array
          const data = Array.isArray(res.data) ? res.data : [];

          console.log("Fetched questions data:", data); // Debug log

          // Barajamos las opciones de cada pregunta antes de guardarlas en el estado
          const shuffledQuestions = data.map((q) => {
            if (!Array.isArray(q.options)) {
              console.error("Invalid options array for question:", q);
              return q;
            }
            const shuffledOptions = shuffleArray(q.options);
            return {
              ...q,
              options: shuffledOptions,
            };
          });

          console.log("Shuffled questions:", shuffledQuestions); // Debug log

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


  // const handleAnswer = async (selectedOption, responseTime) => {
  //   const isCorrect = selectedOption === questions[currentQuestion].correct;

  //   setFeedback({
  //     isCorrect,
  //     correctAnswer: questions[currentQuestion].correct,
  //     details: questions[currentQuestion].feedback,
  //     nextLevelInfo: null, // Se actualizará más adelante
  //     randomized: false, // Indica si la pregunta fue elegida aleatoriamente
  //     nextLevel: null,
  //   });

  //   try {
  //     const response = await axios.post("/api/progress", {
  //       email: userEmail,
  //     correctAnswer: questions[currentQuestion].correct,
  //     details: questions[currentQuestion].feedback,
  //     nextLevelInfo: null, // Se actualizará más adelante
  //     randomized: false, // Indica si la pregunta fue elegida aleatoriamente
  //     nextLevel: null,
  //   });

  //   try {
  //     const response = await axios.post("/api/progress", {
  //       email: userEmail,
  //       idQuestion: questions[currentQuestion].id,
  //       status: isCorrect,
  //       responseTime: responseTime,
  //     });

  //     const nextLevel = response.data?.nextLevel;

  //     setTimeout(() => {
  //       setScore((prevScore) => (isCorrect ? prevScore + 1 : prevScore));
  //       setCorrectAnswers((correctAnswers)=>(isCorrect ? correctAnswers+1:correctAnswers));

  //       // Filtrar preguntas restantes
  //       const remainingQuestions = questions.filter((_, index) => index !== currentQuestion);

  //       // Buscar preguntas con el nivel `nextLevel`
  //       let nextQuestionIndex = remainingQuestions.findIndex(q => q.idlevel === nextLevel);
  //       let randomized = false;

  //       if (nextQuestionIndex === -1 && remainingQuestions.length > 0) {
  //         nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
  //         randomized = true; // Marcar que se seleccionó aleatoriamente
  //       }else if(!isEnabe){
  //         nextQuestionIndex = Math.floor(Math.random() * remainingQuestions.length);
  //       }

  //       if (remainingQuestions.length > 0 && nextQuestionIndex !== -1) {
  //         const selectedQuestion = remainingQuestions[nextQuestionIndex];

  //         setCurrentQuestion(questions.findIndex(q => q.id === selectedQuestion.id));
  //         setQuestions(remainingQuestions);

  //         // Actualizar feedback
  //         setFeedback((prevFeedback) => ({
  //           ...prevFeedback,
  //           nextLevelInfo: randomized
  //             ? `No hay más preguntas del nivel ${nextLevel}, seleccionando una pregunta aleatoria...`
  //             : `La siguiente pregunta será del nivel ${nextLevel}.`,
  //           randomized,
  //           isEnabe,
  //           nextLevel: selectedQuestion.idlevel,

  //         }));


  //         setTimeout(() => {
  //           setFeedback(null); // Esto permite que el juego continúe
  //         }, 6000); // Espera 2 segundos antes de ocultar el feedback
  //       }
  //     }, 3000);

  //   } catch (error) {
  //     console.error("Error al guardar el progreso:", error);
  //   }
  // };

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


  // const restartGame = () => {
  //   setSelectedTopic(null); // Reinicia el tema seleccionado
  //   setSelectedCategory(null);
  //   setQuestions([]);
  //   setCurrentQuestion(0);
  //   setScore(0);
  //   setGameOver(false);
  //   setCorrectAnswers([]);
  // };

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
    handleAnswer,
    restartGame,
  };
};

export default useGame;
