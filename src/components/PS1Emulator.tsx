import { useEffect, useMemo } from 'react'
import type { PS1Game } from '../types/emulator'
import { ps1VirtualGamepad, toEjsControls, type ControlMap } from '../services/controls'

/** Runs EmulatorJS in an isolated document as required by its SPA documentation. */
export function PS1Emulator({ game, bios, controls, onError }: { game: PS1Game | null; bios: File | null; controls: ControlMap; onError(message: string): void }) {
  const session = useMemo(() => {
    if (!game) return undefined
    const source = `${game.file.name}:${game.file.size}:${game.file.lastModified}`
    const id = Math.abs([...source].reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)) || 1
    return { gameUrl: URL.createObjectURL(game.file), biosUrl: bios ? URL.createObjectURL(bios) : '', id }
  }, [game, bios])
  useEffect(() => () => { if (session) { URL.revokeObjectURL(session.gameUrl); if (session.biosUrl) URL.revokeObjectURL(session.biosUrl) } }, [session])
  useEffect(() => { const handler = (event: MessageEvent) => { if (event.data?.type === 'ejs-error') onError('EmulatorJS no pudo iniciar el juego.') }; window.addEventListener('message', handler); return () => window.removeEventListener('message', handler) }, [onError])
  if (!game || !session) return <div className="screen-placeholder"><span>PS</span><p>Selecciona un juego para preparar la sesión.</p></div>
  const document = `<!doctype html><html><head><base href="${window.location.origin}/"><style>html,body,#game{margin:0;width:100%;height:100%;background:#080a14}</style></head><body><div id="game"></div><script>window.EJS_player='#game';window.EJS_core='pcsx_rearmed';window.EJS_gameUrl=${JSON.stringify(session.gameUrl)};window.EJS_biosUrl=${JSON.stringify(session.biosUrl)};window.EJS_pathtodata='/emulatorjs/data/';window.EJS_gameName=${JSON.stringify(game.name)};window.EJS_gameID=${session.id};window.EJS_language='es-ES';window.EJS_defaultControls=${JSON.stringify(toEjsControls(controls))};window.EJS_VirtualGamepadSettings=${JSON.stringify(ps1VirtualGamepad)};window.EJS_onGameStart=()=>parent.postMessage({type:'ejs-start'},'*');window.EJS_ready=()=>parent.postMessage({type:'ejs-ready'},'*');</script><script src="/emulatorjs/data/loader.js"><\/script></body></html>`
  return <iframe className="emulator-frame" title="Emulador PlayStation" srcDoc={document} allow="autoplay; fullscreen; gamepad" />
}
