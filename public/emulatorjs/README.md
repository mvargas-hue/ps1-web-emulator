# EmulatorJS local assets

This directory contains the EmulatorJS **4.2.3 stable** frontend data and official `pcsx_rearmed` core data. `PS1Emulator` loads `/emulatorjs/data/loader.js` inside an isolated iframe, which is EmulatorJS's documented integration path for React/SPAs.

The required layout is present:

```text
public/emulatorjs/data/loader.js
public/emulatorjs/data/cores/pcsx_rearmed_libretro.wasm
...remaining EmulatorJS data assets
```

Do not commit a commercial BIOS or game image. EmulatorJS is GPL-3.0; its license is included at `public/emulatorjs/LICENSE` and must remain with redistributed assets.
