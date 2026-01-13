# Sistema de Predicción Espacio-Temporal de Eventos Delictivos

## 📋 Descripción del Proyecto

Sistema predictivo avanzado que utiliza Machine Learning para anticipar la ocurrencia de eventos delictivos en Ecuador, combinando análisis espacio-temporal, clustering de riesgo y visualización interactiva en tiempo real.

El sistema integra dos modelos complementarios:
1. **Modelo de Regresión**: Predice la intensidad del riesgo delictivo en zonas geográficas
2. **Modelo de Clasificación**: Determina la probabilidad de eventos delictivos graves en puntos específicos

## 🎯 Características Principales

### 🗺️ Visualización Interactiva
- **Mapa de Calor**: Visualización del riesgo delictivo por zonas con gradiente de colores
- **Hotspots**: Identificación de puntos críticos con mayor concentración de delitos graves
- **Predicción por Punto**: Análisis detallado de riesgo para ubicaciones específicas
- **Interfaz Web Responsive**: Acceso desde navegador con diseño moderno

### 🧠 Machine Learning
- **XGBoost Regressor**: Predicción de intensidad de riesgo
- **XGBoost Classifier**: Clasificación binaria de riesgo (ALTO/BAJO)
- **Clustering**: Segmentación de zonas por perfil de riesgo
- **Features Espacio-Temporales**: Grid geográfico + patrones temporales

### 📊 Análisis de Incertidumbre
- **Incertidumbre (1 - max_proba)**: Confiabilidad de la predicción
- **Entropía de Shannon**: Medida alternativa de incertidumbre
- **Visualización Clara**: Interpretación automática de la confianza del modelo

### 🎯 Delitos Monitoreados
1. Delitos contra el derecho a la propiedad
2. Delitos contra la eficiencia de la administración pública
3. Delitos contra la seguridad pública
4. Delitos por producción o tráfico ilícito de sustancias

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFAZ WEB (Frontend)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Leaflet.js │  │ Controles UI │  │  Paneles Info    │   │
│  │  (Mapas)    │  │  (Fecha/Zona)│  │  (Riesgo/Stats)  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON
┌──────────────────────────▼──────────────────────────────────┐
│                    API REST (Flask)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │/api/predecir │  │/api/predecir │  │  /api/zonas     │   │
│  │  (zona)      │  │   _punto     │  │                 │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  MODELOS ML (Predicción)                     │
│  ┌────────────────────┐         ┌─────────────────────┐     │
│  │  XGBoost Regressor │         │ XGBoost Classifier  │     │
│  │  (Intensidad)      │         │ (Alto/Bajo Riesgo)  │     │
│  └────────────────────┘         └─────────────────────┘     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              DATOS (CSV Procesados)                          │
│  • dataset_entrenamiento_final_final.csv                    │
│  • aprehendidos_Detenidos_con_cluster_y_riesgo.csv         │
│  • perfil_infracciones_por_cluster.csv                     │
│  • riesgo_celdas_aprehendidos.csv                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
sistema-de-prediccion-espacio-temporal-de-eventos-delictivos/
│
├── data/
│   ├── raw/                    # Datos originales sin procesar
│   ├── interim/                # Datos parcialmente procesados
│   └── processed/              # Datos finales listos para el modelo
│       ├── dataset_entrenamiento_final_final.csv
│       ├── aprehendidos_Detenidos_con_cluster_y_riesgo.csv
│       ├── perfil_infracciones_por_cluster.csv
│       └── riesgo_celdas_aprehendidos.csv
│
├── notebooks/                  # Jupyter notebooks de análisis
│   ├── notebook_principal.ipynb   
|
├── src/ 
│   │
│   ├── models/ 
│   │   ├── predictor.py       # Funciones de predicción
│   │   ├── zonas.py           # Definición de zonas geográficas
│   │   
│   │
│   ├── js/
│   │   └── app.js             # Lógica frontend
│   │
│   ├── styles/
│       └── style.css          # Estilos de interfaz
│
├── models/
│   └── trained/
│       ├── modelo_riesgo_delictivo.pkl              # Regressor
│       └── modelo_clasificacion_riesgo_delictivo.pkl # Classifier
│
├──  index.html             # Interfaz web principal
│
├── api.py                     # API REST Flask
├── requirements.txt           # Dependencias Python
├── README.md                  # Este archivo
```

## 🚀 Instalación y Configuración

### Requisitos Previos
- Python 3.8+
- pip 
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/mfalvarezd/sistema-de-prediccion-espacio-temporal-de-eventos-delictivos.git
cd sistema-de-prediccion-espacio-temporal-de-eventos-delictivos
```

