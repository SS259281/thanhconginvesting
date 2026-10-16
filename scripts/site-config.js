export const SITE_CONFIG = Object.freeze({
  advisorCode: '3186',
  openAccountUrl: 'https://www.ssi.com.vn/khach-hang-ca-nhan/mo-tai-khoan?mgm=3186',
  openAccountGuide: 'huong-dan-mo-tk-ssi.html',
  transferGuide: 'chuyen-ma-ssi.html',
  zaloUrl: 'https://zalo.me/0977921597',
  communityUrl: 'https://zalo.me/g/awu9n0xkftxzzocsrjlw',
  phoneUrl: 'tel:+84977921597',
  email: 'contact.nhatradehoc@gmail.com',
  leadEndpoint: 'https://formsubmit.co/ajax/contact.nhatradehoc@gmail.com',
  leadTimeoutMs: 15000,
  offer: Object.freeze({
    storageKey: 'tci_first_visit_started_at',
    durationMs: 72 * 60 * 60 * 1000,
    standardVnd: 15000000,
    discountedVnd: 11250000,
    standardUsdt: 555,
    discountedUsdt: 420,
  }),
  payment: Object.freeze({
    bankCode: '970407',
    bankName: 'Techcombank',
    account: '689689259999',
    accountName: 'BUI THANH CONG',
    memo: 'KHDT_TEN_SDT',
    usdtWallet: '0x0b0661895a815cd929af65bcad8d55527d86f763',
    network: 'BEP20',
    binancePayId: '879904257',
    adminUrl: 'https://t.me/mmto1b',
  }),
});

export const prefersLowMotion = () => Boolean(
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  || navigator.connection?.saveData,
);

export const focusableElements = (container) => [...container.querySelectorAll(
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
)].filter((element) => !element.closest('[hidden], [inert]') && element.getClientRects().length);

export const trapFocus = (event, container) => {
  if (event.key !== 'Tab') return;
  const items = focusableElements(container);
  if (!items.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = items[0], last = items.at(-1);
  if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
};

const scrollLocks = new Set();
let previousOverflow = '';
export const lockPageScroll = (owner, active) => {
  if (active) {
    if (!scrollLocks.size) previousOverflow = document.body.style.overflow;
    scrollLocks.add(owner);
    document.body.style.overflow = 'hidden';
  } else {
    const wasLocked = scrollLocks.delete(owner);
    if (wasLocked && !scrollLocks.size) document.body.style.overflow = previousOverflow;
  }
};

let noticeTimer;
export const showNotice = (message) => {
  let toast = document.querySelector('.private-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'private-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4000);
};

export const copyText = async (value) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch { /* Some browsers deny clipboard access; try the selection fallback. */ }
  const previousFocus = document.activeElement;
  const helper = document.createElement('textarea');
  helper.value = value;
  helper.setAttribute('readonly', '');
  helper.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.append(helper);
  helper.select();
  let copied = false;
  try { copied = Boolean(document.execCommand?.('copy')); }
  catch { copied = false; }
  helper.remove();
  previousFocus?.focus?.({ preventScroll: true });
  return copied;
};

export const scrollToSection = (target, focus = false) => {
  if (!target) return;
  target.scrollIntoView({ behavior: prefersLowMotion() ? 'auto' : 'smooth', block: 'start' });
  if (focus) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
};
