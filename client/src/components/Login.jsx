import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ handleLogin }) => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Para confirmación de contraseña
  const [isRegistering, setIsRegistering] = useState(false); // Estado para saber si estamos en modo registro
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegistering && password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    try {
      const endpoint = isRegistering ? "/api/register" : "/api/login";
      const response = await axios.post(`${endpoint}`, {
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage(isRegistering ? "Usuario registrado con éxito" : "Inicio de sesión exitoso");
        setErrorMessage("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        
        handleLogin(response.data.email); // Llamar a handleLogin para manejar la sesión
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || "Error al procesar la solicitud");
      } else {
        setErrorMessage("Error en la conexión al servidor");
      }
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering); // Alternar entre registro e inicio de sesión
    setErrorMessage(""); // Limpiar mensaje de error cuando cambiamos de formulario
    setSuccessMessage(""); // Limpiar mensaje de éxito
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
        {isRegistering && (
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirma tu contraseña"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-5 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-transform transform hover:scale-105"
        >
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </button>
      </form>
      {/* Mostrar los mensajes de error o éxito */}
      {errorMessage && (
        <p className="text-red-500 mt-4 text-center">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-green-500 mt-4 text-center">{successMessage}</p>
      )}

      <p
        className="text-blue-500 mt-4 text-center cursor-pointer"
        onClick={toggleForm}
      >
        {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una'}
      </p>
    </div>
  );
};

export default Login;
