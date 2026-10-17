import { describe, expect, it } from 'vitest'
import { validateGameFile } from './gameFiles'

describe('validateGameFile', () => {
  it('accepts a supported PlayStation disc image', () => {
    const game = validateGameFile(new File(['disc'], 'Example Game.CHD', { type: 'application/octet-stream' }))
    expect(game).toMatchObject({ name: 'Example Game', extension: 'chd' })
  })
  it('rejects an unsupported extension', () => {
    expect(() => validateGameFile(new File(['disc'], 'game.iso'))).toThrow('Selecciona un archivo')
  })
  it('rejects an empty game image', () => {
    expect(() => validateGameFile(new File([], 'game.bin'))).toThrow('vacío')
  })
})
