import { SITE_CONFIG, trapFocus, lockPageScroll, scrollToSection } from './site-config.js';

let initialized = false;
export function initChat() {
  if (initialized) return;
  initialized = true;
  const launcher = document.querySelector('.private-chat-launcher');
  const panel = document.querySelector('.private-chat-panel');
  const messages = panel?.querySelector('.private-chat-messages');
  const quickActions = panel?.querySelector('.private-chat-quick-actions');
  const inputForm = panel?.querySelector('form');
  const input = inputForm?.querySelector('input');
  const close = panel?.querySelector('header button');
  if (!launcher || !panel || !messages || !quickActions || !inputForm || !input || !close) return;
  const mobile = window.matchMedia('(max-width: 768px)');
  let returnFocus = null;
  let suggestedNeed = '';
  let fallbackCount = 0;
  panel.tabIndex = -1;
  launcher.setAttribute('aria-controls', panel.id);
  launcher.setAttribute('aria-haspopup', 'dialog');
  quickActions.setAttribute('aria-label', 'Lựa chọn nhanh');
  const setOpen = (open, restoreFocus = true) => {
    if (open) {
      returnFocus = document.activeElement;
      document.dispatchEvent(new CustomEvent('tci:overlay-open', { detail: 'chat' }));
    }
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('tci-chat-open', open);
    launcher.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    panel.setAttribute('role', mobile.matches ? 'dialog' : 'region');
    if (mobile.matches) panel.setAttribute('aria-modal', String(open));
    else panel.removeAttribute('aria-modal');
    lockPageScroll('chat', open && mobile.matches);
    if (open) (quickActions.querySelector('button') || input).focus({ preventScroll: true });
    else if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };
  const addMessage = (text, role = 'assistant', link = null) => {
    const item = document.createElement('p');
    item.className = role === 'user' ? 'is-user' : 'is-assistant';
    item.textContent = text;
    if (link) {
      const anchor = document.createElement('a');
      anchor.className = 'tci-chat-menu-link';
      anchor.href = link.href;
      anchor.textContent = link.label;
      item.append(document.createElement('br'), anchor);
    }
    messages.append(item);
    messages.scrollTop = messages.scrollHeight;
  };
  const setActions = (actions = []) => {
    const restoreActionFocus = quickActions.contains(document.activeElement);
    quickActions.replaceChildren();
    actions.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.chatAction = action.key;
      button.textContent = action.label;
      quickActions.append(button);
    });
    if (restoreActionFocus) quickActions.querySelector('button')?.focus({ preventScroll: true });
  };
  const backMenu = { key: 'menu', label: 'Về menu chính' };
  const mainActions = [
    { key: 'open', label: 'Mở tài khoản SSI' },
    { key: 'existing', label: 'Tôi đã có tài khoản SSI' },
    { key: 'other', label: 'Tôi đang ở công ty khác' },
    { key: 'course', label: 'Hỏi về khóa học' },
    { key: 'contact', label: 'Trao đổi trực tiếp' },
  ];
  const showMenu = (returning = false) => {
    if (returning) addMessage('Bạn muốn tiếp tục nhu cầu trước đó hay chọn nội dung khác?');
    else if (!messages.children.length) addMessage('Chào bạn. Tôi là Thành Công AI — trợ lý thông tin trên website. Tôi có thể hướng dẫn lộ trình tại SSI, tìm hiểu khóa học hoặc kết nối trực tiếp với Thành Công. Tôi không đưa khuyến nghị mua/bán. Bạn muốn tìm hiểu nội dung nào trước?');
    setActions(mainActions);
  };
  const showLead = () => {
    addMessage('Tôi chỉ cần thông tin cơ bản để Thành Công liên hệ. Vui lòng không gửi OTP, mật khẩu, số tài khoản hoặc ảnh giấy tờ.');
    quickActions.replaceChildren();
    const form = document.createElement('form');
    form.className = 'tci-chat-lead';
    form.innerHTML = `<label><span>Tôi nên xưng hô với bạn thế nào?</span><input name="name" autocomplete="name" required placeholder="Họ và tên"/></label><label><span>Nhu cầu chính</span><select name="need" required><option value="">Chọn nhu cầu</option><option>Mở tài khoản SSI</option><option>Chuyển mã chuyên gia</option><option>Khóa học</option><option>Dịch vụ chuyên sâu</option></select></label><label><span>Kênh liên hệ</span><select name="channel" required><option value="Zalo">Zalo</option><option value="Điện thoại">Điện thoại</option><option value="Email">Email</option></select></label><label><span>Số điện thoại hoặc email</span><input name="contact" required placeholder="Thông tin liên hệ"/></label><label class="tci-chat-contact"><input type="checkbox" required/> Tôi đồng ý để Thành Công Investing sử dụng thông tin này nhằm liên hệ về nhu cầu đã chọn.</label><button type="submit">Điền vào biểu mẫu tư vấn</button>`;
    const needLabels = { 'Mở tài khoản': 'Mở tài khoản SSI', 'Chuyển mã': 'Chuyển mã chuyên gia', 'Khóa học': 'Khóa học', 'Ủy thác đầu tư': 'Dịch vụ chuyên sâu' };
    form.elements.namedItem('need').value = needLabels[suggestedNeed] || '';
    quickActions.append(form);
    form.elements.namedItem('name').focus({ preventScroll: true });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lead = document.querySelector('.private-lead-form');
      if (!lead) {
        addMessage('Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn Zalo 0977 921 597.');
        setActions([{ key: 'zalo', label: 'Mở Zalo' }, backMenu]);
        return;
      }
      if (lead.getAttribute('aria-busy') === 'true') {
        addMessage('Biểu mẫu tư vấn đang gửi yêu cầu. Vui lòng chờ kết quả trước khi bổ sung thông tin.');
        return;
      }
      const data = new FormData(form);
      const mappings = { 'Mở tài khoản SSI': 'Mở tài khoản', 'Chuyển mã chuyên gia': 'Chuyển mã', 'Khóa học': 'Khóa học', 'Dịch vụ chuyên sâu': 'Ủy thác đầu tư' };
      const name = lead.elements.namedItem('name');
      const need = lead.elements.namedItem('need');
      const phone = lead.elements.namedItem('phone');
      const email = lead.elements.namedItem('email');
      if (name) name.value = String(data.get('name') || '').trim();
      if (need) need.value = mappings[data.get('need')] || '';
      const contact = String(data.get('contact') || '').trim();
      if (contact.includes('@')) { if (email) email.value = contact; }
      else if (phone) phone.value = contact;
      const channel = [...lead.querySelectorAll('input[name="channel"]')].find((item) => item.value === data.get('channel'));
      if (channel) channel.checked = true;
      const consent = lead.elements.namedItem('consent');
      if (consent) consent.checked = false;
      addMessage(`${data.get('name')}: ${data.get('need')}`, 'user');
      // This is a local prefill. Only the real lead form can confirm a successful submission.
      const acknowledgement = 'Thông tin đã được điền vào biểu mẫu tư vấn bên dưới, chưa được gửi. Vui lòng kiểm tra, bổ sung thông tin còn thiếu và bấm “Gửi yêu cầu trao đổi” để gửi yêu cầu.';
      addMessage(acknowledgement);
      lead.querySelectorAll('.private-form-success, .private-form-error, .tci-lead-prefill-note').forEach((item) => item.remove());
      const prefillNotice = document.createElement('p');
      prefillNotice.className = 'private-form-privacy tci-lead-prefill-note';
      prefillNotice.setAttribute('role', 'status');
      prefillNotice.textContent = acknowledgement;
      lead.prepend(prefillNotice);
      setActions([{ key: 'zalo', label: 'Mở Zalo' }, backMenu]);
      setOpen(false, false);
      scrollToSection(document.querySelector('#private-lead'));
      const missing = [...lead.querySelectorAll('input[required], select[required]')].find((item) => item.type === 'checkbox' ? !item.checked : !item.value);
      (missing || lead.querySelector('button[type="submit"]'))?.focus({ preventScroll: true });
    });
  };
  const responses = {
    open: () => {
      suggestedNeed = 'Mở tài khoản';
      addMessage('Bạn có thể mở tài khoản SSI qua liên kết chính thức có gắn sẵn mã chuyên gia 3186. Quy trình gồm mở liên kết, tạo tài khoản, hoàn tất eKYC và ký hợp đồng điện tử. Bạn không cần gửi OTP, mật khẩu hoặc ảnh giấy tờ cho tôi.', 'assistant', { href: SITE_CONFIG.openAccountGuide, label: 'Xem hướng dẫn mở tài khoản SSI' });
      setActions([{ key: 'openlink', label: 'Mở liên kết SSI' }, { key: 'benefits', label: 'Xem quyền lợi' }, { key: 'contact', label: 'Cần hỗ trợ' }, backMenu]);
    },
    existing: () => {
      suggestedNeed = 'Chuyển mã';
      addMessage('Bạn có thể gửi yêu cầu chuyển mã chuyên gia tư vấn về Bùi Thành Công — mã 3186 — trên SSI iBoard Pro. Bạn muốn xem hướng dẫn hay cần hỗ trợ trực tiếp?');
      setActions([{ key: 'transfer', label: 'Xem hướng dẫn chuyển mã' }, { key: 'zalo', label: 'Nhắn Zalo' }, { key: 'sent', label: 'Tôi đã gửi yêu cầu' }, backMenu]);
    },
    other: () => {
      suggestedNeed = 'Mở tài khoản';
      addMessage('Bạn có thể mở tài khoản SSI nếu chưa có, hoặc chuyển mã chuyên gia 3186, sau đó nộp tiền và bắt đầu kế hoạch đầu tư tại SSI.');
      setActions([{ key: 'open', label: 'Mở tài khoản SSI' }, { key: 'zalo', label: 'Hỏi về chuyển tài sản' }, { key: 'zalo', label: 'Nhắn Zalo' }, backMenu]);
    },
    course: () => {
      suggestedNeed = 'Khóa học';
      addMessage('Khóa học gồm 8 buổi thực chiến, theo hình thức 1:1, tổ chức online hoặc offline tại Hà Nội. Bạn muốn xem nội dung, học phí hay lịch học?');
      setActions([{ key: 'coursecontent', label: 'Nội dung 8 buổi' }, { key: 'fees', label: 'Học phí & ưu đãi' }, { key: 'schedule', label: 'Lịch học' }, { key: 'lead', label: 'Tư vấn đầu vào' }, backMenu]);
    },
    benefits: () => {
      addMessage('Quyền lợi gồm mức phí ưu đãi theo điều kiện, tư vấn 1:1 và hỗ trợ tài khoản trực tiếp. Phí, margin, ưu đãi và thể lệ cần xác nhận lại tại thời điểm đăng ký.');
      setActions([{ key: 'fees', label: 'Phí & margin' }, { key: 'openlink', label: 'Mở tài khoản ngay' }, { key: 'zalo', label: 'Nhắn Zalo' }, backMenu]);
    },
    fees: () => {
      addMessage('Thông tin trên website mang tính tham khảo và có điều kiện áp dụng. Phí 0,15% áp dụng cho khách hàng có NAV từ 100 triệu đồng; margin theo chương trình hiện hành của SSI. Mức phí, lãi suất, hạn mức và thời hạn chương trình cần được SSI xác nhận còn hiệu lực tại thời điểm đăng ký.');
      setActions([{ key: 'openlink', label: 'Mở tài khoản' }, { key: 'zalo', label: 'Nhắn Zalo để kiểm tra' }, backMenu]);
    },
    coursecontent: () => {
      addMessage('Nội dung gồm nguyên lý vận động thị trường, tư duy xác suất, quản trị rủi ro, thiết lập vị thế, giao dịch xu hướng/range và quy trình intraday.');
      setActions([{ key: 'schedule', label: 'Xem lịch học' }, { key: 'fees', label: 'Học phí & ưu đãi' }, backMenu]);
    },
    schedule: () => {
      suggestedNeed = 'Khóa học';
      addMessage('Bạn có thể học online hoặc offline tại Hà Nội, theo hình thức 1:1. Bạn muốn bắt đầu trong khoảng thời gian nào?');
      setActions([{ key: 'lead', label: 'Để lại thông tin' }, { key: 'course', label: 'Xem lại khóa học' }, backMenu]);
    },
    contact: () => {
      addMessage('Bạn có thể nhắn Zalo trực tiếp hoặc để lại thông tin để được liên hệ. Bạn muốn chọn cách nào?');
      setActions([{ key: 'zalo', label: 'Mở Zalo' }, { key: 'lead', label: 'Để lại thông tin' }, { key: 'call', label: 'Gọi 0977 921 597' }, backMenu]);
    },
    transfer: () => {
      addMessage('Bạn có thể gửi yêu cầu chuyển mã theo hướng dẫn chính thức của SSI hoặc liên hệ Thành Công để được hỗ trợ.');
      setActions([{ key: 'transferlink', label: 'Mở hướng dẫn SSI' }, { key: 'zalo', label: 'Nhắn Zalo' }, backMenu]);
    },
    sent: () => {
      addMessage('Cảm ơn bạn. Khi SSI xác nhận hoàn tất, bạn có thể nhắn Thành Công để kiểm tra kết nối hỗ trợ.');
      setActions([{ key: 'zalo', label: 'Nhắn Zalo' }, backMenu]);
    },
  };
  quickActions.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-chat-action]');
    if (!button) return;
    const action = button.dataset.chatAction;
    addMessage(button.textContent, 'user');
    if (action === 'menu') return showMenu(true);
    if (action === 'openlink') return window.open(SITE_CONFIG.openAccountUrl, '_blank', 'noopener,noreferrer');
    if (action === 'transferlink') return window.location.assign(SITE_CONFIG.transferGuide);
    if (action === 'zalo') return window.open(SITE_CONFIG.zaloUrl, '_blank', 'noopener,noreferrer');
    if (action === 'call') return window.location.assign(SITE_CONFIG.phoneUrl);
    if (action === 'lead') return showLead();
    responses[action]?.();
  });
  const answerFreeText = (question) => {
    const normalized = question.toLocaleLowerCase('vi');
    if (/otp|mật khẩu|password|lừa đảo|an toàn/.test(normalized)) {
      addMessage('Vì an toàn, vui lòng không gửi OTP, mật khẩu, số tài khoản hoặc ảnh giấy tờ qua chatbot. Nếu bạn nghi ngờ lừa đảo hoặc gặp lỗi hồ sơ, hãy nhắn trực tiếp Thành Công để được hỗ trợ.');
      setActions([{ key: 'zalo', label: 'Nhắn Zalo' }, backMenu]);
      return;
    }
    if (/mua|bán|mã nào|cổ phiếu nào|điểm vào|chốt lời/.test(normalized)) {
      addMessage('Tôi không thể đưa khuyến nghị mua/bán hoặc cam kết mức lợi nhuận cho một mã cụ thể. Tôi có thể giúp bạn tìm hiểu nguyên tắc quản trị rủi ro, quy trình hỗ trợ tại SSI hoặc kết nối trực tiếp với Thành Công.');
      setActions([{ key: 'contact', label: 'Trao đổi trực tiếp' }, backMenu]);
      return;
    }
    if (/mở tài khoản|ekyc|đăng ký ssi/.test(normalized)) return responses.open();
    if (/chuyển mã|đã có ssi|đổi môi giới|3186/.test(normalized)) return responses.existing();
    if (/công ty khác|vps|vnd|hsc|tcbs|dnse/.test(normalized)) return responses.other();
    if (/khóa học|học phí|giáo trình|lịch học/.test(normalized)) return responses.course();
    if (/phí|margin|lãi suất|ưu đãi/.test(normalized)) return responses.fees();
    if (/zalo|gọi|liên hệ|gặp/.test(normalized)) return responses.contact();
    fallbackCount += 1;
    if (fallbackCount > 1) {
      addMessage('Tôi vẫn chưa xác định được nhu cầu. Để tránh trả lời sai, tôi có thể chuyển bạn sang Thành Công qua Zalo hoặc điện thoại.');
      setActions([{ key: 'zalo', label: 'Mở Zalo' }, { key: 'call', label: 'Gọi điện' }, backMenu]);
    } else {
      addMessage('Tôi chưa hiểu chính xác ý bạn. Bạn có thể chọn một nội dung gần nhất bên dưới hoặc viết lại câu hỏi ngắn hơn.');
      setActions([{ key: 'open', label: 'Mở tài khoản' }, { key: 'existing', label: 'Chuyển mã' }, { key: 'course', label: 'Khóa học' }, { key: 'fees', label: 'Phí & margin' }, { key: 'contact', label: 'Gặp Thành Công' }]);
    }
  };
  inputForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    answerFreeText(question);
  });
  launcher.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
  close.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (!panel.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    else if (mobile.matches) trapFocus(event, panel);
  });
  document.addEventListener('tci:overlay-open', (event) => {
    if (event.detail !== 'chat' && panel.classList.contains('is-open')) setOpen(false, false);
  });
  mobile.addEventListener('change', () => {
    const open = panel.classList.contains('is-open');
    panel.setAttribute('role', mobile.matches ? 'dialog' : 'region');
    if (mobile.matches) panel.setAttribute('aria-modal', String(open));
    else panel.removeAttribute('aria-modal');
    lockPageScroll('chat', open && mobile.matches);
  });
  let viewportFrame = 0;
  const updateViewport = () => {
    viewportFrame = 0;
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    const keyboardOffset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop || 0));
    panel.style.setProperty('--tci-chat-visible-height', `${height}px`);
    panel.style.setProperty('--tci-chat-keyboard-offset', `${keyboardOffset}px`);
  };
  const scheduleViewportUpdate = () => {
    if (!viewportFrame) viewportFrame = window.requestAnimationFrame(updateViewport);
  };
  window.visualViewport?.addEventListener('resize', scheduleViewportUpdate);
  window.visualViewport?.addEventListener('scroll', scheduleViewportUpdate);
  window.addEventListener('resize', scheduleViewportUpdate);
  updateViewport();
  setOpen(false, false);
  showMenu();
}
