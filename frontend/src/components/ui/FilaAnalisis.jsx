import { ChevronRight } from 'lucide-react'
import './ui.css'

// Fila de la lista de análisis: mosaico de color con ícono, título, resumen
// en una línea y una nota pequeña (fuente o "Simulado"). Toda la fila se toca.
export default function FilaAnalisis({ tono, Icono, titulo, texto, nota, notaTipo, onClick }) {
  return (
    <button type="button" className={`ui-fila tono-${tono}`} onClick={onClick}>
      <span className="ui-fila-mosaico" aria-hidden="true">
        <span>
          <Icono size={22} strokeWidth={1.9} />
        </span>
      </span>
      <span className="ui-fila-texto">
        <strong>{titulo}</strong>
        <span>{texto}</span>
        {nota && <small className={notaTipo ? `nota-${notaTipo}` : ''}>{nota}</small>}
      </span>
      <ChevronRight size={20} className="ui-fila-flecha" aria-hidden="true" />
    </button>
  )
}
