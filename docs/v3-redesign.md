# Giao diện v3: "Hành trình nhà đầu tư" (10/2026), đã thay thế

> **16/10/2026:** chủ sở hữu chọn giữ giao diện cũ. Trang chủ đã quay lại bố cục cũ với hành trình 3D mới ([scroll-journey.md](scroll-journey.md)). Từ bản v3 chỉ giữ lại ảnh Góc nhìn (`assets/photos/`) và mục menu "Chấm điểm". Các file `styles/v3.css`, `scripts/v3/*` và `assets/hero/bui-thanh-cong.webp` không còn được tải, có thể xóa. Bảng nguồn ảnh bên dưới vẫn còn hiệu lực.

Bản v3 thay cho bản nâng cấp 3D trước đó (hero-three, journey, premium-interactions). Các file cũ vẫn còn trong repo nhưng `index.html` không tải chúng nữa. Có thể xóa sau khi duyệt xong.

## Ý tưởng

Trang có một nền 3D cố định: địa hình dữ liệu dạng điểm sáng và đường đồng mức, một dải giá phát sáng và các cột khối lượng. Khi cuộn, nền chuyển trạng thái theo từng chặng của hành trình nhà đầu tư:

| Chặng | Section | Trạng thái nền |
|---|---|---|
| Mở đầu | hero | `hero`, địa hình tĩnh, chưa có dải giá |
| 01 Nhiễu | `#private-principles` | `noise` |
| 02 Trật tự | `#private-about` | `order` |
| 03 Bằng chứng | `#private-proof` | `proof` |
| 04 Lộ trình | `#private-ssi`, `#private-pathways` | `path` |
| 05 Bắt đầu | `#private-process` | `start` |

Khóa học, công cụ (TCI Live Score), dịch vụ, cộng đồng, góc nhìn, form và FAQ là các khối nền đặc, đọc như trang tài chính thông thường. Người dùng bật "giảm chuyển động" sẽ thấy nền đứng yên.

## File

| File | Vai trò |
|---|---|
| `index.html` | Trang chủ v3. Các khối chức năng gốc giữ nguyên: tab bằng chứng, khóa học, bảng giá, lịch học, form, chat, thanh toán |
| `styles/v3.css` | Toàn bộ giao diện v3 |
| `scripts/app.js` | Khởi tạo module, thêm `v3/story.js` |
| `scripts/v3/market-scene.js` | Cảnh Three.js (dùng `assets/vendor/three.module.js`) |
| `scripts/v3/story.js` | Đổi trạng thái nền theo section, thanh tiến trình, widget top 5 TCI Live Score (tự ẩn khi máy chủ chưa chạy) |
| `assets/photos/*.jpg` | Ảnh minh họa đã chỉnh màu navy–champagne cho đồng bộ |
| `assets/hero/bui-thanh-cong.webp` | Chân dung hero đã nén (65 KB, thay PNG 3,6 MB) |

Các trang con `goc-nhin.html`, `huong-dan-mo-tk-ssi.html` và `chuyen-ma-ssi.html` có thêm mục menu "Chấm điểm". Ba thẻ đầu ở `goc-nhin.html` dùng ảnh nền mới.

Nội dung đã bỏ chiến dịch SSI "Sóng lớn cần Tàu lớn" vì đã kết thúc ngày 30/09/2026. Giá, mã 3186, điều kiện và thông tin pháp lý giữ nguyên.

## Nguồn ảnh

Tất cả ảnh lấy từ Unsplash theo [Unsplash License](https://unsplash.com/license): dùng miễn phí cho mục đích thương mại, không bắt buộc ghi công. Các ảnh đã được cắt và chỉnh màu.

| File | Ảnh gốc (CDN Unsplash) |
|---|---|
| tci-insight-iboard.jpg | https://images.unsplash.com/photo-1612178991541-b48cc8e92a4d |
| tci-insight-open.jpg | https://images.unsplash.com/photo-1579389082289-3d6922d506c4 |
| tci-insight-library.jpg | https://images.unsplash.com/photo-1768055104895-e6185762f2a9 |
| tci-course-wide.jpg | https://images.unsplash.com/photo-1681569685386-b7bda397672e |
| tci-consult.jpg | https://images.unsplash.com/photo-1758691737278-3af15b37af48 |
| tci-community.jpg | https://images.unsplash.com/photo-1774600134168-b9ebd714e4e1 |
| tci-skyline-wide.jpg | https://images.unsplash.com/photo-1780203938321-8d4869e0358f |
| tci-screens.jpg | https://images.unsplash.com/photo-1691643158804-d3f02eb456a3 |


## Sao lưu và quay lại

Bản đầy đủ trước v3 (trừ `.git`): `D:\WEB TCI\_sao-luu-web-2026-10-15`. Muốn quay lại, chép đè `index.html`, `scripts/app.js` và 3 trang con từ thư mục sao lưu.

`tests/regression.cjs` viết cho bản trước, nên cần cập nhật selector trước khi dùng cho v3.
