import L from '../../lib/leaflet.js'
import 'leaflet-draw'

export const TILE_SATELITE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri',
}

const M_POR_GRADO = 111320

// Forma base de una parcela algo irregular (x = este, y = norte). Se escala
// para que su área coincida exactamente con las hectáreas declaradas.
const FORMA = [
  [-1, -0.82], [0.05, -0.9], [0.95, -1], [1, 0.02],
  [1.06, 0.86], [0.1, 0.95], [-0.86, 1], [-0.98, 0.05],
]
const AREA_FORMA =
  Math.abs(
    FORMA.reduce((suma, [x1, y1], i) => {
      const [x2, y2] = FORMA[(i + 1) % FORMA.length]
      return suma + x1 * y2 - x2 * y1
    }, 0),
  ) / 2

// Devuelve [[lat, lng], ...]. `escala` y `ruido` generan la versión "aproximada"
// que luego se ajusta a la final durante el procesamiento.
export function poligonoParcela(centro, hectareas, { escala = 1, ruido = 0 } = {}) {
  const lado = Math.sqrt((hectareas * 10000) / AREA_FORMA)
  const cosLat = Math.cos((centro.lat * Math.PI) / 180)
  return FORMA.map(([x, y], i) => {
    const f = escala * (1 + ruido * Math.sin(i * 2.7 + 0.6))
    return [centro.lat + (y * lado * f) / M_POR_GRADO, centro.lng + (x * lado * f) / (M_POR_GRADO * cosLat)]
  })
}

export const interpolar = (a, b, t) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t])

export const areaHa = (puntos) => L.GeometryUtil.geodesicArea(puntos.map(([lat, lng]) => L.latLng(lat, lng))) / 10000

export const perimetroM = (puntos) =>
  puntos.reduce((total, p, i) => total + L.latLng(p).distanceTo(L.latLng(puntos[(i + 1) % puntos.length])), 0)

export const formatoNumero = (n, decimales = 2) => n.toLocaleString('es', { maximumFractionDigits: decimales })

export const formatoCoord = (n) => n.toFixed(6)
