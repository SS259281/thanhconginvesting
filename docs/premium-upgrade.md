# Bản nâng cấp giao diện gốc trên dev

Giai đoạn tiếp theo đã chuyển [chính các phần nội dung thành hành trình cuộn 3D](scroll-journey.md). Bộ tóm tắt sáu chương cũ đã được bỏ để tránh lặp; khóa học, lịch học, liên hệ và FAQ tiếp tục dùng dạng tĩnh. Hero đã được tách khỏi tín hiệu dừng của hành trình để giữ chuyển động tự thân và phản hồi chuột khi còn hiển thị.

Ngày 12/10/2026. Bản này tập trung vào diện mạo và tương tác của website gốc theo phản hồi của chủ sở hữu. Không cần tham số Tết để xem. URL cũ có `?tci-event=tet-demo` cũng hiển thị giao diện gốc.

Giao diện mới được phép khác bản trước: kiểm tra pixel giống desktop không còn là tiêu chí nghiệm thu. Các chức năng đăng ký, lịch học, giá, dữ liệu báo cáo, form, chat và liên kết SSI tiếp tục được kiểm tra.

## Những thay đổi nhìn thấy

- Hero có các vòng kim loại vàng nghiêng trong không gian, hình khối, đồng xu và nến thị trường 3D quanh chân dung. Ánh sáng và góc nhìn thay đổi theo chuột; cảnh chuyển động chậm khi hiển thị.
- Mobile đặt cảnh 3D ngay sau tiêu đề để thấy hiệu ứng sớm. Các nút SSI và nội dung giới thiệu vẫn đầy đủ bên dưới.
- Header dùng nền mờ và đường nhấn vàng. Các phần quy trình, lộ trình SSI, bằng chứng, khóa học, lịch học, liên hệ và FAQ có bố cục mới, nền obsidian/navy, đường viền và phân cấp chữ nhất quán.
- Thẻ lộ trình/giá/vấn đề có ánh sáng theo con trỏ và độ nghiêng tối đa 1,4 độ trên thiết bị có chuột. Không áp dụng chuyển động này cho touch, giảm chuyển động hoặc Save-Data.
- Giữ nguyên dữ liệu báo cáo, toàn bộ điểm biểu đồ, nội dung kinh doanh, giá/ưu đãi, mã SSI và thông tin thanh toán. Không khởi tạo theme sự kiện dù URL chứa tham số Tết cũ.

## Three.js và các giới hạn

Hero có lớp canvas 3D trang trí cạnh chân dung. Tài nguyên Three.js được phục vụ từ `assets/vendor/` trong website. Canvas không nhận focus hay chặn nút/link; chuyển động dừng khi hero ra khỏi màn hình. Người bật giảm chuyển động hoặc Save-Data, và trình duyệt không có WebGL, vẫn xem được hero tĩnh và sử dụng các chức năng chính.

Không xem việc canvas tồn tại là bằng chứng hiệu ứng hoạt động. Bộ kiểm tra mới đọc pixel đã vẽ, xác nhận hình thay đổi theo thời gian, phản hồi con trỏ, dừng/tiếp tục theo vùng hiển thị và kích thước mobile. Đây là kiểm tra Chromium local, chưa đại diện cho Safari/iPhone, GPU thật hoặc tốc độ mạng thực tế.

## Kiểm tra và xem trước

`tests/regression.cjs` giữ kiểm tra 9 viewport cùng các chức năng hiện có; thay kiểm tra demo Tết bằng yêu cầu chỉ hiển thị giao diện gốc. `tests/hero-three.cjs` kiểm tra riêng hero với WebGL phần mềm, giảm chuyển động, WebGL lỗi và Save-Data. Mọi yêu cầu ra ngoài localhost bị chặn hoặc giả lập; không gửi lead thật hay thực hiện thanh toán.

Sau khi server local hoạt động, chạy bằng Node.js có Playwright/Chromium:

```powershell
node tests/regression.cjs
node tests/hero-three.cjs
```

Có thể đặt `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `TCI_BASE_URL`, `TCI_QA_DIR`. Kết quả và ảnh được lưu trong thư mục QA đã chỉ định, mặc định `.qa/`.

Kết quả đã chạy trên Chromium local:

| Kiểm tra | Kết quả |
| --- | --- |
| Browser regression | 32 mục đạt: 9 viewport 320–1440px; menu, proof, lịch học, modal, chat, biểu mẫu giả lập và ba trang con |
| Three.js | 8 mục đạt: pixel WebGL có màu thật, hình thay đổi theo thời gian, phản hồi chuột, pause/resume, mobile, reduced motion, WebGL lỗi và Save-Data |
| Nội dung bằng chứng/ưu đãi | Đạt: 958 điểm, mọi chỉ số và hình học SVG giữ nguyên; refresh/expiry/storage lỗi đều đúng |
| Section QA 1440/390/320px | Không overflow/lỗi JS; tilt/glow đúng giới hạn; giá không chồng lịch học; ngày/giờ cùng hàng desktop và xếp dọc mobile |
| Responsive sau tinh chỉnh | 768/430/390/375/360/320px đều đạt: không overflow/404/lỗi JS, cảnh mobile sau tiêu đề và trước lời giới thiệu, menu/CTA/chat hoạt động |
| Bàn phím và vòng đời cảnh | Skip link có focus nhìn thấy, tương phản 16,66:1; sự kiện pagehide/pageshow với persisted giả lập giữ canvas, dừng và tiếp tục vẽ được pixel |

Bằng chứng tại `D:\WEB TCI\.tci-work\qa-premium`, `qa-premium-regression`, `qa-premium-sections` và `qa-premium-final`: ảnh desktop/mobile, báo cáo JSON, kiểm tra căn chỉnh giá/lịch và vòng đời cảnh. Đã mở lại tab trong app ở bản gốc và kiểm tra cảnh 3D trên viewport hẹp.

Chưa có số đo Lighthouse/Core Web Vitals hay kết luận về iOS/Android, Safari hoặc GPU thật. Các kiểm tra WebGL dùng renderer phần mềm để xác nhận hành vi, không dùng làm số đo FPS thực tế. Kiểm tra persisted mô phỏng handler, chưa xác nhận trình duyệt thực sự đưa trang vào BFCache.

[Xem bản gốc nâng cấp](http://127.0.0.1:4173/thanhconginvesting/). Các thay đổi để chủ sở hữu xem trước trên nhánh `dev`; chưa đưa lên bản chính hoặc triển khai công khai.
