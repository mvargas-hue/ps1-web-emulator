import { useEffect, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'

const controls = [['10', 'L1'], ['11', 'R1'], ['4', '▲'], ['6', '◀'], ['5', '▼'], ['7', '▶'], ['9', '□'], ['0', '△'], ['8', '×'], ['1', '○'], ['2', 'SELECT'], ['3', 'START']] as const

export function MobileController({ hostId, player }: { hostId: string; player: 1 | 2 }) {
  const connection = useRef<DataConnection | null>(null); const [status, setStatus] = useState('Conectando…')
  useEffect(() => {
    const peer = new Peer(); const timer = window.setTimeout(() => setStatus('No se pudo conectar. Vuelve a escanear el QR.'), 10000)
    peer.on('open', () => { const next = peer.connect(hostId, { reliable: false, serialization: 'json', metadata: { player } }); connection.current = next; next.on('open', () => { window.clearTimeout(timer); setStatus(`Control ${player} conectado`) }); next.on('close', () => setStatus('Conexión cerrada. Escanea nuevamente.')); next.on('error', () => setStatus('No se pudo conectar. Vuelve a escanear el QR.')) })
    peer.on('error', () => setStatus('No se pudo crear el control remoto.'))
    return () => { window.clearTimeout(timer); connection.current?.close(); peer.destroy() }
  }, [hostId, player])
  const input = (button: string, pressed: boolean) => { if (connection.current?.open) connection.current.send({ type: 'input', button, pressed }) }
  return <main className="mobile-controller"><header><div className="brand"><span>◉</span><div><b>PS1 WEB</b><small>CONTROL REMOTO</small></div></div></header><p className="remote-status">{status}</p><p className="remote-player">JUGADOR {player}</p><div className="phone-pad">{controls.map(([id, label]) => <button key={id} className={`phone-button button-${id}`} onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); input(id, true) }} onPointerUp={() => input(id, false)} onPointerCancel={() => input(id, false)} onPointerLeave={(event) => { if (event.buttons) input(id, false) }}>{label}</button>)}</div><p className="remote-hint">Mantén el teléfono en horizontal para una mejor distribución. La conexión de juego es directa y cifrada.</p></main>
}
