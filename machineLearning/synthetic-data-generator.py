import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_synthetic_data(
    n_users=100,          # Número de usuarios
    n_interactions=5000,  # Número total de interacciones
    n_questions=80,       # Número de preguntas disponibles
    seed=42              # Semilla para reproducibilidad
):
    np.random.seed(seed)
    
    # Configuración de las categorías y niveles
    categories = {
        1: {'name': 'Navegación en Directorios', 'topic_id': 1},
        2: {'name': 'Manejo de Archivos', 'topic_id': 1},
        3: {'name': 'Permisos y Propiedades', 'topic_id': 1},
        4: {'name': 'Procesos y Servicios', 'topic_id': 1},
        5: {'name': 'Networking', 'topic_id': 1}
    }
    
    # Generar preguntas distribuidas entre categorías y niveles
    questions = []
    question_id = 1
    for cat_id in categories.keys():
        # Distribuir preguntas equitativamente entre categorías
        n_questions_per_category = n_questions // len(categories)
        for _ in range(n_questions_per_category):
            # Asignar nivel de manera balanceada
            level = np.random.randint(1, 4)  # 1: Básico, 2: Intermedio, 3: Avanzado
            questions.append({
                'question_id': question_id,
                'subtopic_id': cat_id,
                'topic_id': categories[cat_id]['topic_id'],
                'default_level': level
            })
            question_id += 1
    
    # Generar datos de interacciones
    data = []
    user_states = {}  # Para mantener track del estado de cada usuario
    
    for interaction in range(n_interactions):
        # Seleccionar o crear usuario
        user_id = np.random.randint(1, n_users + 1)
        
        # Inicializar estado del usuario si es nuevo
        if user_id not in user_states:
            user_states[user_id] = {
                'current_level': 1,
                'success_streak': 0,
                'recent_performance': []
            }
        
        # Seleccionar pregunta basada en el nivel actual del usuario
        user_level = user_states[user_id]['current_level']
        suitable_questions = [q for q in questions if q['default_level'] == user_level]
        question = np.random.choice(suitable_questions)
        
        # Determinar éxito basado en el nivel y experiencia previa
        base_success_prob = {
            1: 0.75,  # Básico: 75% de éxito base
            2: 0.65,  # Intermedio: 65% de éxito base
            3: 0.55   # Avanzado: 55% de éxito base
        }[user_level]
        
        # Ajustar probabilidad según racha reciente
        success_adjustment = min(user_states[user_id]['success_streak'] * 0.05, 0.2)
        success_prob = min(base_success_prob + success_adjustment, 0.95)
        
        # Determinar éxito
        status = np.random.random() < success_prob
        
        # Generar tiempo de respuesta realista
        if status:
            # Usuarios exitosos tienden a responder más rápido
            response_time = np.random.gamma(2, 2)
        else:
            # Usuarios que fallan tienden a tomar más tiempo
            response_time = np.random.gamma(3, 3)
        
        # Limitar tiempo a 30 segundos
        response_time = min(response_time, 30)
        
        # Actualizar estado del usuario
        if status:
            user_states[user_id]['success_streak'] += 1
        else:
            user_states[user_id]['success_streak'] = 0
            
        user_states[user_id]['recent_performance'].append(status)
        if len(user_states[user_id]['recent_performance']) > 5:
            user_states[user_id]['recent_performance'].pop(0)
        
        # Determinar siguiente nivel
        recent_success_rate = sum(user_states[user_id]['recent_performance']) / len(user_states[user_id]['recent_performance'])
        current_level = user_states[user_id]['current_level']
        
        if recent_success_rate > 0.8 and current_level < 3:
            next_level = current_level + 1
        elif recent_success_rate < 0.3 and current_level > 1:
            next_level = current_level - 1
        else:
            next_level = current_level
            
        user_states[user_id]['current_level'] = next_level
        
        # Agregar interacción a los datos
        data.append({
            'user_id': user_id,
            'question_id': question['question_id'],
            'topic_id': question['topic_id'],
            'subtopic_id': question['subtopic_id'],
            'idlevel': user_level,
            'status': int(status),
            'response_time': round(response_time, 2),
            'next_level': next_level
        })
    
    # Crear DataFrame y ordenar por user_id
    df = pd.DataFrame(data)
    df = df.sort_values(['user_id', 'question_id'])
    
    return df

# Generar datos
if __name__ == "__main__":
    df = generate_synthetic_data()
    
    # Guardar en CSV
    df.to_csv("Data/TrainingDataset2.csv", index=False)
    
    # Mostrar estadísticas básicas
    print("\nEstadísticas de los datos generados:")
    print(f"Número total de interacciones: {len(df)}")
    print(f"\nDistribución de niveles:")
    print(df['idlevel'].value_counts().sort_index())
    print(f"\nTasa de éxito general: {df['status'].mean():.2%}")
    print(f"\nTiempo de respuesta promedio: {df['response_time'].mean():.2f} segundos")
    print(f"\nDistribución de categorías:")
    print(df['subtopic_id'].value_counts().sort_index())
