from flask import Flask, request, jsonify
import numpy as np
import random

app = Flask(__name__)

class ThompsonSampling:
    def __init__(self, num_levels=3):  # Solo 3 niveles: Fácil, Medio, Difícil
        self.num_levels = num_levels
        self.successes = np.zeros(num_levels)  # Recompensas positivas (éxitos)
        self.failures = np.zeros(num_levels)   # Recompensas negativas (fallos)

    def select_level(self):
        """
        Selecciona el nivel de dificultad basado en Thompson Sampling con 3 niveles.
        """
        sampled_values = [np.random.beta(self.successes[i] + 1, self.failures[i] + 1) 
                          for i in range(self.num_levels)]
        return np.argmax(sampled_values)  # Selecciona el nivel con mayor probabilidad de éxito

    def update(self, level, reward):
        """
        Actualiza el modelo con la recompensa obtenida.
        """
        if reward > 0:
            self.successes[level] += reward  # Más recompensa si es difícil y rápido
        else:
            self.failures[level] += 1  # Penalización por fallar

# Instancia del modelo con 3 niveles
ts_model = ThompsonSampling(num_levels=3)

def simulate_responses(num_simulations=100):
    """
    Simula respuestas de usuarios para evaluar cómo se comporta el modelo en el tiempo.
    """
    print("\nIniciando simulación con 1000 respuestas...\n")

    for i in range(num_simulations):
        level = ts_model.select_level()  # Seleccionar nivel recomendado por el modelo

        # Simulación de respuesta del usuario
        response_correct = random.choice([True, False])  # El usuario acierta o falla
        response_time = random.uniform(5, 30)  # Tiempo de respuesta en segundos

        # Definir recompensa con 3 niveles
        if response_correct and response_time < 10:
            reward = 3 if level == 2 else 2 if level == 1 else 1
        elif response_correct and response_time < 20:
            reward = 2 if level == 2 else 1
        elif response_correct:
            reward = 1 if level == 2 else 0
        else:
            reward = -1  # Penalización por fallar

        reward = max(0, reward)  # No permitir valores negativos en recompensa

        # Actualizar el modelo con la respuesta simulada
        ts_model.update(level, reward)

    # Imprimir métricas finales después de la simulación
    print("\nResultados finales después de la simulación:\n")
    for i in range(3):
        print(f"Nivel {i}: {ts_model.successes[i]:.0f} éxitos, {ts_model.failures[i]:.0f} fallos")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        
        required_fields = ['status', 'response_time', 'idlevel']
        
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Campo requerido faltante: {field}"})
        
        # Convertir datos
        processed_data = {
            'status': int(data['status']),
            'response_time': float(data['response_time']),
            'idlevel': int(data['idlevel'])-1,  # Nivel actual (0 = Fácil, 2 = Difícil)
        }

        # Seleccionar el siguiente nivel
        next_level = ts_model.select_level()
        next_level =next_level+1;
        print("nexlevel; ",next_level)

        # Ajustar la lógica de recompensa para 3 niveles
        if processed_data['status'] == 1:  # Respuesta correcta
            if processed_data['response_time'] < 10:
                reward = 3 if processed_data['idlevel'] == 2 else 2 if processed_data['idlevel'] == 1 else 1
            elif processed_data['response_time'] < 20:
                reward = 2 if processed_data['idlevel'] == 2 else 1
            else:
                reward = 1 if processed_data['idlevel'] == 2 else 0
        else:  # Respuesta incorrecta
            reward = -1  # Penalización

        reward = max(0, reward)  # Asegurar que la recompensa mínima sea 0

        # Actualizar el modelo
        ts_model.update(processed_data['idlevel'], reward)

        return jsonify({
            "next_level": int(next_level),
            "reward": reward,
            "current_metrics": {
                "successes_per_level": ts_model.successes.tolist(),
                "failures_per_level": ts_model.failures.tolist()
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
