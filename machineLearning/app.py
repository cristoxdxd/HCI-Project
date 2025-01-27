from flask import Flask, request, jsonify
import pickle
import numpy as np

# Cargar el modelo entrenado
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

# Crear la aplicación Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "API de predicción de niveles activa."

# Endpoint para predecir el siguiente nivel
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Obtener los datos del request (enviados como JSON)
        data = request.json

        # Extraer variables necesarias
        status = int(data["status"])  # Convertir True/False en 1/0
        response_time = float(data["response_time"])
        idlevel = int(data["idlevel"])  # Nivel actual de la pregunta

        # Formatear datos para el modelo
        X_input = np.array([[status, response_time, idlevel]])

        # Hacer la predicción
        predicted_level = model.predict(X_input)[0]

        # Devolver el resultado como JSON
        return jsonify({"predicted_level": int(predicted_level)})

    except Exception as e:
        return jsonify({"error": str(e)})

# Iniciar el servidor Flask
if __name__ == "__main__":
    app.run(port=5000, debug=True)
