# Kết quả nâng cấp và kiểm tra bản dev

Đây là báo cáo giai đoạn tách mã và bảo toàn giao diện trước phản hồi về Three.js. Giai đoạn nâng cấp giao diện mới cố ý thay đổi hình thức; tiêu chí 0 pixel khác biệt dưới đây chỉ áp dụng cho bản refactor trước đó. Đọc [báo cáo giao diện gốc mới](premium-upgrade.md) để xem trạng thái hiện tại. Module sự kiện không còn được khởi tạo trong bản xem trước.

Ngày 12/10/2026. Source gốc: `9edb4ea9a66c6d30be0b61f6d88d0255493a6555`. Thay đổi hiện nằm trong working tree nhánh `dev`; chưa commit, push, merge `main` hoặc triển khai. Website giữ kiến trúc static, không cần bước build hay framework mới.

## Kết quả thực hiện

- HTML trang chủ: **10.754.371 → 71.797 byte**, giảm khoảng **99,33%**. Đây là dung lượng HTML; chưa phải số đo tổng transfer, LCP hoặc Lighthouse.
- Bốn PNG và hai TTF giữ nguyên byte, có SHA-256 tại `asset-inventory.json`. QR SSI cũ vẫn được giữ làm tài nguyên dù giao diện hiệu lực đã ẩn nó.
- CSS tách theo các đoạn liên tục, giữ nguyên thứ tự cascade; không xóa override hoặc đổi token màu.
- Nội dung hiệu lực được ghi vào HTML, bỏ chuỗi TreeWalker/outerHTML ghi đè nhiều lần; module riêng quản lý menu, form, chat, proof, chart, giá và lịch học.
- Giữ nguyên giá/72 giờ, số liệu báo cáo, 958 điểm số dư, mã SSI 3186, nội dung và địa chỉ thanh toán, liên kết liên hệ.
- Menu/modal/tabs có bàn phím, Escape và quản lý focus. Chat phối hợp overlay, safe area và visualViewport; sửa lỗi báo đã nhận lead khi chưa gửi bằng luồng prefill form thật.
- Ba trang con dùng chung menu/chat đã được cải thiện bàn phím và viewport mobile. Desktop giữ quy tắc CSS cũ.
- Theme Tết có demo chỉ trên localhost, cấu hình mặc định OFF, lịch +07 và kill switch. Không tự kích hoạt chiến dịch công khai.

## Bằng chứng kiểm tra

| Phép kiểm tra | Kết quả |
| --- | --- |
| Baseline 1440/1280/768/390/375/320px | 6 ảnh toàn trang, không lỗi JS hay overflow ngang |
| Desktop mặc định 1440×900 và 1280×800 | Cùng kích thước ảnh toàn trang; **0 pixel khác biệt** |
| Tablet/mobile 768/390/375/320px | Chiều cao thay đổi 4/8px do field 16px; không khẳng định pixel parity trên mobile |
| Browser regression | **31 mục đạt**, gồm 9 viewport 320–1440px, drawer, proof/keyboard, schedule/payment, form, chat, storage và ba trang con |
| Kiểm tra mobile sau sửa visualViewport/motif | **5 mục đạt**: chat trang chủ và ba trang con ở 390×400; motif Tết kết thúc trước kicker |
| Event unit contracts | **17 mục đạt**: default OFF, host preview, kill switch, lịch/định dạng +07, reduced-motion/Save-Data, lỗi fetch, init lặp |
| Proof/offer contracts | Giữ 958 balances, mọi stats và đường SVG; fresh/refresh/expiry/storage bị chặn và một timer/document đều đạt |
| Cú pháp JavaScript và `git diff --check` | Đạt; Git chỉ nhắc quy tắc LF/CRLF của README |

Browser regression chặn mọi yêu cầu ngoài localhost, riêng form được giả lập. Đã thử success, HTTP lỗi, phản hồi từ chối, JSON hỏng, timeout và honeypot; không gửi lead thật, không bấm xác nhận chuyển tiền. Không có lỗi `pageerror` hoặc HTTP 404 cục bộ trong các lượt chạy.

So sánh desktop dùng Chromium headless, font tải xong, timezone Việt Nam, ưu đãi đã hết hạn, theme OFF, reveal hiển thị đầy đủ và animation tắt. Các ảnh mobile có thay đổi UX được nghiệm thu riêng; không dùng threshold rộng để bỏ qua khác biệt.

Bằng chứng local tại `D:\WEB TCI\.tci-work\qa`: `regression-results.json`, `visual-diff-results.json`, `baseline-*.png`, `after-*.png`, `preview-desktop.png`, `preview-tet-mobile.png`, `preview-tet-desktop.png`, `chat-short-viewport.png`. Bản source gốc ở `D:\WEB TCI\.tci-work\baseline`.

## Chạy lại

Mở server theo README. Các test không đưa thêm dependency vào website:

```powershell
node tests/offer-proof.mjs
node tests/events.cjs
node tests/regression.cjs
```

Test browser cần Playwright/Chromium có sẵn; có thể chỉ định `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `TCI_BASE_URL`, `TCI_QA_DIR`. Mặc định output `.qa/` được Git bỏ qua. Bộ browser hiện có thêm phép kiểm tra chat ở viewport thấp, tương ứng phần kiểm tra riêng đã đạt sau lượt 31 mục.

## Xem bản ban đầu và giới hạn

[Bản dev local](http://127.0.0.1:4173/thanhconginvesting/) và [demo Tết](http://127.0.0.1:4173/thanhconginvesting/?tci-event=tet-demo).

Chưa đo Lighthouse/Core Web Vitals, chưa kiểm tra iPhone Safari/Android thật, chưa gửi email hoặc xác nhận QR live. Không suy luận điểm hiệu năng hoặc độ tương thích thiết bị thật từ các kết quả trên. Các bước này được giữ trong checklist trước phát hành; bản xem trước đã sẵn sàng để chủ sở hữu nhận xét.
