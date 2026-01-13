// Definición de zonas (desde tu archivo zonas.py)
const ZONAS = {
  "Azuay": { "lat_min": -3.6, "lat_max": -2.3, "lon_min": -79.6, "lon_max": -78.3 },
  "Bolívar": { "lat_min": -2.2, "lat_max": -1.3, "lon_min": -79.3, "lon_max": -78.5 },
  "Cañar": { "lat_min": -3.2, "lat_max": -2.2, "lon_min": -79.5, "lon_max": -78.7 },
  "Carchi": { "lat_min": 0.5, "lat_max": 1.2, "lon_min": -78.8, "lon_max": -77.6 },
  "Chimborazo": { "lat_min": -2.3, "lat_max": -1.2, "lon_min": -79.1, "lon_max": -78.4 },
  "Cotopaxi": { "lat_min": -1.4, "lat_max": -0.5, "lon_min": -79.1, "lon_max": -78.3 },
  "El Oro": { "lat_min": -3.9, "lat_max": -3.0, "lon_min": -80.3, "lon_max": -79.4 },
  "Esmeraldas": { "lat_min": 0.0, "lat_max": 1.3, "lon_min": -80.1, "lon_max": -78.5 },
  "Guayas": { "lat_min": -2.6, "lat_max": -1.5, "lon_min": -80.3, "lon_max": -79.5 },
  "Imbabura": { "lat_min": 0.1, "lat_max": 0.7, "lon_min": -78.7, "lon_max": -77.7 },
  "Loja": { "lat_min": -4.9, "lat_max": -3.4, "lon_min": -80.4, "lon_max": -78.8 },
  "Los Ríos": { "lat_min": -1.8, "lat_max": -0.7, "lon_min": -80.2, "lon_max": -79.1 },
  "Manabí": { "lat_min": -1.8, "lat_max": 0.4, "lon_min": -80.9, "lon_max": -79.0 },
  "Morona Santiago": { "lat_min": -3.8, "lat_max": -1.5, "lon_min": -78.7, "lon_max": -76.7 },
  "Napo": { "lat_min": -1.2, "lat_max": 0.1, "lon_min": -78.3, "lon_max": -76.4 },
  "Orellana": { "lat_min": -1.3, "lat_max": 0.0, "lon_min": -77.6, "lon_max": -75.2 },
  "Pastaza": { "lat_min": -2.6, "lat_max": -0.8, "lon_min": -78.3, "lon_max": -75.5 },
  "Pichincha": { "lat_min": -0.7, "lat_max": 0.4, "lon_min": -79.3, "lon_max": -78.0 },
  "Santa Elena": { "lat_min": -2.4, "lat_max": -1.8, "lon_min": -81.1, "lon_max": -80.2 },
  "Santo Domingo de los Tsáchilas": { "lat_min": -1.2, "lat_max": -0.1, "lon_min": -79.7, "lon_max": -79.0 },
  "Sucumbíos": { "lat_min": -1.0, "lat_max": 0.7, "lon_min": -77.5, "lon_max": -75.1 },
  "Tungurahua": { "lat_min": -1.6, "lat_max": -0.9, "lon_min": -79.0, "lon_max": -78.2 },
  "Zamora Chinchipe": { "lat_min": -5.1, "lat_max": -3.4, "lon_min": -79.4, "lon_max": -77.3 }
};

// Inicializar mapa
const map = L.map('map', {
  center: [-1.8312, -78.1834], // Centro de Ecuador
  zoom: 7,
  zoomControl: true
});

// Añadir capa base
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  maxZoom: 19
}).addTo(map);

let heatLayer = null;
let hotspotMarkers = [];
let hotspotsVisible = false;
let currentHotspots = [];

// Poblar selector de zonas
const selectZona = document.getElementById('zona');
Object.keys(ZONAS).sort().forEach(zona => {
  const option = document.createElement('option');
  option.value = zona;
  option.textContent = zona;
  selectZona.appendChild(option);
});

// Establecer fecha de hoy por defecto
document.getElementById('fecha').valueAsDate = new Date();

// Toggle panel
function togglePanel() {
  const panel = document.getElementById('sidePanel');
  panel.classList.toggle('hidden');
}

