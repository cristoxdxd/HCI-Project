const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Sample Route
app.get("/api/questions", async (req, res) => {
  try {
    // Consulta SQL para obtener las preguntas y sus opciones
    const result = await pool.query(`
    SELECT 
		q.idquestion,  
    q.question,
		q.correct,
		o.idoption,
		o.option
    FROM questions q
    LEFT JOIN options o ON o.idquestion = q.idquestion
    `);

    // Agrupar las opciones por cada pregunta
    const questions = [];
    result.rows.forEach((row) => {
      const existingQuestion = questions.find((q) => q.id === row.idquestion);

      if (existingQuestion) {
        existingQuestion.options.push(row.option);
      } else {
        questions.push({
          id: row.idquestion,
          question: row.question,
          correct: row.correct,
          options: [row.option],
        });
      }
    });

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Error al obtener las preguntas" });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
