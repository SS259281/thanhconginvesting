/**
 * TCI journey film: one continuous camera flight through a night-time financial city.
 * The page's scroll controller drives `setProgress(0..1)`; the camera eases between
 * keyframes so every content section has its own shot.
 */
const journeyScenes = new WeakMap();

// Camera shots. `p` matches data-journey-progress on the sections in index.html.
const SHOTS = [
  { p: 0.00, pos: [0, 150, 95], look: [0, 0, -70] },        // opening: above the haze
  { p: 0.05, pos: [10, 62, 40], look: [-6, 8, -60] },
  { p: 0.10, pos: [1, 17, 10], look: [-3, 13, -50] },       // 01 Nguyên tắc: down onto the boulevard
  { p: 0.17, pos: [-3, 21, -22], look: [12, 30, -70] },
  { p: 0.24, pos: [-6, 25, -38], look: [12, 40, -78] },     // 02 Kinh nghiệm: the tiered tower
  { p: 0.31, pos: [-2, 16, -80], look: [2, 4, -122] },
  { p: 0.38, pos: [0, 24, -86], look: [0, 0, -136] },       // 03 Lộ trình: the fork in the road
  { p: 0.44, pos: [-12, 18, -116], look: [4, 4, -156] },    // SSI plaza
  { p: 0.49, pos: [-8, 31, -146], look: [4, 34, -198] },
  { p: 0.54, pos: [-16, 33, -158], look: [8, 33, -198] },  // 04 Năng lực: holographic chart
  { p: 0.62, pos: [-6, 40, -176], look: [14, 30, -214] },
  { p: 0.72, pos: [-4, 58, -214], look: [6, 14, -258] },    // 05 Đồng hành: above the network
  { p: 0.79, pos: [14, 50, -232], look: [-2, 18, -266] },
  { p: 0.86, pos: [-10, 44, -252], look: [6, 18, -286] },
  { p: 0.93, pos: [-2, 28, -282], look: [4, 30, -340] },    // 06 Bắt đầu: four beacons
  { p: 1.00, pos: [0, 36, -296], look: [0, 33, -420] },     // dawn on the horizon
];

