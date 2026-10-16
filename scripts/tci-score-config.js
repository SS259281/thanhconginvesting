/*
 * Cấu hình kết nối dashboard TCI Live Score.
 * - Trên website (thanhconginvesting.com): gọi máy chủ qua https://api.thanhconginvesting.com
 *   (Cloudflare Tunnel trỏ về máy đang chạy server).
 * - Khi mở trực tiếp từ máy chạy server (http://localhost:8000): dùng chính địa chỉ đó.
 * - Có thể ghi đè bằng tham số URL: cham-diem.html?api=http://192.168.1.10:8000
 * KHÔNG BAO GIỜ đặt khóa SSI ở frontend — khóa chỉ nằm trên máy chủ.
 */
(function () {
  const h = location.hostname;
  const onSite = h.endsWith('thanhconginvesting.com') || h.endsWith('github.io');
  window.TCI_SCORE_CONFIG = Object.freeze({
    // Trên website: qua Cloudflare Tunnel. Xem trước trên chính máy chạy server (localhost/127.0.0.1): gọi thẳng cổng 8000.
    apiBase: onSite ? 'https://api.thanhconginvesting.com'
      : (location.port === '8000' ? location.origin
        : (/^(localhost|127\.0\.0\.1)$/.test(h) ? 'http://localhost:8000' : 'https://api.thanhconginvesting.com')),
    pageSize: 100,
    renderIntervalMs: 1000,
  });
})();
