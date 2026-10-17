import { useEffect, useState } from 'react'
import { GameLibrary } from './components/GameLibrary'
import { ControlsPanel, useControls } from './components/ControlsPanel'
import { GameUploader } from './components/GameUploader'
import { PS1Emulator } from './components/PS1Emulator'
import { validateBiosFile } from './services/biosFiles'
import { deleteGame, listGames, registerGame, toggleFavorite, type LibraryGame } from './services/gameStorage'
import type { PS1Game } from './types/emulator'

export default function App() {
  const [game, setGame] = useState<PS1Game | null>(null); const [bios, setBios] = useState<File | null>(null); const [error, setError] = useState(''); const [games, setGames] = useState<LibraryGame[]>([])
  const [controls, setControls] = useControls()
  const refreshLibrary = () => listGames().then(setGames).catch(() => setError('No se pudo acceder a la biblioteca local.'))
  useEffect(() => { refreshLibrary() }, [])
  const loadGame = async (next: PS1Game) => { setError(''); setGame(next); try { await registerGame(next.file); refreshLibrary() } catch { setError('El juego se abrirá, pero no se pudo registrar en la biblioteca local.') } }
  return <main><header><div className="brand"><span>◉</span><div><b>PS1 WEB</b><small>EMULATOR</small></div></div><div className="status"><i /> LOCAL · PRIVADO</div></header>
    <div className="layout"><GameLibrary games={games} onToggleFavorite={async (id) => { await toggleFavorite(id); refreshLibrary() }} onDelete={async (id) => { await deleteGame(id); refreshLibrary() }} />
      <section className="play-area"><div className="play-head"><div><p className="eyebrow">SESIÓN ACTUAL</p><h1>{game?.name ?? 'Listo para jugar'}</h1></div><button className="icon-button" onClick={() => document.querySelector('.emulator-frame')?.requestFullscreen()}>⛶</button></div>
        <div className="screen"><PS1Emulator game={game} bios={bios} controls={controls} onError={setError} /></div>
        {!game && <GameUploader onGame={loadGame} onError={setError} />}
        {error && <p className="error" role="alert">{error}</p>}</section>
      <aside className="settings"><p className="eyebrow">CONFIGURACIÓN</p><h2>BIOS propia</h2><p>{bios ? 'BIOS seleccionada para esta sesión.' : 'Opcional según el juego y el núcleo. No incluimos BIOS comerciales.'}</p><label className="file-button">{bios ? bios.name : 'Seleccionar BIOS'}<input type="file" accept=".bin" onChange={(e) => { try { const selected = e.target.files?.[0]; setBios(selected ? validateBiosFile(selected) : null); setError('') } catch (error) { setError(error instanceof Error ? error.message : 'No se pudo validar la BIOS.') } }} /></label><hr/><p className="legal">Usa únicamente copias de juegos y BIOS que puedas utilizar legalmente.</p></aside></div><ControlsPanel controls={controls} setControls={setControls} /></main>
}
