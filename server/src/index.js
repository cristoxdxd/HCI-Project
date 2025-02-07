const express = require("express");
const cors = require("cors");
const { createClient } = require("@libsql/client");
const bcrypt = require("bcrypt");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const pool = createClient({
  url: "file:local.db",
  syncUrl: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 10000,
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
// app.get("/api/questions/:idCategory/:email", async (req, res) => {
//   try {
//     // Consulta SQL para obtener las preguntas y sus opciones
//     console.log("entro a api/questions/")
//     const { idCategory, email } = req.params;

//     // Obtener el userId y el next_level más reciente del usuario
//     const userResult = await pool.query(
//       "SELECT iduser FROM users WHERE email = $1",
//       [email]
//     );

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: "Usuario no encontrado" });
//     }

//     const userId = userResult.rows[0].iduser;
//     console.log("userID: ", userId)

//     // Obtener el next_level más reciente del usuario
//     const levelResult = await pool.query(
//       "SELECT next_level FROM progress WHERE iduser = $1 ORDER BY idprogress DESC LIMIT 1",
//       [userId]
//     );

//     // Si no hay progreso registrado, asignar un nivel por defecto (nivel 1)
//     // const nextLevel = levelResult.rows.length > 0 ? levelResult.rows[0].next_level : 1;
//     nextLevel = 1
//     console.log("next level: ", nextLevel)

//     // const query = `
//     // SELECT 
//     // q.idquestion,  
//     // q.question,
//     // q.correct,
//     // q.feedback,
//     // o.idoption,
//     // o.option,
//     // q.idlevel
//     // FROM questions q
//     // LEFT JOIN options o ON o.idquestion = q.idquestion
//     // WHERE q.idcategory = $1 
//     // AND q.idlevel = $2
//     // AND q.idquestion NOT IN (
//     // SELECT idquestion FROM progress 
//     // WHERE iduser = $3 
//     // AND status = TRUE -- Filtra solo las preguntas contestadas correctamente
//     // )
//     // `;

//     const query = `
//     SELECT 
//     q.idquestion,  
//     q.question,
//     q.correct,
//     q.feedback,
//     o.idoption,
//     o.option,
//     q.idlevel -- Incluimos el idlevel para cada pregunta
//     FROM questions q
//     LEFT JOIN options o ON o.idquestion = q.idquestion
//     WHERE q.idcategory = $1
//     AND q.idquestion NOT IN (
//     SELECT idquestion FROM progress 
//     WHERE iduser = $2 
//     AND status = TRUE -- Filtra solo las preguntas contestadas correctamente
//     )` 
//     ;


//     const result = await pool.query(query, [idCategory, nextLevel, userId]);

//     if (!result.rows || result.rows.length === 0) {
//       return res.json([]); // Devolvemos un array vacío en caso de no haber resultados
//     }

//     // Agrupar las opciones por cada pregunta
//     const questions = [];
//     result.rows.forEach((row) => {
//       const existingQuestion = questions.find((q) => q.id === row.idquestion);

//       if (existingQuestion) {
//         existingQuestion.options.push(row.option);
//       } else {
//         questions.push({
//           id: row.idquestion,
//           question: row.question,
//           correct: row.correct,
//           feedback: row.feedback,
//           idLevel: row.idlevel,
//           options: row.option ? [row.option] : [],
//         });
//       }
//     });

//     console.log(questions)

//     res.json(questions);
//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(500).json({ error: "Error al obtener las preguntas" });
//   }
// });

