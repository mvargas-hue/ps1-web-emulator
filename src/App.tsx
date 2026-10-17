import { useCallback, useEffect, useRef, useState } from 'react'
import { GameLibrary } from './components/GameLibrary'
import { ControlsPanel, useControls } from './components/ControlsPanel'
import { GameUploader } from './components/GameUploader'
import { MobileController } from './components/MobileController'
import { PS1Emulator, type EmulatorHandle } from './components/PS1Emulator'
import { RemoteControllers } from './components/RemoteControllers'
import { validateBiosFile } from './services/biosFiles'
import { decodeEcm } from './services/ecmDecoder'
import { validateGameFile } from './services/gameFiles'
import { deleteGame, listGames, registerGame, toggleFavorite, type LibraryGame } from './services/gameStorage'
import type { PS1Game } from './types/emulator'

export default function App() {
  const remote = new URLSearchParams(window.location.search).get('remote'); const remotePlayer = new URLSearchParams(window.location.search).get('player') === '2' ? 2 : 1
  if (remote) return <MobileController hostId={remote} player={remotePlayer} />
  const [game, setGame] = useState<PS1Game | null>(null); const [bios, setBios] = useState<File | null>(null); const [error, setError] = useState(''); const [games, setGames] = useState<LibraryGame[]>([]); const [importing, setImporting] = useState(false)
  const emulator = useRef<EmulatorHandle>(null); const [emulatorInputs, setEmulatorInputs] = useState<Record<number, number>>({})
  const sendRemoteInput = useCallback(({ player, button, pressed }: { player: 1 | 2; button: string; pressed: boolean }) => emulator.current?.remoteInput(player, button, pressed), [])
  const confirmRemoteInput = useCallback((player: 1 | 2, applied: boolean) => { if (!applied) { setError('El control remoto llegó, pero el emulador aún no está listo. Espera a que el juego inicie.'); return } setEmulatorInputs((current) => ({ ...current, [player]: (current[player] ?? 0) + 1 })) }, [])
  const [controls, setControls] = useControls()
  const refreshLibrary = () => listGames().then(setGames).catch(() => setError('No se pudo acceder a la biblioteca local.'))
  useEffect(() => { refreshLibrary() }, [])
  const loadGame = async (selected: PS1Game) => { setError(''); setImporting(selected.extension === 'ecm'); try { const next = selected.extension === 'ecm' ? validateGameFile(await decodeEcm(selected.file)) : selected; setGame(next); await registerGame(next.file); refreshLibrary() } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo importar el juego.') } finally { setImporting(false) } }
  const exitGame = () => { setGame(null); setError(''); setEmulatorInputs({}) }
  return <main><header><div className="brand"><span>◉</span><div><b>PS1 WEB</b><small>EMULATOR</small></div></div><div className="status"><i /> LOCAL · PRIVADO</div></header>
    <div className="layout"><GameLibrary games={games} onToggleFavorite={async (id) => { await toggleFavorite(id); refreshLibrary() }} onDelete={async (id) => { await deleteGame(id); refreshLibrary() }} />
      <section className="play-area"><div className="play-head"><div><p className="eyebrow">SESIÓN ACTUAL</p><h1>{game?.name ?? 'Listo para jugar'}</h1></div><div className="play-actions">{game && <button className="exit-game" onClick={exitGame}>Salir del juego</button>}<button className="icon-button" aria-label="Pantalla completa" onClick={() => document.querySelector('.emulator-frame')?.requestFullscreen()}>⛶</button></div></div>
        <div className="screen"><PS1Emulator ref={emulator} game={game} bios={bios} controls={controls} onError={setError} onRemoteState={confirmRemoteInput} /></div>
        {!game && <GameUploader onGame={loadGame} onError={setError} />}
        {importing && <p className="importing" role="status">Convirtiendo ECM localmente a BIN… Puede tardar y usar memoria adicional.</p>}
        {error && <p className="error" role="alert">{error}</p>}<RemoteControllers onInput={sendRemoteInput} emulatorInputs={emulatorInputs} /></section>
      <aside className="settings"><p className="eyebrow">CONFIGURACIÓN</p><h2>BIOS propia</h2><p>{bios ? 'BIOS seleccionada para esta sesión.' : 'Opcional según el juego y el núcleo. No incluimos BIOS comerciales.'}</p><label className="file-button">{bios ? bios.name : 'Seleccionar BIOS'}<input type="file" accept=".bin" onChange={(e) => { try { const selected = e.target.files?.[0]; setBios(selected ? validateBiosFile(selected) : null); setError('') } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo validar la BIOS.') } }} /></label><hr/><p className="legal">Usa únicamente copias de juegos y BIOS que puedas utilizar legalmente.</p></aside></div><ControlsPanel controls={controls} setControls={setControls} /></main>
}
