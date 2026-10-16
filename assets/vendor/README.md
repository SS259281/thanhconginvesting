# Three.js r180

Pinned version `0.180.0`, MIT license. The browser loads these local files; no CDN is needed at runtime.

- `three.module.js`: upstream `build/three.module.min.js`
- `three.core.js`: upstream `build/three.core.min.js`
- `THREE-LICENSE.txt`: original upstream license

Source: https://github.com/mrdoob/three.js/tree/r180

The module's relative core import was changed from `./three.core.min.js` to `./three.core.js` to match the local filename. No library implementation changes.

## addons/ (10/2026)

Hiệu ứng bloom cho cảnh thành phố ở `scripts/journey-three.js`. Các file được chép nguyên từ `examples/jsm` của gói npm `three@0.180.0` (cùng phiên bản và giấy phép MIT):

- `addons/postprocessing/`: `EffectComposer.js`, `RenderPass.js`, `UnrealBloomPass.js`, `OutputPass.js`, `Pass.js`, `ShaderPass.js`, `MaskPass.js`
- `addons/shaders/`: `CopyShader.js`, `LuminosityHighPassShader.js`, `OutputShader.js`

Thay đổi duy nhất: đổi `from 'three'` thành `from '../../three.module.js'` để chạy không cần import map.
