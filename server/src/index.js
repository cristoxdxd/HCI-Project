const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
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

// Login y Registro Combinado
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      // Usuario no existe: Registrar
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hashedPassword]
      );

      return res.status(201).json({ message: "Usuario registrado con éxito", email });
    }

    // Usuario ya existe: Verificar contraseña
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Inicio de sesión exitoso", email: user.email });
  } catch (error) {
    console.error("Error en el login/registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Verificar si el usuario existe en la base de datos
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length > 0) {
      // Usuario encontrado
      const user = result.rows[0];
      res.json({ message: "Inicio de sesión exitoso", user });
    } else {
      // Usuario no encontrado
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
  }
});

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
