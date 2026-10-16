# Baseline giao diện TCI

Ngày ghi nhận: 12/10/2026, giờ Việt Nam (+07). Commit nguồn: `9edb4ea9a66c6d30be0b61f6d88d0255493a6555` (`9edb4ea`). Bản đối chiếu được lưu tại `D:\WEB TCI\.tci-work\baseline`, ảnh và số đo tại `D:\WEB TCI\.tci-work\qa`. Đây là baseline local của source đã xác minh; chưa triển khai lên bản chính.

## Màu và font khóa

| Token | Giá trị gốc |
| --- | --- |
| `--private-obsidian` | `#0b0b0c` |
| `--private-ink` | `#121317` |
| `--private-navy` | `#0b1e3b` |
| `--private-wine` | `#5a0a0a` |
| `--private-red` | `#e2232a` |
| `--private-gold` | `#d6a84a` |
| `--private-champagne` | `#f3d79b` |
| `--private-ivory` | `#f8f2e7` |
| `--private-muted` | `#a8a8a8` |
| `--private-line` | `#d6a84a47` |
| `--private-border-dark` | `#ffffff1f` |

Ba token font `--private-serif`, `--private-sans`, `--private-numeric` đều giữ stack `"Montserrat Vietnamese", "Segoe UI", Arial, sans-serif`. Hai font gốc normal/italic giữ khoảng weight `100 900` và `font-display: swap`; bản nâng cấp chỉ chuyển dữ liệu nhúng ra file font, không thay typeface. Font cơ sở của `.private-page` là 16px, line-height 1.6. Không lấy tên `serif` trong token làm lý do đổi sang font có chân.

Các giá trị này nằm trong `styles/tokens.css` sau khi tách nguyên cascade. Theme sự kiện chỉ sử dụng token hiện có, không định nghĩa lại màu lõi. Màu global của static export và các màu đã tồn tại trong override gốc cần tiếp tục giữ theo cascade, không thay đồng loạt để “đồng nhất palette”.

## Sáu ảnh baseline

Ảnh dưới đây là ảnh **toàn trang**; chiều cao trong bảng là viewport lúc chụp, không phải chiều cao file PNG.

| Viewport | Ảnh | Số đo |
| --- | --- | --- |
| 1440×900 | [baseline-1440.png](<D:/WEB TCI/.tci-work/qa/baseline-1440.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-1440-metrics.json>) |
| 1280×800 | [baseline-1280.png](<D:/WEB TCI/.tci-work/qa/baseline-1280.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-1280-metrics.json>) |
| 768×1024 | [baseline-768.png](<D:/WEB TCI/.tci-work/qa/baseline-768.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-768-metrics.json>) |
| 390×844 | [baseline-390.png](<D:/WEB TCI/.tci-work/qa/baseline-390.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-390-metrics.json>) |
| 375×812 | [baseline-375.png](<D:/WEB TCI/.tci-work/qa/baseline-375.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-375-metrics.json>) |
| 320×720 | [baseline-320.png](<D:/WEB TCI/.tci-work/qa/baseline-320.png>) | [metrics](<D:/WEB TCI/.tci-work/qa/baseline-320-metrics.json>) |

Trạng thái bổ sung: [menu 390px](<D:/WEB TCI/.tci-work/qa/baseline-menu-390.png>) và [chat 390px](<D:/WEB TCI/.tci-work/qa/baseline-chat-390.png>). Kết quả capture baseline: [baseline-results.json](<D:/WEB TCI/.tci-work/qa/baseline-results.json>); sáu viewport ghi nhận overflow ngang 0 và không có lỗi `pageerror` trong lần chạy này. Đây không phải số đo Lighthouse hoặc xác nhận Safari/Android thực tế.

## Điều kiện so sánh có thể tái lập

- Chromium headless, viewport như bảng; timezone `Asia/Ho_Chi_Minh`, `reducedMotion: reduce`.
- Chỉ cho phép request đến local `127.0.0.1`; chặn request ngoài để tránh gửi dữ liệu hoặc tạo kết quả phụ thuộc dịch vụ live.
- Seed `localStorage.tci_first_visit_started_at = "1"` để trạng thái ưu đãi đã hết hạn và đồng hồ không gây pixel diff thay đổi theo từng giây. Đây là dữ liệu QA trong browser context riêng, không sửa quy tắc 72 giờ.
- Đợi `networkidle` và `document.fonts.ready`; tắt animation, transition, smooth scroll bằng CSS trước khi chụp.
- Xóa class `private-motion-ready` trên root và thêm `is-revealed` vào mọi `[data-private-reveal]`. Nội dung toàn trang được hiển thị tĩnh đầy đủ ở cả baseline và after, tránh so sánh nhầm các vùng đang chờ scroll reveal.
- Chụp bằng `fullPage: true`, `animations: 'disabled'`; giữ sự kiện OFF khi so sánh mặc định. Demo Tết được nghiệm thu riêng qua URL local.

