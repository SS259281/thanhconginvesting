const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const modulePath = path.join(__dirname, '..', 'scripts', 'event-theme.js');
const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content', 'events.json'), 'utf8'));
const source = fs.readFileSync(modulePath, 'utf8').replace(/export /g, '').replace(/import\.meta\.url/g, JSON.stringify(pathToFileURL(modulePath).href)) + '\nglobalThis.api = { initEventTheme, disableEventTheme };';
function setup({ config = defaults, hostname = '127.0.0.1', search = '', reduced = false, saveData = false, now = Date.parse('2027-02-01T00:00:00+07:00'), fetchError = false } = {}) {
  const state = { now, requests: 0, timers: new Map(), nextTimer: 0, listeners: new Map() };
  function element(tag) {
    return { tag, dataset: {}, children: [], attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, append(node) { this.children.push(node); node.parent = this; if (tag === 'head' && node.onload) node.onload(); }, remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); } };
  }
  const hero = element('section');
  const head = element('head');
  class MockDate extends Date { static now() { return state.now; } }
  const context = { URL, URLSearchParams, AbortController, Date: MockDate, console, document: { head, visibilityState: 'visible', createElement: element, getElementById: () => hero, addEventListener: (type, fn) => state.listeners.set(type, fn), removeEventListener: (type) => state.listeners.delete(type) }, window: { location: { hostname, search }, matchMedia: () => ({ matches: reduced, addEventListener() {}, removeEventListener() {} }) }, navigator: { connection: { saveData, addEventListener() {}, removeEventListener() {} } }, fetch: async () => { state.requests++; if (fetchError) throw Error('offline'); return { ok: true, json: async () => structuredClone(config) }; }, setTimeout: (fn, delay) => { const id = ++state.nextTimer; state.timers.set(id, { fn, delay }); return id; }, clearTimeout: id => state.timers.delete(id) };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { state, hero, head, api: context.api };
}
function productionConfig() {
  const config = structuredClone(defaults);
  config.enabled = true;
  config.themes['tet-demo'].enabled = true;
  config.themes['tet-demo'].previewOnly = false;
  return config;
}
async function run() {
  const cases = [];
  async function check(name, fn) { await fn(); cases.push(name); }
  await check('Default OFF has no decoration, stylesheet or schedule', async () => {
    const s = setup(); const result = await s.api.initEventTheme();
    assert.equal(result.active, false); assert.equal(s.hero.children.length, 0); assert.equal(s.head.children.length, 0); assert.equal(s.state.timers.size, 0);
  });
  await check('Local preview renders decorative, unfocusable nodes without enabling configuration', async () => {
    const s = setup({ search: '?tci-event=tet-demo' }); const result = await s.api.initEventTheme();
    assert.equal(result.active, true); assert.equal(result.preview, true); assert.equal(s.hero.dataset.tciEventMotion, 'static');
    assert.equal(s.hero.children[0].attributes['aria-hidden'], 'true'); assert.equal(s.hero.children[0].children[1].textContent, defaults.themes['tet-demo'].title);
    assert.equal(s.head.children.length, 1); assert.equal(defaults.enabled, false); s.api.disableEventTheme(); assert.equal(s.hero.children.length, 0); assert.equal(s.state.listeners.size, 0);
  });
  for (const hostname of ['thanhconginvesting.com', 'staging.example.com', '127.0.0.1.evil.test', 'localhost.example.com']) {
    await check(`Public hostname rejects query preview: ${hostname}`, async () => {
      const s = setup({ hostname, search: '?tci-event=tet-demo' }); assert.equal((await s.api.initEventTheme()).active, false); assert.equal(s.head.children.length, 0);
    });
  }
  await check('Kill switch also blocks local preview', async () => {
    const config = structuredClone(defaults); config.killSwitch = true;
    assert.equal((await setup({ config, search: '?tci-event=tet-demo' }).api.initEventTheme()).active, false);
  });
  for (const time of ['2027-02-31T00:00:00+07:00', '2027-01-25T00:00:00Z', 'not-a-date']) {
    await check(`Invalid Vietnam date fails closed: ${time}`, async () => {
      const config = productionConfig(); config.themes['tet-demo'].startsAt = time;
      assert.equal((await setup({ config }).api.initEventTheme()).active, false);
    });
  }
  await check('Scheduled activation and end cleanup use fixed +07 boundaries', async () => {
    const config = productionConfig(); const s = setup({ config, now: Date.parse('2027-01-24T23:59:59+07:00') });
    const result = await s.api.initEventTheme(); assert.equal(result.active, false); assert.equal(s.head.children.length, 0);
    const startTimer = [...s.state.timers.values()][0]; assert.equal(startTimer.delay, 1000);
    s.state.now = Date.parse(config.themes['tet-demo'].startsAt); await startTimer.fn(); assert.equal(result.active, true); assert.equal(s.hero.children.length, 1);
    s.state.now = Date.parse(config.themes['tet-demo'].endsAt) + 1; await s.state.listeners.get('visibilitychange')(); await Promise.resolve();
    assert.equal(result.active, false); assert.equal(s.hero.children.length, 0); assert.equal(s.hero.dataset.tciEvent, undefined);
  });
  await check('Public query does not bypass an approved event schedule', async () => {
    const config = productionConfig(); const s = setup({ config, hostname: 'thanhconginvesting.com', search: '?tci-event=tet-demo', now: Date.parse('2027-03-01T00:00:00+07:00') });
    assert.equal((await s.api.initEventTheme()).active, false);
  });
  for (const scenario of [{ reduced: true }, { saveData: true }, {}]) {
    await check(`Motion preference: ${JSON.stringify(scenario)}`, async () => {
      const config = productionConfig(); config.features.enhancedMotion = true; const s = setup({ config, ...scenario }); await s.api.initEventTheme();
      assert.equal(s.hero.dataset.tciEventMotion, scenario.reduced || scenario.saveData ? 'static' : 'gentle');
    });
  }
  await check('Network failure does not break main content', async () => {
    const s = setup({ fetchError: true }); assert.equal((await s.api.initEventTheme()).active, false); assert.equal(s.head.children.length, 0);
  });
  await check('Repeated initialization shares the fetch and decorations', async () => {
    const s = setup({ search: '?tci-event=tet-demo' }); await Promise.all([s.api.initEventTheme(), s.api.initEventTheme()]);
    assert.equal(s.state.requests, 1); assert.equal(s.hero.children.length, 1);
  });
  console.log(JSON.stringify({ passed: cases.length, cases }, null, 2));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
