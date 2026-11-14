import { useMemo } from 'react'
import { MapContainer, Polygon, TileLayer } from 'react-leaflet'
import {
  Activity, BarChart3, House, Layers, LandPlot, Map as MapIcon, MapPin, Ruler, ScanLine, UserRound, Zap,
} from 'lucide-react'
import L from '../../lib/leaflet.js'
import { TILE_SATELITE, formatoCoord, formatoNumero } from './geo.js'

const ICONOS = { Rápido: Zap, Profundo: Layers, Ubicación: MapPin, Superficie: Ruler, Parcela: ScanLine }

const saludo = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}

const hora = (fecha) => fecha.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

const NAVEGACION = [
  { nombre: 'Inicio', Icono: House },
  { nombre: 'Mapa', Icono: MapIcon },
  { nombre: 'Análisis', Icono: BarChart3 },
  { nombre: 'Perfil', Icono: UserRound },
]

// Home simulada: resumen de la finca recién registrada.
export default function PantallaHome({ nombre, ubicacion, parcela, historial, onProceso }) {
  const limites = useMemo(() => L.latLngBounds(parcela.poligono), [parcela])
  const primerNombre = nombre.split(' ')[0]

  return (
    <div className="fg-pantalla fg-home">
      <header className="fg-home-cabecera">
        <div>
          <p>{saludo()},</p>
          <h1>{primerNombre}</h1>
        </div>
        <span className="vm-avatar" aria-hidden="true">
          {primerNombre.charAt(0).toUpperCase()}
        </span>
      </header>

      <div className="fg-home-contenido">
        <article className="fg-tarjeta-finca fg-aparecer">
          <div className="fg-mini-mapa">
            <MapContainer
              bounds={limites}
              boundsOptions={{ padding: [20, 20] }}
              className="map"
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
              keyboard={false}
              attributionControl={false}
            >
              <TileLayer url={TILE_SATELITE.url} maxZoom={19} />
              <Polygon
                positions={parcela.poligono}
                pathOptions={{ color: '#fff', weight: 2, fillColor: '#10b981', fillOpacity: 0.4 }}
              />
            </MapContainer>
            <span className="fg-insignia">
              <ScanLine size={14} /> Parcela delimitada
            </span>
          </div>
          <div className="fg-tarjeta-finca-info">
            <h2>Mi finca</h2>
            <p>
              <MapPin size={14} /> {formatoCoord(ubicacion.lat)}, {formatoCoord(ubicacion.lng)}
            </p>
          </div>
        </article>

        <div className="fg-stats fg-aparecer" style={{ '--retraso': '0.1s' }}>
          <div className="fg-stat">
            <LandPlot size={18} />
            <span>Superficie</span>
            <strong>{formatoNumero(parcela.area)} ha</strong>
          </div>
          <div className="fg-stat">
            <Ruler size={18} />
            <span>Perímetro</span>
            <strong>{formatoNumero(parcela.perimetro, 0)} m</strong>
          </div>
          <div className="fg-stat ancho">
            <Activity size={18} />
            <span>Salud del cultivo</span>
            <strong className="fg-pendiente">Sin análisis todavía</strong>
          </div>
        </div>

        <section className="fg-aparecer" style={{ '--retraso': '0.2s' }}>
          <h2 className="fg-seccion-titulo">Procesos</h2>
          <div className="vm-procesos">
            <button className="vm-proceso" onClick={() => onProceso('Rápido')}>
              <Zap size={20} /> <span>Rápido</span>
            </button>
            <button className="vm-proceso azul" onClick={() => onProceso('Profundo')}>
              <Layers size={20} /> <span>Profundo</span>
            </button>
          </div>
        </section>

        <section className="fg-aparecer" style={{ '--retraso': '0.3s' }}>
          <h2 className="fg-seccion-titulo">Actividad reciente</h2>
          <ul className="vm-lista">
            {historial.slice(0, 5).map((item) => {
              const Icono = ICONOS[item.tipo] ?? Activity
              return (
                <li key={item.id} className="vm-item">
                  <span className={`vm-item-icono ${item.tipo === 'Profundo' ? 'azul' : ''}`}>
                    <Icono size={16} />
                  </span>
                  <div className="vm-item-texto">
                    <strong>{item.tipo}</strong>
                    <span>{item.detalle}</span>
                  </div>
                  <small>{hora(item.fecha)}</small>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <nav className="fg-nav" aria-label="Navegación principal">
        {NAVEGACION.map(({ nombre: n, Icono }, i) => (
          <button key={n} className={i === 0 ? 'activo' : ''} aria-current={i === 0 ? 'page' : undefined}>
            <Icono size={22} />
            <span>{n}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
