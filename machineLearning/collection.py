import json
import random

# Configuración de la colección
collection = {
    "name": "Predict API Requests",
    "version": 1,
    "requests": []
}

# Generar múltiples solicitudes de prueba
for i in range(10):  # Cambia 10 por la cantidad de pruebas que necesites
    request = {
        "name": f"Test Request {i+1}",
        "method": "POST",
        "url": "http://localhost:5000/predict",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": {
            "status": random.choice([0, 1]),  # 0 o 1
            "response_time": round(random.uniform(1, 10), 2),  # Entre 1 y 10 segundos
            "idlevel": random.randint(1, 5),  # Niveles entre 1 y 5
            "question_id": random.randint(1, 100),  # IDs de preguntas hasta 100
            "topic_id": random.randint(1, 10),  # IDs de temas entre 1 y 10
            "subtopic_id": random.randint(1, 10),  # IDs de subtemas entre 1 y 10
            "user_id": random.randint(1000, 1100)  # IDs de usuario entre 1000 y 1100
        }
    }
    collection["requests"].append(request)

# Guardar la colección en un archivo JSON
with open("bruno_collection.json", "w") as file:
    json.dump(collection, file, indent=4)

print("Colección Bruno generada con éxito: 'bruno_collection.json'")

