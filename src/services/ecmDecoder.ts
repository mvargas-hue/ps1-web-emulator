const worker = () => new Worker(new URL('./ecmDecoder.worker.ts', import.meta.url), { type: 'module' })
export const ecmOutputName = (name: string) => { const baseName = name.replace(/\.ecm$/i, ''); return /\.bin$/i.test(baseName) ? baseName : `${baseName}.bin` }
export async function decodeEcm(file: File): Promise<File> {
  const source = await file.arrayBuffer(); const decoder = worker()
  try { const output = await new Promise<Blob>((resolve, reject) => { decoder.onmessage = ({ data }) => data.ok ? resolve(data.output) : reject(new Error(data.error)); decoder.onerror = () => reject(new Error('El Worker de ECM se detuvo inesperadamente.')); decoder.postMessage({ source, maxOutputBytes: 700 * 1024 * 1024 }, [source]) }); return new File([output], ecmOutputName(file.name), { type: 'application/octet-stream' }) } finally { decoder.terminate() }
}