### 2. Crear Entorno Virtual
```bash
# Con venv
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

**Principales dependencias:**
```
flask==2.3.0
flask-cors==4.0.0
pandas==2.0.3
numpy==1.24.3
scikit-learn==1.3.0
xgboost==1.7.6
joblib==1.3.1
```

### 4. Preparar Datos
Asegúrate de tener los siguientes archivos en `data/processed/`:
- `dataset_entrenamiento_final_final.csv`
- `aprehendidos_Detenidos_con_cluster_y_riesgo.csv`
- `perfil_infracciones_por_cluster.csv`
- `riesgo_celdas_aprehendidos.csv`

### 5. Entrenar Modelos (Opcional)
Si necesitas reentrenar los modelos:
```bash
cd notebooks/
jupyter notebook notebook_principal.ipynb
```

### 6. Iniciar el Sistema

#### Backend (API)
```bash
python api.py
```
El servidor iniciará en `http://localhost:5000`

#### Frontend (Web)
```bash
# Opción 1: Servidor HTTP simple
cd web/
python -m http.server 8000

# Opción 2: Abrir directamente
# Abrir web/index.html en tu navegador
```

Acceder a `http://localhost:8000` en tu navegador.

## 📖 Guía de Uso

### 1. Predicción por Zona

#### Paso 1: Seleccionar Parámetros
- **Fecha**: Elige la fecha para la predicción
- **Zona**: Selecciona una provincia de Ecuador

#### Paso 2: Generar Predicción
- Click en el botón **"Predecir"**
- Espera a que se genere el mapa de calor

#### Paso 3: Analizar Resultados
- **Panel Izquierdo**: Información de la zona y leyenda de colores
- **Mapa Central**: Visualización del riesgo con gradiente de colores
  - 🔵 Azul: Riesgo muy bajo
  - 🔵 Cyan: Riesgo bajo
  - 🟢 Verde: Riesgo moderado
  - 🟡 Amarillo: Riesgo medio-alto
  - 🟠 Naranja: Riesgo alto
  - 🔴 Rojo: Riesgo crítico
- **Panel Derecho**: Análisis de riesgo e infracciones esperadas

### 2. Visualizar Hotspots

#### Activar Hotspots
- Click en el botón **"🔥 Hotspots"**
- Los círculos rojos aparecerán en el mapa

#### Interpretar Hotspots
- **Tamaño del círculo**: Proporcional a la cantidad de delitos
- **Número central**: Total de incidentes registrados
- **Click en círculo**: Ver detalles de delitos en esa ubicación

### 3. Predicción por Punto Específico

#### Paso 1: Activar Modo Selección
- Selecciona una **fecha**
- Click en **"Seleccionar Punto"**
- El cursor cambiará a cruz (+)

#### Paso 2: Seleccionar Ubicación
- Haz click en cualquier punto del mapa
- Aparecerá un marcador verde

#### Paso 3: Analizar Predicción
El panel lateral mostrará:

**Clasificación**
- ALTO RIESGO / BAJO RIESGO

**Probabilidades**
- P(Alto Riesgo): % de probabilidad de evento grave
- P(Bajo Riesgo): % de probabilidad de no evento

**Medidas de Incertidumbre**
- **Incertidumbre (1 - max_proba)**:
  - < 0.2: ✓ Predicción muy confiable
  - 0.2 - 0.4: ⚠️ Moderadamente confiable
  - > 0.4: ⚠️ Alta incertidumbre
- **Entropía**: Medida complementaria (0 = certeza, 1 = incertidumbre)

**Datos Históricos**
- Eventos totales registrados en esa celda
- Delitos graves históricos

**Infracciones Típicas**
- Top 3 tipos de delitos esperados en esa zona

## 🧪 Modelos de Machine Learning

### Modelo 1: Regresión de Riesgo

**Tipo**: XGBoost Regressor

**Objetivo**: Predecir la intensidad del riesgo delictivo en una celda del grid

