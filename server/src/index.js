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
app.use(cors({ origin: "*" }));
app.use(express.json()); // Parse JSON bodies

// Obtener topics
app.get("/api/topics", async (req, res) => {
  try {
    const result = await pool.execute("SELECT * FROM topics");
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
    const result = await pool.execute(
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
    const result = await pool.execute("SELECT * FROM users WHERE email = $1", [
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
    const result = await pool.execute("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Crear el usuario nuevo
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashedPassword,
    ]);

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
    const result = await pool.execute(query, [idCategory]);

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
      const userResult = await pool.execute(
          "SELECT iduser FROM users WHERE email = $1",
          [email]
      );

      if (userResult.rows.length === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const userId = userResult.rows[0].iduser;

      // 2. Obtener información de la pregunta y su categoría
      const questionResult = await pool.execute(
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
      // await pool.promise().execute(
      //     `INSERT INTO progress (iduser, idquestion, status, response_time, idlevel, next_level)
      //      VALUES ($1, $2, $3, $4, $5, $6)`,
      //     [userId, idQuestion, status, responseTimeFormatted, idlevel, predictedLevel]
      // );

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

// Create HTTP server
const server = http.createServer(app);

// Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Track connected WebSocket clients
const connectedClients = new Set();

let buttonState = ""; // Global variable to store the button state

// Handle incoming WebSocket connections
io.on("connection", (socket) => {
  console.log("Client connected via WebSocket");
  connectedClients.add(socket);

  // Send the current button state to the newly connected client
  if (buttonState) {
    socket.emit("buttonState", buttonState);
  }

  socket.on("message", (message) => {
    try {
      console.log("Message received from client:", message);
      const parsedMessage = JSON.parse(message);
      // Handle specific message types if needed
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      socket.emit("error", "Invalid message format");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from WebSocket");
    connectedClients.delete(socket);
  });
});

// Function to broadcast messages to all connected WebSocket clients
function broadcastToClients(message) {
  io.emit("buttonState", message);
}

// GET Method to retrieve the button state
app.get("/update", (req, res) => {
  try {
    // Check if buttonState has been set
    if (buttonState && buttonState.length > 0) {
      console.log(`Current button state: ${buttonState}`);

      // Send the current button state to the client
      res.status(200).json({
        success: true,
        message: "Button state retrieved",
        data: buttonState,
      });
    } else {
      // If no button state is available
      console.log("No button state available");

      // Return an empty state message
      res.status(200).json({
        success: true,
        message: "No button state available",
        data: "",
      });
    }
  } catch (error) {
    console.error("Error handling /update GET request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// POST Method to update the button state
app.post("/update", (req, res) => {
  try {
    const payload = req.body; // Get the full payload sent from the client
    const controllerId = payload.controller_id || "";
    const inputs = payload.inputs || {};
    const buttons = inputs.buttons || {};

    // Check if there are buttons in the payload
    if (Object.keys(buttons).length > 0) {
      // Update the button state for each button
      let buttonStates = [];
      for (let button in buttons) {
        const action = buttons[button].state; // Get the button state (pressed, released)
        buttonStates.push(`Button: ${button}, Action: ${action}`);
      }
      buttonState = buttonStates.join(', '); // Combine all button states into a string

      console.log(`Button states updated: ${buttonState}`);

      // Broadcast the updated button state to all WebSocket clients
      broadcastToClients(buttonState);

      // Respond back to the client
      res.status(200).json({
        success: true,
        message: `Button states updated for ${controllerId}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No button states provided in the request body",
      });
    }
  } catch (error) {
    console.error("Error handling POST /update:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// Error handling middleware for Express
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start the Server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
