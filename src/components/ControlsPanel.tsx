import { useEffect, useState } from 'react'
import { defaultControls, type ControlMap } from '../services/controls'

const savedKey = 'ps1-web-controls'
export function useControls() {
  const [controls, setControls] = useState<ControlMap>(() => { try { return { ...defaultControls, ...JSON.parse(localStorage.getItem(savedKey) ?? '{}') } } catch { return defaultControls } })
  useEffect(() => localStorage.setItem(savedKey, JSON.stringify(controls)), [controls])
  return [controls, setControls] as const
}
export function ControlsPanel({ controls, setControls }: { controls: ControlMap; setControls(next: ControlMap): void }) {
  const [gamepads, setGamepads] = useState<Gamepad[]>([]); const [listening, setListening] = useState<string | null>(null)
  useEffect(() => { const update = () => setGamepads([...navigator.getGamepads()].filter((gamepad): gamepad is Gamepad => Boolean(gamepad))); update(); window.addEventListener('gamepadconnected', update); window.addEventListener('gamepaddisconnected', update); return () => { window.removeEventListener('gamepadconnected', update); window.removeEventListener('gamepaddisconnected', update) } }, [])
  useEffect(() => { if (!listening) return; const capture = (event: KeyboardEvent) => { event.preventDefault(); setControls({ ...controls, [listening]: { ...controls[listening], value: event.key } }); setListening(null) }; window.addEventListener('keydown', capture, true); return () => window.removeEventListener('keydown', capture, true) }, [controls, listening, setControls])
  return <section className="controls-panel"><div className="controls-title"><div><p className="eyebrow">CONTROLES</p><h2>Control digital PS1</h2></div><span className={gamepads.length ? 'connected' : ''}>{gamepads.length ? `${gamepads.length} mando conectado` : 'Sin mando detectado'}</span></div><p>Las asignaciones se aplican al iniciar la próxima sesión del emulador.</p><div className="bindings">{Object.entries(controls).map(([id, control]) => <div className="binding" key={id}><span>{control.label}</span><button className={listening === id ? 'listening' : ''} onClick={() => setListening(id)}>{listening === id ? 'Pulsa una tecla…' : control.value}</button><small>{control.value2}</small></div>)}</div><button className="reset-controls" onClick={() => setControls(defaultControls)}>Restablecer controles</button>{gamepads.length > 0 && <p className="gamepad-name">{gamepads.map((gamepad) => gamepad.id).join(' · ')}</p>}<p className="touch-note">En móvil, el gamepad virtual de EmulatorJS se habilita dentro de la sesión.</p></section>
}
