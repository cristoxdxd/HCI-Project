const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Sample Route
app.get("/api/questions", (_, res) => {
  res.json([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Paris", "Berlin", "Madrid", "Rome"],
      correct: 0,
    },
    {
      id: 2,
      question: 'Who wrote "To Kill a Mockingbird"?',
      options: ["Harper Lee", "J.K. Rowling", "Ernest Hemingway", "Mark Twain"],
      correct: 0,
    },
    {
      id: 3,
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correct: 1,
    },
    {
      id: 4,
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Jupiter", "Saturn"],
      correct: 1,
    },
    {
      id: 5,
      question: "What is the smallest country in the world?",
      options: ["Monaco", "Vatican City", "Maldives"],
      correct: 1,
    },
    {
      id: 6,
      question: "What is the largest mammal in the world?",
      options: ["Elephant", "Blue Whale", "Giraffe"],
      correct: 1,
    },
    {
      id: 7,
      question: "What is the largest ocean in the world?",
      options: ["Atlantic", "Indian", "Pacific"],
      correct: 2,
    },
    {
      id: 8,
      question: "What is the largest animal in the world?",
      options: ["Elephant", "Blue Whale", "Giraffe"],
      correct: 1,
    },
    {
      id: 9,
      question: "What is the largest bird in the world?",
      options: ["Ostrich", "Eagle", "Albatross"],
      correct: 0,
    },
    {
      id: 10,
      question: "What is the largest continent in the world?",
      options: ["Africa", "Asia", "Europe"],
      correct: 1,
    }
  ]);
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
