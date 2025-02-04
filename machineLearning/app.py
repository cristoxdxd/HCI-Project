from flask import Flask, request, jsonify
import numpy as np
import random

app = Flask(__name__)

class ThompsonSampling:
    def __init__(self, num_levels=3):
        self.num_levels = num_levels
        self.successes = np.zeros(num_levels)  # Recompensas positivas (éxitos)
        self.failures = np.zeros(num_levels)   # Recompensas negativas (fallos)

    def select_level(self, current_level):
        """
        Selecciona el nivel de dificultad basado en Thompson Sampling con 3 niveles.
        """
        sampled_values = [np.random.beta(self.successes[i] + 1, self.failures[i] + 1) 
                          for i in range(self.num_levels)]
        
        best_level = np.argmax(sampled_values)

        # 📌 Ajuste: Si hay demasiadas fallas en un nivel, bajar de nivel
        if self.failures[current_level] >= 3 and current_level > 0:
            return current_level - 1  # Baja de nivel si hay 3 fallas consecutivas

        return best_level

    def update(self, level, reward):
        """
        Actualiza el modelo con la recompensa obtenida.
        """
        if reward > 0:
            self.successes[level] += reward  
        else:
            self.failures[level] += 1  # Contar fallas
            if self.failures[level] >= 3 and level > 0:
                print(f"📉 Muchas fallas en nivel {level}, bajando de nivel.")

# Instancia del modelo con 3 niveles
ts_model = ThompsonSampling(num_levels=3)

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
            'idlevel': int(data['idlevel']) - 1,  # Convertir nivel a 0,1,2
        }
        
        print("po:", processed_data)

        # 📌 Seleccionar siguiente nivel basado en éxito/fallo y Thompson Sampling
        next_level = ts_model.select_level(processed_data['idlevel']) + 1  # Convertir de nuevo a 1,2,3

        # 📌 Ajustar la lógica de recompensa para 3 niveles
        if processed_data['status'] == 1:  # Respuesta correcta
            if processed_data['response_time'] < 8:
                reward = 3 if processed_data['idlevel'] == 2 else 2 if processed_data['idlevel'] == 1 else 1
            elif processed_data['response_time'] < 15:
                reward = 2 if processed_data['idlevel'] == 2 else 1
            else:
                reward = 1 if processed_data['idlevel'] == 2 else 0
        else:  # Respuesta incorrecta
            reward = -3  # Penalización más controlada

        # 📌 Actualizar el modelo con la recompensa
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