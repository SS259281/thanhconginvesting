(() => {
  const openAccountUrl = 'https://www.ssi.com.vn/khach-hang-ca-nhan/mo-tai-khoan?mgm=3186';
  const zaloUrl = 'https://zalo.me/0977921597';
  const menuButton = document.querySelector('.tci-menu-button');
  const mobileMenu = document.querySelector('.tci-mobile-menu');
  menuButton?.addEventListener('click', () => mobileMenu?.classList.toggle('is-open'));

  const launcher = document.createElement('button');
  launcher.className = 'tci-chat-launcher'; launcher.type = 'button'; launcher.innerHTML = '<span>TC</span><strong>Hỏi Thành Công AI</strong>';
  const chat = document.createElement('section');
  chat.className = 'tci-chat'; chat.setAttribute('aria-label', 'Trợ lý thông tin Thành Công AI');
  chat.innerHTML = '<header><div><strong>Thành Công AI</strong><span>Trợ lý thông tin · Không khuyến nghị mua/bán</span></div><button type="button" aria-label="Đóng trò chuyện">×</button></header><div class="tci-chat-messages" aria-live="polite"></div><div class="tci-chat-actions"></div><form><input aria-label="Nhập câu hỏi" placeholder="Nhập câu hỏi…" autocomplete="off"/><button type="submit" aria-label="Gửi">→</button></form><p class="tci-chat-note">Không gửi OTP, mật khẩu, số tài khoản hoặc dữ liệu đăng nhập.</p>';
  document.body.append(launcher, chat);
  const messages = chat.querySelector('.tci-chat-messages'); const actions = chat.querySelector('.tci-chat-actions'); const input = chat.querySelector('input');
  const add = (text, user = false) => { const p = document.createElement('p'); p.textContent = text; if (user) p.className = 'is-user'; messages.append(p); messages.scrollTop = messages.scrollHeight; };
  const setActions = (items) => { actions.replaceChildren(); items.forEach(([key, label]) => { const button = document.createElement('button'); button.type = 'button'; button.dataset.action = key; button.textContent = label; actions.append(button); }); };
  const menu = () => { add('Chào bạn. Tôi có thể hướng dẫn mở tài khoản SSI, chuyển mã chuyên gia, tìm hiểu khóa học hoặc kết nối trực tiếp với Thành Công. Bạn muốn bắt đầu từ đâu?'); setActions([['open','Mở tài khoản SSI'],['existing','Tôi đã có tài khoản SSI'],['other','Tôi đang ở công ty khác'],['course','Hỏi về khóa học'],['contact','Trao đổi trực tiếp']]); };
  const reply = (key) => {
    const answers = {
      open: ['Bạn có thể mở tài khoản SSI qua liên kết chính thức có gắn sẵn mã chuyên gia 3186. Xem bài hướng dẫn để chuẩn bị và thực hiện eKYC.',['openlink','Mở liên kết SSI'],['guide','Xem hướng dẫn'],['contact','Cần hỗ trợ']],
      existing: ['Bạn có thể gửi yêu cầu chuyển mã chuyên gia về Bùi Thành Công — mã 3186 — theo hướng dẫn chính thức của SSI.',['transfer','Hướng dẫn chuyển mã'],['contact','Nhắn Zalo']],
      other: ['Bạn có thể mở tài khoản SSI hoặc trao đổi trực tiếp để được hướng dẫn lộ trình phù hợp.',['open','Mở tài khoản SSI'],['contact','Trao đổi trực tiếp']],
      course: ['Khóa học gồm 8 buổi thực chiến, theo hình thức 1:1; có thể học online hoặc offline tại Hà Nội.',['coursepage','Xem khóa học'],['contact','Tư vấn đầu vào']],
      contact: ['Bạn có thể nhắn Zalo trực tiếp hoặc để lại thông tin để Thành Công liên hệ.',['zalo','Mở Zalo'],['lead','Để lại thông tin']],
      fees: ['Phí, margin và ưu đãi đều có điều kiện áp dụng; cần xác nhận lại tại thời điểm đăng ký.',['openlink','Mở tài khoản'],['contact','Trao đổi trực tiếp']]
    };
    const item = answers[key]; if (!item) return menu(); add(item[0]); setActions([...item.slice(1), ['menu','Về menu chính']]);
  };
  actions.addEventListener('click', (event) => { const button = event.target.closest('button'); if (!button) return; const key = button.dataset.action; add(button.textContent, true); if (key === 'openlink') return window.open(openAccountUrl, '_blank', 'noopener,noreferrer'); if (key === 'guide') return window.location.href = 'huong-dan-mo-tk-ssi.html'; if (key === 'transfer') return window.open('https://www.ssi.com.vn/khach-hang-ca-nhan/quan-ly-tai-khoan-kieu-xac-thuc-iboard-pro', '_blank', 'noopener,noreferrer'); if (key === 'coursepage') return window.location.href = 'index.html#private-course'; if (key === 'zalo') return window.open(zaloUrl, '_blank', 'noopener,noreferrer'); if (key === 'lead') return window.location.href = 'index.html#private-lead'; reply(key); });
  chat.querySelector('form').addEventListener('submit', (event) => { event.preventDefault(); const q = input.value.trim(); if (!q) return; add(q, true); input.value = ''; const v = q.toLowerCase(); if (/otp|mật khẩu|password|lừa đảo/.test(v)) { add('Vì an toàn, vui lòng không gửi OTP, mật khẩu, số tài khoản hoặc ảnh giấy tờ qua chatbot.'); setActions([['contact','Trao đổi trực tiếp'],['menu','Về menu chính']]); } else if (/mua|bán|mã nào|điểm vào/.test(v)) { add('Tôi không thể đưa khuyến nghị mua/bán hoặc cam kết lợi nhuận. Tôi có thể hỗ trợ thông tin chung và kết nối trực tiếp với Thành Công.'); setActions([['contact','Trao đổi trực tiếp'],['menu','Về menu chính']]); } else if (/mở|ekyc|đăng ký/.test(v)) reply('open'); else if (/chuyển mã|đã có ssi|3186/.test(v)) reply('existing'); else if (/khóa học|học phí|lịch học/.test(v)) reply('course'); else if (/phí|margin|ưu đãi/.test(v)) reply('fees'); else { add('Tôi chưa hiểu chính xác ý bạn. Bạn có thể chọn một nội dung bên dưới.'); setActions([['open','Mở tài khoản'],['existing','Chuyển mã'],['course','Khóa học'],['contact','Gặp Thành Công']]); } });
  launcher.addEventListener('click', () => chat.classList.toggle('is-open')); chat.querySelector('header button').addEventListener('click', () => chat.classList.remove('is-open')); menu();
})();
