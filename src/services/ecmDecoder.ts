const worker = () => new Worker(new URL('./ecmDecoder.worker.ts', import.meta.url), { type: 'module' })
export async function decodeEcm(file: File): Promise<File> {
  const source = await file.arrayBuffer(); const decoder = worker()
  try { const output = await new Promise<ArrayBuffer>((resolve, reject) => { decoder.onmessage = ({ data }) => data.ok ? resolve(data.output) : reject(new Error(data.error)); decoder.onerror = () => reject(new Error('El Worker de ECM se detuvo inesperadamente.')); decoder.postMessage({ source, maxOutputBytes: 700 * 1024 * 1024 }, [source]) }); return new File([output], file.name.replace(/\.ecm$/i, '') || 'game.bin', { type: 'application/octet-stream' }) } finally { decoder.terminate() }
}
