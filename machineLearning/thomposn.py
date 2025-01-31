import numpy as np
import random

class ThompsonSampling:
    def __init__(self, num_levels=3):
        """
        Inicializa el modelo de Thompson Sampling.
        - num_levels: número de niveles de dificultad.
        """
        self.num_levels = num_levels
        self.successes = np.zeros(num_levels)  # Recompensas positivas (respuestas correctas y rápidas)
        self.failures = np.zeros(num_levels)   # Recompensas negativas (errores o respuestas lentas)

    def select_level(self):
        """
        Selecciona el nivel de dificultad basado en Thompson Sampling.
        """
        sampled_values = [np.random.beta(self.successes[i] + 1, self.failures[i] + 1) 
                          for i in range(self.num_levels)]
        return np.argmax(sampled_values)  # Selecciona el nivel con la mayor probabilidad de éxito

    def update(self, level, reward):
        """
        Actualiza el modelo con la recompensa obtenida.
        - level: nivel de dificultad elegido.
        - reward: 1 si el usuario tuvo éxito, 0 si falló.
        """
        if reward > 0:
            self.successes[level] += 1
        else:
            self.failures[level] += 1
# Inicializar el modelo con 4 niveles de dificultad
ts = ThompsonSampling(num_levels=3)

# Simular 1000 preguntas respondidas por usuarios
for i in range(1000):
    level = ts.select_level()  # Seleccionar nivel de dificultad recomendado

    # Simulación de respuesta del usuario
    response_correct = random.choice([True, False])  # El usuario acierta o falla
    response_time = random.uniform(5, 30)  # Tiempo de respuesta en segundos

    # Definir recompensa (1 si acierta rápido, 0 si falla o tarda mucho)
    if response_correct and response_time < 15:
        reward = 1  # Respuesta correcta y rápida
    else:
        reward = 0  # Respuesta incorrecta o tardía

    # Actualizar el modelo
    ts.update(level, reward)

# Imprimir los niveles con más éxito
print("\nResumen de niveles:")
for i in range(3):
    print(f"Nivel {i}: {ts.successes[i]} éxitos, {ts.failures[i]} fallos")
