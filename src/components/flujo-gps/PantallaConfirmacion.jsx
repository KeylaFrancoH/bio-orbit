import CheckAnimado from './CheckAnimado.jsx'

export default function PantallaConfirmacion({
  titulo,
  mensaje,
  detalles = [],
  textoPrincipal,
  iconoPrincipal,
  onPrincipal,
  textoSecundario,
  onSecundario,
}) {
  return (
    <div className="fg-pantalla fg-pantalla-padding">
      <div className="fg-cuerpo">
        <CheckAnimado />
        <h1 className="fg-titulo fg-aparecer" style={{ '--retraso': '0.55s' }}>
          {titulo}
        </h1>
        <p className="fg-texto fg-aparecer" style={{ '--retraso': '0.65s' }}>
          {mensaje}
        </p>
        {detalles.length > 0 && (
          <dl className="fg-detalles fg-aparecer" style={{ '--retraso': '0.8s' }}>
            {detalles.map((d) => (
              <div key={d.etiqueta} className="fg-detalle">
                <dt>{d.etiqueta}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="onb-acciones fg-aparecer" style={{ '--retraso': '0.9s' }}>
        <button type="button" className="onb-btn onb-btn-primario" onClick={onPrincipal} autoFocus>
          {textoPrincipal} {iconoPrincipal}
        </button>
        {textoSecundario && (
          <button type="button" className="fg-btn-texto" onClick={onSecundario}>
            {textoSecundario}
          </button>
        )}
      </div>
    </div>
  )
}
