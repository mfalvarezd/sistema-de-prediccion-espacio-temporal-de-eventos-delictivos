# sistema-de-prediccion-espacio-temporal-de-eventos-delictivos
# estructura de carpetas
ai-project/
│
├── data/
│   ├── raw/                # Datos originales sin procesar
│   ├── interim/            # Datos parcialmente procesados
│   ├── processed/          # Datos finales listos para el modelo
│   ├── external/           # Datos de fuentes externas (APIs, terceros)
│
├── notebooks/
│   ├── 01_exploration.ipynb
│   ├── 02_feature_engineering.ipynb
│   ├── 03_modeling.ipynb
│   └── 04_evaluation.ipynb
│
├── src/
│   ├── __init__.py
│   │
│   ├── data/
│   │   ├── load_data.py        # Carga de datos
│   │   ├── preprocess.py       # Limpieza y preprocesamiento
│   │   └── feature_build.py    # Ingeniería de características
│   │
│   ├── models/
│   │   ├── train.py            # Entrenamiento
│   │   ├── predict.py          # Inferencia
│   │   └── evaluate.py         # Métricas y validación
│   │
│   ├── visualization/
│   │   └── plots.py            # Gráficos y visualizaciones
│   │
│   ├── utils/
│   │   ├── config.py           # Configuración global
│   │   └── helpers.py          # Funciones auxiliares
│   │
│   └── pipelines/
│       └── training_pipeline.py
│
├── models/
│   ├── trained/                # Modelos entrenados (.pkl, .pt, .h5)
│   └── checkpoints/            # Estados intermedios del modelo
│
├── reports/
│   ├── figures/                # Gráficos finales
│   └── results.md              # Resultados y conclusiones
│
├── tests/
│   ├── test_data.py
│   ├── test_models.py
│   └── test_utils.py
│
├── configs/
│   ├── model.yaml              # Hiperparámetros
│   └── paths.yaml              # Rutas del proyecto
│
├── requirements.txt
├── environment.yml             # (opcional) Conda
├── README.md
└── .gitignore
