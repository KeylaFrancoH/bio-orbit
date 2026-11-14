import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleMarker, MapContainer, Marker, Polygon, TileLayer } from 'react-leaflet'
import { ArrowRight, Check, LoaderCircle, ScanLine } from 'lucide-react'
import L from '../../lib/leaflet.js'
import { TILE_SATELITE, areaHa, formatoNumero, interpolar, perimetroM, poligonoParcela } from './geo.js'

// Simulación visual del procesamiento que en el futuro hará el backend
// (análisis de la imagen satelital y ajuste del polígono de la parcela).
const DURACIONES = [1300, 1700, 1700, 1600, 1300]
const DURACION_AJUSTE = 1400

const ICONO_CENTRO = L.divIcon({
  className: 'fg-marcador',
  html: '<span class="fg-marcador-punto"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

const marcarTrazo = (e) => e.target.getElement()?.setAttribute('pathLength', '1')

export default function PantallaProcesando({ ubicacion, hectareas, onTerminado, onIrAlInicio }) {
  const [fase, setFase] = useState(0)
  const final = useMemo(() => poligonoParcela(ubicacion, hectareas), [ubicacion, hectareas])
  const aproximado = useMemo(
    () => poligonoParcela(ubicacion, hectareas, { escala: 1.22, ruido: 0.14 }),
    [ubicacion, hectareas],
  )
  const [forma, setForma] = useState(aproximado)
  const limites = useMemo(() => L.latLngBounds(aproximado), [aproximado])
  const resultado = useMemo(() => ({ area: areaHa(final), perimetro: perimetroM(final) }), [final])

  const onTerminadoRef = useRef(onTerminado)
  useEffect(() => {
    onTerminadoRef.current = onTerminado
  })

  // Línea de tiempo de las fases
  useEffect(() => {
    if (fase >= DURACIONES.length) {
      onTerminadoRef.current?.({ poligono: final, ...resultado })
      return
    }
    const id = setTimeout(() => setFase((f) => f + 1), DURACIONES[fase])
    return () => clearTimeout(id)
  }, [fase, final, resultado])

  // Fase 3: el contorno aproximado se ajusta al área declarada
  useEffect(() => {
    if (fase !== 3) return
    let raf
    const inicio = performance.now()
    const paso = (t) => {
      const k = Math.min(1, (t - inicio) / DURACION_AJUSTE)
      const suave = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2
      setForma(interpolar(aproximado, final, suave))
      if (k < 1) raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [fase, aproximado, final])

  const terminado = fase >= DURACIONES.length
  const pasos = [
    'Recibiendo coordenadas GPS',
    'Analizando imagen satelital',
    'Detectando bordes de la parcela',
    `Ajustando polígono a ${formatoNumero(hectareas)} ha`,
    'Validando límites del terreno',
  ]
  const progreso = Math.round((Math.min(fase, DURACIONES.length) / DURACIONES.length) * 100)

  return (
    <div className="fg-pantalla">
      <div className={`fg-mapa fg-proceso fase-${fase}`}>
        <MapContainer
          bounds={limites}
          boundsOptions={{ padding: [36, 36] }}
          className="map"
          zoomControl={false}
          dragging={terminado}
          scrollWheelZoom={terminado}
          doubleClickZoom={false}
          touchZoom={terminado}
          keyboard={false}
        >
          <TileLayer url={TILE_SATELITE.url} attribution={TILE_SATELITE.attribution} maxZoom={19} />
          <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_CENTRO} />

          {(fase === 2 || fase === 3) && (
            <Polygon
              positions={forma}
              eventHandlers={{ add: marcarTrazo }}
              pathOptions={{ className: 'fg-trazo', color: '#fbbf24', weight: 3, fillColor: '#fbbf24', fillOpacity: 0.12 }}
            />
          )}
          {fase >= 4 && (
            <>
              <Polygon
                positions={final}
                pathOptions={{
                  className: 'fg-poligono-final',
                  color: '#ffffff',
                  weight: 3,
                  fillColor: '#10b981',
                  fillOpacity: terminado ? 0.4 : 0.25,
                }}
              />
              {final.map((p, i) => (
                <CircleMarker
                  key={i}
                  center={p}
                  radius={5}
                  pathOptions={{ color: '#047857', weight: 2, fillColor: '#fff', fillOpacity: 1 }}
                />
              ))}
            </>
          )}
        </MapContainer>

        <div className="fg-cuadricula" />
        <div className="fg-hud" aria-hidden="true">
          <span /> <span /> <span /> <span />
        </div>
        {(fase === 1 || fase === 2) && <div className="fg-escaneo" aria-hidden="true" />}
        <div className={`fg-chip-gps ${terminado ? 'fijada' : 'buscando'}`}>
          <span className="fg-chip-punto" />
          {terminado ? 'Parcela delimitada' : 'Procesando imagen satelital'}
        </div>
      </div>

      <section className="fg-hoja" aria-live="polite">
        <div className="fg-hoja-cabecera">
          <span className={`fg-hoja-icono ${terminado ? 'fijada' : 'buscando'}`}>
            {terminado ? <Check size={22} /> : <ScanLine size={22} />}
          </span>
          <div>
            <h1 className="fg-hoja-titulo">{terminado ? '¡Parcela delimitada!' : 'Delimitando tu parcela…'}</h1>
            <p className="fg-hoja-texto">
              {terminado
                ? 'Calculamos el tamaño y los límites de tu terreno.'
                : 'Estamos ubicando los bordes de tu terreno en la imagen satelital.'}
            </p>
          </div>
        </div>

        {terminado ? (
          <>
            <div className="fg-lectura fg-resultado">
              <div>
                <span>Área</span>
                <strong>{formatoNumero(resultado.area)} ha</strong>
              </div>
              <div>
                <span>Perímetro</span>
                <strong>{formatoNumero(resultado.perimetro, 0)} m</strong>
              </div>
              <div>
                <span>Vértices</span>
                <strong>{final.length}</strong>
              </div>
            </div>
            <button className="onb-btn onb-btn-primario fg-aparecer" onClick={onIrAlInicio} autoFocus>
              Ir al inicio <ArrowRight size={20} />
            </button>
          </>
        ) : (
          <>
            <div className="fg-progreso" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progreso}>
              <span style={{ width: `${progreso}%` }} />
            </div>
            <ul className="fg-pasos">
              {pasos.map((texto, i) => (
                <li key={i} className={i < fase ? 'hecho' : i === fase ? 'activo' : ''}>
                  <span className="fg-paso-icono">
                    {i < fase ? <Check size={14} /> : i === fase ? <LoaderCircle size={14} className="onb-girando" /> : null}
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