**Features**:
```python
features = [
    'lat_grid',              # Latitud de la celda
    'lon_grid',              # Longitud de la celda
    'mes',                   # Mes del año (1-12)
    'dia',                   # Día del mes (1-31)
    'dia_semana',            # Día de la semana (0-6)
    'conteo_llamadas_riesgo' # Llamadas históricas de emergencia
]
```

**Target**: `prediccion_riesgo` (valor continuo)

**Hiperparámetros**:
```python
XGBRegressor(
    objective='reg:squarederror',
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8
)
```

### Modelo 2: Clasificación de Riesgo

**Tipo**: XGBoost Classifier

**Objetivo**: Clasificar si una ubicación tendrá un evento delictivo grave

**Features**: Mismas que el modelo de regresión

**Target**: `evento_delictivo_grave` (0 = No, 1 = Sí)

**Hiperparámetros**:
```python
XGBClassifier(
    objective='binary:logistic',
    eval_metric='logloss',
    n_estimators=400,
    max_depth=5,
    learning_rate=0.05,
    subsample=0.7,
    colsample_bytree=0.7,
    min_child_weight=10,
    gamma=2,
    reg_alpha=1.0,      # L1 regularization
    reg_lambda=2.0,     # L2 regularization
    scale_pos_weight=calculated  # Balance de clases
)
```

### Grid Espacial

**Precisión**: 0.001° (~111 metros)

**Cálculo**:
```python
lat_grid = round(latitud, 3)
lon_grid = round(longitud, 3)
```

**Ventajas**:
- Granularidad suficiente para análisis urbano
- Balance entre detalle y procesamiento
- Compatible con datos GPS estándar

## 📊 Datasets

### 1. Dataset de Entrenamiento
**Archivo**: `dataset_entrenamiento_final_final.csv`

**Descripción**: Dataset principal con features agregadas por celda geográfica

**Columnas clave**:
- `lat_grid`, `lon_grid`: Coordenadas de la celda
- `mes`, `dia`, `dia_semana`: Features temporales
- `conteo_llamadas_riesgo`: Llamadas de emergencia históricas
- `conteo_delitos`: Total de delitos en la celda
- `conteo_delitos_graves`: Delitos graves registrados

### 2. Aprehendidos y Detenidos
**Archivo**: `aprehendidos_Detenidos_con_cluster_y_riesgo.csv`

**Descripción**: Registros individuales de eventos delictivos con clustering

**Columnas clave**:
- `fecha_completa`: Timestamp del evento
- `latitud`, `longitud`: Ubicación exacta
- `presunta_infraccion`: Tipo de delito
- `cluster_id`: ID del cluster de riesgo
- `nivel_riesgo`: ALTO/MEDIO/BAJO

### 3. Perfil de Infracciones por Cluster
**Archivo**: `perfil_infracciones_por_cluster.csv`

**Descripción**: Distribución de tipos de delitos por cluster

**Columnas**:
- `cluster_id`: Identificador del cluster
- `nivel_riesgo`: Nivel asignado
- `presunta_infraccion`: Tipo de delito
- `conteo`: Cantidad de eventos
- `pct`: Porcentaje del total

### 4. Riesgo por Celdas
**Archivo**: `riesgo_celdas_aprehendidos.csv`

**Descripción**: Métricas de riesgo agregadas por celda geográfica

**Columnas**:
- `lat_grid`, `lon_grid`: Identificador de celda
- `total_delitos`: Total de delitos
- `total_graves`: Delitos graves
- `ratio_graves`: Proporción de delitos graves
- `cluster_id`: Cluster asignado
- `nivel_riesgo`: Clasificación de riesgo

## 🔧 API REST

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Predicción por Zona
```http
POST /api/predecir
Content-Type: application/json

{
  "fecha": "2024-12-15",
  "zona": "Guayas"
}
```

**Respuesta**:
```json
{
  "datos": [[lat, lon, intensidad], ...],
  "puntos": 1250,
  "estadisticas": {
    "riesgo_min": 0.12,
    "riesgo_max": 0.89,
    "riesgo_promedio": 0.45
  },
  "nivel_riesgo": "ALTO",
  "prediccion_eventos": 6.3,
  "perfil_infracciones": [
    {"tipo": "DELITOS CONTRA LA PROPIEDAD", "prob": 0.34},
    ...
  ],
  "hotspots": [
    {
      "lat": -2.145,
      "lon": -79.967,
      "intensidad": 23,
      "tipo_delito": "...",
      "delitos": [...]
    },
    ...
  ]
}
```

