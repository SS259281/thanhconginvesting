import { escapeHtml, formatNumber } from './charts.js';
import { initOfferTimer } from './offer-timer.js';
import { SITE_CONFIG, lockPageScroll } from './site-config.js';

const instances = new WeakMap();
const DAY_LABELS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ensurePaymentModal(root) {
  let modal = root.querySelector('.tci-payment-modal');
  if (modal) return modal;
  modal = root.createElement('section');
  modal.className = 'tci-payment-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="tci-payment-dialog"><header class="tci-payment-head"><span>Thanh toán bảo mật</span><h3 id="tci-payment-title">Thanh toán khóa học</h3><button class="tci-payment-close" type="button" aria-label="Đóng">×</button></header><div class="tci-payment-scroll"><div class="tci-payment-summary"></div><div class="tci-payment-tabs" role="tablist"><button class="tci-payment-tab is-active" type="button" data-pay-tab="bank">Banking VN</button><button class="tci-payment-tab" type="button" data-pay-tab="usdt">USDT (BEP20)</button><button class="tci-payment-tab" type="button" data-pay-tab="binance">Binance Pay</button></div><div class="tci-payment-panel" data-pay-panel="bank"><img class="tci-payment-qr" data-bank-qr alt="Mã VietQR thanh toán khóa học"><div class="tci-payment-details"><div class="tci-payment-row"><span>Ngân hàng</span><strong>Techcombank</strong></div><div class="tci-payment-row"><span>Số tài khoản</span><strong>6896 8925 9999</strong><button class="tci-copy" type="button" data-copy="689689259999">Sao chép</button></div><div class="tci-payment-row"><span>Chủ tài khoản</span><strong>BUI THANH CONG</strong></div><div class="tci-payment-row"><span>Nội dung bắt buộc</span><strong>KHDT_TEN_SDT</strong><button class="tci-copy" type="button" data-copy="KHDT_TEN_SDT">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-bank-amount></strong></div></div></div><div class="tci-payment-panel" data-pay-panel="usdt" hidden><img class="tci-payment-qr" data-usdt-qr alt="Mã QR ví USDT mạng BEP20"><div class="tci-payment-details"><div class="tci-payment-row"><span>Mạng lưới</span><strong>BEP20 · BNB Smart Chain</strong></div><div class="tci-payment-row"><span>Địa chỉ ví</span><strong>0x0b0661895a815cd929af65bcad8d55527d86f763</strong><button class="tci-copy" type="button" data-copy="0x0b0661895a815cd929af65bcad8d55527d86f763">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-usdt-amount></strong></div></div><p class="tci-payment-warning">Chỉ gửi USDT qua mạng BEP20 (BSC). Gửi sai mạng có thể làm mất tài sản.</p></div><div class="tci-payment-panel" data-pay-panel="binance" hidden><img class="tci-payment-qr" data-binance-qr alt="Mã QR Binance Pay"><div class="tci-payment-details"><div class="tci-payment-row"><span>Phương thức</span><strong>Binance Pay</strong></div><div class="tci-payment-row"><span>Pay ID</span><strong>879904257</strong><button class="tci-copy" type="button" data-copy="879904257">Sao chép</button></div><div class="tci-payment-row is-total"><span>Số tiền</span><strong data-binance-amount></strong></div></div></div><a class="tci-payment-confirm" data-confirm-payment href="https://t.me/mmto1b" target="_blank" rel="noreferrer">Liên hệ Admin sau khi chuyển</a></div></div>`;
  root.body.append(modal);
  return modal;
}

