import { useEffect, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'

type Button = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11'

export function MobileController({ hostId, player }: { hostId: string; player: 1 | 2 }) {
  const connection = useRef<DataConnection | null>(null); const [status, setStatus] = useState('Conectando…'); const [acknowledged, setAcknowledged] = useState(0)
  useEffect(() => {
    const peer = new Peer(); const timer = window.setTimeout(() => setStatus('No se pudo conectar. Vuelve a escanear el QR.'), 10000)
    peer.on('open', () => { const next = peer.connect(hostId, { reliable: false, serialization: 'json', metadata: { player } }); connection.current = next; next.on('open', () => { window.clearTimeout(timer); setStatus(`Control ${player} sincronizado`) }); next.on('data', (payload: unknown) => { const data = payload as { type?: string; count?: number }; if (data.type === 'host-ack') { setAcknowledged(data.count ?? 0); setStatus('Sincronizado · señal recibida por la consola') } }); next.on('close', () => setStatus('Conexión cerrada. Escanea nuevamente.')); next.on('error', () => setStatus('No se pudo conectar. Vuelve a escanear el QR.')) })
    peer.on('error', () => setStatus('No se pudo crear el control remoto.'))
    return () => { window.clearTimeout(timer); connection.current?.close(); peer.destroy() }
  }, [hostId, player])
  const input = (button: Button, pressed: boolean) => { if (connection.current?.open) connection.current.send({ type: 'input', button, pressed }) }
  const control = (button: Button, label: string, className = '') => <button className={`ps-button ${className}`} onContextMenu={(event) => event.preventDefault()} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); input(button, true) }} onPointerUp={() => input(button, false)} onPointerCancel={() => input(button, false)} onPointerLeave={(event) => { if (event.buttons) input(button, false) }}>{label}</button>
  return <main className="mobile-controller"><section className="orientation-warning"><span>↻</span><h1>Gira tu teléfono</h1><p>El control PS1 se usa en horizontal.</p></section><section className="controller-stage"><header className="mobile-header"><div className="brand"><span>◉</span><div><b>PS1 WEB</b><small>CONTROL {player}</small></div></div><div className="sync-state"><i />{status}<small>{acknowledged ? `${acknowledged} señales confirmadas` : 'Toca un botón para comprobar'}</small></div></header><div className="ps1-controller"><div className="shoulders">{control('10', 'L1', 'shoulder left')}{control('11', 'R1', 'shoulder right')}</div><div className="controller-body"><div className="dpad">{control('4', '▲', 'up')}{control('6', '◀', 'left')}{control('5', '▼', 'down')}{control('7', '▶', 'right')}</div><div className="center-controls">{control('2', 'SELECT', 'select')}{control('3', 'START', 'start')}<span className="ps-logo">PS</span></div><div className="face-buttons">{control('0', '△', 'triangle')}{control('9', '□', 'square')}{control('8', '×', 'cross')}{control('1', '○', 'circle')}</div></div></div></section></main>
}
