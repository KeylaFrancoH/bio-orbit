import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import PantallaLocalizando from './PantallaLocalizando.jsx'
import PantallaConfirmacion from './PantallaConfirmacion.jsx'
import PantallaHectareas from './PantallaHectareas.jsx'
import PantallaProcesando from './PantallaProcesando.jsx'
import PantallaHome from './PantallaHome.jsx'
import { formatoCoord, formatoNumero } from './geo.js'
import '../onboarding/onboarding.css'
import '../mapa-movil/mapa-movil.css'
import './flujo-gps.css'

const PANTALLA = { LOCALIZANDO: 1, UBICACION_OK: 2, HECTAREAS: 3, HECTAREAS_OK: 4, PROCESANDO: 5, HOME: 6 }

// Flujo que sigue a "Ubicación actual":
// localizar → confirmar → hectáreas → confirmar → procesar parcela → home
export default function FlujoGps({ nombre, historial, onEvento, onProceso, onCancelar, onManual }) {
  const [pantalla, setPantalla] = useState(PANTALLA.LOCALIZANDO)
  const [direccion, setDireccion] = useState('adelante')
  const [ubicacion, setUbicacion] = useState(null)
  const [hectareas, setHectareas] = useState(null)
  const [parcela, setParcela] = useState(null)

  const irA = (destino) => {
    setDireccion(destino > pantalla ? 'adelante' : 'atras')
    setPantalla(destino)
  }

  const alUbicar = (u) => {
    setUbicacion(u)
    onEvento('Ubicación', `GPS: ${formatoCoord(u.lat)}, ${formatoCoord(u.lng)}`)
    irA(PANTALLA.UBICACION_OK)
  }

  const alGuardarHectareas = (ha) => {
    setHectareas(ha)
    onEvento('Superficie', `${formatoNumero(ha)} ha declaradas`)
    irA(PANTALLA.HECTAREAS_OK)
  }

  const alTerminarProceso = (resultado) => {
    setParcela(resultado)
    onEvento('Parcela', `Delimitada: ${formatoNumero(resultado.area)} ha · ${resultado.poligono.length} vértices`)
  }

  const contenido = () => {
    switch (pantalla) {
      case PANTALLA.LOCALIZANDO:
        return <PantallaLocalizando onUbicada={alUbicar} onCancelar={onCancelar} onManual={onManual} />
      case PANTALLA.UBICACION_OK:
        return (
          <PantallaConfirmacion
            titulo="¡Ubicación obtenida!"
            mensaje="Acabamos de registrar la ubicación actual de tu finca."
            detalles={[
              { etiqueta: 'Latitud', valor: formatoCoord(ubicacion.lat) },
              { etiqueta: 'Longitud', valor: formatoCoord(ubicacion.lng) },
              { etiqueta: 'Precisión', valor: `±${Math.round(ubicacion.precision)} m` },
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
            ]}
            textoPrincipal="Delimitar mi parcela"
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
      default:
        return (
          <PantallaHome
            nombre={nombre}
            ubicacion={ubicacion}
            parcela={parcela}
            historial={historial}
            onProceso={(modo) => onProceso(modo, `Finca de ${formatoNumero(parcela.area)} ha`)}
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
