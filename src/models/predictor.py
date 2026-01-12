#prediccion del modelo entrenado

import pandas as pd
import joblib


#MÓDULO DE CARGA DE RECURSOS

# Funciones utilitarias para la carga serializada de modelos y dataFrames
def cargar_modelo(ruta):
    return joblib.load(ruta)

def cargar_dataset(ruta):
    return pd.read_csv(ruta)

#PREPARACIÓN DEL GRID Y PREDICCIÓN

def preparar_grid(df, fecha_dt):
    columnas_modelo = [
        "lat_grid", "lon_grid", "mes", "dia", "dia_semana",
        "conteo_delitos_graves", "conteo_llamadas_riesgo"
    ]

    #Obtiene las coordenadas únicas de la cuadrícula 
    df_grid = df[["lat_grid", "lon_grid"]].drop_duplicates().copy()

    df_grid["mes"] = fecha_dt.month
    df_grid["dia"] = fecha_dt.day
    df_grid["dia_semana"] = fecha_dt.weekday() # 'weekday' retorna 0=Lunes a 6=Domingo

    # Se asume conteo cero para features de eventos pasados en la fecha futura de predicción
    df_grid["conteo_delitos_graves"] = 0
    df_grid["conteo_llamadas_riesgo"] = 0

    return df_grid[columnas_modelo]


def predecir_riesgo(modelo, df_grid):
    df_grid = df_grid.copy()
    # Ejecuta la inferencia (predicción) del modelo sobre los datos del grid
    df_grid["prediccion_riesgo"] = modelo.predict(df_grid)
    return df_grid

#FILTRADO GEOGRÁFICO

def filtrar_por_zona(df, limites):

    return df[
        (df["lon_grid"] >= limites["lon_min"]) &
        (df["lon_grid"] <= limites["lon_max"]) &
        (df["lat_grid"] >= limites["lat_min"]) &
        (df["lat_grid"] <= limites["lat_max"])
    ].copy()