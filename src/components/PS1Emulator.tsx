import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import type { PS1Game } from '../types/emulator'
import { player2Controls, ps1VirtualGamepad, toEjsControls, type ControlMap } from '../services/controls'

export type EmulatorHandle = { remoteInput(player: 1 | 2, button: string, pressed: boolean): void }

/** Runs EmulatorJS in an isolated document as required by its SPA documentation. */
export const PS1Emulator = forwardRef<EmulatorHandle, { game: PS1Game | null; bios: File | null; controls: ControlMap; onError(message: string): void; onRemoteState(player: 1 | 2, applied: boolean): void }>(function PS1Emulator({ game, bios, controls, onError, onRemoteState }, ref) {
  const frame = useRef<HTMLIFrameElement>(null)
  useImperativeHandle(ref, () => ({ remoteInput(player, button, pressed) { frame.current?.contentWindow?.postMessage({ type: 'ejs-remote-input', player, button, pressed }, '*') } }), [])
  const session = useMemo(() => {
    if (!game) return undefined
    const source = `${game.file.name}:${game.file.size}:${game.file.lastModified}`
    const id = Math.abs([...source].reduce((hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0)) || 1
    return { gameUrl: URL.createObjectURL(game.file), biosUrl: bios ? URL.createObjectURL(bios) : '', id }
  }, [game, bios])
  useEffect(() => () => { if (session) { URL.revokeObjectURL(session.gameUrl); if (session.biosUrl) URL.revokeObjectURL(session.biosUrl) } }, [session])
  useEffect(() => { const handler = (event: MessageEvent) => { if (event.source !== frame.current?.contentWindow) return; if (event.data?.type === 'ejs-error') onError('EmulatorJS no pudo iniciar el juego.'); if (event.data?.type === 'ejs-remote-state') onRemoteState(event.data.player === 2 ? 2 : 1, event.data.applied === true) }; window.addEventListener('message', handler); return () => window.removeEventListener('message', handler) }, [onError, onRemoteState])
  if (!game || !session) return <div className="screen-placeholder"><span>PS</span><p>Selecciona un juego para preparar la sesión.</p></div>
  const document = `<!doctype html><html><head><base href="${window.location.origin}/"><style>html,body,#game{margin:0;width:100%;height:100%;background:#080a14}</style></head><body><div id="game"></div><script>window.addEventListener('message',(event)=>{if(event.source!==parent||event.data?.type!=='ejs-remote-input')return;const emulator=window.EJS_emulator;const button=Number(event.data.button);const player=event.data.player===2?2:1;if(!emulator?.gameManager||!Number.isInteger(button))return parent.postMessage({type:'ejs-remote-state',player,applied:false},'*');emulator.gameManager.simulateInput(player-1,button,event.data.pressed?1:0);parent.postMessage({type:'ejs-remote-state',player,applied:true},'*')});window.EJS_player='#game';window.EJS_core='pcsx_rearmed';window.EJS_gameUrl=${JSON.stringify(session.gameUrl)};window.EJS_biosUrl=${JSON.stringify(session.biosUrl)};window.EJS_pathtodata='/emulatorjs/data/';window.EJS_gameName=${JSON.stringify(game.name)};window.EJS_gameID=${session.id};window.EJS_language='es-ES';window.EJS_defaultControls=${JSON.stringify(toEjsControls(controls))};window.EJS_VirtualGamepadSettings=${JSON.stringify(ps1VirtualGamepad)};window.EJS_onGameStart=()=>parent.postMessage({type:'ejs-start'},'*');window.EJS_ready=()=>parent.postMessage({type:'ejs-ready'},'*');</script><script src="/emulatorjs/data/loader.js"><\/script></body></html>`
  return <iframe ref={frame} className="emulator-frame" title="Emulador PlayStation" srcDoc={document} allow="autoplay; fullscreen; gamepad" />
})
