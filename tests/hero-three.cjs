// Local browser QA for the original premium hero. External traffic is blocked.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');

const base = process.env.TCI_BASE_URL || 'http://127.0.0.1:4173/thanhconginvesting/';
const output = process.env.TCI_QA_DIR || path.join(__dirname, '..', '.qa');
const localOrigin = new URL(base).origin;
const results = [];
const contexts = [];
const check = async (name, fn) => {
  try { await fn(); results.push({ name, status: 'passed' }); console.log('PASS ' + name); }
  catch (error) { results.push({ name, status: 'failed', error: error.message }); throw error; }
};

// Read immediately after a frame, before the compositor discards WebGL buffers.
// This samples actual rendered pixels rather than accepting an empty canvas.
const sampleFrame = async page => page.locator('.tci-hero-scene canvas').evaluate(canvas => new Promise(resolve => {
  const host = canvas.closest('.tci-hero-scene');
  const initialFrames = host.__tciThree?.frames;
  let attempts = 0;
  function read() {
    if (host.__tciThree?.frames === initialFrames && attempts++ < 30) { requestAnimationFrame(read); return; }
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return resolve({ context: false });
    const width = gl.drawingBufferWidth, height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const stride = Math.max(1, Math.floor(width * height / 12000));
    let colored = 0, opaque = 0, hash = 2166136261, samples = 0;
    for (let pixel = 0; pixel < width * height; pixel += stride) {
      const i = pixel * 4; samples++;
      if (pixels[i] || pixels[i + 1] || pixels[i + 2]) colored++;
      if (pixels[i + 3]) opaque++;
      for (let channel = 0; channel < 4; channel++) hash = Math.imul(hash ^ pixels[i + channel], 16777619) >>> 0;
    }
    resolve({ context: true, width, height, colored, opaque, samples, hash, error: gl.getError() });
  }
  requestAnimationFrame(read);
}));

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  });
  const createPage = async ({ reducedMotion = 'no-preference', init } = {}) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion, timezoneId: 'Asia/Ho_Chi_Minh' });
    contexts.push(context);
    await context.addInitScript(() => { try { localStorage.setItem('tci_first_visit_started_at', '1'); } catch {} });
    if (init) await context.addInitScript(init);
    await context.route('**/*', route => new URL(route.request().url()).origin === localOrigin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [], missing = [], requested = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requested.push(request.url()));
    page.on('response', response => { if (response.url().startsWith(localOrigin) && response.status() >= 400) missing.push({ url: response.url(), status: response.status() }); });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.tci-hero-scene[data-tci-three]').waitFor({ state: 'attached' });
    return { page, context, errors, missing, requested };
  };
  const healthy = state => { assert.deepEqual(state.errors, []); assert.deepEqual(state.missing, []); };
  const functional = async state => {
    const page = state.page;
    await page.locator('.private-hero .private-button-secondary').click();
    assert.equal(new URL(page.url()).hash, '#private-pathways');
    await page.locator('.private-chat-launcher').click();
    assert.equal(await page.locator('#private-chat-panel').getAttribute('aria-hidden'), 'false');
    await page.keyboard.press('Escape');
    assert(await page.locator('.private-chat-launcher').evaluate(element => element === document.activeElement));
    await page.locator('.private-lead-form [type="submit"]').click();
    assert.equal(await page.locator('.private-form-success').count(), 0);
    healthy(state);
  };

  try {
    const normal = await createPage();
    await check('normal motion: local Three.js renders a decorative canvas', async () => {
      await normal.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'ready');
      const geometry = await normal.page.locator('.tci-hero-scene canvas').evaluate(canvas => ({
        width: canvas.width, height: canvas.height, rect: { width: canvas.getBoundingClientRect().width, height: canvas.getBoundingClientRect().height },
        pointerEvents: getComputedStyle(canvas).pointerEvents,
        decorative: canvas.getAttribute('aria-hidden') === 'true' || Boolean(canvas.closest('[aria-hidden="true"]')),
        focusable: canvas.hasAttribute('tabindex') && canvas.tabIndex >= 0
      }));
      assert(geometry.width > 100 && geometry.height > 100);
      assert(geometry.rect.width > 100 && geometry.rect.height > 100);
      assert.equal(geometry.pointerEvents, 'none'); assert(geometry.decorative); assert.equal(geometry.focusable, false);
      assert(normal.requested.some(url => /\/assets\/vendor\/three\.module\.js(?:\?|$)/.test(url)));
      const frame = await sampleFrame(normal.page);
      assert(frame.context && frame.colored > 10 && frame.opaque > 10, 'WebGL must draw visible colored pixels');
      assert.equal(frame.error, 0);
      results.push({ name: 'WebGL drawing evidence', status: 'observed', frame, geometry });
      await normal.page.screenshot({ path: path.join(output, 'premium-original-desktop.png') });
      healthy(normal);
    });
    await check('normal motion: the rendered 3D image changes over time', async () => {
      const before = await sampleFrame(normal.page);
      await normal.page.waitForTimeout(350);
      const after = await sampleFrame(normal.page);
      assert.notEqual(after.hash, before.hash, 'The 3D renderer must update its actual image');
      assert(after.colored > 10);
    });
    await check('pointer input changes the hero scene target', async () => {
      const host = normal.page.locator('.tci-hero-scene');
      const box = await host.boundingBox(); assert(box && box.width > 0);
      await normal.page.mouse.move(box.x + box.width * 0.22, box.y + box.height * 0.3);
      const before = await host.evaluate(element => ({ x: element.__tciThree?.pointerX, y: element.__tciThree?.pointerY }));
      await normal.page.mouse.move(box.x + box.width * 0.78, box.y + box.height * 0.7);
      await normal.page.waitForFunction(previous => {
        const host = document.querySelector('.tci-hero-scene');
        return host.__tciThree?.pointerX !== previous.x || host.__tciThree?.pointerY !== previous.y;
      }, before);
      const after = await host.evaluate(element => ({ x: element.__tciThree?.pointerX, y: element.__tciThree?.pointerY }));
      assert(Number.isFinite(Number(after.x)) && Number.isFinite(Number(after.y)), 'The renderer exposes finite pointer targets');
    });
    await check('offscreen hero pauses and resumes when visible', async () => {
      await normal.page.evaluate(() => document.querySelector('#private-proof').scrollIntoView({ behavior: 'instant' }));
      await normal.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'paused');
      const frames = await normal.page.locator('.tci-hero-scene').evaluate(element => element.__tciThree.frames);
      await normal.page.waitForTimeout(200);
      assert.equal(await normal.page.locator('.tci-hero-scene').evaluate(element => element.__tciThree.frames), frames);
      await normal.page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await normal.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'ready');
      const frame = await sampleFrame(normal.page); assert(frame.colored > 10);
      healthy(normal);
    });
    await check('mobile scene resizes without horizontal overflow', async () => {
      await normal.page.setViewportSize({ width: 390, height: 844 });
      await normal.page.locator('.tci-hero-scene').scrollIntoViewIfNeeded();
      await normal.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'ready');
      const dimensions = await normal.page.locator('.tci-hero-scene canvas').evaluate(canvas => ({
        width: canvas.width, cssWidth: canvas.getBoundingClientRect().width, scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth
      }));
      assert.equal(dimensions.scrollWidth, dimensions.viewport);
      assert(dimensions.width > 0 && dimensions.width <= Math.ceil(dimensions.cssWidth * 2.05));
      await normal.page.screenshot({ path: path.join(output, 'premium-original-mobile.png') });
      healthy(normal);
    });

    const reduced = await createPage({ reducedMotion: 'reduce' });
    await check('reduced motion uses a still hero and preserves functions', async () => {
      const host = reduced.page.locator('.tci-hero-scene');
      await reduced.page.waitForFunction(() => {
        const host = document.querySelector('.tci-hero-scene');
        return host?.dataset.tciThree === 'fallback' || (host?.dataset.tciThree === 'ready' && host.__tciThree?.reducedMotion && !host.__tciThree?.running);
      });
      const frames = await host.evaluate(element => element.__tciThree?.frames);
      await reduced.page.waitForTimeout(250);
      assert.equal(await host.evaluate(element => element.__tciThree?.frames), frames);
      await functional(reduced);
    });

    const unavailable = await createPage({ init: () => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        return /^webgl/i.test(type) ? null : original.call(this, type, ...args);
      };
    } });
    await check('unavailable WebGL falls back without breaking navigation or form', async () => {
      await unavailable.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'fallback');
      assert.equal(await unavailable.page.locator('.tci-hero-scene canvas').count(), 0);
      assert(await unavailable.page.locator('.private-portrait').isVisible());
      await functional(unavailable);
    });

    const saveData = await createPage({ init: () => {
      Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '4g', addEventListener() {}, removeEventListener() {} } });
    } });
    await check('Save-Data skips Three.js download and keeps the static hero', async () => {
      await saveData.page.waitForFunction(() => document.querySelector('.tci-hero-scene')?.dataset.tciThree === 'fallback');
      assert.equal(await saveData.page.locator('.tci-hero-scene canvas').count(), 0);
      assert.equal(saveData.requested.some(url => /\/assets\/vendor\/three\.(?:module|core)\.js(?:\?|$)/.test(url)), false);
      assert(await saveData.page.locator('.private-portrait').isVisible());
      await functional(saveData);
    });
  } finally {
    await fs.writeFile(path.join(output, 'hero-three-results.json'), JSON.stringify({ base, browser: browser.version(), results }, null, 2));
    await Promise.all(contexts.map(context => context.close()));
    await browser.close();
  }
  console.log(`${results.filter(result => result.status === 'passed').length} hero checks passed. All external traffic blocked; no real lead or payment actions.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
