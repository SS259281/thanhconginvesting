# Kiến trúc và phạm vi nâng cấp

Mốc đối chiếu: commit `9edb4ea`, nhánh làm việc `dev`. Chưa triển khai, đổi `main` hay push lên remote. Website vẫn dùng HTML/CSS/JavaScript tĩnh, đường dẫn tương đối phù hợp GitHub Pages dưới thư mục dự án.

## Trước và sau

Bản cũ chứa HTML/CSS, bốn ảnh PNG và hai font TTF base64, ba khối JavaScript inline cùng `index-aug04.js`. Nội dung bị chỉnh nhiều lần sau tải trang; các bản MT5 cũ tồn tại song song với số liệu hiệu lực cuối cùng.

Bản mới ghi nội dung hiệu lực trực tiếp vào `index.html`, tách tài nguyên và khởi tạo ES modules qua `scripts/app.js`. HTML giảm từ **10.754.371 xuống 71.797 byte** tại mốc tách tài nguyên. Đây là dung lượng HTML, không phải tổng dung lượng tải trang hoặc kết quả Lighthouse.

Bốn PNG/hai TTF được tách nguyên byte. [Danh mục tài nguyên](asset-inventory.json) ghi dung lượng và SHA-256. Chưa chuyển đổi WebP/AVIF/WOFF2; quyền sử dụng font chưa được xác minh.

## Trách nhiệm module

| Module | Trách nhiệm |
| --- | --- |
| `site-config.js` | Hằng số nghiệp vụ; helper chuyển động, focus, clipboard, khóa cuộn |
| `navigation.js` | Reveal, drawer, CTA cố định, mở SSI, sao chép mã |
| `lead-form.js` | Kiểm tra biểu mẫu, gửi FormSubmit, timeout, trạng thái phản hồi |
| `chat-ui.js` | Menu thông tin, trả lời theo quy tắc, chuyển thông tin sang biểu mẫu thật |
| `offer-timer.js` | Đồng hồ 72 giờ và nguồn trạng thái giá dùng chung |
| `course-schedule.js` | Chọn lịch, kiểm tra hai ngày, modal thanh toán và QR |
| `proof-tabs.js`, `charts.js` | Hiển thị SSI/MT5/Crypto, tab/accordion, biểu đồ SVG |
| `event-theme.js` | Trang trí tùy chọn từ cấu hình, độc lập với giá và nội dung nghiệp vụ |

Số liệu chứng minh ở `content/proof-data.json`; sự kiện ở `content/events.json`. Nếu JSON chứng minh không tải được, giữ phần HTML có sẵn. Nếu cấu hình sự kiện lỗi hoặc tắt, giao diện thường tiếp tục hoạt động.

## CSS và nguồn cũ

Thứ tự giữ cascade: `base → fonts → tokens → components → sections → responsive → legacy-overrides → legacy-followup → index-aug04.css → mobile-ux`. CSS sự kiện chỉ tải khi cần.

Các file legacy CSS là phần ổn định giao diện trong lần chuyển đổi này. `index-aug04.js` còn trên đĩa để đối chiếu nhưng không được tham chiếu bởi HTML. Không chạy lại script cũ cùng module mới vì sẽ gắn handler trùng và ghi đè dữ liệu.

## Giới hạn nghiệm thu

QA Chromium local đã hoàn tất; xem `qa-report.md` để biết kết quả và giới hạn. Chưa có kết quả Lighthouse, iOS/Android thật hoặc xác nhận dịch vụ email/QR/thanh toán bên ngoài. Không suy luận hiệu năng tổng từ việc HTML nhỏ hơn.
