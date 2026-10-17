import type { LibraryGame } from '../services/gameStorage'

export function GameLibrary({ games, onToggleFavorite, onDelete }: { games: LibraryGame[]; onToggleFavorite(id: string): void; onDelete(id: string): void }) {
  return <aside><p className="eyebrow">BIBLIOTECA</p>{games.length === 0 ? <p className="aside-note">Aún no hay juegos registrados.</p> : <div className="library-list">{[...games].sort((a, b) => b.lastPlayedAt - a.lastPlayedAt).map((game) => <article className="library-item" key={game.id}><span>▣</span><div><b>{game.name}</b><small>{game.format} · {Math.ceil(game.size / 1024 / 1024)} MB</small></div><button aria-label={`Favorito ${game.name}`} onClick={() => onToggleFavorite(game.id)}>{game.favorite ? '★' : '☆'}</button><button aria-label={`Eliminar ${game.name}`} onClick={() => onDelete(game.id)}>×</button></article>)}</div>}<p className="aside-note">Se guardan metadatos, no imágenes de disco. Para volver a abrir un juego, selecciónalo nuevamente.</p></aside>
}
