export type LibraryGame = { id: string; name: string; format: string; size: number; lastPlayedAt: number; favorite: boolean }

const database = 'ps1-web-emulator'
const store = 'library'

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(database, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(store, { keyPath: 'id' })
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'))
  })
}
async function transaction<T>(mode: IDBTransactionMode, work: (records: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode); const request = work(tx.objectStore(store))
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error('Error de almacenamiento.'))
    tx.oncomplete = () => db.close(); tx.onerror = () => { db.close(); reject(tx.error ?? new Error('Error de almacenamiento.')) }
  })
}
export const gameIdFor = (file: File) => `${file.name}:${file.size}:${file.lastModified}`
export const listGames = () => transaction<LibraryGame[]>('readonly', (records) => records.getAll())
export const deleteGame = (id: string) => transaction<undefined>('readwrite', (records) => records.delete(id))
export async function registerGame(file: File): Promise<LibraryGame> {
  const id = gameIdFor(file); const existing = await transaction<LibraryGame | undefined>('readonly', (records) => records.get(id))
  const game: LibraryGame = { id, name: file.name.replace(/\.[^.]+$/, ''), format: file.name.split('.').pop()?.toUpperCase() ?? '—', size: file.size, lastPlayedAt: Date.now(), favorite: existing?.favorite ?? false }
  await transaction<IDBValidKey>('readwrite', (records) => records.put(game)); return game
}
export async function toggleFavorite(id: string): Promise<void> {
  const game = await transaction<LibraryGame | undefined>('readonly', (records) => records.get(id)); if (!game) return
  await transaction<IDBValidKey>('readwrite', (records) => records.put({ ...game, favorite: !game.favorite }))
}
