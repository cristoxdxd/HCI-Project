import React, { useState } from 'react';

const Login = ({ handleLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setMessage("");
      } else {
        setError("");
        setMessage(data.message);
        handleLogin(data.email);
      }
    } catch (err) {
      setError("Error en el servidor");
      setMessage("");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <div>
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu correo"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-5 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-transform transform hover:scale-105"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
