import type { PS1Game } from '../types/emulator'

const supported = new Set(['bin', 'cue', 'chd'])
export function validateGameFile(file: File): PS1Game {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !supported.has(extension)) throw new Error('Selecciona un archivo .cue, .bin o .chd compatible.')
  if (file.size === 0) throw new Error('El archivo seleccionado está vacío.')
  return { file, name: file.name.replace(/\.[^.]+$/, ''), extension: extension as PS1Game['extension'] }
}
