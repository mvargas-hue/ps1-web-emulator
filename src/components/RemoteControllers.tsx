import { useEffect, useMemo, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'
import { QRCodeSVG } from 'qrcode.react'

export type RemoteInput = { player: 1 | 2; button: string; pressed: boolean }
export function RemoteControllers({ onInput, emulatorInputs }: { onInput(input: RemoteInput): void; emulatorInputs: Record<number, number> }) {
  const peer = useRef<Peer | null>(null); const inputCounts = useRef<Record<number, number>>({}); const [hostId, setHostId] = useState(''); const [players, setPlayers] = useState<Record<number, boolean>>({}); const [inputCount, setInputCount] = useState<Record<number, number>>({})
  useEffect(() => {
    const id = `ps1-${crypto.randomUUID().replaceAll('-', '')}`; const instance = new Peer(id); peer.current = instance
    instance.on('open', () => setHostId(id)); instance.on('connection', (connection) => attach(connection)); instance.on('error', () => setHostId(''))
    const attach = (connection: DataConnection) => {
      const player = connection.metadata?.player === 2 ? 2 : 1
      connection.on('open', () => setPlayers((current) => ({ ...current, [player]: true })))
      connection.on('data', (payload: unknown) => { const data = payload as { type?: string; button?: string; pressed?: boolean }; if (data.type === 'input' && typeof data.button === 'string' && typeof data.pressed === 'boolean') { onInput({ player, button: data.button, pressed: data.pressed }); const count = (inputCounts.current[player] ?? 0) + 1; inputCounts.current[player] = count; setInputCount((current) => ({ ...current, [player]: count })); connection.send({ type: 'host-ack', count }) } })
      connection.on('close', () => setPlayers((current) => ({ ...current, [player]: false })))
    }
    return () => instance.destroy()
  }, [onInput])
  const urls = useMemo(() => [1, 2].map((player) => `${window.location.origin}${window.location.pathname}?remote=${encodeURIComponent(hostId)}&player=${player}`), [hostId])
  return <section className="remote-hub"><div><p className="eyebrow">CONTROLES REMOTOS</p><h2>Dos teléfonos, una sesión</h2><p>Escanea el QR correspondiente. Las pulsaciones viajan por WebRTC directamente al navegador que ejecuta el juego.</p></div><div className="qr-list">{urls.map((url, index) => <div className={`qr-card ${players[index + 1] ? 'qr-synced' : ''}`} key={index}>{players[index + 1] ? <><span className="sync-mark">✓</span><b>Control {index + 1}</b><small className="remote-online">Sincronizado · RX {inputCount[index + 1] ?? 0} · EMU {emulatorInputs[index + 1] ?? 0}</small></> : <><QRCodeSVG value={url} size={116} level="M" includeMargin/><b>Control {index + 1}</b><small>{hostId ? 'Listo para escanear' : 'Preparando sesión…'}</small></>}</div>)}</div><small className="remote-note">RX confirma que llegó desde el teléfono. EMU confirma que el iframe aplicó la entrada al núcleo.</small></section>
}
