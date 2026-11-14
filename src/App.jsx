import { useCallback, useState } from 'react'
import Onboarding from './components/onboarding/Onboarding.jsx'
import VistaMapaMovil from './components/mapa-movil/VistaMapaMovil.jsx'
import FlujoGps from './components/flujo-gps/FlujoGps.jsx'

export default function App() {
  // null mientras el usuario está en el onboarding
  const [sesion, setSesion] = useState(null)
  const [ultimoNombre, setUltimoNombre] = useState('')
  const [historial, setHistorial] = useState([])
  const [figuras, setFiguras] = useState(0)

  const registrar = useCallback((tipo, detalle) => {
    setHistorial((prev) => [
      { id: crypto.randomUUID(), tipo, detalle, fecha: new Date() },
      ...prev,
    ])
  }, [])

  // La ubicación se obtiene dentro del flujo GPS (pantalla "Detectando tu ubicación")
  const onUseCurrentLocation = ({ nombre }) => {
    setSesion({ nombre, ubicacion: null, modo: 'gps' })
  }

  const onSelectManually = ({ nombre }) => {
    setSesion({ nombre, ubicacion: null, modo: 'manual' })
    registrar('Ubicación', 'Selección manual en el mapa')
  }

  // Vuelve al paso "Ubica tu finca" conservando el nombre
  const volverAlOnboarding = () => {
    setUltimoNombre(sesion.nombre)
    setFiguras(0)
    setSesion(null)
  }

  const ejecutarProceso = (modo, detalle) => {
    registrar(modo, detalle ?? (figuras ? `${figuras} área(s) seleccionada(s)` : 'Sin áreas dibujadas'))
  }

  if (!sesion) {
    return (
      <Onboarding
        nombreInicial={ultimoNombre}
        pasoInicial={ultimoNombre ? 2 : 1}
        onUseCurrentLocation={onUseCurrentLocation}
        onSelectManually={onSelectManually}
      />
    )
  }

  if (sesion.modo === 'gps') {
    return (
      <FlujoGps
        nombre={sesion.nombre}
        historial={historial}
        onEvento={registrar}
        onProceso={ejecutarProceso}
        onCancelar={volverAlOnboarding}
        onManual={() => onSelectManually({ nombre: sesion.nombre })}
      />
    )
  }

  return (
    <VistaMapaMovil
      sesion={sesion}
      historial={historial}
      onProceso={ejecutarProceso}
      onVolver={volverAlOnboarding}
      onFigurasChange={setFiguras}
      onEvento={registrar}
    />
  )
}
