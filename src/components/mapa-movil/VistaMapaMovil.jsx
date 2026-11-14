import { ChevronLeft } from 'lucide-react'
import MapaVisualizador from '../MapaVisualizador.jsx'
import PanelInferior from './PanelInferior.jsx'
import './mapa-movil.css'

// Pantalla que sigue al onboarding: barra superior, mapa y panel inferior
// con el historial y los procesos.
export default function VistaMapaMovil({ sesion, historial, onProceso, onVolver, onFigurasChange, onEvento }) {
  const inicial = sesion.nombre.trim().charAt(0).toUpperCase()

  return (
    <div className="marco">
      <div className="marco-tarjeta vm">
        <header className="vm-barra">
          <button className="vm-boton-icono" onClick={onVolver} aria-label="Volver">
            <ChevronLeft size={24} />
          </button>
          <div className="vm-titulo">
            <strong>{sesion.modo === 'gps' ? 'Tu ubicación' : 'Ubica tu finca'}</strong>
            <span>Hola, {sesion.nombre.split(' ')[0]}</span>
          </div>
          <span className="vm-avatar" title={sesion.nombre} aria-hidden="true">
            {inicial}
          </span>
        </header>

        <div className="vm-mapa">
          <MapaVisualizador
            ubicacion={sesion.ubicacion}
            modo={sesion.modo}
            onFigurasChange={onFigurasChange}
            onEvento={onEvento}
          />
        </div>

        <PanelInferior historial={historial} onProceso={onProceso} />
      </div>
    </div>
  )
}
