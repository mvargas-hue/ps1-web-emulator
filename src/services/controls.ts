export type ControlBinding = { label: string; value: string; value2: string }
export type ControlMap = Record<string, ControlBinding>

export const defaultControls: ControlMap = {
  '0': { label: '×', value: 'x', value2: 'BUTTON_2' }, '1': { label: '□', value: 's', value2: 'BUTTON_4' },
  '2': { label: 'Select', value: 'v', value2: 'SELECT' }, '3': { label: 'Start', value: 'enter', value2: 'START' },
  '4': { label: '↑', value: 'up arrow', value2: 'DPAD_UP' }, '5': { label: '↓', value: 'down arrow', value2: 'DPAD_DOWN' },
  '6': { label: '←', value: 'left arrow', value2: 'DPAD_LEFT' }, '7': { label: '→', value: 'right arrow', value2: 'DPAD_RIGHT' },
  '8': { label: '○', value: 'z', value2: 'BUTTON_1' }, '9': { label: '△', value: 'a', value2: 'BUTTON_3' },
  '10': { label: 'L1', value: 'q', value2: 'LEFT_TOP_SHOULDER' }, '11': { label: 'R1', value: 'e', value2: 'RIGHT_TOP_SHOULDER' },
  '12': { label: 'L2', value: '1', value2: 'LEFT_BOTTOM_SHOULDER' }, '13': { label: 'R2', value: '3', value2: 'RIGHT_BOTTOM_SHOULDER' },
}
/** Keyboard fallback used solely by the second remote player inside EmulatorJS. */
export const player2Controls: ControlMap = {
  '0': { label: '×', value: 'i', value2: 'BUTTON_2' }, '1': { label: '□', value: 'o', value2: 'BUTTON_4' },
  '2': { label: 'Select', value: 'c', value2: 'SELECT' }, '3': { label: 'Start', value: 'p', value2: 'START' },
  '4': { label: '↑', value: 'w', value2: 'DPAD_UP' }, '5': { label: '↓', value: 's', value2: 'DPAD_DOWN' },
  '6': { label: '←', value: 'a', value2: 'DPAD_LEFT' }, '7': { label: '→', value: 'd', value2: 'DPAD_RIGHT' },
  '8': { label: '○', value: 'f', value2: 'BUTTON_1' }, '9': { label: '△', value: 'r', value2: 'BUTTON_3' },
  '10': { label: 'L1', value: 'q', value2: 'LEFT_TOP_SHOULDER' }, '11': { label: 'R1', value: 'e', value2: 'RIGHT_TOP_SHOULDER' },
  '12': { label: 'L2', value: '1', value2: 'LEFT_BOTTOM_SHOULDER' }, '13': { label: 'R2', value: '3', value2: 'RIGHT_BOTTOM_SHOULDER' },
}
const toPlayer = (controls: ControlMap) => Object.fromEntries(Object.entries(controls).map(([id, binding]) => [id, { value: binding.value, value2: binding.value2 }]))
export const toEjsControls = (controls: ControlMap) => ({ 0: toPlayer(controls), 1: toPlayer(player2Controls), 2: {}, 3: {} })
export const ps1VirtualGamepad = [
  { type: 'dpad', location: 'left', left: '50%', right: '50%', joystickInput: false, inputValues: [4, 5, 6, 7] },
  { type: 'button', text: '△', id: 'ps-triangle', location: 'right', left: 40, bold: true, input_value: 9 },
  { type: 'button', text: '○', id: 'ps-circle', location: 'right', left: 81, top: 40, bold: true, input_value: 8 },
  { type: 'button', text: '×', id: 'ps-cross', location: 'right', left: 40, top: 80, bold: true, input_value: 0 },
  { type: 'button', text: '□', id: 'ps-square', location: 'right', left: 0, top: 40, bold: true, input_value: 1 },
  { type: 'button', text: 'Start', id: 'ps-start', location: 'center', left: 60, fontSize: 15, block: true, input_value: 3 },
  { type: 'button', text: 'Select', id: 'ps-select', location: 'center', left: -5, fontSize: 15, block: true, input_value: 2 },
]