Script tạo baseline: [capture-baseline.cjs](<D:/WEB TCI/.tci-work/capture-baseline.cjs>). So sánh phải dùng cùng điều kiện browser, font, trạng thái ưu đãi và reveal; không nới ngưỡng ảnh để che khác biệt chưa được giải thích.

## Những khác biệt chủ đích cần nghiệm thu

Mục tiêu refactor asset/CSS/module là giữ giao diện và nội dung runtime hiện tại. Bản source gốc có DOM patch sau tải; dữ liệu cần đối chiếu với ảnh/metrics runtime baseline, không chỉ với text HTML trước khi JavaScript chạy. Tách tài nguyên giữ pixel, crop, alt và thông tin nghiệp vụ gốc.

| Phạm vi | Thay đổi chủ đích | Tác dụng cần xác nhận |
| --- | --- | --- |
| Mobile overlay | Menu/chat/modal phối hợp trạng thái, tránh hiển thị đồng thời lớp sticky/launcher gây chồng lấp | CTA và nút đóng không bị che; trả focus về điểm mở đúng lúc |
| Bàn phím và focus | Focus trap/ESC, đóng bằng backdrop, khóa cuộn nền, `inert`/ARIA cho vùng đóng | Người dùng bàn phím đi đúng thứ tự và không lọt vào nội dung ẩn |
| Mobile safe-area | Khoảng cách dưới dùng `env(safe-area-inset-bottom)`; panel dùng giới hạn `dvh` và vùng nội dung có thể cuộn | Không bị home indicator, bàn phím hoặc viewport nhỏ cắt input/submit |
| Mobile form | Input/select đọc nhập ở 16px; một số hành động quan trọng tối thiểu 44px | Tránh zoom khi focus trên iOS, tăng vùng chạm; chiều cao một số đoạn mobile có thể đổi |
| Chat xác nhận gửi | Khi chat chỉ điền thông tin sang form tư vấn, thông báo rõ “chưa được gửi”, hướng dẫn kiểm tra và bấm gửi ở form | Không báo đã tiếp nhận yêu cầu khi chưa có phản hồi gửi thành công |
| Reduced motion/Save-Data | Dùng trạng thái tĩnh đầy đủ; chuyển động bổ sung và seasonal theme mặc định OFF | Nội dung/CTA luôn đọc và dùng được khi người dùng hạn chế chuyển động/dữ liệu |

Các khác biệt mobile trên phải được đối chiếu ảnh và thao tác cụ thể. Không dùng chúng làm lý do thay bố cục desktop, font thương hiệu, giá, SSI code 3186, link liên hệ hoặc dữ liệu chart. Giao diện chat mở có thông báo chính xác hơn nên được xem là khác biệt nội dung chủ đích, không che bằng threshold pixel diff.

## Trạng thái nghiệm thu

QA tác vụ chính đã báo cáo ảnh mặc định desktop 1440px và 1280px có **0 pixel thay đổi** trong điều kiện capture tĩnh đã ghi ở trên. Kết quả được lưu trong [visual-diff-results.json](<D:/WEB TCI/.tci-work/qa/visual-diff-results.json>).

| Chiều rộng | Chiều cao ảnh baseline | Chiều cao ảnh after | Kết quả |
| --- | --- | --- | --- |
| 1440px | 13.633px | 13.633px | 0 pixel thay đổi |
| 1280px | 13.299px | 13.299px | 0 pixel thay đổi |
| 768px | 16.703px | 16.699px | Ngắn hơn 4px |
| 390px | 20.637px | 20.629px | Ngắn hơn 8px |
| 375px | 20.697px | 20.689px | Ngắn hơn 8px |
| 320px | 21.654px | 21.646px | Ngắn hơn 8px |

Chênh lệch chiều cao tablet/mobile được tác vụ chính xác định do chuẩn hóa field 16px để hạn chế zoom khi nhập, là thay đổi an toàn mobile có chủ đích. Vì kích thước ảnh khác nhau, không khẳng định mobile có 0 pixel thay đổi. Menu, chat, form, bàn phím và trạng thái động đã qua regression Chromium local riêng trong `qa-report.md`; ảnh mặc định không chứng minh toàn bộ luồng tương tác.

Demo Tết được xem riêng: nhãn nhỏ đã được kiểm tra trong ảnh desktop/mobile. Họa tiết mobile được thu nhỏ xuống 72×54px, top 76px để kết thúc ở 130px và tránh chạm kicker; ảnh cuối đã xác nhận motif kết thúc trước kicker và không chạm nội dung. Không gộp ảnh bật Tết vào kết luận parity của giao diện mặc định.

Chưa kiểm chứng bàn phím ảo, safe-area và rendering trên iPhone Safari/Chrome Android thiết bị thật. Những giới hạn này cần được nêu rõ trước release. Nhánh main, cấu hình production và publish vẫn nằm ngoài phạm vi bản xem thử hiện tại.
