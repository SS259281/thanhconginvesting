import { buildTradeChart, escapeHtml, formatNumber } from './charts.js';

let proofDataPromise;
const instances = new WeakMap();

export function loadProofData() {
  proofDataPromise ??= fetch(new URL('../content/proof-data.json', import.meta.url))
    .then((response) => {
      if (!response.ok) throw new Error('Không tải được dữ liệu bằng chứng.');
      return response.json();
    })
    .catch((error) => {
      proofDataPromise = undefined;
      throw error;
    });
  return proofDataPromise;
}

/** Desktop and mobile share these templates and the same source data. */
export function renderProofContent(key, data, surface = 'desktop') {
  if (key === 'mt5') {
    const report = data.mt5;
    return `<div class="private-proof-panel-grid tci-proof-panel"><div class="private-proof-copy"><span class="private-kicker">Báo cáo MT5 · ${escapeHtml(report.period)}</span><h3>${escapeHtml(report.title)}</h3><div class="tci-report-meta"><span>${report.trades} giao dịch</span><span>Profit factor ${report.profitFactor.toFixed(2)}</span><span>Win rate ${report.winRate.toFixed(2)}%</span></div></div><div class="tci-account-card"><div class="tci-account-card__top"><span>Số dư cuối kỳ</span><strong>${formatNumber(report.final)} USD</strong></div>${buildTradeChart(report, surface === 'desktop' ? 'tciTradeAreaAug04' : 'tciTradeAreaAug04Mobile')}<div class="tci-account-metrics"><div><span>Lợi nhuận ròng</span><strong>+${formatNumber(report.netProfit)} USD</strong></div><div><span>Profit factor</span><strong>${report.profitFactor.toFixed(2)}</strong></div><div><span>Win rate</span><strong>${report.winRate.toFixed(2)}%</strong></div><div><span>Max drawdown</span><strong>${report.drawdown.toFixed(2)}%</strong></div></div><p class="tci-report-note">${escapeHtml(report.riskNote)}</p></div></div>`;
  }
  if (key === 'crypto') {
    const crypto = data.crypto;
    return `<div class="private-proof-panel-grid tci-proof-panel tci-proof-panel--crypto"><div class="private-proof-copy"><span class="private-kicker">${escapeHtml(crypto.kicker)}</span><h3>${escapeHtml(crypto.title)}</h3><p>${escapeHtml(crypto.description)}</p><div class="private-crypto-pair"><div class="is-return"><span>${escapeHtml(crypto.roiLabel)}</span><strong>${escapeHtml(crypto.roi)}</strong></div><div class="is-risk"><span>${escapeHtml(crypto.cutoffLabel)}</span><strong>${escapeHtml(crypto.cutoff)}</strong></div></div></div><figure class="tci-performance-figure"><img src="${escapeHtml(crypto.image)}" alt="${escapeHtml(crypto.imageAlt)}" loading="lazy" decoding="async"/></figure></div>`;
  }
  const ssi = data.ssi;
  return `<div class="private-proof-panel-grid tci-proof-panel"><div class="private-proof-copy"><span class="private-kicker">${escapeHtml(ssi.kicker)}</span><h3>${escapeHtml(ssi.title)}</h3><p>${escapeHtml(ssi.description)}</p></div><div class="private-kpi-grid private-kpi-grid-spotlight private-kpi-impact"><div><strong>${ssi.customers}</strong><span>${escapeHtml(ssi.customersLabel)}</span></div><div><strong>${escapeHtml(ssi.aum)}</strong><span>${escapeHtml(ssi.aumLabel)}</span></div></div></div>`;
}

export async function initProofTabs({ root = document } = {}) {
  const section = root.querySelector('#private-proof');
  if (!section) return null;
  if (instances.has(section)) return instances.get(section);
  const pending = loadProofData().then((data) => {
    const panel = section.querySelector('.private-proof-desktop-panel');
    const tablist = section.querySelector('.private-proof-tabs');
    const buttons = data.tabs.map((tab) => section.querySelector(`#${tab.id}`)).filter(Boolean);
    if (!panel || !tablist || !buttons.length) return null;
    const abort = new AbortController();
    const options = { signal: abort.signal };
    let selectedKey;
    panel.id ||= 'private-proof-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    tablist.setAttribute('role', 'tablist');

    const select = (key, moveFocus = false) => {
      const tab = data.tabs.find((item) => item.key === key) || data.tabs[0];
      const activeButton = buttons.find((button) => button.id === tab.id);
      if (!activeButton) return;
      buttons.forEach((button) => {
        const active = button === activeButton;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      if (selectedKey !== tab.key) panel.innerHTML = renderProofContent(tab.key, data);
      selectedKey = tab.key;
      if (moveFocus) activeButton.focus();
    };

    buttons.forEach((button) => {
      const tab = data.tabs.find((item) => item.id === button.id);
      button.textContent = tab.label;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', panel.id);
      button.addEventListener('click', () => select(tab.key), options);
      button.addEventListener('keydown', (event) => {
        const index = buttons.indexOf(button);
        let next;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(data.tabs.find((item) => item.id === buttons[next].id).key, true);
      }, options);
    });

    section.querySelectorAll('.private-proof-mobile-accordion details').forEach((detail, index) => {
      const tab = data.tabs[index];
      const summary = detail.querySelector('summary');
      if (!tab || !summary) return;
      summary.replaceChildren(root.createTextNode(tab.label));
      const icon = root.createElement('span');
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '+';
      summary.append(icon);
      const template = root.createElement('template');
      template.innerHTML = renderProofContent(tab.key, data, 'mobile');
      detail.replaceChildren(summary, template.content);
    });
    const initial = data.tabs.find((tab) => section.querySelector(`#${tab.id}`)?.getAttribute('aria-selected') === 'true');
    select(initial?.key || data.tabs[0].key);
    return { select, data, destroy() { abort.abort(); instances.delete(section); } };
  }).catch(() => {
    // Retain the server-rendered proof when its data cannot be fetched.
    instances.delete(section);
    return null;
  });
  instances.set(section, pending);
  return pending;
}
