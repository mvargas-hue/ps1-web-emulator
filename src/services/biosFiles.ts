const acceptedBiosNames = new Set(['scph1001.bin', 'scph101.bin', 'scph5500.bin', 'scph5501.bin', 'scph5502.bin', 'scph7001.bin', 'psxonpsp660.bin'])

export function validateBiosFile(file: File): File {
  if (!file.name.toLowerCase().endsWith('.bin') || file.size === 0) throw new Error('Selecciona un archivo BIOS .bin no vacío.')
  if (!acceptedBiosNames.has(file.name.toLowerCase())) throw new Error('El archivo se puede usar, pero su nombre no coincide con una BIOS PS1 documentada. Verifica su procedencia.')
  return file
}
