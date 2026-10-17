import { describe, expect, it } from 'vitest'
import { ecmOutputName } from './ecmDecoder'

describe('ecmOutputName', () => {
  it('keeps a BIN extension after ECM decoding', () => expect(ecmOutputName('game.bin.ecm')).toBe('game.bin'))
  it('normalizes IMG output to a BIN extension', () => expect(ecmOutputName('Tomb Raider.img.ecm')).toBe('Tomb Raider.img.bin'))
})
