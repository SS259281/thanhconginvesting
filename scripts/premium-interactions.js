// The core navigation owns reveal visibility. This enhancement only adds material response.
export function initPremiumInteractions({ root = document } = {}) {
  const page = root.querySelector('.private-page');
  if (!page || page.dataset.tciPremiumInteractions === 'ready') return;
  page.dataset.tciPremiumInteractions = 'ready';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const cardSelector = '.private-problem-grid article, .private-pathway-card, .private-price-card';
  const cards = [...page.querySelectorAll(cardSelector)];
  cards.forEach((card) => card.classList.add('tci-premium-reactive'));

  let activeCard = null;
  let lastPointer = null;
  let updateFrame = 0;

  const motionAllowed = () => !reducedMotion.matches && !connection?.saveData;
  const resetCard = () => {
    if (updateFrame) cancelAnimationFrame(updateFrame);
    updateFrame = 0;
    lastPointer = null;
    if (!activeCard) return;
    activeCard.classList.remove('is-pointer-active');
    for (const property of ['--tci-pointer-x', '--tci-pointer-y', '--tci-tilt-x', '--tci-tilt-y', '--tci-card-lift']) {
      activeCard.style.removeProperty(property);
    }
    activeCard = null;
  };
  const syncMotionPreference = () => {
    page.classList.toggle('tci-premium-low-motion', !motionAllowed());
    if (!motionAllowed() || !finePointer.matches) resetCard();
  };

  const updateCard = () => {
    updateFrame = 0;
    if (!activeCard || !lastPointer || !motionAllowed() || !finePointer.matches) return;
    const rect = activeCard.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(1, Math.max(0, (lastPointer.x - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (lastPointer.y - rect.top) / rect.height));
    activeCard.style.setProperty('--tci-pointer-x', `${(x * 100).toFixed(2)}%`);
    activeCard.style.setProperty('--tci-pointer-y', `${(y * 100).toFixed(2)}%`);
    activeCard.style.setProperty('--tci-tilt-x', `${((.5 - y) * 2.8).toFixed(2)}deg`);
    activeCard.style.setProperty('--tci-tilt-y', `${((x - .5) * 2.8).toFixed(2)}deg`);
    activeCard.style.setProperty('--tci-card-lift', '-3px');
  };

  page.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || !motionAllowed() || !finePointer.matches) return;
    const candidate = event.target.closest?.('.tci-premium-reactive');
    if (!candidate || !page.contains(candidate)) {
      resetCard();
      return;
    }
    if (candidate !== activeCard) {
      resetCard();
      activeCard = candidate;
      activeCard.classList.add('is-pointer-active');
    }
    lastPointer = { x: event.clientX, y: event.clientY };
    if (!updateFrame) updateFrame = requestAnimationFrame(updateCard);
  }, { passive: true });
  page.addEventListener('pointerleave', resetCard, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) resetCard();
  });
  window.addEventListener('scroll', resetCard, { passive: true });
  reducedMotion.addEventListener?.('change', syncMotionPreference);
  finePointer.addEventListener?.('change', syncMotionPreference);
  connection?.addEventListener?.('change', syncMotionPreference);
  syncMotionPreference();

  // Entrance accents remain progressive: no opacity/visibility changes or reveal ownership.
  if ('IntersectionObserver' in window && motionAllowed()) {
    const entranceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('tci-premium-entered');
        entranceObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    page.querySelectorAll('.private-section, .private-final-cta').forEach((section) => entranceObserver.observe(section));
  }
}
