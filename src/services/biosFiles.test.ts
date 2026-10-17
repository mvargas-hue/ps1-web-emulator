import { describe, expect, it } from 'vitest'
import { validateBiosFile } from './biosFiles'

describe('validateBiosFile', () => {
  it('accepts the documented SCPH1001 name', () => expect(validateBiosFile(new File(['bios'], 'SCPH1001.BIN'))).toBeInstanceOf(File))
  it('rejects an unknown BIOS filename', () => expect(() => validateBiosFile(new File(['bios'], 'random.bin'))).toThrow('no coincide'))
})
