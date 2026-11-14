import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import PantallaLocalizando from './PantallaLocalizando.jsx'
import PantallaConfirmacion from './PantallaConfirmacion.jsx'
import PantallaHectareas from './PantallaHectareas.jsx'
import PantallaProcesando from './PantallaProcesando.jsx'
import PantallaHome from './PantallaHome.jsx'
import PantallaResultados from '../resultados/PantallaResultados.jsx'
import { formatoCoord, formatoNumero } from './geo.js'
import '../onboarding/onboarding.css'
import '../mapa-movil/mapa-movil.css'
import './flujo-gps.css'

const PANTALLA = { LOCALIZANDO: 1, UBICACION_OK: 2, HECTAREAS: 3, HECTAREAS_OK: 4, PROCESANDO: 5, HOME: 6, RESULTADOS: 7 }

// Flujo que sigue a "Estoy en mi finca":
// localizar → confirmar → hectáreas → confirmar → procesar parcela → home → resultados
// Si la finca ya viene dibujada a mano (`parcelaInicial`), empieza en el inicio.
export default function FlujoGps({
  nombre, historial, ubicacionInicial = null, parcelaInicial = null, onEvento, onProceso, onCancelar, onManual,
}) {
  const [pantalla, setPantalla] = useState(parcelaInicial ? PANTALLA.HOME : PANTALLA.LOCALIZANDO)
  const [direccion, setDireccion] = useState('adelante')
  const [ubicacion, setUbicacion] = useState(ubicacionInicial)
  const [hectareas, setHectareas] = useState(parcelaInicial?.area ?? null)
  const [parcela, setParcela] = useState(parcelaInicial)
  const [modoAnalisis, setModoAnalisis] = useState('Rápido')
  const [analisis, setAnalisis] = useState(null)

  const irA = (destino) => {
    setDireccion(destino > pantalla ? 'adelante' : 'atras')
    setPantalla(destino)
  }

  const alUbicar = (u) => {
    setUbicacion(u)
    onEvento('Ubicación', `Encontrada con GPS (±${Math.round(u.precision)} m)`)
    irA(PANTALLA.UBICACION_OK)
  }

  const alGuardarHectareas = (ha) => {
    setHectareas(ha)
    onEvento('Superficie', `${formatoNumero(ha)} ha declaradas`)
    irA(PANTALLA.HECTAREAS_OK)
  }

  const alTerminarProceso = (resultado) => {
    setParcela(resultado)
    onEvento('Parcela', `Contorno aproximado de ${formatoNumero(resultado.area)} ha`)
  }

  const analizar = (modo) => {
    setModoAnalisis(modo)
    onProceso(modo, modo === 'Profundo' ? 'Plan de siembra para 4 años' : 'Revisión de tu finca y la lluvia')
    irA(PANTALLA.RESULTADOS)
  }

  const contenido = () => {
    switch (pantalla) {
      case PANTALLA.LOCALIZANDO:
        return <PantallaLocalizando onUbicada={alUbicar} onCancelar={onCancelar} onManual={onManual} />
      case PANTALLA.UBICACION_OK:
        return (
          <PantallaConfirmacion
            titulo="¡Ubicación obtenida!"
            mensaje="Guardamos el lugar donde estás ahora, que es tu finca."
            detalles={[
              { etiqueta: 'Precisión del GPS', valor: `unos ${Math.round(ubicacion.precision)} metros` },
              { etiqueta: 'Coordenadas', valor: `${formatoCoord(ubicacion.lat)}, ${formatoCoord(ubicacion.lng)}` },
            ]}
            textoPrincipal="Continuar"
            iconoPrincipal={<ArrowRight size={20} />}
            onPrincipal={() => irA(PANTALLA.HECTAREAS)}
            textoSecundario="Volver a ubicarme"
            onSecundario={() => irA(PANTALLA.LOCALIZANDO)}
          />
        )
      case PANTALLA.HECTAREAS:
        return (
          <PantallaHectareas
            valorInicial={hectareas}
            onGuardar={alGuardarHectareas}
            onVolver={() => irA(PANTALLA.UBICACION_OK)}
          />
        )
      case PANTALLA.HECTAREAS_OK:
        return (
          <PantallaConfirmacion
            titulo="¡Superficie guardada!"
            mensaje={`Registramos que tu finca tiene ${formatoNumero(hectareas)} hectáreas.`}
            detalles={[
              { etiqueta: 'Superficie', valor: `${formatoNumero(hectareas)} ha` },
              { etiqueta: 'Equivale a', valor: `${formatoNumero(hectareas * 10000, 0)} m²` },
              { etiqueta: 'Es como', valor: `${formatoNumero(hectareas * 1.4, 1)} canchas de fútbol` },
            ]}
            textoPrincipal="Ubicar mi parcela en el mapa"
            iconoPrincipal={<ArrowRight size={20} />}
            onPrincipal={() => irA(PANTALLA.PROCESANDO)}
            textoSecundario="Editar hectáreas"
            onSecundario={() => irA(PANTALLA.HECTAREAS)}
          />
        )
      case PANTALLA.PROCESANDO:
        return (
          <PantallaProcesando
            ubicacion={ubicacion}
            hectareas={hectareas}
            onTerminado={alTerminarProceso}
            onIrAlInicio={() => irA(PANTALLA.HOME)}
          />
        )
      case PANTALLA.RESULTADOS:
        return (
          <PantallaResultados
            ubicacion={ubicacion}
            parcela={parcela}
            modo={modoAnalisis}
            onVolver={() => irA(PANTALLA.HOME)}
            onProfundo={() => {
              setModoAnalisis('Profundo')
              onProceso('Profundo', 'Plan de siembra para 4 años')
            }}
            onAnalisis={setAnalisis}
          />
        )
      default:
        return (
          <PantallaHome
            nombre={nombre}
            ubicacion={ubicacion}
            parcela={parcela}
            historial={historial}
            analisis={analisis}
            onProceso={analizar}
            onVerResultados={() => (analisis ? irA(PANTALLA.RESULTADOS) : analizar('Rápido'))}
          />
        )
    }
  }

  return (
    <div className="marco onb">
      <div className="marco-tarjeta fg">
        <div key={pantalla} className={`fg-transicion onb-${direccion}`}>
          {contenido()}
        </div>
      </div>
    </div>
  )
}
