import { SITE_CONFIG, prefersLowMotion, focusableElements, trapFocus, lockPageScroll, copyText, showNotice, scrollToSection } from './site-config.js';

let initialized = false;
export function initNavigation() {
  if (initialized) return;
  initialized = true;
  const root = document.documentElement;
  const revealItems = [...document.querySelectorAll('[data-private-reveal]')];
  if (!prefersLowMotion() && 'IntersectionObserver' in window) {
    root.classList.add('private-motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6%' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    root.classList.remove('private-motion-ready');
    revealItems.forEach((item) => item.classList.add('is-revealed'));
  }

  const drawer = document.querySelector('.private-mobile-drawer');
  const dialog = drawer?.querySelector('.private-drawer-panel');
  const menuButton = document.querySelector('.private-menu-button');
  let drawerReturnFocus = null;
  const setDrawer = (open, restoreFocus = true) => {
    if (!drawer || !menuButton || !dialog) return;
    if (open) {
      drawerReturnFocus = document.activeElement;
      document.dispatchEvent(new CustomEvent('tci:overlay-open', { detail: 'drawer' }));
    }
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('tci-drawer-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.inert = !open;
    lockPageScroll('drawer', open);
    if (open) {
      (dialog.querySelector('button[aria-label*="Đóng"]') || focusableElements(dialog)[0] || dialog).focus();
    } else if (restoreFocus && drawerReturnFocus?.isConnected) {
      drawerReturnFocus.focus({ preventScroll: true });
    }
  };
  if (drawer && dialog && menuButton) {
    dialog.tabIndex = -1;
    menuButton.setAttribute('aria-controls', drawer.id || 'private-mobile-menu');
    setDrawer(false, false);
    menuButton.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
    drawer.addEventListener('click', (event) => {
      if (event.target.closest('.private-drawer-backdrop, .private-drawer-head button')) setDrawer(false);
      else if (event.target.closest('a, .private-drawer-panel > button')) setDrawer(false);
    });
    document.addEventListener('keydown', (event) => {
      if (!drawer.classList.contains('is-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); }
      else trapFocus(event, dialog);
    });
    document.addEventListener('tci:overlay-open', (event) => {
      if (event.detail !== 'drawer' && drawer.classList.contains('is-open')) setDrawer(false, false);
    });
    window.matchMedia('(min-width: 769px)').addEventListener('change', (event) => {
      if (event.matches && drawer.classList.contains('is-open')) setDrawer(false, false);
    });
  }

  document.querySelectorAll('button').forEach((button) => {
    if (button.closest('.private-chat-panel, .tci-payment-modal')) return;
    const label = button.textContent?.trim() || '';
    if (/Mở (?:mới )?tài khoản|Mở tài khoản SSI/i.test(label)) {
      button.addEventListener('click', () => window.open(SITE_CONFIG.openAccountUrl, '_blank', 'noopener,noreferrer'));
    }
    if (/Sao chép mã/i.test(label)) {
      button.addEventListener('click', async () => {
        const copied = await copyText(SITE_CONFIG.advisorCode);
        if (copied) {
          button.textContent = 'Đã sao chép mã 3186';
          showNotice('Đã sao chép mã 3186');
        } else showNotice('Không sao chép được. Mã chuyên gia: 3186.');
      });
    }
    if (/Đang có tài khoản\?/i.test(label)) {
      button.addEventListener('click', () => scrollToSection(document.querySelector('#private-pathways'), true));
    }
  });

  const sticky = document.querySelector('.private-sticky-cta');
  let scrollFrame = 0;
  const updateSticky = () => {
    sticky?.classList.toggle('is-visible', window.scrollY > 720);
    scrollFrame = 0;
  };
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateSticky);
  }, { passive: true });
  updateSticky();
}
