# api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
from src.models.predictor import (
    cargar_modelo, cargar_dataset,
    preparar_grid, predecir_riesgo, filtrar_por_zona
)
from src.models.zonas import ZONAS

app = Flask(__name__)
CORS(app) 

# rutas de archivos
ruta_dataset = os.path.join("data","processed","dataset_entrenamiento_final_final.csv")
ruta_modelo = os.path.join("models", "trained", "modelo_riesgo_delictivo.pkl")
ruta_perfil = os.path.join("data", "processed","aprehendidos_clustering", "perfil_infracciones_por_cluster.csv")
ruta_riesgo_celdas = os.path.join("data", "processed","aprehendidos_clustering", "riesgo_celdas_aprehendidos.csv")
ruta_aprehendidos = os.path.join("data", "processed", "aprehendidos_clustering","aprehendidos_con_cluster_y_riesgo.csv")

# Cargar modelo y datasets al iniciar
print("🔄 Cargando modelo y datasets...")
modelo = cargar_modelo(ruta_modelo)
df = cargar_dataset(ruta_dataset)

# Cargar datos adicionales
df_perfil = pd.read_csv(ruta_perfil) if os.path.exists(ruta_perfil) else None
df_riesgo_celdas = pd.read_csv(ruta_riesgo_celdas) if os.path.exists(ruta_riesgo_celdas) else None
df_aprehendidos = pd.read_csv(ruta_aprehendidos) if os.path.exists(ruta_aprehendidos) else None

print("✅ Sistema listo")

# Delitos de interés para hotspots
DELITOS_INTERES = [
    "DELITOS CONTRA EL DERECHO A LA PROPIEDAD",
    "DELITOS CONTRA LA EFICIENCIA DE LA ADMINISTRACIÓN PÚBLICA",
    "DELITOS CONTRA LA SEGURIDAD PÚBLICA",
    "DELITOS POR LA PRODUCCIÓN O TRÁFICO ILÍCITO DE SUSTANCIAS CATALOGADAS SUJETAS A FISCALIZACIÓN"
]

def obtener_cluster_zona(df_pred_zona):
    """Obtiene el cluster predominante en la zona"""
    if df_riesgo_celdas is not None and not df_pred_zona.empty:
        lat_centro = df_pred_zona["lat_grid"].mean()
        lon_centro = df_pred_zona["lon_grid"].mean()
        
        df_riesgo_celdas['distancia'] = (
            (df_riesgo_celdas['lat_grid'] - lat_centro)**2 + 
            (df_riesgo_celdas['lon_grid'] - lon_centro)**2
        )
        celda_cercana = df_riesgo_celdas.nsmallest(1, 'distancia')
        
        if not celda_cercana.empty:
            return celda_cercana.iloc[0]['cluster_id'], celda_cercana.iloc[0]['nivel_riesgo']
    
    return None, None

def obtener_infracciones_cluster(cluster_id):
    """Obtiene las principales infracciones para un cluster"""
    if df_perfil is None or cluster_id is None:
        return []
    
    df_cluster = df_perfil[df_perfil['cluster_id'] == cluster_id]
    df_top = df_cluster.nlargest(5, 'pct')
    
    infracciones = []
    for _, row in df_top.iterrows():
        infracciones.append({
            'tipo': row['presunta_infraccion'],
            'prob': float(row['pct'])
        })
    
    return infracciones