// Generar predicción (conectada con backend Python)
async function generarPrediccion() {
  const fecha = document.getElementById('fecha').value;
  const zona = document.getElementById('zona').value;

  if (!fecha || !zona) {
    alert('⚠️ Por favor, selecciona una fecha y una zona válidas.');
    return;
  }

  // Ocultar pantalla de bienvenida
  document.getElementById('welcomeScreen').style.display = 'none';

  // Mostrar loading
  document.getElementById('loadingOverlay').classList.add('active');

  try {
    // Llamada real al backend Python
    const response = await fetch('http://localhost:5000/api/predecir', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fecha: fecha,
        zona: zona
      })
    });

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const resultado = await response.json();

    // Validar que hay datos
    if (!resultado.datos || resultado.datos.length === 0) {
      alert('❌ No hay datos disponibles para esta zona y fecha.');
      document.getElementById('loadingOverlay').classList.remove('active');
      return;
    }

    // Obtener límites de la zona
    const limites = ZONAS[zona];

    // Actualizar mapa con datos reales
    actualizarMapa(resultado.datos, limites);

    // Actualizar panel de información izquierdo
    actualizarPanel(zona, fecha, resultado.puntos);

    // Actualizar panel de riesgo derecho (NUEVO)
    actualizarPanelRiesgo(resultado);

    // Guardar hotspots
    if (resultado.hotspots) {
      currentHotspots = resultado.hotspots;
      document.querySelector('.hotspot-toggle').style.display = 'block';
    }

    // Mostrar paneles y botón toggle
    document.getElementById('sidePanel').classList.remove('hidden');
    document.getElementById('riskPanel').classList.remove('hidden');
    document.querySelector('.toggle-button').style.display = 'block';

  } catch (error) {
    console.error('Error al generar predicción:', error);
    alert('❌ Error al conectar con el servidor. Asegúrate de que el backend esté ejecutándose.\n\nDetalles: ' + error.message);
  } finally {
    // Ocultar loading
    document.getElementById('loadingOverlay').classList.remove('active');
  }
}

function actualizarMapa(datos, limites) {
  // Extraer intensidades sin normalizar
  const intensidades = datos.map(d => d[2]);

  // Calcular percentiles P10 y P90 para definir rango de riesgo
  const sorted = intensidades.slice().sort((a, b) => a - b);
  const p10 = sorted[Math.floor(0.10 * (sorted.length - 1))];
  const p90 = sorted[Math.floor(0.90 * (sorted.length - 1))];

  let riesgoMin = p10;
  let riesgoMax = p90;

  if (riesgoMax <= riesgoMin) {
    riesgoMax = riesgoMin + 1e-6;
  }

  // Normalización manual para evitar saturación
  const datosNormalizados = datos.map(d => {
    const v = Math.max(0, Math.min(1, (d[2] - riesgoMin) / (riesgoMax - riesgoMin)));
    return [d[0], d[1], v];
  });

  // Eliminar capa anterior
  if (heatLayer) {
    map.removeLayer(heatLayer);
  }

  // Heatmap con parámetros que EVITAN saturación roja
  heatLayer = L.heatLayer(datosNormalizados, {
    radius: 18,
    blur: 15,
    minZoom: 10,
    maxZoom: 16,
    minOpacity: 0.15,
    maxOpacity: 1.0,
    gradient: {
      0.0: '#0000ff',
      0.2: '#00ffff',
      0.4: '#00ff00',
      0.6: '#ffff00',
      0.8: '#ff8800',
      1.0: '#ff0000'
    }
  }).addTo(map);

  // Centrar mapa en la zona
  const centerLat = (limites.lat_min + limites.lat_max) / 2;
  const centerLon = (limites.lon_min + limites.lon_max) / 2;
  map.setView([centerLat, centerLon], 10);
}

// Actualizar panel de información izquierdo
function actualizarPanel(zona, fecha, puntos) {
  document.getElementById('infoZona').textContent = zona;
  document.getElementById('infoFecha').textContent = new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES');
  document.getElementById('infoPuntos').textContent = puntos.toLocaleString('es-ES');
}

