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

// Obtener topics
app.get("/api/topics", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM topics");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener los topics:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Obtener categories por topic
app.get("/api/categories/:idTopic", async (req, res) => {
  const { idTopic } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE idtopic = $1",
      [idTopic]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
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
    // Verificar si el usuario ya existe
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" }); // Retorna error si el usuario no existe
    }

    // Usuario ya existe: Verificar contraseña
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({ message: "Inicio de sesión exitoso", email: user.email });
  } catch (error) {
    console.error("Error en el login", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Register Route
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Crear el usuario nuevo
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Question Route
app.get("/api/questions/:idCategory", async (req, res) => {
  try {
    // Consulta SQL para obtener las preguntas y sus opciones
    const { idCategory } = req.params;

    const result = await pool.query(`
    SELECT 
		q.idquestion,  
    q.question,
		q.correct,
    q.feedback,
		o.idoption,
		o.option
    FROM questions q
    LEFT JOIN options o ON o.idquestion = q.idquestion
    WHERE q.idcategory = $1`,
    [idCategory]
    );



    if (!result.rows || result.rows.length === 0) {
      return res.json([]); // Devolvemos un array vacío en caso de no haber resultados
    }

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
          feedback: row.feedback,
          options: row.option ? [row.option] : [],
        });
      }
    });

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Error al obtener las preguntas" });
  }
});

// Ruta para guardar o actualizar el progreso del usuario
app.post("/api/progress", async (req, res) => {
  const { email, idQuestion, status, responseTime } = req.body;

  if (!email || !idQuestion || typeof status !== "boolean" || responseTime == null) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {

    const responseTimeFormatted = parseFloat(responseTime).toFixed(2); // Asegurarse de que sea numérico y tenga dos decimales

    const userResult = await pool.query("SELECT iduser FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userId = userResult.rows[0].iduser;

    // Verificar si ya existe un registro para este usuario y pregunta
    const progressResult = await pool.query(
      "SELECT idprogress FROM progress WHERE iduser = $1 AND idquestion = $2",
      [userId, idQuestion]
    );

    if (progressResult.rows.length > 0) {
      // Actualizar el estado existente
      await pool.query(
        "UPDATE progress SET status = $1, response_time = $2 WHERE iduser = $3 AND idquestion = $4",
        [status, responseTimeFormatted, userId, idQuestion]
      );
    } else {
      // Insertar un nuevo registro de progreso
      await pool.query(
        "INSERT INTO progress (iduser, idquestion, status, response_time) VALUES ($1, $2, $3, $4)",
        [userId, idQuestion, status, responseTimeFormatted]
      );
    }

    res.status(200).json({ message: "Progreso guardado correctamente" });
  } catch (error) {
    console.error("Error al guardar el progreso:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