#### 2. Predicción por Punto
```http
POST /api/predecir_punto
Content-Type: application/json

{
  "lat": -2.1709,
  "lon": -79.9224,
  "fecha": "2024-12-15"
}
```

**Respuesta**:
```json
{
  "lat": -2.1709,
  "lon": -79.9224,
  "clasificacion": "ALTO RIESGO",
  "prob_alto_riesgo": 0.7845,
  "prob_bajo_riesgo": 0.2155,
  "incertidumbre": 0.2155,
  "entropia": 0.7549,
  "eventos_historicos": 23,
  "delitos_graves_historicos": 8,
  "infracciones_tipicas": [...]
}
```

#### 3. Obtener Zonas
```http
GET /api/zonas
```

**Respuesta**:
```json
{
  "zonas": ["Azuay", "Bolívar", "Guayas", ...]
}
```

#### 4. Health Check
```http
GET /api/health
```

**Respuesta**:
```json
{
  "status": "OK",
  "message": "API funcionando correctamente"
}
```

## 🎨 Tecnologías Utilizadas

### Backend
- **Flask**: Framework web ligero
- **Flask-CORS**: Manejo de CORS para API
- **Pandas**: Procesamiento de datos
- **NumPy**: Operaciones numéricas
- **XGBoost**: Modelos de ML
- **Scikit-learn**: Preprocesamiento y métricas
- **Joblib**: Serialización de modelos

### Frontend
- **Leaflet.js**: Biblioteca de mapas interactivos
- **Leaflet.heat**: Plugin para mapas de calor
- **Font Awesome**: Iconos
- **Vanilla JavaScript**: Lógica de interfaz
- **CSS3**: Estilos y animaciones

### Datos
- **CSV**: Formato de almacenamiento
- **Pandas**: Manipulación y análisis

## 📈 Métricas de Rendimiento

### Modelo de Regresión
- **MAE (Mean Absolute Error)**: Evaluar en validación
- **RMSE (Root Mean Square Error)**: Evaluar en validación
- **R² Score**: Capacidad explicativa del modelo

### Modelo de Clasificación
- **Accuracy**: Precisión global
- **Precision**: Precisión en clase positiva
- **Recall**: Sensibilidad
- **F1-Score**: Balance precision-recall
- **ROC-AUC**: Área bajo la curva ROC
- **Confusion Matrix**: Matriz de confusión

## 🔒 Consideraciones de Seguridad

1. **API**: Implementar autenticación para producción
2. **CORS**: Configurar dominios permitidos
3. **Rate Limiting**: Limitar requests por IP
4. **Validación**: Sanitizar inputs del usuario
5. **HTTPS**: Usar SSL/TLS en producción

## 🚧 Limitaciones Conocidas

1. **Datos Históricos**: Predicción limitada por calidad de datos
2. **Granularidad Temporal**: No considera horarios específicos dentro del día
3. **Factores Externos**: No incluye eventos especiales o cambios socioeconómicos
4. **Actualización**: Modelos requieren reentrenamiento periódico
5. **Cobertura**: Limitado a zonas con datos históricos suficientes

## 🔮 Trabajo Futuro

### Mejoras del Modelo
- [ ] Incorporar variables meteorológicas
- [ ] Incluir eventos especiales (festividades, eventos deportivos)
- [ ] Análisis de series temporales (LSTM, Prophet)
- [ ] Ensamble de múltiples modelos
- [ ] Calibración de probabilidades

### Funcionalidades
- [ ] Alertas automáticas por zona
- [ ] Exportación de reportes PDF
- [ ] Dashboard de análisis histórico
- [ ] Comparación temporal (antes/después)
- [ ] API de streaming en tiempo real

### Infraestructura
- [ ] Dockerización del sistema
- [ ] CI/CD pipeline
- [ ] Base de datos PostgreSQL/MongoDB
- [ ] Cache con Redis
- [ ] Escalamiento horizontal

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request


## 🙏 Agradecimientos

- Datos proporcionados por [Datos Abiertos Ecuador]
- Comunidad de XGBoost y Scikit-learn
- Leaflet.js por la excelente biblioteca de mapas

---

**Nota**: Este sistema es una herramienta de apoyo para la toma de decisiones. Las predicciones deben complementarse con análisis experto y no deben ser la única base para decisiones operativas.