def obtener_hotspots_zona(limites):
    """Obtiene los hotspots de delitos graves en una zona"""
    if df_aprehendidos is None:
        return []
    
    # Filtrar por zona geográfica
    df_zona = df_aprehendidos[
        (df_aprehendidos['latitud'] >= limites['lat_min']) &
        (df_aprehendidos['latitud'] <= limites['lat_max']) &
        (df_aprehendidos['longitud'] >= limites['lon_min']) &
        (df_aprehendidos['longitud'] <= limites['lon_max'])
    ].copy()
    
    # Filtrar solo delitos de interés
    df_delitos = df_zona[df_zona['presunta_infraccion'].isin(DELITOS_INTERES)].copy()
    
    if df_delitos.empty:
        return []
    
    # Agrupar por celda (lat_grid, lon_grid) y contar delitos
    df_grouped = df_delitos.groupby(['lat_grid', 'lon_grid', 'presunta_infraccion']).agg({
        'fecha': 'count'  # Contar eventos
    }).reset_index()
    df_grouped.columns = ['lat_grid', 'lon_grid', 'tipo_delito', 'conteo']
    
    # Obtener top hotspots (células con más delitos)
    df_hotspots = df_grouped.groupby(['lat_grid', 'lon_grid']).agg({
        'conteo': 'sum'
    }).reset_index()
    df_hotspots = df_hotspots.nlargest(50, 'conteo')  # Top 50 hotspots
    
    # Crear lista de hotspots con información detallada
    hotspots = []
    for _, row in df_hotspots.iterrows():
        # Obtener delitos en esta celda
        delitos_celda = df_grouped[
            (df_grouped['lat_grid'] == row['lat_grid']) &
            (df_grouped['lon_grid'] == row['lon_grid'])
        ]
        
        # Tipo de delito más frecuente
        delito_principal = delitos_celda.nlargest(1, 'conteo').iloc[0]
        
        hotspots.append({
            'lat': float(row['lat_grid']),
            'lon': float(row['lon_grid']),
            'intensidad': int(row['conteo']),
            'tipo_delito': delito_principal['tipo_delito'],
            'delitos': delitos_celda[['tipo_delito', 'conteo']].to_dict('records')
        })
        print(f"Hotspot: {hotspots[-1]}")
    
    return hotspots

@app.route('/api/predecir', methods=['POST'])
def predecir():
    try:
        data = request.json
        fecha_str = data.get('fecha')
        zona = data.get('zona')

        if not fecha_str or not zona:
            return jsonify({'error': 'Fecha y zona son requeridas'}), 400

        if zona not in ZONAS:
            return jsonify({'error': 'Zona no válida'}), 400

        fecha_dt = pd.to_datetime(fecha_str)
        df_grid = preparar_grid(df, fecha_dt)
        df_pred = predecir_riesgo(modelo, df_grid)

        limites = ZONAS[zona]
        df_zona = filtrar_por_zona(df_pred, limites)

        if df_zona.empty:
            return jsonify({'error': 'No hay datos para esta zona'}), 404

        riesgo_min = df_zona["prediccion_riesgo"].min()
        riesgo_max = df_zona["prediccion_riesgo"].max()

        if riesgo_max - riesgo_min < 0.1:
            riesgo_min = df_zona["prediccion_riesgo"].quantile(0.1)
            riesgo_max = df_zona["prediccion_riesgo"].quantile(0.9)

        df_zona_norm = df_zona.copy()
        df_zona_norm["riesgo_norm"] = (
            (df_zona["prediccion_riesgo"] - riesgo_min) / 
            (riesgo_max - riesgo_min)
        ).clip(0, 1)

        heat_data = df_zona_norm[["lat_grid", "lon_grid", "riesgo_norm"]].values.tolist()

        cluster_id, nivel_riesgo = obtener_cluster_zona(df_zona)
        infracciones = obtener_infracciones_cluster(cluster_id)
        prediccion_eventos = float(df_zona["prediccion_riesgo"].mean())
        
        # Obtener hotspots
        hotspots = obtener_hotspots_zona(limites)
        print(f"Hotspots encontrados: {len(hotspots)}")

        return jsonify({
            'datos': heat_data,
            'puntos': len(df_zona),
            'estadisticas': {
                'riesgo_min': float(riesgo_min),
                'riesgo_max': float(riesgo_max),
                'riesgo_promedio': float(df_zona["prediccion_riesgo"].mean())
            },
            'zona': {
                'lat_grid': float(df_zona["lat_grid"].mean()),
                'lon_grid': float(df_zona["lon_grid"].mean())
            },
            'fecha': fecha_str[:7],
            'prediccion_eventos': round(prediccion_eventos, 1),
            'nivel_riesgo': nivel_riesgo if nivel_riesgo else 'MEDIO',
            'perfil_infracciones': infracciones,
            'hotspots': hotspots
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/zonas', methods=['GET'])
def obtener_zonas():
    return jsonify({'zonas': list(ZONAS.keys())})

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'API funcionando correctamente'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)