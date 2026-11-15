// Ilustraciones del widget de clima (estilo tarjeta del tiempo). Son SVG
// inline para que funcionen sin conexión y escalen sin perder nitidez.

function Nube({ x = 0, y = 0, escala = 1, id, opacidad = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={opacidad}>
      <path
        d="M22 58h52a18 18 0 0 0 1-36 26 26 0 0 0-49-6A21 21 0 0 0 22 58Z"
        fill={`url(#${id})`}
      />
    </g>
  )
}

function Degradados() {
  return (
    <defs>
      <linearGradient id="ilu-nube" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#c7dcf5" />
      </linearGradient>
      <linearGradient id="ilu-nube-atras" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e6f0fb" />
        <stop offset="1" stopColor="#a9c6ea" />
      </linearGradient>
      <radialGradient id="ilu-sol" cx="0.4" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#fff3b0" />
        <stop offset="1" stopColor="#fbbf24" />
      </radialGradient>
    </defs>
  )
}

export function IlustracionClima({ tipo = 'lluvia' }) {
  return (
    <svg viewBox="0 0 120 100" className="ui-ilustracion" aria-hidden="true">
      <Degradados />
      {tipo !== 'lluvia' && (
        <g>
          {tipo === 'sol' &&
            Array.from({ length: 8 }, (_, i) => (
              <line
                key={i}
                x1="60" y1="14" x2="60" y2="6"
                stroke="#fde68a" strokeWidth="4" strokeLinecap="round"
                transform={`rotate(${i * 45} 60 40)`}
              />
            ))}
          <circle cx={tipo === 'sol' ? 60 : 74} cy={tipo === 'sol' ? 40 : 34} r={tipo === 'sol' ? 20 : 17} fill="url(#ilu-sol)" />
        </g>
      )}
      {tipo !== 'sol' && (
        <>
          <Nube id="ilu-nube-atras" x={30} y={2} escala={0.75} opacidad={0.9} />
          <Nube id="ilu-nube" x={4} y={16} escala={0.95} />
        </>
      )}
      {tipo === 'sol' && <Nube id="ilu-nube" x={26} y={44} escala={0.6} opacidad={0.95} />}
      {tipo === 'lluvia' &&
        [26, 44, 62, 80].map((x, i) => (
          <line
            key={x}
            x1={x} y1={78 + (i % 2) * 4} x2={x - 4} y2={88 + (i % 2) * 4}
            stroke="#dbeafe" strokeWidth="3.5" strokeLinecap="round"
          />
        ))}
    </svg>
  )
}
