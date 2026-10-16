/** Optional decoration only. Prices, offers, data, links and core tokens stay outside this module. */
export const EVENT_FEATURE_FLAGS = Object.freeze({ enhancedMotion: false });

const configUrl = new URL('../content/events.json', import.meta.url);
const stylesheetUrl = new URL('../styles/event-themes.css', import.meta.url);
const campaignsUrl = new URL('../assets/campaigns/', import.meta.url);
const maxTimerDelay = 2147483647;
let initialization;
let stylesheetPromise;
let stopTheme = () => {};
let revision = 0;

function parseVietnamTime(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/.test(value)) return NaN;
  const time = Date.parse(value);
  // Reject invalid dates which Date.parse would otherwise normalize (for example 31 February).
  const localIso = Number.isFinite(time) ? new Date(time + 7 * 3600000).toISOString().slice(0, 19) : '';
  return localIso === value.slice(0, 19) ? time : NaN;
}

function findCandidate(config) {
  if (!config || config.killSwitch === true || typeof config.themes !== 'object' || !config.themes) return null;
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const previewId = isLocal ? new URLSearchParams(window.location.search).get('tci-event') : null;
  const preview = Boolean(previewId && Object.hasOwn(config.themes, previewId));
  const id = preview ? previewId : config.activeTheme;
  if (typeof id !== 'string' || !Object.hasOwn(config.themes, id)) return null;
  const theme = config.themes[id];
  if (!theme || theme.variant !== 'tet') return null;
  if (!preview && (config.enabled !== true || theme.enabled !== true || theme.previewOnly === true)) return null;
  const startsAt = parseVietnamTime(theme.startsAt);
  const endsAt = parseVietnamTime(theme.endsAt);
  if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || endsAt <= startsAt) return null;
  if (typeof theme.title !== 'string' || !theme.title.trim() || theme.title.length > 64) return null;
  let asset;
  try {
    asset = new URL(theme.visualAsset, configUrl);
    if (asset.origin !== campaignsUrl.origin || !asset.pathname.startsWith(campaignsUrl.pathname)) return null;
    if (!/\.(svg|png|webp|avif)$/i.test(asset.pathname) || asset.search || asset.hash) return null;
  } catch {
    return null;
  }
  return { id, theme, asset, preview, startsAt, endsAt };
}

function loadStyles() {
  if (stylesheetPromise) return stylesheetPromise;
  stylesheetPromise = new Promise((resolve) => {
    const link = document.createElement('link');
    let settled = false;
    const timeout = setTimeout(() => complete(false), 5000);
    function complete(loaded) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!loaded) { link.remove(); stylesheetPromise = undefined; }
      resolve(loaded);
    }
    link.rel = 'stylesheet';
    link.href = stylesheetUrl.href;
    link.dataset.tciEventStyles = '';
    link.onload = () => complete(true);
    link.onerror = () => complete(false);
    document.head.append(link);
  });
  return stylesheetPromise;
}

function createDecoration(candidate) {
  const layer = document.createElement('div');
  layer.className = 'tci-event-decoration';
  layer.setAttribute('aria-hidden', 'true');
  const decorations = Array.isArray(candidate.theme.decorations) ? candidate.theme.decorations : [];
  if (decorations.includes('hero-motif')) {
    const motif = document.createElement('img');
    motif.className = 'tci-event-motif';
    motif.src = candidate.asset.href;
    motif.alt = '';
    motif.width = 240;
    motif.height = 180;
    motif.decoding = 'async';
    motif.draggable = false;
    layer.append(motif);
  }
  if (decorations.includes('hero-badge')) {
    const badge = document.createElement('span');
    badge.className = 'tci-event-badge';
    badge.textContent = candidate.theme.title;
    layer.append(badge);
  }
  return layer;
}

export function disableEventTheme() {
  revision += 1;
  stopTheme();
  stopTheme = () => {};
  initialization = undefined;
}

async function initialize(initialRevision) {
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 5000);
  let config;
  try {
    const response = await fetch(configUrl, { cache: 'no-cache', signal: controller.signal });
    if (!response.ok) return { active: false, reason: 'config-unavailable' };
    config = await response.json();
  } catch {
    return { active: false, reason: 'config-unavailable' };
  } finally {
    clearTimeout(fetchTimeout);
  }
  if (initialRevision !== revision) return { active: false, reason: 'disabled' };
  const candidate = findCandidate(config);
  const hero = document.getElementById('private-top');
  if (!candidate || !hero) return { active: false, reason: 'disabled' };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  let decoration;
  let timer;
  let stopped = false;
  let refreshing = false;
  const status = { active: false, preview: candidate.preview, theme: candidate.id };

  function setMotion() {
    if (!decoration) return;
    const motionRequested = config.features?.enhancedMotion ?? EVENT_FEATURE_FLAGS.enhancedMotion;
    const motionAllowed = motionRequested === true && !reducedMotion.matches && connection?.saveData !== true;
    hero.dataset.tciEventMotion = motionAllowed ? 'gentle' : 'static';
  }

  function removeDecoration() {
    decoration?.remove();
    decoration = undefined;
    delete hero.dataset.tciEvent;
    delete hero.dataset.tciEventPreview;
    delete hero.dataset.tciEventMotion;
    status.active = false;
  }

  async function refresh() {
    if (stopped || refreshing) return;
    refreshing = true;
    try {
      clearTimeout(timer);
      const now = Date.now();
      const active = candidate.preview || (now >= candidate.startsAt && now <= candidate.endsAt);
      if (active && !decoration) {
        if (!(await loadStyles()) || stopped) return;
        // Loading a stylesheet may span the end of an event. Recheck before mounting.
        if (!candidate.preview && Date.now() > candidate.endsAt) return;
        decoration = createDecoration(candidate);
        hero.dataset.tciEvent = candidate.theme.variant;
        if (candidate.preview) hero.dataset.tciEventPreview = 'true';
        setMotion();
        hero.append(decoration);
        status.active = true;
      } else if (!active) {
        removeDecoration();
      }
      if (!candidate.preview) {
        const nextChange = now < candidate.startsAt ? candidate.startsAt : candidate.endsAt + 1;
        if (nextChange > Date.now()) timer = setTimeout(refresh, Math.min(nextChange - Date.now(), maxTimerDelay));
      }
    } finally {
      refreshing = false;
    }
  }

  function refreshWhenVisible() {
    if (document.visibilityState === 'visible') void refresh();
  }
  reducedMotion.addEventListener?.('change', setMotion);
  connection?.addEventListener?.('change', setMotion);
  document.addEventListener('visibilitychange', refreshWhenVisible);
  stopTheme = () => {
    stopped = true;
    clearTimeout(timer);
    removeDecoration();
    reducedMotion.removeEventListener?.('change', setMotion);
    connection?.removeEventListener?.('change', setMotion);
    document.removeEventListener('visibilitychange', refreshWhenVisible);
  };
  await refresh();
  return status;
}

/** Fetch failures fail closed: the existing page remains usable without seasonal assets. */
export async function initEventTheme() {
  if (!initialization) initialization = initialize(revision);
  return initialization;
}
