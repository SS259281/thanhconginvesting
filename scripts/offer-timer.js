import { SITE_CONFIG } from './site-config.js';
import { formatNumber } from './charts.js';

export const OFFER_KEY = SITE_CONFIG.offer.storageKey;
export const OFFER_DURATION = SITE_CONFIG.offer.durationMs;
export const COURSE_PRICES = Object.freeze({
  regularVnd: SITE_CONFIG.offer.standardVnd,
  offerVnd: SITE_CONFIG.offer.discountedVnd,
  regularUsdt: SITE_CONFIG.offer.standardUsdt,
  offerUsdt: SITE_CONFIG.offer.discountedUsdt
});

const instances = new WeakMap();

export function initOfferTimer({ root = document, now = () => Date.now(), storage } = {}) {
  if (instances.has(root)) return instances.get(root);
  let firstVisit = now();
  try {
    const offerStorage = storage === undefined ? root.defaultView.localStorage : storage;
    firstVisit = Number(offerStorage.getItem(OFFER_KEY)) || now();
    if (!offerStorage.getItem(OFFER_KEY)) offerStorage.setItem(OFFER_KEY, String(firstVisit));
  } catch {
    // Storage blocked: preserve the original 72-hour offer for this visit.
  }
  const getPricing = () => {
    const remaining = Math.max(0, firstVisit + OFFER_DURATION - now());
    const active = remaining > 0;
    return {
      remaining, active,
      vnd: active ? COURSE_PRICES.offerVnd : COURSE_PRICES.regularVnd,
      usdt: active ? COURSE_PRICES.offerUsdt : COURSE_PRICES.regularUsdt
    };
  };
  const update = () => {
    const { active, remaining, vnd } = getPricing();
    const hours = String(Math.floor(remaining / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
    root.querySelectorAll('.private-offer-clock').forEach((clock) => {
      clock.dataset.active = String(active);
      const output = clock.querySelector('strong');
      if (output) output.textContent = active ? `Còn ${hours}:${minutes}:${seconds}` : 'Ưu đãi đã kết thúc';
    });
    root.querySelectorAll('.private-price-card .private-price-row.is-highlight strong, .private-scheduler-footer strong').forEach((price) => {
      price.textContent = `${formatNumber(vnd, 0)}đ`;
    });
  };
  update();
  const interval = root.defaultView.setInterval(update, 1000);
  const controller = { getPricing, update, firstVisit, destroy() { root.defaultView.clearInterval(interval); instances.delete(root); } };
  instances.set(root, controller);
  return controller;
}