app.get("/api/questions/:idCategory/:email", async (req, res) => {
  try {
    console.log("entro a api/questions/");
    const { idCategory } = req.params; // Ya no necesitamos 'email'

    // Consulta para obtener todas las preguntas de la categoría especificada
    const query = `
      SELECT 
        q.idquestion,  
        q.question,
        q.correct,
        q.feedback,
        o.idoption,
        o.option,
        q.idlevel -- Incluimos el idlevel para cada pregunta
      FROM questions q
      LEFT JOIN options o ON o.idquestion = q.idquestion
      WHERE q.idcategory = $1
    `;

    // Ejecutar la consulta
    const result = await pool.query(query, [idCategory]);

    // Si no hay resultados, devolvemos un array vacío
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
          idlevel: row.idlevel, // Añadimos idlevel a la pregunta
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


// RUTA para guardar o actualizar el progreso del usuario


app.post("/api/progress", async (req, res) => {
  console.log("es")
  console.log("email",req)
  const { email, idQuestion, status, responseTime } = req.body;
  

  // if (!email || !idQuestion || typeof status !== "boolean" || responseTime == null) {
  //     return res.status(400).json({ error: "Faltan campos obligatorios" });
  // }

  try {
      const responseTimeFormatted = parseFloat(responseTime).toFixed(2);

      // 1. Obtener el userId
      const userResult = await pool.query(
          "SELECT iduser FROM users WHERE email = $1",
          [email]
      );

      if (userResult.rows.length === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const userId = userResult.rows[0].iduser;

      // 2. Obtener información de la pregunta y su categoría
      const questionResult = await pool.query(
          `SELECT q.idlevel, q.idcategory, c.idtopic 
           FROM questions q 
           JOIN categories c ON q.idcategory = c.idcategory 
           WHERE q.idquestion = $1`,
          [idQuestion]
      );

      if (questionResult.rows.length === 0) {
          return res.status(404).json({ error: "Pregunta no encontrada" });
      }

      const { idlevel, idcategory, idtopic } = questionResult.rows[0];

      // 3. Preparar datos para el modelo de predicción (sin question_id y user_id)
      const predictionData = {
          status: status ? 1 : 0, // Convertir booleano a entero (1 o 0)
          response_time: parseFloat(responseTimeFormatted),
          idlevel: parseInt(idlevel),
      };
      console.log(predictionData)
      // 4. Llamar a Flask para predecir next_level (MANTENIDO TAL CUAL)
      const mlResponse = await axios.post(
          "http://127.0.0.1:5000/predict",
          predictionData
      );

      const predictedLevel = mlResponse.data.next_level;
      console.log("predictedLevel: ", predictedLevel);

      // 5. Insertar registro en progress con next_level
      await pool.query(
          `INSERT INTO progress (iduser, idquestion, status, response_time, idlevel, next_level)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, idQuestion, status, responseTimeFormatted, idlevel, predictedLevel]
      );

      res.status(200).json({
          message: "Progreso guardado correctamente",
          nextLevel: predictedLevel,
          metrics: mlResponse.data.current_metrics
      });

  } catch (error) {
      console.error("Error al guardar el progreso:", error);
      res.status(500).json({ error: "Error en el servidor" });
  }
});


// app.post("/api/progress", async (req, res) => {
//   const { email, idQuestion, status, responseTime } = req.body;

//   if (!email || !idQuestion || typeof status !== "boolean" || responseTime == null) {
//     return res.status(400).json({ error: "Faltan campos obligatorios" });
//   }

//   try {
//     const responseTimeFormatted = parseFloat(responseTime).toFixed(2);

//     // 1. Obtener el userId
//     const userResult = await pool.query("SELECT iduser FROM users WHERE email = $1", [email]);
//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ error: "Usuario no encontrado" });
//     }
//     const userId = userResult.rows[0].iduser;

//     // 2. Obtener idlevel de la pregunta
//     const questionResult = await pool.query("SELECT idlevel FROM questions WHERE idquestion = $1", [idQuestion]);
//     if (questionResult.rows.length === 0) {
//       return res.status(404).json({ error: "Pregunta no encontrada" });
//     }
//     const idlevel = questionResult.rows[0].idlevel;

//     // 3. Llamar a Flask para predecir next_level
//     const mlResponse = await axios.post("http://127.0.0.1:5000/predict", {
//       status,
//       response_time: responseTimeFormatted,
//       idlevel
//     });
//     const predictedLevel = mlResponse.data.predicted_level;

//     console.log("predictedLevel: ", predictedLevel)

//     // 4. Insertar registro en progress con next_level
//     await pool.query(`
//       INSERT INTO progress (iduser, idquestion, status, response_time, idlevel, next_level)
//       VALUES ($1, $2, $3, $4, $5, $6)
//     `, [userId, idQuestion, status, responseTimeFormatted, idlevel, predictedLevel]);

//     res.status(200).json({
//       message: "Progreso guardado correctamente",
//       nextLevel: predictedLevel
//     });

//   } catch (error) {
//     console.error("Error al guardar el progreso:", error);
//     res.status(500).json({ error: "Error en el servidor" });
//   }
// });

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
