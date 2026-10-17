import { useRef, useState } from 'react'
import { validateGameFile } from '../services/gameFiles'
import type { PS1Game } from '../types/emulator'

export function GameUploader({ onGame, onError }: { onGame(game: PS1Game): void; onError(message: string): void }) {
  const input = useRef<HTMLInputElement>(null); const [dragging, setDragging] = useState(false)
  const choose = (files: FileList | null) => { try { const file = files?.[0]; if (!file) return; onGame(validateGameFile(file)) } catch (e) { onError(e instanceof Error ? e.message : 'No se pudo abrir el archivo.') } }
  return <section className={`uploader ${dragging ? 'dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files) }}>
    <span className="upload-icon">◇</span><h2>Cargar un juego propio</h2><p>Arrastra un archivo o selecciónalo desde tu dispositivo.</p>
    <button onClick={() => input.current?.click()}>Seleccionar archivo</button><input ref={input} type="file" accept=".cue,.bin,.chd,.ecm" onChange={(e) => choose(e.target.files)} hidden />
    <small>Compatible: CUE, BIN, CHD y ECM. ECM se convierte localmente antes de iniciar. Para BIN/CUE, selecciona primero el CUE junto a sus archivos BIN en la misma carpeta.</small>
  </section>
}
