import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report
import pickle

def calculate_consecutive_correct(series):
    """
    Calcula la cantidad de respuestas correctas consecutivas para cada usuario.
    """
    count = 0
    streaks = []
    for value in series:
        if value == 1:
            count += 1
        else:
            count = 0
        streaks.append(count)
    return streaks

def prepare_features(df):
    """
    Prepara las características básicas para el modelo, incluyendo features derivadas.
    """
    df = df.copy()
    
    df['recent_success_rate'] = df.groupby('user_id')['status'].transform(
        lambda x: x.rolling(window=5, min_periods=1).mean()
    )
    
    df['avg_response_time'] = df.groupby('user_id')['response_time'].transform(
        lambda x: x.rolling(window=5, min_periods=1).mean()
    )
    
    df = df.join(
        df.groupby('user_id')['status']
        .apply(lambda x: pd.Series(calculate_consecutive_correct(x), index=x.index))
        .rename('consecutive_correct')  
    )


    return df[['status', 'response_time', 'idlevel', 'question_id', 'topic_id', 
               'subtopic_id', 'user_id', 'recent_success_rate', 'avg_response_time', 
               'consecutive_correct']]

def train_model(df):
    """
    Entrena el modelo de aprendizaje supervisado para predecir el siguiente nivel.
    """
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42)

    X_train = prepare_features(train_df)
    y_train = train_df['next_level']
    X_test = prepare_features(test_df)
    y_test = test_df['next_level']

    columns_to_scale = ['response_time', 'recent_success_rate', 'avg_response_time', 'consecutive_correct']
    scaler = StandardScaler()
    X_train[columns_to_scale] = scaler.fit_transform(X_train[columns_to_scale])
    X_test[columns_to_scale] = scaler.transform(X_test[columns_to_scale])

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42
    )

    print("Entrenando modelo...")
    model.fit(X_train, y_train)

    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)

    print(f"\nPuntuación en entrenamiento: {train_score:.3f}")
    print(f"Puntuación en prueba: {test_score:.3f}")

    cv_scores = cross_val_score(model, X_train, y_train, cv=5)
    print(f"Puntuación de validación cruzada: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    feature_importance = pd.DataFrame({
        'feature': X_train.columns,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nImportancia de características:")
    print(feature_importance)

    return model, scaler

def save_model(model, scaler, model_path="mvp_model.pkl", scaler_path="mvp_scaler.pkl"):
    """
    Guarda el modelo y el scaler en archivos pickle.
    """
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"Modelo guardado en {model_path} y scaler en {scaler_path}")

def predict_next_level(model, scaler, user_data):
    """
    Realiza predicciones sobre el siguiente nivel del usuario.
    
    Args:
        model: Modelo entrenado
        scaler: Scaler ajustado
        user_data: DataFrame con los datos del usuario
        
    Returns:
        int: Siguiente nivel recomendado
    """
    required_features = ['status', 'response_time', 'idlevel', 'question_id',
                         'topic_id', 'subtopic_id', 'user_id', 'recent_success_rate',
                         'avg_response_time', 'consecutive_correct']
    
    missing_cols = [col for col in required_features if col not in user_data.columns]
    
    if missing_cols:
        raise ValueError(f"Faltan columnas en los datos del usuario: {missing_cols}")

    user_data = user_data[required_features]

    columns_to_scale = ['response_time', 'recent_success_rate', 'avg_response_time', 'consecutive_correct']
    user_data[columns_to_scale] = scaler.transform(user_data[columns_to_scale])
    
    next_level = model.predict(user_data)
    return next_level[0]

# Ejemplo de uso
if __name__ == "__main__":
    # 1. Cargar datos
    df = pd.read_csv("Data/TrainingDataset2.csv")
    
    # 2. Asegurar que los tipos de datos son correctos
    df['status'] = df['status'].astype(int)
    df['response_time'] = df['response_time'].astype(float)
    df['idlevel'] = df['idlevel'].astype(int)
    df['question_id'] = df['question_id'].astype(int)
    df['topic_id'] = df['topic_id'].astype(int)
    df['subtopic_id'] = df['subtopic_id'].astype(int)
    df['user_id'] = df['user_id'].astype(int)
    df['next_level'] = df['next_level'].astype(int)
    
    # 3. Entrenar modelo
    model, scaler = train_model(df)
    
    # 4. Guardar modelo
    save_model(model, scaler)

    # 5. Cargar usuario de prueba y predecir
    user_sample_data = pd.DataFrame({
        'status': [1],           
        'response_time': [12.5],    
        'idlevel': [2],         
        'question_id': [102],     
        'topic_id': [5],        
        'subtopic_id': [22],     
        'user_id': [1001],         
        'recent_success_rate': [0.8],  
        'avg_response_time': [15.2],    
        'consecutive_correct': [3]    
    })

    # 6. Predecir siguiente nivel para el usuario de prueba
    predicted_level = predict_next_level(model, scaler, user_sample_data)
    print(f"\nEl siguiente nivel recomendado para el usuario es: {predicted_level}")
