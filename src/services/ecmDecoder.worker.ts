type DecodeRequest = { source: ArrayBuffer; maxOutputBytes: number }

const input = (source: ArrayBuffer) => new Uint8Array(source)
const sync = (sector: Uint8Array) => { sector.fill(0); sector.fill(0xff, 1, 11) }
function createTables() {
  const forward = new Uint8Array(256); const backward = new Uint8Array(256); const edc = new Uint32Array(256)
  for (let i = 0; i < 256; i++) { const doubled = (i << 1) ^ (i & 0x80 ? 0x11d : 0); forward[i] = doubled; backward[i ^ doubled] = i; let value = i; for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xd8018001 : 0); edc[i] = value >>> 0 }
  return { forward, backward, edc }
}
const tables = createTables()
function checksum(value: number, data: Uint8Array, start = 0, end = data.length) { for (let i = start; i < end; i++) value = (value >>> 8) ^ tables.edc[(value ^ data[i]) & 0xff]; return value >>> 0 }
function eccBlock(source: Uint8Array, majorCount: number, minorCount: number, majorMult: number, minorInc: number, destination: Uint8Array, destinationOffset: number) {
  const size = majorCount * minorCount
  for (let major = 0; major < majorCount; major++) { let index = ((major >>> 1) * majorMult) + (major & 1); let a = 0; let b = 0; for (let minor = 0; minor < minorCount; minor++) { const value = source[12 + index]; index += minorInc; if (index >= size) index -= size; a ^= value; b ^= value; a = tables.forward[a] } a = tables.backward[tables.forward[a] ^ b]; destination[destinationOffset + major] = a; destination[destinationOffset + majorCount + major] = a ^ b }
}
function put32le(target: Uint8Array, offset: number, value: number) { target[offset] = value; target[offset + 1] = value >>> 8; target[offset + 2] = value >>> 16; target[offset + 3] = value >>> 24 }
function generateSector(sector: Uint8Array, type: number) {
  if (type === 1) { put32le(sector, 0x810, checksum(0, sector, 0, 0x810)); sector.fill(0, 0x814, 0x81c); eccBlock(sector, 86, 24, 2, 86, sector, 0x81c); eccBlock(sector, 52, 43, 86, 88, sector, 0x8c8); return }
  put32le(sector, type === 2 ? 0x818 : 0x92c, checksum(0, sector, 0x10, type === 2 ? 0x818 : 0x92c)); if (type === 3) return; const address = sector.slice(12, 16); sector.fill(0, 12, 16); eccBlock(sector, 86, 24, 2, 86, sector, 0x81c); eccBlock(sector, 52, 43, 86, 88, sector, 0x8c8); sector.set(address, 12)
}
function decode(source: ArrayBuffer, maxOutputBytes: number) {
  const encoded = input(source); if (encoded.length < 8 || encoded[0] !== 0x45 || encoded[1] !== 0x43 || encoded[2] !== 0x4d || encoded[3] !== 0) throw new Error('El archivo no tiene una cabecera ECM válida.')
  let position = 4; let total = 0; let hash = 0; const chunks: Uint8Array[] = []
  const take = (size: number) => { if (position + size > encoded.length) throw new Error('El archivo ECM está truncado.'); const part = encoded.slice(position, position + size); position += size; return part }
  const write = (part: Uint8Array) => { total += part.length; if (total > maxOutputBytes) throw new Error('La imagen descomprimida excede el límite local de 700 MB.'); hash = checksum(hash, part); chunks.push(part) }
  for (;;) { let byte = encoded[position++]; if (byte === undefined) throw new Error('El archivo ECM está truncado.'); const type = byte & 3; let count = (byte >>> 2) & 31; let bits = 5; while (byte & 0x80) { byte = encoded[position++]; if (byte === undefined || bits > 31) throw new Error('El archivo ECM contiene un registro inválido.'); count |= (byte & 0x7f) << bits; bits += 7 }
    if (count === -1) break; count++; if (count >= 0x80000000) throw new Error('El archivo ECM contiene un tamaño inválido.')
    if (type === 0) { write(take(count)); continue }
    for (let sectorNumber = 0; sectorNumber < count; sectorNumber++) { const sector = new Uint8Array(2352); sync(sector); if (type === 1) { sector[15] = 1; sector.set(take(3), 12); sector.set(take(0x800), 0x10); generateSector(sector, 1); write(sector) } else if (type === 2) { sector[15] = 2; sector.set(take(4), 0x14); sector.set(sector.slice(0x14, 0x18), 0x10); sector.set(take(0x800), 0x18); generateSector(sector, 2); write(sector.slice(0x10)) } else if (type === 3) { sector[15] = 2; sector.set(take(4), 0x14); sector.set(sector.slice(0x14, 0x18), 0x10); sector.set(take(0x914), 0x18); generateSector(sector, 3); write(sector.slice(0x10)) } else throw new Error('El archivo ECM usa un tipo de sector no compatible.') }
  }
  const expected = take(4); const expectedHash = expected[0] | (expected[1] << 8) | (expected[2] << 16) | (expected[3] << 24); if ((hash >>> 0) !== (expectedHash >>> 0)) throw new Error(`La verificación ECM falló (EDC ${hash.toString(16)}; esperado ${(expectedHash >>> 0).toString(16)}).`)
  return new Blob(chunks, { type: 'application/octet-stream' })
}
const workerScope = self as unknown as { onmessage: (event: MessageEvent<DecodeRequest>) => void; postMessage(message: unknown, transfer?: Transferable[]): void }
workerScope.onmessage = ({ data }) => { try { const output = decode(data.source, data.maxOutputBytes); workerScope.postMessage({ ok: true, output }) } catch (error) { workerScope.postMessage({ ok: false, error: error instanceof Error ? error.message : 'No se pudo decodificar ECM.' }) } }
