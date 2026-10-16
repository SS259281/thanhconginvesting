import { SITE_CONFIG } from './site-config.js';

let initialized = false;
export function initLeadForm() {
  if (initialized) return;
  initialized = true;
  const form = document.querySelector('.private-lead-form');
  if (!form) return;
  let pending = false;
  const notice = (successful, message) => {
    const item = document.createElement('div');
    item.className = successful ? 'private-form-success' : 'private-form-error';
    item.setAttribute('role', successful ? 'status' : 'alert');
    if (successful) {
      const title = document.createElement('strong');
      title.textContent = 'Yêu cầu đã được gửi.';
      const details = document.createElement('span');
      details.textContent = 'Chúng tôi sẽ liên hệ theo kênh bạn đã chọn.';
      item.append(title, details);
    } else item.textContent = message;
    form.append(item);
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    form.querySelectorAll('.private-form-success, .private-form-error, .tci-lead-prefill-note').forEach((item) => item.remove());
    // Preserve the existing honeypot while avoiding a network request for filled traps.
    if (form.elements.namedItem('_honey')?.value) return;
    const submit = form.querySelector('button[type="submit"]');
    const originalLabel = submit?.textContent || 'Gửi yêu cầu trao đổi';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), SITE_CONFIG.leadTimeoutMs);
    pending = true;
    form.setAttribute('aria-busy', 'true');
    if (submit) { submit.disabled = true; submit.textContent = 'Đang gửi…'; }
    try {
      const data = new FormData(form);
      data.append('_subject', 'Yêu cầu tư vấn mới từ Thành Công Investing');
      data.append('_template', 'table');
      data.append('_captcha', 'false');
      const response = await fetch(SITE_CONFIG.leadEndpoint, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      if (!response.ok) throw new Error('submit_failed');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('submit_failed');
      notice(true);
      form.reset();
    } catch {
      notice(false, 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn Zalo 0977 921 597.');
    } finally {
      window.clearTimeout(timeout);
      pending = false;
      form.removeAttribute('aria-busy');
      if (submit) { submit.disabled = false; submit.textContent = originalLabel; }
    }
  });
}
