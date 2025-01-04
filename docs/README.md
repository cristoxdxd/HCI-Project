# HCI Project - TuxLab

## Overview

**TuxLab** is an educational platform designed to guide users through learning Linux in an interactive and engaging way. The platform includes a game-like experience, where users answer questions about Linux, progressing through various levels of difficulty tailored to their skills. Leveraging modern web technologies, TuxLab is both a teaching tool and an entertaining way to explore Linux concepts.

### Key Features

- **Interactive Learning**: A quiz-based system inspired by Duolingo.
- **Dynamic Difficulty**: Levels of difficulty adapt to the user’s performance.
- **ESP32 Integration**: Supports hardware interaction, allowing users to navigate through questions using a PS4 DualShock controller.
- **Modular Design**: Built for scalability, enabling future expansion to other topics beyond Linux.

## Client

The frontend of this project is built using **React**, a popular JavaScript library for building user interfaces. React’s component-based architecture ensures reusability and maintainability, making it ideal for projects with interactive and dynamic content.

### Setup Instructions

```bash
cd client
npm install
npm run dev
```

Access the application at <http://localhost:3000>.

## Server

The backend of this project is built using **Node.js**, a JavaScript runtime built on Chrome's V8 engine. It employs **Express.js**, a flexible framework for handling routes and middleware, ensuring efficient API communication with the frontend.

### Setup Instructions

```bash
cd client
npm install
npm run start
```

By default, the server will run on <http://localhost:3001>.

## Architecture

```bash
project/
├── server/
│   ├── index.js        # Main server file
│   ├── package.json    # Server dependencies and scripts
│   └── .gitignore      # Ignored files for the server
├── client/
│   ├── public/         # Static files
│   ├── src/            # React source code
│   ├── package.json    # Client dependencies and scripts
│   └── .gitignore      # Ignored files for the client
└── vercel.json         # Deployment configuration for Vercel
```

## Features in Development

1. **Question Database:** A centralized repository of Linux-related questions with difficulty levels.
2. **AI-Driven Question Selection:** Integration of a trained model to personalize the learning experience based on user performance.
3. **Controller Support:** Full implementation of ESP32 communication with a PS4 DualShock controller for navigation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
