import { ChevronLeft, LocateFixed, Map as MapIcon } from 'lucide-react'
import Progreso from './Progreso.jsx'

export default function PasoUbicacion({ nombre, onVolver, onUseCurrentLocation, onSelectManually }) {
  return (
    <div className="onb-form">
      <div className="onb-top">
        <button type="button" className="onb-volver" onClick={onVolver}>
          <ChevronLeft size={20} /> Volver
        </button>
        <Progreso paso={2} />
      </div>

      <div className="onb-cuerpo">
        <div className="onb-avatar" aria-hidden="true">
          <MapIcon size={44} strokeWidth={1.75} />
        </div>
        <p className="onb-saludo">Hola, {nombre.split(' ')[0]}</p>
        <h1 className="onb-titulo">Ubica tu finca</h1>
        <p className="onb-subtitulo">Selecciona cómo deseas registrar la ubicación de tu terreno.</p>
      </div>

      <div className="onb-acciones">
        <button type="button" className="onb-btn onb-btn-primario" onClick={onUseCurrentLocation}>
          <LocateFixed size={20} /> Ubicación actual
        </button>
        <button type="button" className="onb-btn onb-btn-secundario" onClick={onSelectManually}>
          <MapIcon size={20} /> Seleccionar manualmente
        </button>
      </div>
    </div>
  )
}