export function initCourseSchedule({ root = document, offer } = {}) {
  const course = root.querySelector('#private-course');
  if (!course) return null;
  if (instances.has(course)) return instances.get(course);
  const dateInput = course.querySelector('input[type="date"]');
  const timeSelect = course.querySelector('.private-scheduler-grid select');
  const dayButtons = [...course.querySelectorAll('.private-day-selector button[aria-pressed]')];
  const register = course.querySelector('.private-scheduler-footer button');
  if (!dateInput || !timeSelect || !dayButtons.length || !register) return null;
  const offerController = offer || initOfferTimer({ root });
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const modal = ensurePaymentModal(root);
  const dialog = modal.querySelector('.tci-payment-dialog');
  modal.id ||= 'tci-payment-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'tci-payment-title');
  dialog.tabIndex = -1;
  register.setAttribute('aria-haspopup', 'dialog');
  register.setAttribute('aria-controls', modal.id);
  let autoSelectedButton = null;
  let previousFocus = null;
  let inerted = [];
  let paymentOpen = false;
  let autoNote = course.querySelector('.tci-auto-day-note');
  if (!autoNote) {
    autoNote = root.createElement('p');
    autoNote.className = 'tci-auto-day-note';
    dateInput.parentElement.insertAdjacentElement('afterend', autoNote);
  }
  autoNote.id ||= 'tci-schedule-status';
  autoNote.setAttribute('aria-live', 'polite');
  autoNote.setAttribute('aria-atomic', 'true');
  dateInput.setAttribute('aria-describedby', autoNote.id);
  const selectedDays = () => dayButtons.filter((button) => button.getAttribute('aria-pressed') === 'true');
  const setDay = (button, selected) => {
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('tci-day-selected', selected);
  };
  const showMessage = (message) => { autoNote.textContent = message; };

  dayButtons.forEach((button) => button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') === 'true';
    if (!selected && selectedDays().length >= 2) {
      showMessage('Bạn chỉ có thể chọn tối đa 2 buổi học trong tuần.');
      return;
    }
    setDay(button, !selected);
    showMessage(!selected
      ? (selectedDays().length === 2 ? 'Đã chọn đủ 2 buổi học trong tuần.' : 'Đã chọn 1 buổi. Vui lòng chọn thêm 1 ngày học.')
      : 'Vui lòng chọn thêm 1 ngày học.');
  }, options));

  dateInput.addEventListener('change', () => {
    dateInput.removeAttribute('aria-invalid');
    if (!dateInput.value) return;
    const day = new Date(`${dateInput.value}T12:00:00`).getDay();
    const target = dayButtons.find((button) => button.textContent.trim() === DAY_LABELS[day]);
    if (autoSelectedButton && autoSelectedButton !== target) setDay(autoSelectedButton, false);
    if (target && target.getAttribute('aria-pressed') !== 'true' && selectedDays().length >= 2) {
      const toRemove = selectedDays().find((button) => button !== target);
      if (toRemove) setDay(toRemove, false);
    }
    if (target) setDay(target, true);
    autoSelectedButton = target || null;
    showMessage(target ? `Đã tự động chọn ${DAY_LABELS[day]} theo ngày bắt đầu dự kiến.` : '');
  }, options);

  const validateSchedule = () => {
    if (!dateInput.value) {
      showMessage('Vui lòng chọn ngày bắt đầu dự kiến.');
      dateInput.setAttribute('aria-invalid', 'true');
      dateInput.focus();
      return false;
    }
    const selected = selectedDays();
    if (selected.length !== 2) {
      showMessage('Vui lòng chọn đủ 2 buổi học trong tuần.');
      dayButtons.find((button) => button.getAttribute('aria-pressed') !== 'true')?.focus();
      return false;
    }
    const dayValue = (button) => DAY_LABELS.indexOf(button.textContent.trim());
    const rawDistance = Math.abs(dayValue(selected[0]) - dayValue(selected[1]));
    const weeklyDistance = Math.min(rawDistance, 7 - rawDistance);
    if (weeklyDistance < 3) {
      showMessage('Vui lòng chọn hai buổi học cách nhau ít nhất 2 ngày nghỉ.');
      selected[1].focus();
      return false;
    }
    return true;
  };

  const visibleFocusables = () => [...modal.querySelectorAll(FOCUSABLE)]
    .filter((element) => !element.closest('[hidden]') && element.getClientRects().length > 0);
  const closeModal = () => {
    if (!paymentOpen) return;
    paymentOpen = false;
    modal.hidden = true;
    root.body.classList.remove('tci-modal-open');
    lockPageScroll('payment', false);
    inerted.forEach(([element, wasInert]) => { element.inert = wasInert; });
    inerted = [];
    if (previousFocus?.isConnected) previousFocus.focus();
  };
  const openModal = () => {
    if (!validateSchedule()) return false;
    const days = selectedDays().map((button) => button.textContent.trim()).join(' & ');
    const { vnd: bankValue, usdt: usdtValue } = offerController.getPricing();
    const startDate = dateInput.value;
    const time = timeSelect.value;
    modal.querySelector('.tci-payment-summary').innerHTML = `<div><span>Lịch học</span><strong>${escapeHtml(days)}</strong></div><div><span>Khung giờ</span><strong>${escapeHtml(time)}</strong></div><div><span>Ngày bắt đầu</span><strong>${escapeHtml(startDate)}</strong></div>`;
    modal.querySelector('[data-bank-amount]').textContent = `${formatNumber(bankValue, 0)} VND`;
    modal.querySelector('[data-usdt-amount]').textContent = `${usdtValue} USDT`;
    modal.querySelector('[data-binance-amount]').textContent = `${usdtValue} USDT`;
    const payment = SITE_CONFIG.payment;
    modal.querySelector('[data-bank-qr]').src = `https://img.vietqr.io/image/${payment.bankCode}-${payment.account}-compact2.png?amount=${bankValue}&addInfo=${encodeURIComponent(payment.memo)}&accountName=${encodeURIComponent(payment.accountName)}`;
    modal.querySelector('[data-usdt-qr]').src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payment.usdtWallet)}`;
    modal.querySelector('[data-binance-qr]').src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payment.binancePayId)}`;
    const message = `Chào Admin, tôi đã thanh toán khóa học.\n- Lịch: ${days}\n- Giờ: ${time}\n- Ngày bắt đầu: ${startDate}\n- Giá: ${formatNumber(bankValue, 0)} VND`;
    modal.querySelector('[data-confirm-payment]').href = `${payment.adminUrl}?text=${encodeURIComponent(message)}`;
    previousFocus = root.activeElement;
    root.dispatchEvent(new root.defaultView.CustomEvent('tci:overlay-open', { detail: 'payment' }));
    modal.hidden = false;
    paymentOpen = true;
    root.body.classList.add('tci-modal-open');
    lockPageScroll('payment', true);
    inerted = [...root.body.children].filter((element) => element !== modal && !element.contains(modal))
      .map((element) => [element, element.inert]);
    inerted.forEach(([element]) => { element.inert = true; });
    modal.querySelector('.tci-payment-close').focus();
    return true;
  };
  register.addEventListener('click', openModal, options);
  modal.querySelector('.tci-payment-close').addEventListener('click', closeModal, options);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); }, options);
  root.addEventListener('keydown', (event) => {
    if (!paymentOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeModal();
    }
    if (event.key !== 'Tab') return;
    const focusables = visibleFocusables();
    const first = focusables[0];
    const last = focusables.at(-1);
    if (!first) { event.preventDefault(); dialog.focus(); return; }
    if (event.shiftKey && (root.activeElement === first || !modal.contains(root.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (root.activeElement === last || !modal.contains(root.activeElement))) {
      event.preventDefault(); first.focus();
    }
  }, { ...options, capture: true });

  const payTabs = [...modal.querySelectorAll('[data-pay-tab]')];
  const activatePayTab = (tab, focus = false) => {
    payTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    modal.querySelectorAll('[data-pay-panel]').forEach((panel) => { panel.hidden = panel.dataset.payPanel !== tab.dataset.payTab; });
    if (focus) tab.focus();
  };
  modal.querySelector('.tci-payment-tabs').setAttribute('aria-label', 'Phương thức thanh toán');
  payTabs.forEach((tab, index) => {
    tab.id ||= `tci-pay-tab-${tab.dataset.payTab}`;
    tab.setAttribute('role', 'tab');
    const panel = modal.querySelector(`[data-pay-panel="${tab.dataset.payTab}"]`);
    panel.id ||= `tci-pay-panel-${tab.dataset.payTab}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.setAttribute('aria-controls', panel.id);
    tab.addEventListener('click', () => activatePayTab(tab), options);
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % payTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + payTabs.length) % payTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = payTabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activatePayTab(payTabs[next], true);
    }, options);
  });
  activatePayTab(payTabs.find((tab) => tab.classList.contains('is-active')) || payTabs[0]);

  let copyStatus = modal.querySelector('[data-copy-status]');
  if (!copyStatus) {
    copyStatus = root.createElement('p');
    copyStatus.className = 'private-sr-only';
    copyStatus.dataset.copyStatus = '';
    copyStatus.setAttribute('role', 'status');
    modal.querySelector('.tci-payment-scroll').append(copyStatus);
  }
  modal.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    let copied = false;
    try {
      await root.defaultView.navigator.clipboard.writeText(button.dataset.copy);
      copied = true;
    } catch {
      const helper = root.createElement('textarea');
      helper.value = button.dataset.copy;
      helper.setAttribute('aria-hidden', 'true');
      helper.style.cssText = 'position:fixed;left:-9999px;top:0;';
      modal.append(helper);
      helper.select();
      try { copied = root.execCommand('copy'); } catch { /* Report a copy failure. */ }
      helper.remove();
      button.focus();
    }
    const original = button.textContent;
    button.textContent = copied ? 'Đã chép' : 'Chưa sao chép được';
    copyStatus.textContent = copied ? 'Đã sao chép thông tin thanh toán.' : 'Không thể sao chép. Vui lòng chọn và sao chép thông tin hiển thị.';
    root.defaultView.setTimeout(() => { button.textContent = original; }, 1200);
  }, options));
  const controller = { openModal, closeModal, validateSchedule, selectedDays, modal, destroy() { closeModal(); abort.abort(); instances.delete(course); } };
  instances.set(course, controller);
  return controller;
}
