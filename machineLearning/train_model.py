import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# 1) Carga del CSV
df = pd.read_csv(r"machineLearning\Data\TrainingDataset.csv")  # Ajusta el nombre de tu CSV


# 3) Transformar 'status' booleano a entero (0/1)
df['status'] = df['status'].astype(int)

# Asegurarte de que response_time es float
df['response_time'] = df['response_time'].astype(float)

# Si tienes idlevel (1, 2, 3), asegúrate de que sea int
df['idlevel'] = df['idlevel'].astype(int)

# 4) Definir features (X) y la etiqueta a predecir (y)
#    Suponiendo que quieres usar 'status', 'response_time' y 'idlevel' para predecir 'next_level'
X = df[['status', 'response_time', 'idlevel']]  # si incluyes 'idlevel'
y = df['next_level']

# 5) Separar en datos de entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(X, y, 
                                                    test_size=0.2, 
                                                    random_state=42)

# 6) Entrenar un modelo. Ejemplo: RandomForestClassifier
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    min_samples_split=5, 
    min_samples_leaf=2,  # Cada hoja debe tener al menos 2 muestras
    random_state=42
)

model.fit(X_train, y_train)
print(df['status'].value_counts())
# 7) Evaluación
train_acc = model.score(X_train, y_train)
test_acc = model.score(X_test, y_test)
print(f"Exactitud en entrenamiento: {train_acc:.2f}")
print(f"Exactitud en prueba: {test_acc:.2f}")

# 8) Guardar (serializar) el modelo en un archivo .pkl
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Modelo entrenado y guardado en model.pkl.")
