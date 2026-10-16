import { createJourneyScene } from './journey-three.js';

let initialized = false;
const clamp = value => Math.max(0, Math.min(1, value));
const ease = t => t * t * (3 - 2 * t);
/* Title cards shown between chapters while the city film plays behind them. */
const CHAPTERS = {
  'private-principles': ['01', 'Nguyên tắc', 'Giữa nhiễu thông tin, bắt đầu từ một quy trình.'],
  'private-about': ['02', 'Kinh nghiệm', 'Nhiều lớp thị trường, một nguyên tắc.'],
  'private-pathways': ['03', 'SSI 3186', 'Hai lối vào, cùng một điểm đến.'],
  'private-proof': ['04', 'Năng lực', 'Kết quả và rủi ro, nhìn cả hai.'],
  'private-service': ['05', 'Đồng hành', 'Không ai đi đường dài một mình.'],
  'private-process': ['06', 'Bắt đầu', 'Bốn bước tới một kế hoạch rõ ràng.'],
};

/** The original content is the timeline. No duplicate deck or artificial scroll runway. */
export function initJourney() {
  const root = document.querySelector('#tci-journey');
  if (!root || initialized) return;
  initialized = true;
  const host = root.querySelector('.tci-journey-scene');
  const stage = root.querySelector('.tci-journey-stage');
  const hud = root.querySelector('[data-journey-hud]');
  const readingButton = root.querySelector('[data-journey-reading]');
  const sections = [...document.querySelectorAll('[data-journey-section]')];
  const rail = root.querySelector('.tci-journey-rail');
  const links = [...rail.querySelectorAll('a[href^="#"]')];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const interludes = new Map();
  sections.forEach(section => {
    const chapter = CHAPTERS[section.id];
    if (!chapter) return;
    const card = document.createElement('div');
    card.className = 'tci-journey-interlude';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = `<span class="tci-interlude-index">Chương ${chapter[0]}</span><strong>${chapter[1]}</strong><em>${chapter[2]}</em>`;
    section.before(card);
    interludes.set(section, card);
  });
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let controller = null;
  let scenePromise = null;
  let failed = false;
  let readingRequested = false;
  let mode = 'reading';
  let activeIndex = -1;
  let progress = 0;
  let visible = false;
  let headerHeight = 68;
  let stageHeight = innerHeight - headerHeight;
  let points = [];
  let frame = 0;
  let pendingResize = false;

  const eligible = () => !motionQuery.matches && !connection?.saveData && innerHeight >= 480;
  const readState = () => ({
    mode, progress, activeIndex, activeSection: sections[activeIndex]?.id || null,
    visible, stageHeight, headerHeight, sectionCount: sections.length,
    sections: points.flatMap((point, k) => point.kind !== 'top' ? [] : [{
      id: point.id, label: point.label, layout: point.layout, act: point.act,
      start: point.y, end: points[k + 1]?.y ?? point.y, from: point.p, to: points[k + 1]?.p ?? point.p, easing: 'smoothstep',
    }]),
    knots: points.map(point => ({ ...point }))
  });
  Object.defineProperty(root, '__tciJourney', { configurable: true, get: () => { measure(); return readState(); } });

  function measure() {
    headerHeight = Math.round(document.querySelector('.private-header')?.getBoundingClientRect().height || 68);
    stageHeight = Math.max(1, innerHeight - headerHeight);
    const headerValue = `${headerHeight}px`;
    if (stage.style.getPropertyValue('--tci-story-header') !== headerValue) {
      stage.style.setProperty('--tci-story-header', headerValue);
      document.querySelectorAll('.tci-journey-flow').forEach(flow => flow.style.setProperty('--tci-story-header', headerValue));
    }
    const probe = headerHeight + stageHeight * (innerWidth <= 767 ? .24 : .36);
    const top = element => element.getBoundingClientRect().top + scrollY - probe;
    const knots = [];
    let last = 0;
    sections.forEach((section, index) => {
      const base = Number(section.dataset.journeyProgress);
      const next = sections[index + 1];
      const act = section.parentElement.id;
      const card = interludes.get(section);
      if (card?.offsetHeight) knots.push({ y: top(card), p: last, sec: index, act, kind: 'interlude' });
      knots.push({ y: top(section), p: base, sec: index, act, kind: 'top', id: section.id, label: section.dataset.journeyLabel, layout: section.dataset.journeyLayout });
      const sameAct = next && next.parentElement === section.parentElement;
      const bottom = section.getBoundingClientRect().bottom + scrollY - probe;
      if (!sameAct) knots.push({ y: bottom, p: Math.min(1, base + .08), sec: index, act, kind: 'bottom' });
      else if (interludes.get(next)?.offsetHeight) {
        const nextBase = Number(next.dataset.journeyProgress);
        knots.push({ y: bottom, p: base + (nextBase - base) * .3, sec: index, act, kind: 'bottom' });
      }
      last = knots[knots.length - 1].p;
    });
    points = knots;
  }

  function update() {
    frame = 0;
    measure();
    activeIndex = -1;
    for (let k = 0; k < points.length - 1; k += 1) {
      const a = points[k], b = points[k + 1];
      if (a.act !== b.act || scrollY < a.y || scrollY >= b.y) continue;
      activeIndex = a.kind === 'bottom' ? b.sec : a.sec;
      progress = clamp(a.p + (b.p - a.p) * ease(clamp((scrollY - a.y) / Math.max(1, b.y - a.y))));
      break;
    }
    visible = activeIndex >= 0;
    let interludeVisible = false;
    const middle = innerHeight / 2;
    interludes.forEach(card => {
      if (!card.offsetHeight) return;
      const bounds = card.getBoundingClientRect();
      const amount = clamp(1 - Math.abs(bounds.top + bounds.height / 2 - middle) / (innerHeight * .42));
      card.style.setProperty('--interlude', amount.toFixed(3));
      if (amount > .35) interludeVisible = true;
    });
    document.body.classList.toggle('tci-story-interlude', visible && interludeVisible);
    if (visible) {
      const section = sections[activeIndex];
      const point = { id: section.id, layout: section.dataset.journeyLayout };
      controller?.setProgress(progress);
      document.body.dataset.tciStoryLayout = point.layout;
      links.forEach(link => {
        const target = link.getAttribute('href').slice(1);
        const current = target === point.id || (point.id === 'private-ssi' && target === 'private-pathways')
          || (point.id === 'private-community' && target === 'private-service')
          || (point.id === 'private-insights' && target === 'private-service');
        link.classList.toggle('is-current', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    const playing = mode === 'cinematic' && visible && !document.hidden;
    controller?.setActive(playing);
    document.body.classList.toggle('tci-story-active', playing);
    const available = Boolean(controller && !failed && eligible());
    document.body.classList.toggle('tci-journey-available', available);
    hud.hidden = !available || !visible;
    readingButton.textContent = mode === 'cinematic' ? 'Xem dạng đọc' : 'Bật nền 3D';
    readingButton.setAttribute('aria-pressed', String(mode === 'reading'));
    root.style.setProperty('--journey-progress', String(progress));
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function setMode(next, preserve = true) {
    if (next === mode) { update(); return; }
    const anchor = [...document.querySelectorAll('main section')].find(section => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= headerHeight + 40 && bounds.bottom > headerHeight + 40;
    });
    const offset = anchor?.getBoundingClientRect().top;
    mode = next;
    root.dataset.tciJourneyMode = next;
    document.body.classList.toggle('tci-journey-enabled', next === 'cinematic');
    if (preserve && anchor) {
      const change = anchor.getBoundingClientRect().top - offset;
      if (Math.abs(change) > 1) scrollTo({ top: scrollY + change, behavior: 'instant' });
    }
    update();
  }

  function refresh() {
    if (document.activeElement?.matches('input, select, textarea')) {
      pendingResize = true;
      return;
    }
    pendingResize = false;
    if (!controller && !failed && eligible()) {
      if (!scenePromise) {
        scenePromise = createJourneyScene(host).then(scene => {
          controller = scene;
          failed = !scene;
          scenePromise = null;
          refresh();
        }).catch(() => {
          failed = true;
          scenePromise = null;
          setMode('fallback');
        });
      }
      update();
      return;
    }
    setMode(failed || !eligible() ? 'fallback' : controller && !readingRequested ? 'cinematic' : 'reading');
  }

  readingButton.addEventListener('click', () => {
    readingRequested = mode === 'cinematic';
    setMode(readingRequested ? 'reading' : 'cinematic');
    readingButton.focus({ preventScroll: true });
  });
  links.forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: 'start', behavior: eligible() ? 'smooth' : 'instant' });
    history.replaceState(history.state, '', link.getAttribute('href'));
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }));
  rail.addEventListener('keydown', event => {
    const index = links.indexOf(event.target.closest('a'));
    if (index < 0 || !['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
      : Math.max(0, Math.min(links.length - 1, index + (/Right|Down/.test(event.key) ? 1 : -1)));
    links[next].focus({ preventScroll: true });
  });
  host.addEventListener('tci:journey-scene-fallback', () => {
    failed = true;
    setMode('fallback');
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) controller?.setActive(false);
    requestUpdate();
  });
  document.addEventListener('focusout', () => { if (pendingResize) requestAnimationFrame(refresh); });
  motionQuery.addEventListener('change', refresh);
  connection?.addEventListener?.('change', refresh);
  const contentObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(requestUpdate) : null;
  contentObserver?.observe(document.querySelector('main'));
  refresh();
  document.fonts?.ready.then(refresh);
}
