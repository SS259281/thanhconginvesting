# Thành Công Investing

Website tĩnh của Bùi Thành Công, mã chuyên gia SSI **3186**. Sửa trên nhánh `dev`, xem trước bằng `D:\WEB TCI\XEM-TRUOC-WEB.bat`. Khi duyệt xong, chạy `D:\WEB TCI\DAY-WEB-LEN-GITHUB.bat` để đẩy `dev` và cập nhật `main`, tức bản đang chạy trên thanhconginvesting.com.

## Xem trên máy

Chạy trong PowerShell, dùng Python đã cài trên máy:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory 'D:\WEB TCI'
```

Mở [trang xem trước](http://127.0.0.1:4173/thanhconginvesting/). Cần HTTP local để tải ES modules và JSON; không mở trực tiếp bằng `file://`.

Trang chủ giữ giao diện tối–vàng hiện có. Hành trình 3D là **thước phim "thành phố tài chính"**: cuộn chuột điều khiển camera bay liền mạch qua 6 chương, có thẻ tiêu đề giữa các chương. Toàn bộ nội dung và chức năng giữ nguyên. Xem [kịch bản và cơ chế](docs/scroll-journey.md). Dashboard chấm điểm cổ phiếu nằm ở `cham-diem.html`.

## Cấu trúc và chỉnh sửa

| Nơi chỉnh | Nội dung |
| --- | --- |
| `index.html` | Nội dung hiệu lực đã ghi trực tiếp vào HTML |
| `styles/` | CSS nền, font, token, component, section, responsive, mobile và giao diện premium |
| `scripts/app.js` | Khởi tạo các module giao diện |
| `scripts/site-config.js` | Liên kết, mã SSI, giá, thông tin thanh toán, endpoint biểu mẫu |
| `content/proof-data.json` | Số liệu SSI/MT5/Crypto và toàn bộ điểm biểu đồ |
| `scripts/journey.js` | Chuyển vị trí cuộn thành tiến độ phim, thẻ tiêu đề chương, điều hướng, chế độ đọc |
| `scripts/journey-three.js` | Thước phim thành phố tài chính (Three.js) |
| `styles/journey.css` | Nền 3D, panel nội dung, thẻ tiêu đề chương |
| `scripts/hero-three.js` | Cảnh 3D phần đầu trang |
| `assets/photos/` | Ảnh minh họa Góc nhìn (Unsplash, xem `docs/v3-redesign.md`) |
| `cham-diem.html`, `scripts/tci-score*.js`, `styles/tci-score.css` | Dashboard TCI Live Score (dữ liệu từ máy chủ riêng) |
| `assets/vendor/` | Three.js r180 chạy local và giấy phép MIT |
| `assets/` | Ảnh/font đã tách khỏi base64 |

Giữ thứ tự stylesheet hiện tại để bảo toàn cascade. `index-aug04.css` vẫn có hiệu lực; `index-aug04.js` được giữ làm nguồn đối chiếu và không còn được tải. Chưa chuyển đổi font/ảnh để tránh làm thay đổi hình thức; giấy phép font cần được xác minh trước khi phát hành.

## Kiểm tra

`tests/regression.cjs` dùng Node.js và Playwright Chromium, chạy khi server local đã mở:

```powershell
node tests/offer-proof.mjs
node tests/regression.cjs
node tests/hero-three.cjs
node tests/journey.cjs
```

Nếu Playwright/Chromium nằm ở runtime riêng, đặt `PLAYWRIGHT_MODULE`/`CHROMIUM_PATH` đúng đường dẫn có sẵn; không cần thêm thư viện vào website. Test chặn hoặc giả lập yêu cầu bên ngoài, xuất báo cáo/ảnh vào `.qa/`. Kết quả mô phỏng không xác nhận gửi email, thanh toán hay dịch vụ QR thật.

Đọc [kiến trúc](docs/architecture-audit.md), [hành vi phải giữ](docs/behavior-contract.md), [rủi ro còn lại](docs/risk-register.md), [checklist nghiệm thu](docs/release-checklist.md) và [khôi phục](docs/rollback.md). [Báo cáo giai đoạn tách mã](docs/qa-report.md) ghi kết quả trước khi đổi giao diện; kết quả giao diện mới ở [premium-upgrade](docs/premium-upgrade.md). Chưa có Lighthouse hoặc kiểm tra trên iOS/Android thật.
