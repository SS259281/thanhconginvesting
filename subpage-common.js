(() => {
  if (document.documentElement.dataset.tciSubpageInitialized) return;
  document.documentElement.dataset.tciSubpageInitialized = 'true';
  const openAccountUrl = 'https://www.ssi.com.vn/khach-hang-ca-nhan/mo-tai-khoan?mgm=3186';
  const zaloUrl = 'https://zalo.me/0977921597';
  const menuButton = document.querySelector('.tci-menu-button');
  const mobileMenu = document.querySelector('.tci-mobile-menu');
  const mobile = window.matchMedia('(max-width: 900px)');
  const focusable = (container) => [...container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.closest('[hidden], [inert]') && element.getClientRects().length);
  const scrollLocks = new Set();
  let previousOverflow = '';
  const lockScroll = (owner, active) => {
    if (active) {
      if (!scrollLocks.size) previousOverflow = document.body.style.overflow;
      scrollLocks.add(owner);
      document.body.style.overflow = 'hidden';
    } else if (scrollLocks.delete(owner) && !scrollLocks.size) {
      document.body.style.overflow = previousOverflow;
    }
  };
  const trapFocus = (event, items, fallback) => {
    if (event.key !== 'Tab') return;
    const first = items[0], last = items.at(-1);
    if (!first) { event.preventDefault(); fallback?.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  };
  let menuReturnFocus = null;
  let setChatOpen = () => {};
  const setMenuOpen = (open, restoreFocus = true) => {
    if (!menuButton || !mobileMenu) return;
    if (open) {
      menuReturnFocus = document.activeElement;
      setChatOpen(false, false);
    }
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    mobileMenu.inert = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('tci-subpage-menu-open', open);
    lockScroll('menu', open);
    if (open) (focusable(mobileMenu)[0] || menuButton).focus({ preventScroll: true });
    else if (restoreFocus && menuReturnFocus?.isConnected) menuReturnFocus.focus({ preventScroll: true });
  };
  if (menuButton && mobileMenu) {
    mobileMenu.id ||= 'tci-mobile-menu';
    if (!mobileMenu.hasAttribute('aria-label')) mobileMenu.setAttribute('aria-label', 'Điều hướng di động');
    menuButton.setAttribute('aria-controls', mobileMenu.id);
    setMenuOpen(false, false);
    menuButton.addEventListener('click', () => setMenuOpen(!mobileMenu.classList.contains('is-open')));
    mobileMenu.addEventListener('click', (event) => { if (event.target.closest('a')) setMenuOpen(false); });
  }

  const launcher = document.createElement('button');
  launcher.className = 'tci-chat-launcher'; launcher.type = 'button'; launcher.innerHTML = '<span>TC</span><strong>Hỏi Thành Công AI</strong>';
  launcher.querySelector('span').setAttribute('aria-hidden', 'true');
  const chat = document.createElement('section');
  chat.className = 'tci-chat'; chat.setAttribute('aria-label', 'Trợ lý thông tin Thành Công AI');
  chat.id = 'tci-secondary-chat';
  chat.tabIndex = -1;
  launcher.setAttribute('aria-controls', chat.id);
  launcher.setAttribute('aria-haspopup', 'dialog');
  chat.innerHTML = '<header><div><strong>Thành Công AI</strong><span>Trợ lý thông tin · Không khuyến nghị mua/bán</span></div><button type="button" aria-label="Đóng trò chuyện">×</button></header><div class="tci-chat-messages" aria-live="polite"></div><div class="tci-chat-actions"></div><form><input aria-label="Nhập câu hỏi" placeholder="Nhập câu hỏi…" autocomplete="off"/><button type="submit" aria-label="Gửi">→</button></form><p class="tci-chat-note">Không gửi OTP, mật khẩu, số tài khoản hoặc dữ liệu đăng nhập.</p>';
  document.body.append(launcher, chat);
  let chatReturnFocus = null;
  setChatOpen = (open, restoreFocus = true) => {
    if (open) {
      chatReturnFocus = document.activeElement;
      setMenuOpen(false, false);
    }
    chat.classList.toggle('is-open', open);
    chat.setAttribute('aria-hidden', String(!open));
    chat.inert = !open;
    chat.setAttribute('role', mobile.matches ? 'dialog' : 'region');
    if (mobile.matches) chat.setAttribute('aria-modal', String(open));
    else chat.removeAttribute('aria-modal');
    launcher.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('tci-subpage-chat-open', open);
    lockScroll('chat', open && mobile.matches);
    if (open) (chat.querySelector('.tci-chat-actions button') || chat.querySelector('input')).focus({ preventScroll: true });
    else if (restoreFocus && chatReturnFocus?.isConnected) chatReturnFocus.focus({ preventScroll: true });
  };
  setChatOpen(false, false);
  const messages = chat.querySelector('.tci-chat-messages'); const actions = chat.querySelector('.tci-chat-actions'); const input = chat.querySelector('input');
  const add = (text, user = false) => { const p = document.createElement('p'); p.textContent = text; if (user) p.className = 'is-user'; messages.append(p); messages.scrollTop = messages.scrollHeight; };
  actions.setAttribute('aria-label', 'Lựa chọn nhanh');
  const setActions = (items) => { const restoreFocus = actions.contains(document.activeElement); actions.replaceChildren(); items.forEach(([key, label]) => { const button = document.createElement('button'); button.type = 'button'; button.dataset.action = key; button.textContent = label; actions.append(button); }); if (restoreFocus && chat.classList.contains('is-open')) (actions.querySelector('button') || input).focus({ preventScroll: true }); };
  const menu = () => { add('Chào bạn. Tôi có thể hướng dẫn mở tài khoản SSI, chuyển mã chuyên gia, tìm hiểu khóa học hoặc kết nối trực tiếp với Thành Công. Bạn muốn bắt đầu từ đâu?'); setActions([['open','Mở tài khoản SSI'],['existing','Tôi đã có tài khoản SSI'],['other','Tôi đang ở công ty khác'],['course','Hỏi về khóa học'],['contact','Trao đổi trực tiếp']]); };
  const reply = (key) => {
    const answers = {
      open: ['Bạn có thể mở tài khoản SSI qua liên kết chính thức có gắn sẵn mã chuyên gia 3186. Xem bài hướng dẫn để chuẩn bị và thực hiện eKYC.',['openlink','Mở liên kết SSI'],['guide','Xem hướng dẫn'],['contact','Cần hỗ trợ']],
      existing: ['Bạn có thể thay đổi ID Chuyên viên tư vấn về Bùi Thành Công — mã 3186 — trực tiếp trên ứng dụng SSI iBoard Pro.',['transfer','Hướng dẫn chuyển mã'],['contact','Nhắn Zalo']],
      other: ['Bạn có thể mở tài khoản SSI hoặc trao đổi trực tiếp để được hướng dẫn lộ trình phù hợp.',['open','Mở tài khoản SSI'],['contact','Trao đổi trực tiếp']],
      course: ['Khóa học gồm 8 buổi thực chiến, theo hình thức 1:1; có thể học online hoặc offline tại Hà Nội.',['coursepage','Xem khóa học'],['contact','Tư vấn đầu vào']],
      contact: ['Bạn có thể nhắn Zalo trực tiếp hoặc để lại thông tin để Thành Công liên hệ.',['zalo','Mở Zalo'],['lead','Để lại thông tin']],
      fees: ['Phí, margin và ưu đãi đều có điều kiện áp dụng; cần xác nhận lại tại thời điểm đăng ký.',['openlink','Mở tài khoản'],['contact','Trao đổi trực tiếp']]
    };
    const item = answers[key]; if (!item) return menu(); add(item[0]); setActions([...item.slice(1), ['menu','Về menu chính']]);
  };
  actions.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; const key = button.dataset.action; add(button.textContent, true); if (key === 'openlink') return window.open(openAccountUrl, '_blank', 'noopener,noreferrer'); if (key === 'guide') return window.location.href = 'huong-dan-mo-tk-ssi.html'; if (key === 'transfer') return window.location.href = 'chuyen-ma-ssi.html'; if (key === 'coursepage') return window.location.href = 'index.html#private-course'; if (key === 'zalo') return window.open(zaloUrl, '_blank', 'noopener,noreferrer'); if (key === 'lead') return window.location.href = 'index.html#private-lead'; reply(key); });
  chat.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); const q = input.value.trim(); if (!q) return; add(q, true); input.value = ''; const v = q.toLowerCase(); if (/otp|mật khẩu|password|lừa đảo/.test(v)) { add('Vì an toàn, vui lòng không gửi OTP, mật khẩu, số tài khoản hoặc ảnh giấy tờ qua chatbot.'); setActions([['contact','Trao đổi trực tiếp'],['menu','Về menu chính']]); } else if (/mua|bán|mã nào|điểm vào/.test(v)) { add('Tôi không thể đưa khuyến nghị mua/bán hoặc cam kết lợi nhuận. Tôi có thể hỗ trợ thông tin chung và kết nối trực tiếp với Thành Công.'); setActions([['contact','Trao đổi trực tiếp'],['menu','Về menu chính']]); } else if (/mở|ekyc|đăng ký/.test(v)) reply('open'); else if (/chuyển mã|đã có ssi|3186/.test(v)) reply('existing'); else if (/khóa học|học phí|lịch học/.test(v)) reply('course'); else if (/phí|margin|ưu đãi/.test(v)) reply('fees'); else { add('Tôi chưa hiểu chính xác ý bạn. Bạn có thể chọn một nội dung bên dưới.'); setActions([['open','Mở tài khoản'],['existing','Chuyển mã'],['course','Khóa học'],['contact','Gặp Thành Công']]); } });
  launcher.addEventListener('click', () => setChatOpen(!chat.classList.contains('is-open')));
  chat.querySelector('header button').addEventListener('click', () => setChatOpen(false));
  document.addEventListener('keydown', (event) => {
    if (chat.classList.contains('is-open')) {
      if (event.key === 'Escape') { event.preventDefault(); setChatOpen(false); }
      else if (mobile.matches) trapFocus(event, focusable(chat), chat);
    } else if (mobileMenu?.classList.contains('is-open')) {
      if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); }
      else trapFocus(event, [menuButton, ...focusable(mobileMenu)], menuButton);
    }
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches && mobileMenu?.classList.contains('is-open')) setMenuOpen(false, false);
    const open = chat.classList.contains('is-open');
    chat.setAttribute('role', mobile.matches ? 'dialog' : 'region');
    if (mobile.matches) chat.setAttribute('aria-modal', String(open));
    else chat.removeAttribute('aria-modal');
    lockScroll('chat', open && mobile.matches);
  });
  let viewportFrame = 0;
  const updateViewport = () => {
    viewportFrame = 0;
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    const keyboardOffset = Math.max(0, window.innerHeight - height - (viewport?.offsetTop || 0));
    chat.style.setProperty('--tci-visible-height', `${height}px`);
    chat.style.setProperty('--tci-keyboard-offset', `${keyboardOffset}px`);
    chat.style.setProperty('--tci-chat-gap', keyboardOffset > 100 ? '12px' : '74px');
  };
  const scheduleViewportUpdate = () => {
    if (!viewportFrame) viewportFrame = window.requestAnimationFrame(updateViewport);
  };
  window.visualViewport?.addEventListener('resize', scheduleViewportUpdate);
  window.visualViewport?.addEventListener('scroll', scheduleViewportUpdate);
  window.addEventListener('resize', scheduleViewportUpdate);
  updateViewport();
  menu();
})();
