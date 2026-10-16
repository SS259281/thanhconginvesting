/** A contained, progressively enhanced financial sculpture behind the portrait. */
const activeScenes = new WeakMap();

export async function initHeroThree() {
  const host = document.querySelector('.tci-hero-scene');
  if (!host) return () => {};
  if (activeScenes.has(host)) return activeScenes.get(host);

  const setState = (state) => { host.dataset.tciThree = state; };
  host.dataset.threeRevision = 'premium-orbit-2';
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) {
    setState('fallback');
    return () => {};
  }

  let THREE;
  try {
    THREE = await import('../assets/vendor/three.module.js');
  } catch (error) {
    setState('fallback');
    console.warn('Hero visual could not load.', error);
    return () => {};
  }
  if (!host.isConnected) return () => {};

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    setState('fallback');
    return () => {};
  }

  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
  camera.position.set(0, 0.03, 8.5);
  camera.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.36;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
  host.appendChild(renderer.domElement);

  const geometries = new Set();
  const materials = new Set();
  const geometry = (value) => { geometries.add(value); return value; };
  const material = (value) => { materials.add(value); return value; };
  const gold = material(new THREE.MeshStandardMaterial({ color: 0xd6a84a, metalness: 0.72, roughness: 0.26 }));
  const brightGold = material(new THREE.MeshStandardMaterial({ color: 0xf3d79b, metalness: 0.62, roughness: 0.22 }));
  const red = material(new THREE.MeshStandardMaterial({ color: 0xe2232a, metalness: 0.4, roughness: 0.32 }));
  const darkGold = material(new THREE.MeshStandardMaterial({ color: 0x735123, metalness: 0.75, roughness: 0.3 }));
  const sculpture = new THREE.Group();
  sculpture.position.y = 0.12;
  scene.add(sculpture);

  scene.add(new THREE.AmbientLight(0xffe5bd, 1.45));
  const key = new THREE.DirectionalLight(0xffedcf, 4.4);
  key.position.set(-3.5, 4.5, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 2.6);
  fill.position.set(4, -1, 4);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe2232a, 3.4);
  rim.position.set(2, 2, -3);
  scene.add(rim);

  const orbit = new THREE.Group();
  orbit.rotation.set(0.49, 0.41, -0.24);
  sculpture.add(orbit);
  const outerRing = new THREE.Mesh(geometry(new THREE.TorusGeometry(2.16, 0.071, 12, 128)), gold);
  orbit.add(outerRing);
  const edgeRing = new THREE.Mesh(geometry(new THREE.TorusGeometry(2.285, 0.017, 8, 128)), brightGold);
  orbit.add(edgeRing);

  const crossingOrbit = new THREE.Group();
  crossingOrbit.rotation.set(-0.65, 0.69, 0.5);
  sculpture.add(crossingOrbit);
  const crossingRing = new THREE.Mesh(geometry(new THREE.TorusGeometry(2.36, 0.033, 10, 128)), darkGold);
  crossingOrbit.add(crossingRing);
  const redArc = new THREE.Mesh(geometry(new THREE.TorusGeometry(2.36, 0.039, 10, 52, Math.PI * 0.44)), red);
  redArc.rotation.z = -0.9;
  crossingOrbit.add(redArc);

  // Dimensional markers ride the ring; the center is kept quiet for the portrait.
  const markerGeometry = geometry(new THREE.OctahedronGeometry(0.145, 0));
  const markers = [];
  [0.23, 1.14, 2.17, 3.27, 4.2, 5.45].forEach((angle, index) => {
    const marker = new THREE.Mesh(markerGeometry, index === 2 || index === 5 ? red : brightGold);
    marker.position.set(Math.cos(angle) * 2.16, Math.sin(angle) * 2.16, 0);
    marker.rotation.set(angle * 0.4, angle * 0.6, angle);
    orbit.add(marker);
    markers.push(marker);
  });

  const candleBodyGeometry = geometry(new THREE.BoxGeometry(0.135, 1, 0.13));
  const candleWickGeometry = geometry(new THREE.BoxGeometry(0.016, 1, 0.016));
  const candles = [];
  const candlePositions = [
    [-2.05, -0.66, 0.44, 0.52, true],
    [-2.32, -0.22, -0.05, 0.34, false],
    [-1.95, 0.84, -0.3, 0.54, true],
    [2.12, 0.56, 0.5, 0.52, true],
    [2.34, 0.01, 0.14, 0.32, false],
    [1.89, -0.82, 0.75, 0.66, true],
  ];
  candlePositions.forEach(([x, y, z, height, rising], index) => {
    const candle = new THREE.Group();
    const candleMaterial = rising ? gold : red;
    const wick = new THREE.Mesh(candleWickGeometry, candleMaterial);
    wick.scale.y = height + 0.25;
    const body = new THREE.Mesh(candleBodyGeometry, candleMaterial);
    body.scale.y = height;
    candle.add(wick, body);
    candle.position.set(x, y, z);
    candle.rotation.set(-0.12, rising ? -0.28 : 0.3, index % 2 ? -0.14 : 0.08);
    sculpture.add(candle);
    candles.push({ object: candle, baseY: y, phase: index * 1.7 });
  });

  const coinGeometry = geometry(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 40));
  const coinEdge = material(new THREE.MeshStandardMaterial({ color: 0xad7623, metalness: 0.7, roughness: 0.25 }));
  const coinFaceGeometry = geometry(new THREE.TorusGeometry(0.168, 0.009, 6, 32));
  const coins = [];
  [[1.74, 1.77, 0.1, 0.18], [-1.7, -1.52, 0.5, -0.32], [1.55, -1.7, -0.3, 0.56]].forEach(([x, y, z, tilt]) => {
    const coin = new THREE.Group();
    const disc = new THREE.Mesh(coinGeometry, [coinEdge, gold, gold]);
    disc.rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(coinFaceGeometry, brightGold);
    face.position.z = 0.032;
    coin.add(disc, face);
    coin.position.set(x, y, z);
    coin.rotation.set(0.25, tilt, -0.18);
    sculpture.add(coin);
    coins.push(coin);
  });

  const particlePositions = [];
  const particleColors = [];
  // A deterministic sparse field keeps screenshots and reduced-motion views stable.
  for (let index = 0; index < 58; index += 1) {
    const angle = index * 2.399963;
    const radius = 1.8 + ((index * 17) % 29) / 29 * 1.1;
    particlePositions.push(Math.cos(angle) * radius, Math.sin(angle) * radius, -1.1 - (index % 5) * 0.3);
    const color = new THREE.Color(index % 7 === 0 ? 0xe2232a : 0xf3d79b);
    particleColors.push(color.r, color.g, color.b);
  }
  const particleGeometry = geometry(new THREE.BufferGeometry());
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
  const particleMaterial = material(new THREE.PointsMaterial({ size: 0.026, sizeAttenuation: true, transparent: true, opacity: 0.62, vertexColors: true, depthWrite: false }));
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const visual = host.closest('.private-hero-visual') || host;
  const pointerSurface = host.closest('.private-hero') || visual;
  const initialBounds = visual.getBoundingClientRect();
  let disposed = false;
  let suspended = false;
  let inView = initialBounds.bottom > 0 && initialBounds.top < innerHeight && initialBounds.right > 0 && initialBounds.left < innerWidth;
  let frameId = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let previousTime = 0;
  let width = 0;
  let height = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let frames = 0;
  const canAnimate = () => !disposed && !suspended && inView && !document.hidden && !motionQuery.matches && width > 0 && height > 0;

  // A getter allows browser QA to inspect playback without touching the render loop.
  Object.defineProperty(host, '__tciThree', {
    configurable: true,
    get: () => ({
      frames,
      rotation: { x: sculpture.rotation.x, y: sculpture.rotation.y, z: orbit.rotation.z },
      pointerX,
      pointerY,
      smoothX,
      smoothY,
      smoothRotation: { x: sculpture.rotation.x, y: sculpture.rotation.y, orbit: orbit.rotation.z, crossing: crossingOrbit.rotation.z },
      elapsed,
      running: Boolean(frameId) && canAnimate(),
      reducedMotion: motionQuery.matches,
      inView,
      width,
      height,
      pixelRatio: renderer.getPixelRatio(),
    }),
  });

  function render() {
    if (disposed || width <= 0 || height <= 0) return;
    try {
      renderer.render(scene, camera);
      frames += 1;
    } catch (error) {
      cleanup();
      setState('fallback');
    }
  }

  function stop() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
    previousTime = 0;
  }

  function tick(time) {
    frameId = 0;
    if (!canAnimate()) return;
    const frameInterval = mobileQuery.matches ? 1000 / 30 : 1000 / 60;
    if (time - lastFrame < frameInterval - 0.5) {
      frameId = requestAnimationFrame(tick);
      return;
    }
    const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.08) : 0;
    previousTime = time;
    lastFrame = time;
    elapsed += delta;
    const pointerEase = 1 - Math.exp(-delta * 9);
    smoothX += (pointerX - smoothX) * pointerEase;
    smoothY += (pointerY - smoothY) * pointerEase;
    sculpture.rotation.y = Math.sin(elapsed * 0.2) * 0.16 + smoothX * 0.24;
    sculpture.rotation.x = Math.cos(elapsed * 0.17) * 0.065 + smoothY * 0.16;
    orbit.rotation.z = -0.24 + elapsed * 0.043;
    crossingOrbit.rotation.z = 0.5 - elapsed * 0.026;
    markers.forEach((marker, index) => { marker.rotation.y = index * 0.6 + elapsed * 0.34; });
    coins.forEach((coin, index) => { coin.rotation.y = Math.sin(elapsed * 0.4 + index) * 0.56; });
    candles.forEach(({ object, baseY, phase }) => { object.position.y = baseY + Math.sin(elapsed * 0.6 + phase) * 0.078; });
    particles.rotation.z = elapsed * 0.005;
    render();
    if (canAnimate()) frameId = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    stop();
    if (disposed) return;
    if (!inView || suspended || document.hidden) {
      setState('paused');
      return;
    }
    setState('ready');
    render();
    if (canAnimate()) frameId = requestAnimationFrame(tick);
  }

  function resize() {
    if (disposed) return;
    const bounds = host.getBoundingClientRect();
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    if (!width || !height) { stop(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileQuery.matches ? 1 : 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Maintain the whole sculpture on narrow cards, with an intentionally close desktop view.
    camera.position.z = camera.aspect < 0.9 ? 7.2 / camera.aspect : 8.15;
    camera.updateProjectionMatrix();
    render();
    if (canAnimate() && !frameId) frameId = requestAnimationFrame(tick);
  }

  function onPointerMove(event) {
    if (motionQuery.matches || event.pointerType === 'touch') return;
    const bounds = pointerSurface.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
    pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
  }
  function onPointerLeave() { pointerX = 0; pointerY = 0; }
  function onContextLost(event) {
    event.preventDefault();
    cleanup();
    setState('fallback');
  }
  function onPageHide(event) {
    // Retain the sculpture when the browser stores this document for Back/Forward.
    if (event.persisted) { suspended = true; stop(); setState('paused'); }
    else cleanup();
  }
  function onPageShow() {
    if (disposed) return;
    suspended = false;
    const bounds = visual.getBoundingClientRect();
    inView = bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
    resize();
    syncPlayback();
  }
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
  const intersectionObserver = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { rootMargin: '0px', threshold: 0 }) : null;

  function cleanup() {
    if (disposed) return;
    disposed = true;
    stop();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('resize', resize);
    pointerSurface.removeEventListener('pointermove', onPointerMove);
    pointerSurface.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('blur', onPointerLeave);
    motionQuery.removeEventListener('change', syncPlayback);
    mobileQuery.removeEventListener('change', resize);
    renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('pageshow', onPageShow);
    geometries.forEach((item) => item.dispose());
    materials.forEach((item) => item.dispose());
    renderer.dispose();
    renderer.domElement.remove();
    delete host.__tciThree;
    activeScenes.delete(host);
  }

  activeScenes.set(host, cleanup);
  pointerSurface.addEventListener('pointermove', onPointerMove, { passive: true });
  pointerSurface.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('blur', onPointerLeave);
  document.addEventListener('visibilitychange', syncPlayback);
  motionQuery.addEventListener('change', syncPlayback);
  mobileQuery.addEventListener('change', resize);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', onPageShow);
  if (resizeObserver) resizeObserver.observe(host);
  else window.addEventListener('resize', resize, { passive: true });
  intersectionObserver?.observe(visual);
  resize();
  syncPlayback();
  return cleanup;
}
