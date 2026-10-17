# PS1 Web Emulator — Phase 1

React + TypeScript + Vite foundation for a local, browser-hosted PlayStation session. The emulator is deliberately isolated in an iframe because [EmulatorJS documents this as the only supported method for React/SPAs](https://emulatorjs.org/docs/embed/).

## Research decision

- Pinned integration target: **EmulatorJS v4.2.3** (latest non-prerelease Git tag as checked 2026-10-16). Do not use the current `4.3.0-pre` for production.
- `EJS_core = 'pcsx_rearmed'` is a documented PS1 core; `psx` aliases to it. Its WebAssembly asset is part of the EmulatorJS data distribution.
- The documented configuration used here is `EJS_player`, `EJS_core`, `EJS_gameUrl`, `EJS_biosUrl`, `EJS_pathtodata`, `EJS_gameName`, `EJS_gameID`, `EJS_ready`, and `EJS_onGameStart`.
- `EJS_gameID` must become a stable per-game numeric ID before saves are introduced. EmulatorJS's built-in cache uses IndexedDB; game library records and explicit save import/export remain phase-2 work.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Local EmulatorJS distribution

The official EmulatorJS 4.2.3 frontend distribution and the official `pcsx_rearmed` 4.2.3 core data are vendored under `public/emulatorjs/data`, including its GPL-3.0 license. BIOS and game images are intentionally not included. See [public/emulatorjs/README.md](public/emulatorjs/README.md).

The Vite development server sends COOP/COEP headers for the documented threaded-core path. A static production host must also serve `.wasm` as `application/wasm`; use COOP `same-origin` and COEP `require-corp` if enabling `EJS_threads`.

## Disc images and BIOS

The UI accepts `.cue`, `.bin`, and `.chd` as the initial selection surface, but no compatibility claim is made until manually checked with the exact EmulatorJS distribution/core and a legally obtained title. Select the `.cue` when a disc has multiple `.bin` tracks; browser `File` objects cannot infer or expose sibling tracks, so multi-track CUE handling requires a later local file-set workflow.

No commercial BIOS is bundled or downloaded. EmulatorJS documents supported BIOS filenames and checksums on its PlayStation page. The UI lets the owner provide a `.bin` BIOS as a temporary browser URL.

## Status

Implemented: Vite/React/TS scaffold, responsive console UI, local file validation, iframe-based documented EJS configuration, local BIOS selection, full-screen affordance, local EmulatorJS 4.2.3 + PCSX ReARMed core assets, IndexedDB metadata library/favorites/deletion, COOP/COEP dev headers, and validation tests.

Pending validation: real game smoke test/audio/gamepad, CUE companion-file packaging, EmulatorJS save-state and memory-card import/export flows, and production static-host validation.

## References

- [EmulatorJS repository and GPL-3.0 license](https://github.com/EmulatorJS/EmulatorJS)
- [EmulatorJS React/SPA embed guidance](https://emulatorjs.org/docs/embed/)
- [PlayStation core and BIOS documentation](https://emulatorjs.org/docs/systems/playstation/)
- [Documented options and save callbacks](https://emulatorjs.org/docs/options/)