// Actualizar panel de riesgo derecho (NUEVO)
function actualizarPanelRiesgo(resultado) {
  const nivelRiesgo = document.getElementById('nivelRiesgo');
  const prediccionEventos = document.getElementById('prediccionEventos');
  const listaInfracciones = document.getElementById('listaInfracciones');

  // Actualizar nivel de riesgo
  const nivel = resultado.nivel_riesgo || 'MEDIO';
  nivelRiesgo.textContent = nivel;
  nivelRiesgo.className = 'risk-level-value ' + nivel;

  // Actualizar predicción de eventos
  prediccionEventos.textContent = resultado.prediccion_eventos || '-';

  // Actualizar infracciones
  listaInfracciones.innerHTML = '';
  
  if (resultado.perfil_infracciones && resultado.perfil_infracciones.length > 0) {
    resultado.perfil_infracciones.forEach(infraccion => {
      const div = document.createElement('div');
      div.className = 'infraccion-item';
      
      const percentage = Math.round(infraccion.prob * 100);
      
      div.innerHTML = `
        <div class="infraccion-tipo">${infraccion.tipo}</div>
        <div class="infraccion-prob">
          <div class="prob-bar">
            <div class="prob-fill" style="width: ${percentage}%"></div>
          </div>
          <div class="prob-value">${percentage}%</div>
        </div>
      `;
      
      listaInfracciones.appendChild(div);
    });
  } else {
    listaInfracciones.innerHTML = '<p style="color: #6c757d; font-size: 0.9rem; text-align: center; padding: 20px;">No hay datos de infracciones disponibles</p>';
  }
}

// Toggle hotspots en el mapa
function toggleHotspots() {
  hotspotsVisible = !hotspotsVisible;
  const btn = document.querySelector('.hotspot-toggle');
  
  if (hotspotsVisible) {
    btn.classList.add('active');
    mostrarHotspots();
  } else {
    btn.classList.remove('active');
    ocultarHotspots();
  }
}

// Mostrar hotspots en el mapa
function mostrarHotspots() {
  // Limpiar marcadores anteriores
  ocultarHotspots();
  
  if (!currentHotspots || currentHotspots.length === 0) {
    return;
  }
  
  // Calcular tamaños basados en intensidad
  const intensidades = currentHotspots.map(h => h.intensidad);
  const maxIntensidad = Math.max(...intensidades);
  const minIntensidad = Math.min(...intensidades);
  
  currentHotspots.forEach(hotspot => {
    // Calcular tamaño del marcador (entre 20 y 50 píxeles)
    const intensidadNorm = (hotspot.intensidad - minIntensidad) / (maxIntensidad - minIntensidad || 1);
    const size = 20 + (intensidadNorm * 30);
    
    // Crear icono personalizado
    const icon = L.divIcon({
      className: 'hotspot-marker',
      html: `<div style="width: ${size}px; height: ${size}px; line-height: ${size}px;">${hotspot.intensidad}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2]
    });
    
    // Crear contenido del popup
    let delitosHtml = '';
    if (hotspot.delitos && hotspot.delitos.length > 0) {
      delitosHtml = `
        <div class="hotspot-delitos-list">
          <h5>Delitos Registrados:</h5>
          ${hotspot.delitos.map(d => `
            <div class="hotspot-delito-item">
              <span class="hotspot-delito-tipo">${d.tipo_delito}</span>
              <span class="hotspot-delito-count">${d.conteo}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    const popupContent = `
      <div class="hotspot-popup">
        <div class="hotspot-popup-header">
          <i class="fas fa-fire"></i>
          Zona de Alto Riesgo
        </div>
        <div class="hotspot-popup-body">
          <div class="hotspot-popup-item">
            <div class="hotspot-popup-label">Total de Incidentes:</div>
            <div class="hotspot-popup-value">${hotspot.intensidad}</div>
          </div>
          <div class="hotspot-popup-item">
            <div class="hotspot-popup-label">Delito Principal:</div>
            <div class="hotspot-popup-value">${hotspot.tipo_delito}</div>
          </div>
          ${delitosHtml}
        </div>
      </div>
    `;
    
    // Crear marcador
    const marker = L.marker([hotspot.lat, hotspot.lon], { icon: icon })
      .bindPopup(popupContent)
      .addTo(map);
    
    hotspotMarkers.push(marker);
  });
}

// Ocultar hotspots del mapa
function ocultarHotspots() {
  hotspotMarkers.forEach(marker => {
    map.removeLayer(marker);
  });
  hotspotMarkers = [];
}