const COLORS = {
  night: 0x06080e,
  fog: 0x0a0f1a,
  gold: 0xd6a84a,
  champagne: 0xf3d79b,
  red: 0xe2232a,
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const frac = (v) => ((v % 1) + 1) % 1;
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const FOG_GLSL = `
uniform vec3 uFogColor; uniform float uFogDensity;
vec3 applyFog(vec3 c, float d) { float f = 1.0 - exp(-pow(d * uFogDensity, 2.0)); return mix(c, uFogColor, clamp(f, 0.0, 1.0)); }
`;
const HASH_GLSL = `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
`;

export async function createJourneyScene(host) {
  if (!host?.isConnected) return null;
  if (journeyScenes.has(host)) return journeyScenes.get(host);
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const fail = () => {
    host.dataset.tciJourneyThree = 'fallback';
    host.dispatchEvent(new CustomEvent('tci:journey-scene-fallback', { bubbles: true }));
  };
  if (connection?.saveData || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { fail(); return null; }

  const smallScreen = window.matchMedia('(max-width: 767px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small = smallScreen.matches;

  let THREE, renderer;
  try {
    THREE = await import('../assets/vendor/three.module.js');
    if (!host.isConnected) return null;
    renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false, powerPreference: 'high-performance' });
  } catch (error) { fail(); return null; }

  renderer.setClearColor(COLORS.night, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.0062);
  const camera = new THREE.PerspectiveCamera(small ? 62 : 48, 1, 0.5, 1400);

  const disposables = new Set();
  const keep = (x) => { disposables.add(x); return x; };
  const fogUniforms = { uFogColor: { value: new THREE.Color(COLORS.fog) }, uFogDensity: { value: 0.0062 } };
  const time = { value: 0 };
  const vec3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);

  /* ---------- Sky ---------- */
  const skyUniforms = { uDawn: { value: 0 }, uTop: { value: new THREE.Color(0x04060b) }, uHorizon: { value: new THREE.Color(0x14223a) } };
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(1000, 32, 16)), keep(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyUniforms,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uDawn; uniform vec3 uTop; uniform vec3 uHorizon; varying vec3 vDir;
      void main(){
        float y = vDir.y;
        vec3 c = mix(uHorizon, uTop, smoothstep(-0.02, 0.45, y));
        float band = exp(-abs(y - 0.01) * 18.0);
        vec3 dawnCol = mix(vec3(0.55, 0.16, 0.08), vec3(1.0, 0.72, 0.36), band);
        float toward = smoothstep(0.2, 1.0, -vDir.z);
        c += band * (0.10 + uDawn * 0.9 * toward) * mix(vec3(0.2,0.25,0.4), dawnCol, uDawn);
        float sun = pow(max(dot(normalize(vDir), normalize(vec3(0.0, 0.035, -1.0))), 0.0), 900.0);
        c += sun * uDawn * vec3(1.6, 1.15, 0.7);
        gl_FragColor = vec4(c, 1.0);
      }`,
  })));
  sky.frustumCulled = false;
  scene.add(sky);

  /* ---------- Ground with street grid ---------- */
  const ground = new THREE.Mesh(keep(new THREE.PlaneGeometry(700, 900)), keep(new THREE.ShaderMaterial({
    uniforms: { ...fogUniforms, uTime: time },
    vertexShader: 'varying vec3 vW; varying float vD; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: `${FOG_GLSL} uniform float uTime; varying vec3 vW; varying float vD;
      float lineAA(float d, float w){ float fw = fwidth(d) + 1e-4; return 1.0 - smoothstep(w, w + fw * 1.5, d); }
      void main(){
        vec3 c = vec3(0.018, 0.022, 0.032);
        // street grid: blocks are 10 wide with 4 wide streets, period 14
        float ax = abs(vW.x);
        float gx = mod(ax - 12.0, 14.0); float gz = mod(28.0 - vW.z, 14.0);
        float street = max(step(10.0, gx), step(10.0, gz));
        if (ax < 12.0) street = 1.0;
        c = mix(c, vec3(0.032, 0.037, 0.05), street);
        // boulevard: kerb lines, dashed lanes, double centre line
        float edge = lineAA(abs(ax - 10.0), 0.07);
        float lanes = (lineAA(abs(ax - 3.4), 0.05) + lineAA(abs(ax - 6.8), 0.05)) * step(0.55, fract(vW.z * 0.1));
        float centre = lineAA(abs(ax - 0.18), 0.05);
        c += vec3(0.84, 0.62, 0.27) * (edge * 0.5 + lanes * 0.22 + centre * 0.45);
        c += vec3(0.5, 0.35, 0.15) * 0.05 * exp(-ax * 0.12);
        gl_FragColor = vec4(applyFog(c, vD), 1.0);
      }`,
  })));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, -200);
  scene.add(ground);

  /* ---------- City layout ---------- */
  const rand = rng(3186);
  const forkLeft = new THREE.CatmullRomCurve3([[0, 0.06, -102], [-8, 0.06, -113], [-21, 0.06, -126], [-19, 0.06, -141], [-4, 0.06, -151]].map(vec3));
  const forkRight = new THREE.CatmullRomCurve3([[0, 0.06, -102], [8, 0.06, -113], [21, 0.06, -126], [19, 0.06, -141], [4, 0.06, -151]].map(vec3));
  const forkSamples = [...forkLeft.getSpacedPoints(40), ...forkRight.getSpacedPoints(40)];
  const PLAZA = new THREE.Vector3(0, 0, -156);
  const TOWER = new THREE.Vector3(19, 0, -76);
  const BEACONS = [[-16, -306, 30], [16, -319, 37], [-16, -332, 44], [16, -345, 52]];
  const nearFork = (x, z, r) => forkSamples.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < r * r);

  const buildings = [];
  const rooftops = [];
  const xBlocks = small ? 6 : 7;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < xBlocks; i += 1) {
      const bx0 = 12 + i * 14; // block spans x in [bx0, bx0+10]
      for (let j = 0; j < 34; j += 1) {
        const bz0 = 40 - j * 14; // block spans z in [bz0-10, bz0]
        const cols = rand() < 0.5 ? 1 : 2;
        const rows = rand() < 0.5 ? 1 : 2;
        for (let a = 0; a < cols; a += 1) {
          for (let b = 0; b < rows; b += 1) {
            const w = 10 / cols, d = 10 / rows;
            const sx = w * (0.62 + rand() * 0.3), sz = d * (0.62 + rand() * 0.3);
            const x = side * (bx0 + w * (a + 0.5));
            const z = bz0 - d * (b + 0.5);
            if (z < -152 + 22 && z > -152 - 22 && Math.abs(x) < 32 && (nearFork(x, z, 8.5) || Math.hypot(x - PLAZA.x, z - PLAZA.z) < 16)) continue;
            if (Math.hypot(x - TOWER.x, z - TOWER.z) < 10) continue;
            if (BEACONS.some(([bx, bz]) => Math.hypot(x - bx, z - bz) < 7)) continue;
            const centrality = Math.exp(-Math.abs(x) / 45);
            let h = 5 + rand() * 16 + centrality * rand() * 18;
            if (rand() < 0.08) h = 32 + rand() * 30;
            if (z < -170 && z > -222 && Math.abs(x) < 50) h = Math.min(h, 4 + rand() * 7); // keep the sky clear for the chart
            if (z < -296 && z > -360 && Math.abs(x) < 30) h = Math.min(h, 6 + rand() * 9);  // let the beacons rise
            const seed = rand();
            buildings.push({ x, z, sx, sz, h, seed });
            if (z < -222 && z > -300 && Math.abs(x) < 60 && h > 10) rooftops.push(new THREE.Vector3(x, h, z));
          }
        }
      }
    }
  }
  // the tiered landmark tower (02) is part of the city mesh, tier by tier
  const tiers = [[13, 18], [11, 16], [9, 14], [7.2, 12], [5.6, 11]];
  let tierY = 0;
  const tierTops = [];
  tiers.forEach(([s, h], k) => {
    buildings.push({ x: TOWER.x, z: TOWER.z, sx: s, sz: s, h, y: tierY, seed: 0.91 + k * 0.01 });
    tierY += h;
    tierTops.push({ y: tierY, s });
  });
  BEACONS.forEach(([x, z, h]) => buildings.push({ x, z, sx: 6, sz: 6, h, seed: 0.97 }));

  const boxGeometry = keep(new THREE.BoxGeometry(1, 1, 1));
  boxGeometry.translate(0, 0.5, 0);

  const cityUniforms = { ...fogUniforms, uReveal: { value: 0 }, uRevealOrigin: { value: new THREE.Vector2(0, -60) } };
  const cityMaterial = keep(new THREE.ShaderMaterial({
    uniforms: cityUniforms,
    vertexShader: `attribute float aSeed; varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vD; varying vec3 vW; varying vec3 vSize;
      void main(){
        vec3 s = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vSize = s; vLocal = position * s; vN = normal; vSeed = aSeed;
        vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.0); vW = w.xyz;
        vec4 mv = viewMatrix * w; vD = -mv.z; gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `${FOG_GLSL} ${HASH_GLSL} uniform float uReveal; uniform vec2 uRevealOrigin;
      varying vec3 vLocal; varying vec3 vN; varying float vSeed; varying float vD; varying vec3 vW; varying vec3 vSize;
      void main(){
        vec3 facade = mix(vec3(0.010, 0.016, 0.030), vec3(0.030, 0.040, 0.062), pow(vLocal.y / max(vSize.y, 1.0), 1.4));
        vec3 c = facade;
        float isSide = 1.0 - step(0.5, abs(vN.y));
        float u = abs(vN.x) > 0.5 ? vLocal.z : vLocal.x;
        float halfW = abs(vN.x) > 0.5 ? vSize.z * 0.5 : vSize.x * 0.5;
        float ribbon = step(0.55, fract(vSeed * 7.31));            // office towers: continuous window bands
        vec2 cell = vec2((u + 50.0) / mix(1.25, 4.8, ribbon), vLocal.y / mix(2.1, 2.6, ribbon));
        vec2 id = floor(cell); vec2 f = fract(cell);
        float win = mix(step(0.28, f.x) * step(f.x, 0.72) * step(0.34, f.y) * step(f.y, 0.70),
                        step(0.05, f.x) * step(f.x, 0.95) * step(0.40, f.y) * step(f.y, 0.66), ribbon);
        float aa = clamp(length(fwidth(cell)) * 1.4 - 0.15, 0.0, 1.0);
        win *= step(1.4, vLocal.y) * step(vLocal.y, vSize.y - 1.1) * step(abs(u), halfW - 0.5);
        float h = hash12(id + vec2(vSeed * 113.0, vN.x * 7.0 + vN.z * 13.0));
        float revealed = 1.0 - smoothstep(uReveal - 30.0, uReveal, length(vW.xz - uRevealOrigin) - h * 25.0);
        float lit = step(0.78 - 0.1 * vSeed, h) * revealed;
        vec3 warm = mix(vec3(1.0, 0.70, 0.36), vec3(0.78, 0.84, 1.0), step(0.8, hash12(id + 7.1)));
        vec3 wcol = win * (lit * warm * (0.42 + 0.3 * h) + (1.0 - lit) * vec3(0.016, 0.024, 0.04));
        vec3 wavg = mix(0.16, 0.24, ribbon) * (0.2 * revealed * vec3(1.0, 0.72, 0.4) * 0.5 + vec3(0.016, 0.024, 0.04));
        c += isSide * mix(wcol, wavg, aa);
        // vertical corner highlight and street-level glow
        float corner = 1.0 - smoothstep(0.0, 0.18, halfW - abs(u));
        c += isSide * corner * vec3(0.05, 0.045, 0.04);
        c += isSide * vec3(0.55, 0.38, 0.16) * 0.08 * exp(-vLocal.y * 0.5);
        // gold crown on selected roofs
        if (vN.y > 0.5) {
          vec2 r = vec2(abs(vLocal.x) - vSize.x * 0.5, abs(vLocal.z) - vSize.z * 0.5);
          float e = 1.0 - smoothstep(0.0, 0.35, -max(r.x, r.y));
          c += e * step(0.84, vSeed) * vec3(1.1, 0.78, 0.38) * revealed;
        }
        gl_FragColor = vec4(applyFog(c, vD), 1.0);
      }`,
  }));
  const city = new THREE.InstancedMesh(boxGeometry, cityMaterial, buildings.length);
  const seeds = new Float32Array(buildings.length);
  const m4 = new THREE.Matrix4();
  buildings.forEach((b, i) => {
    m4.makeScale(b.sx, b.h, b.sz).setPosition(b.x, b.y || 0, b.z);
    city.setMatrixAt(i, m4);
    seeds[i] = b.seed;
  });
  boxGeometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  city.computeBoundingSphere();
  scene.add(city);

  /* ---------- Glow helpers ---------- */
  const glowMaterial = (color, opacity = 1, intensity = 2.2) => keep(new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(intensity), transparent: opacity < 1, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: true,
  }));

  /* ---------- 02: tier rings + beacon on the landmark tower ---------- */
  const tierRings = tierTops.map(({ y, s }) => {
    const ring = new THREE.Mesh(keep(new THREE.BoxGeometry(s + 0.5, 0.35, s + 0.5)), glowMaterial(COLORS.gold, 0, 2.6));
    ring.position.set(TOWER.x, y, TOWER.z);
    scene.add(ring);
    return ring;
  });
  const spire = new THREE.Mesh(keep(new THREE.ConeGeometry(1.4, 14, 4)), glowMaterial(COLORS.champagne, 0.9, 1.6));
  spire.position.set(TOWER.x, tierY + 7, TOWER.z);
  spire.rotation.y = Math.PI / 4;
  scene.add(spire);
  const spriteTexture = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.25, 'rgba(255,255,255,.55)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return keep(new THREE.CanvasTexture(c));
  })();
  const makeFlare = (color, size) => {
    const s = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: spriteTexture, color: new THREE.Color(color).multiplyScalar(2), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
    s.scale.set(size, size, 1);
    return s;
  };
  const towerBeacon = makeFlare(COLORS.red, 9);
  towerBeacon.position.set(TOWER.x, tierY + 15, TOWER.z);
  scene.add(towerBeacon);

  /* ---------- 03: fork paths and the SSI plaza ---------- */
  const leftPath = new THREE.Mesh(keep(new THREE.TubeGeometry(forkLeft, 80, 0.22, 6)), glowMaterial(COLORS.red, 0.95, 2.4));
  const rightPath = new THREE.Mesh(keep(new THREE.TubeGeometry(forkRight, 80, 0.22, 6)), glowMaterial(COLORS.gold, 0.95, 2.4));
  scene.add(leftPath, rightPath);
  const plazaRing = new THREE.Mesh(keep(new THREE.TorusGeometry(9, 0.2, 8, 120)), glowMaterial(COLORS.red, 1, 2.4));
  plazaRing.rotation.x = -Math.PI / 2; plazaRing.position.set(PLAZA.x, 0.2, PLAZA.z);
  const plazaInner = new THREE.Mesh(keep(new THREE.TorusGeometry(5.2, 0.12, 8, 100)), glowMaterial(COLORS.champagne, 1, 1.8));
  plazaInner.rotation.x = -Math.PI / 2; plazaInner.position.set(PLAZA.x, 0.25, PLAZA.z);
  const beamMaterial = (color) => keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uStrength: { value: 1 }, uTime: time },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 uColor; uniform float uStrength; uniform float uTime; varying vec2 vUv;
      void main(){ float a = pow(1.0 - vUv.y, 1.6) * (0.55 + 0.45 * sin(vUv.y * 30.0 - uTime * 3.0) * 0.3);
        float edge = 1.0 - abs(vUv.x - 0.5) * 2.0; a *= 0.35 + 0.65 * edge;
        gl_FragColor = vec4(uColor * 1.8 * a * uStrength, 1.0); }`,
  }));
  const plazaBeam = new THREE.Mesh(keep(new THREE.CylinderGeometry(2.4, 3.2, 46, 40, 1, true)), beamMaterial(COLORS.red));
  plazaBeam.position.set(PLAZA.x, 23, PLAZA.z);
  scene.add(plazaRing, plazaInner, plazaBeam);
  const pulseCount = 14;
  const pulseGeometry = keep(new THREE.BufferGeometry());
  pulseGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pulseCount * 2 * 3), 3));
  const pulses = new THREE.Points(pulseGeometry, keep(new THREE.PointsMaterial({ size: 2.2, map: spriteTexture, color: new THREE.Color(COLORS.champagne).multiplyScalar(2.2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  pulses.frustumCulled = false;
  scene.add(pulses);

  /* ---------- 04: holographic candlestick chart ---------- */
  const chart = new THREE.Group();
  chart.position.set(4, 22, -198);
  scene.add(chart);
  const N = small ? 26 : 38;
  const candles = [];
  let price = 0;
  const cr = rng(86);
  for (let i = 0; i < N; i += 1) {
    const open = price;
    const close = open + (cr() - 0.36) * 3.2;
    const high = Math.max(open, close) + cr() * 1.6;
    const low = Math.min(open, close) - cr() * 1.6;
    candles.push({ open, close, high, low });
    price = close;
  }
  const minP = Math.min(...candles.map((c) => c.low)), maxP = Math.max(...candles.map((c) => c.high));
  const scaleY = 26 / (maxP - minP);
  const chartWidth = 64;
  const bodyUp = new THREE.InstancedMesh(boxGeometry, glowMaterial(COLORS.gold, 0.9, 1.9), N);
  const bodyDown = new THREE.InstancedMesh(boxGeometry, glowMaterial(COLORS.red, 0.9, 2.1), N);
  const wicks = new THREE.InstancedMesh(boxGeometry, glowMaterial(COLORS.champagne, 0.55, 1.2), N);
  [bodyUp, bodyDown, wicks].forEach((m) => { m.frustumCulled = false; chart.add(m); });
  const chartMaterials = [];
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  const closes = [];
  function layoutChart(grow) {
    let up = 0, down = 0;
    candles.forEach((c, i) => {
      const x = -chartWidth / 2 + (i + 0.5) * (chartWidth / N);
      const t = smooth(i / N, (i + 3) / N, grow);
      const y0 = (Math.min(c.open, c.close) - minP) * scaleY;
      const hBody = Math.max(0.35, Math.abs(c.close - c.open) * scaleY) * t;
      m4.makeScale(chartWidth / N * 0.58, hBody, 0.6).setPosition(x, y0, 0);
      if (c.close >= c.open) bodyUp.setMatrixAt(up++, m4); else bodyDown.setMatrixAt(down++, m4);
      m4.makeScale(0.12, (c.high - c.low) * scaleY * t, 0.12).setPosition(x, (c.low - minP) * scaleY, 0);
      wicks.setMatrixAt(i, m4);
    });
    for (let i = up; i < N; i += 1) bodyUp.setMatrixAt(i, zero);
    for (let i = down; i < N; i += 1) bodyDown.setMatrixAt(i, zero);
    bodyUp.count = up; bodyDown.count = down;
    [bodyUp, bodyDown, wicks].forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  }
  candles.forEach((c, i) => closes.push(new THREE.Vector3(-chartWidth / 2 + (i + 0.5) * (chartWidth / N), (c.close - minP) * scaleY + 3.2, 0.4)));
  const trendCurve = new THREE.CatmullRomCurve3(closes);
  const trendGeometry = keep(new THREE.TubeGeometry(trendCurve, N * 6, 0.12, 6));
  const trend = new THREE.Mesh(trendGeometry, glowMaterial(COLORS.champagne, 0.95, 2.6));
  trend.frustumCulled = false;
  chart.add(trend);
  [bodyUp, bodyDown, wicks, trend].forEach((m) => { m.material.transparent = true; chartMaterials.push([m.material, m.material.opacity]); });
  const gridPoints = [];
  for (let k = 0; k <= 6; k += 1) { const y = k * 30 / 6 - 1; gridPoints.push(-chartWidth / 2 - 2, y, -0.8, chartWidth / 2 + 2, y, -0.8); }
  for (let k = 0; k <= 8; k += 1) { const x = -chartWidth / 2 - 2 + k * (chartWidth + 4) / 8; gridPoints.push(x, -1, -0.8, x, 29, -0.8); }
  const gridGeometry = keep(new THREE.BufferGeometry());
  gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
  const gridMaterial = keep(new THREE.LineBasicMaterial({ color: new THREE.Color(COLORS.gold).multiplyScalar(0.8), transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
  chart.add(new THREE.LineSegments(gridGeometry, gridMaterial));
  const projectors = [-22, 0, 22].map((x) => {
    const cone = new THREE.Mesh(keep(new THREE.CylinderGeometry(9, 0.4, 20, 24, 1, true)), beamMaterial(COLORS.gold));
    cone.position.set(chart.position.x + x, 11, chart.position.z + 2);
    scene.add(cone);
    return cone;
  });

  /* ---------- 05: rooftop network ---------- */
  const network = new THREE.Group();
  scene.add(network);
  rooftops.sort((a, b) => a.z - b.z);
  const hubs = rooftops.filter((_, i) => i % 2 === 0).slice(0, small ? 18 : 30);
  const arcCurves = [];
  hubs.forEach((a, i) => {
    const near = hubs.map((b, j) => ({ j, d: a.distanceTo(b) })).filter((o) => o.j > i).sort((x, y) => x.d - y.d).slice(0, 2);
    near.forEach(({ j, d }) => {
      if (d > 48) return;
      const b = hubs[j];
      const mid = a.clone().add(b).multiplyScalar(0.5); mid.y += 5 + d * 0.25;
      arcCurves.push(new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone()));
    });
  });
  // arcs drawn as dotted light: reads as data flowing between rooftops
  const arcDots = [];
  arcCurves.forEach((curve) => { curve.getSpacedPoints(Math.max(16, Math.round(curve.getLength() / 1.4))).forEach((v) => arcDots.push(v.x, v.y, v.z)); });
  const arcGeometry = keep(new THREE.BufferGeometry());
  arcGeometry.setAttribute('position', new THREE.Float32BufferAttribute(arcDots, 3));
  const arcMaterial = keep(new THREE.PointsMaterial({ size: 1.5, map: spriteTexture, color: new THREE.Color(COLORS.champagne).multiplyScalar(1.8), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  network.add(new THREE.Points(arcGeometry, arcMaterial));
  const nodeGeometry = keep(new THREE.BufferGeometry());
  nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hubs.flatMap((v) => [v.x, v.y + 0.4, v.z]), 3));
  const nodeMaterial = keep(new THREE.PointsMaterial({ size: 4.2, map: spriteTexture, color: new THREE.Color(COLORS.gold).multiplyScalar(2.2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  network.add(new THREE.Points(nodeGeometry, nodeMaterial));
  const netPulseGeometry = keep(new THREE.BufferGeometry());
  netPulseGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(arcCurves.length * 3), 3));
  const netPulseMaterial = keep(new THREE.PointsMaterial({ size: 1.8, map: spriteTexture, color: new THREE.Color(0xffffff).multiplyScalar(2), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const netPulses = new THREE.Points(netPulseGeometry, netPulseMaterial);
  netPulses.frustumCulled = false;
  network.add(netPulses);

  /* ---------- 06: four beacons ---------- */
  const beaconCaps = BEACONS.map(([x, z, h]) => {
    const cap = new THREE.Mesh(keep(new THREE.BoxGeometry(6.6, 0.6, 6.6)), glowMaterial(COLORS.gold, 0.15, 2.4));
    cap.position.set(x, h + 0.3, z);
    const beam = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.2, 2.6, 90, 24, 1, true)), beamMaterial(COLORS.champagne));
    beam.position.set(x, h + 45, z);
    beam.material.uniforms.uStrength.value = 0;
    const flare = makeFlare(COLORS.champagne, 0.01);
    flare.position.set(x, h + 1.5, z);
    scene.add(cap, beam, flare);
    return { cap, beam, flare };
  });

  /* ---------- Light trails along the streets ---------- */
  const trailCount = small ? 260 : 520;
  const trailGeometry = keep(new THREE.BoxGeometry(0.16, 0.12, 2.8));
  const tLane = new Float32Array(trailCount), tOffset = new Float32Array(trailCount), tSpeed = new Float32Array(trailCount), tAxis = new Float32Array(trailCount), tWarm = new Float32Array(trailCount);
  const tr = rng(77);
  const zStreets = []; for (let j = 0; j < 34; j += 1) zStreets.push(28 - j * 14);
  for (let i = 0; i < trailCount; i += 1) {
    const alongZ = tr() < 0.72;
    tAxis[i] = alongZ ? 0 : 1;
    if (alongZ) {
      const lanes = [-8.5, -5.1, -1.7, 1.7, 5.1, 8.5, -24, 24, -38, 38, -52, 52];
      tLane[i] = lanes[Math.floor(tr() * (tr() < 0.6 ? 6 : lanes.length))];
    } else tLane[i] = zStreets[Math.floor(tr() * zStreets.length)] + (tr() < 0.5 ? -1 : 1);
    tOffset[i] = tr() * 1000; tSpeed[i] = 9 + tr() * 12;
    tWarm[i] = (alongZ ? tLane[i] > 0 : tLane[i] % 28 > 0) ? 1 : 0;
  }
  [['aLane', tLane], ['aOffset', tOffset], ['aSpeed', tSpeed], ['aAxis', tAxis], ['aWarm', tWarm]].forEach(([n, a]) => trailGeometry.setAttribute(n, new THREE.InstancedBufferAttribute(a, 1)));
  const trails = new THREE.InstancedMesh(trailGeometry, keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...fogUniforms, uTime: time, uLevel: { value: 0 } },
    vertexShader: `attribute float aLane; attribute float aOffset; attribute float aSpeed; attribute float aAxis; attribute float aWarm;
      uniform float uTime; varying float vWarm; varying float vD; varying float vFade;
      void main(){
        float dir = aWarm > 0.5 ? -1.0 : 1.0;
        float L = aAxis < 0.5 ? 460.0 : 200.0;
        float s = mod(aOffset + uTime * aSpeed, L);
        vec3 p = position;
        vec3 w;
        if (aAxis < 0.5) { float z = 40.0 - s; if (dir > 0.0) z = -420.0 + s; w = vec3(aLane + p.x, 0.25 + p.y, z + p.z);
          if (abs(aLane) < 10.0 && z < -100.0 && z > -153.0) w.y = -50.0; }
        else { float x = -100.0 + s; if (dir < 0.0) x = 100.0 - s; w = vec3(x + p.z, 0.25 + p.y, aLane + p.x); }
        vWarm = aWarm; vFade = 1.0;
        vec4 mv = viewMatrix * vec4(w, 1.0); vD = -mv.z; gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `${FOG_GLSL} uniform float uLevel; varying float vWarm; varying float vD; varying float vFade;
      void main(){ vec3 c = vWarm > 0.5 ? vec3(1.0, 0.82, 0.55) * 2.6 : vec3(0.95, 0.12, 0.12) * 2.4;
        float f = 1.0 - exp(-pow(vD * uFogDensity, 2.0));
        gl_FragColor = vec4(c * (1.0 - f) * uLevel, 1.0); }`,
  })), trailCount);
  trails.frustumCulled = false;
  for (let i = 0; i < trailCount; i += 1) trails.setMatrixAt(i, new THREE.Matrix4());
  scene.add(trails);

  /* ---------- Haze / noise particles (01) and floating dust ---------- */
  const noiseCount = small ? 1400 : 2600;
  const nPos = new Float32Array(noiseCount * 3), nSeed = new Float32Array(noiseCount);
  const nr = rng(11);
  for (let i = 0; i < noiseCount; i += 1) {
    nPos[i * 3] = (nr() - 0.5) * 220; nPos[i * 3 + 1] = 8 + nr() * 150; nPos[i * 3 + 2] = 90 - nr() * 230; nSeed[i] = nr();
  }
  const noiseGeometry = keep(new THREE.BufferGeometry());
  noiseGeometry.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  noiseGeometry.setAttribute('aSeed', new THREE.BufferAttribute(nSeed, 1));
  const noiseMaterial = keep(new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: time, uNoise: { value: 1 }, uScale: { value: 1 }, uMap: { value: spriteTexture } },
    vertexShader: `attribute float aSeed; uniform float uTime; uniform float uNoise; uniform float uScale; varying float vA; varying float vRed;
      void main(){ vec3 p = position; float t = uTime * (0.4 + aSeed);
        p += vec3(sin(t + aSeed * 40.0), cos(t * 1.3 + aSeed * 17.0), sin(t * 0.7 + aSeed * 9.0)) * (2.0 + 6.0 * uNoise);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float flicker = step(0.35, fract(sin(floor(uTime * (3.0 + aSeed * 5.0)) * 43758.5 * (aSeed + 0.1))));
        vA = mix(0.18, flicker, uNoise) * (0.25 + 0.75 * uNoise); vRed = step(0.82, aSeed);
        gl_PointSize = min(5.0, uScale * (0.8 + aSeed * 1.6) * 220.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uMap; varying float vA; varying float vRed;
      void main(){ vec4 t = texture2D(uMap, gl_PointCoord); vec3 c = mix(vec3(0.95, 0.8, 0.5), vec3(1.0, 0.2, 0.18), vRed);
        gl_FragColor = vec4(c * t.a * vA * 1.4, 1.0); }`,
  }));
  const noise = new THREE.Points(noiseGeometry, noiseMaterial);
  noise.frustumCulled = false;
  scene.add(noise);

  /* ---------- Post-processing (bloom), desktop only ---------- */
  let composer = null, bloom = null;
  if (small) renderer.toneMappingExposure = 1.5; // no bloom on phones: lift the image a little
  if (!small) {
    try {
      const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
        import('../assets/vendor/addons/postprocessing/EffectComposer.js'),
        import('../assets/vendor/addons/postprocessing/RenderPass.js'),
        import('../assets/vendor/addons/postprocessing/UnrealBloomPass.js'),
        import('../assets/vendor/addons/postprocessing/OutputPass.js'),
      ]);
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), 0.7, 0.45, 0.9);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    } catch (error) { composer = null; }
  }

  /* ---------- Camera path ---------- */
  const shotPos = new THREE.CatmullRomCurve3(SHOTS.map((s) => vec3(s.pos)), false, 'centripetal');
  const shotLook = new THREE.CatmullRomCurve3(SHOTS.map((s) => vec3(s.look)), false, 'centripetal');
  const tmpPos = new THREE.Vector3(), tmpLook = new THREE.Vector3();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  function shotAt(p, outPos, outLook) {
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1].p) i += 1;
    const a = SHOTS[i], b = SHOTS[i + 1];
    const local = clamp((p - a.p) / (b.p - a.p));
    const u = (i + local) / (SHOTS.length - 1);
    shotPos.getPoint(u, outPos);
    shotLook.getPoint(u, outLook);
  }

  /* ---------- State + loop ---------- */
  let width = 0, height = 0, frameId = 0, active = false, disposed = false, suspended = false, dirty = true, frames = 0;
  let progress = 0, targetProgress = 0, last = performance.now();
  let prevX = 0, roll = 0;
  const snap = /[?&]tci-snap\b/.test(location.search);
  let portraitPull = 1;
  let lastInput = performance.now();
  const IDLE_MS = 6000; // after the camera arrives and nobody moves, let the GPU rest

  const FOG_NIGHT = new THREE.Color(COLORS.fog), FOG_DAWN = new THREE.Color(0x2a1a17);
  function applyProgress(p) {
    const reveal = smooth(0.0, 0.11, p);
    cityUniforms.uReveal.value = 40 + reveal * 620;
    noiseMaterial.uniforms.uNoise.value = 1 - smooth(0.02, 0.12, p);
    noise.visible = p < 0.3;
    trails.material.uniforms.uLevel.value = smooth(0.04, 0.12, p);
    // 02 tiers light up one by one
    tierRings.forEach((ring, k) => { ring.material.opacity = smooth(0.13 + k * 0.022, 0.16 + k * 0.022, p); });
    towerBeacon.material.opacity = smooth(0.2, 0.25, p) * (0.75 + 0.25 * Math.sin(time.value * 2.4));
    // 03 fork + plaza
    const fork = smooth(0.28, 0.36, p) * (1 - smooth(0.62, 0.7, p));
    leftPath.material.opacity = 0.2 + 0.75 * fork; rightPath.material.opacity = 0.2 + 0.75 * fork;
    pulses.material.opacity = fork;
    const plaza = smooth(0.36, 0.43, p);
    plazaRing.scale.setScalar(0.6 + 0.4 * plaza); plazaBeam.material.uniforms.uStrength.value = smooth(0.28, 0.36, p) * (0.15 + plaza * 0.5) * (1 - smooth(0.44, 0.48, p));
    // 04 chart
    const grow = smooth(0.43, 0.52, p);
    chart.visible = p > 0.36 && p < 0.64;
    const chartFade = 1 - smooth(0.57, 0.63, p);
    chartMaterials.forEach(([m, o]) => { m.opacity = o * chartFade; });
    layoutChart(grow);
    trendGeometry.setDrawRange(0, Math.floor(trendGeometry.index.count * smooth(0.47, 0.56, p) / 3) * 3);
    gridMaterial.opacity = 0.02 + 0.07 * smooth(0.42, 0.48, p);
    projectors.forEach((c) => { c.material.uniforms.uStrength.value = 0.25 * smooth(0.42, 0.5, p); });
    // 05 network
    const net = smooth(0.6, 0.68, p);
    arcMaterial.opacity = 0.85 * net; nodeMaterial.opacity = net; netPulseMaterial.opacity = net;
    // 06 beacons one by one + dawn
    beaconCaps.forEach(({ cap, beam, flare }, k) => {
      const on = smooth(0.875 + k * 0.025, 0.9 + k * 0.025, p);
      cap.material.opacity = 0.12 + 0.88 * on;
      beam.material.uniforms.uStrength.value = 0.38 * on;
      flare.scale.setScalar(0.01 + 3.2 * on);
    });
    const dawn = smooth(0.84, 1.0, p);
    skyUniforms.uDawn.value = dawn;
    fogUniforms.uFogColor.value.copy(FOG_NIGHT).lerp(FOG_DAWN, dawn * 0.55); scene.fog.color.copy(fogUniforms.uFogColor.value);
    const density = 0.0062 - 0.0016 * smooth(0.6, 1.0, p);
    fogUniforms.uFogDensity.value = density; scene.fog.density = density;
    if (bloom) bloom.strength = 0.7 + 0.25 * dawn;
  }

  function animatePulses(t) {
    const arr = pulseGeometry.attributes.position.array;
    for (let i = 0; i < pulseCount; i += 1) {
      const u = frac(t * 0.12 + i / pulseCount);
      forkLeft.getPoint(u, tmpPos); arr.set([tmpPos.x, 0.5, tmpPos.z], i * 6);
      forkRight.getPoint(frac(u + 0.5 / pulseCount), tmpPos); arr.set([tmpPos.x, 0.5, tmpPos.z], i * 6 + 3);
    }
    pulseGeometry.attributes.position.needsUpdate = true;
    if (netPulseMaterial.opacity > 0.01) {
      const na = netPulseGeometry.attributes.position.array;
      arcCurves.forEach((c, i) => { c.getPoint(frac(t * 0.25 + i * 0.37), tmpPos); na[i * 3] = tmpPos.x; na[i * 3 + 1] = tmpPos.y; na[i * 3 + 2] = tmpPos.z; });
      netPulseGeometry.attributes.position.needsUpdate = true;
    }
  }

  function render(now) {
    frameId = 0;
    if (disposed || !active || suspended || document.hidden || !width) return;
    const dt = clamp((now - last) / 1000, 0, 0.05); // rAF timestamps can precede `last`
    last = now;
    time.value += reducedMotion.matches ? 0 : dt;
    progress += (targetProgress - progress) * (1 - Math.exp(-dt * 2.6));
    if (snap || Math.abs(targetProgress - progress) < 1e-4) progress = targetProgress;
    applyProgress(progress);
    animatePulses(time.value);
    pointer.x += (pointer.tx - pointer.x) * (1 - Math.exp(-dt * 2));
    pointer.y += (pointer.ty - pointer.y) * (1 - Math.exp(-dt * 2));
    shotAt(progress, tmpPos, tmpLook);
    if (portraitPull > 1) tmpPos.sub(tmpLook).multiplyScalar(portraitPull).add(tmpLook); // narrow screens: step back so landmarks fit
    const breathe = reducedMotion.matches ? 0 : Math.sin(time.value * 0.35) * 0.35;
    camera.position.set(tmpPos.x + pointer.x * 1.6, tmpPos.y + breathe + pointer.y * 0.8, tmpPos.z);
    camera.lookAt(tmpLook);
    sky.position.copy(camera.position);
    const vx = (tmpPos.x - prevX) / Math.max(dt, 1e-3);
    prevX = tmpPos.x;
    roll += (clamp(-vx * 0.004, -0.06, 0.06) - roll) * (1 - Math.exp(-dt * 3));
    camera.rotateZ(roll);
    if (composer) composer.render(dt); else renderer.render(scene, camera);
    frames += 1;
    dirty = false;
    if (progress === targetProgress && now - lastInput > IDLE_MS) return; // idle: sleep until the next scroll/pointer
    schedule();
  }
  function canRender() { return !disposed && active && !suspended && !document.hidden && width > 0; }
  function schedule() { if (!frameId && canRender()) { last = performance.now(); frameId = requestAnimationFrame(render); } }
  function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; }

  function resize() {
    if (disposed) return;
    const bounds = host.getBoundingClientRect();
    width = Math.round(bounds.width); height = Math.round(bounds.height);
    if (!width || !height) { stop(); return; }
    const ratio = Math.min(window.devicePixelRatio || 1, smallScreen.matches ? 1.25 : 1.5);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    if (composer) { composer.setPixelRatio(ratio); composer.setSize(width, height); bloom?.resolution.set(width / 2, height / 2); }
    camera.aspect = width / height;
    const aspect = width / height;
    camera.fov = aspect < 0.8 ? 60 : 48;
    portraitPull = aspect < 0.8 ? 1 + (0.8 - aspect) * 1.4 : 1;
    camera.updateProjectionMatrix();
    dirty = true; schedule();
  }
  function onPointer(e) { lastInput = performance.now(); schedule(); pointer.tx = (e.clientX / innerWidth - 0.5) * 2; pointer.ty = -(e.clientY / innerHeight - 0.5) * 2; }
  function visibilityChanged() { if (document.hidden) stop(); else { dirty = true; lastInput = performance.now(); schedule(); } }
  function pageHidden(event) { if (event.persisted) { suspended = true; stop(); } else dispose(); }
  function pageShown() { suspended = false; lastInput = performance.now(); resize(); schedule(); }
  function contextLost(event) { event.preventDefault(); dispose(); fail(); }
  function motionChanged() { dirty = true; schedule(); }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;

  function setProgress(value) {
    if (disposed) return;
    const next = clamp(Number(value) || 0);
    if (next === targetProgress && !dirty) return;
    if (!frames) progress = next; // first shot: no fly-in from zero
    lastInput = performance.now();
    targetProgress = next; dirty = true; schedule();
  }
  function setActive(value) {
    if (disposed) return;
    const next = Boolean(value);
    if (active === next) { if (next) schedule(); return; }
    active = next;
    if (active) { dirty = true; lastInput = performance.now(); schedule(); } else stop();
  }
  function dispose() {
    if (disposed) return;
    disposed = true; active = false; stop();
    resizeObserver?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('pagehide', pageHidden);
    window.removeEventListener('pageshow', pageShown);
    document.removeEventListener('visibilitychange', visibilityChanged);
    smallScreen.removeEventListener('change', resize);
    reducedMotion.removeEventListener('change', motionChanged);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    disposables.forEach((item) => item.dispose?.());
    city.dispose(); trails.dispose(); bodyUp.dispose(); bodyDown.dispose(); wicks.dispose();
    composer?.dispose?.();
    renderer.dispose();
    renderer.domElement.remove();
    delete host.__tciJourneyThree;
    journeyScenes.delete(host);
  }

  const controller = Object.freeze({ setProgress, setActive, dispose });
  journeyScenes.set(host, controller);
  Object.defineProperty(host, '__tciJourneyThree', {
    configurable: true,
    get: () => ({
      progress, targetProgress, frames,
      active: active && !suspended && !document.hidden,
      camera: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      shotCamera: { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z }, // path position without ambient sway/parallax
      width, height, rendering: Boolean(frameId) && canRender(), pixelRatio: renderer.getPixelRatio(),
      bloom: Boolean(composer), buildings: buildings.length,
    }),
  });
  host.dataset.tciJourneyThree = 'ready';
  host.dataset.journeyThreeRevision = 'financial-city-film-1';
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  document.addEventListener('visibilitychange', visibilityChanged);
  window.addEventListener('pagehide', pageHidden);
  window.addEventListener('pageshow', pageShown);
  window.addEventListener('pointermove', onPointer, { passive: true });
  smallScreen.addEventListener('change', resize);
  reducedMotion.addEventListener('change', motionChanged);
  if (resizeObserver) resizeObserver.observe(host); else window.addEventListener('resize', resize, { passive: true });
  resize();
  return controller;
}
