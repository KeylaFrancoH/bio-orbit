import L from '../../lib/leaflet.js'
import 'leaflet-draw'

export const TILE_SATELITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri',
}

const M_POR_GRADO = 111320

// Cuadrado (4 esquinas [lat, lng]) centrado en `centro` cuya área es `hectareas`.
export function cuadradoPorArea(centro, hectareas) {
  const medio = Math.sqrt(hectareas * 10000) / 2
  const dLat = medio / M_POR_GRADO
  const dLng = medio / (M_POR_GRADO * Math.cos((centro.lat * Math.PI) / 180))
  return [
    [centro.lat + dLat, centro.lng - dLng],
    [centro.lat + dLat, centro.lng + dLng],
    [centro.lat - dLat, centro.lng + dLng],
    [centro.lat - dLat, centro.lng - dLng],
  ]
}

export const centroide = (puntos) => [
  puntos.reduce((s, p) => s + p[0], 0) / puntos.length,
  puntos.reduce((s, p) => s + p[1], 0) / puntos.length,
]

export const areaHa = (puntos) => L.GeometryUtil.geodesicArea(puntos.map(([lat, lng]) => L.latLng(lat, lng))) / 10000

export const perimetroM = (puntos) =>
  puntos.reduce((total, p, i) => total + L.latLng(p).distanceTo(L.latLng(puntos[(i + 1) % puntos.length])), 0)

export const formatoNumero = (n, decimales = 2) => n.toLocaleString('es', { maximumFractionDigits: decimales })

export const formatoCoord = (n) => n.toFixed(6)
