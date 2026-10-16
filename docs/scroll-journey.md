# Hành trình 3D: thước phim "thành phố tài chính" (16/10/2026)

Bản này thay phần hình ảnh của hành trình cũ (sáu khối 3D rời rạc) bằng **một thước phim liền mạch**: camera bay qua một thành phố tài chính ban đêm tông navy–vàng, và cuộn chuột điều khiển camera. Toàn bộ nội dung, bố cục section, giá, liên kết và chức năng của giao diện cũ được giữ nguyên.

## Kịch bản

| Chương | Section | Cảnh |
| --- | --- | --- |
| Mở màn | trước `#private-principles` | Camera hạ từ trên cao xuống. Đèn thành phố bật dần, lớp "nhiễu" (hạt sáng chập chờn) tan đi |
| 01 Nguyên tắc | `#private-principles` | Bay vào đại lộ trung tâm, dòng xe ánh vàng/đỏ |
| 02 Kinh nghiệm | `#private-about` | Tòa tháp nhiều tầng: từng tầng sáng viền vàng lần lượt, đèn hiệu đỏ trên đỉnh |
| 03 SSI 3186 | `#private-pathways`, `#private-ssi` | Con đường tách hai nhánh (đỏ: mở mới, vàng: đã có tài khoản) rồi hội tụ ở quảng trường vòng đỏ |
| 04 Năng lực | `#private-proof` | Biểu đồ nến 3D mọc lên trên nóc nhà, đường xu hướng phát sáng |
| *(Khóa học, lịch học: tĩnh)* | `#private-course` | Cảnh dừng |
| 05 Đồng hành | `#private-service`, `#private-community`, `#private-insights` | Bay cao: mạng lưới cung sáng dạng chấm nối các nóc nhà |
| 06 Bắt đầu | `#private-process` | Bốn cột đèn sáng lần lượt (4 bước), bình minh lên ở đường chân trời |

Giữa các chương có **thẻ tiêu đề** ("Chương 02, Kinh nghiệm", kèm một câu ngắn), cao khoảng một màn hình, để người xem thấy cảnh bay toàn màn hình. Các thẻ này chỉ là trang trí (`aria-hidden`), được tạo bằng JS và chỉ hiện ở chế độ 3D. Chế độ đọc, giảm chuyển động, Save-Data, không có WebGL hoặc tắt JavaScript đều hiển thị luồng nội dung gốc, không có thẻ.

## Cơ chế

- `scripts/journey.js` chuyển vị trí cuộn thành tiến độ phim 0–1. Mỗi section có mốc `data-journey-progress`. Giữa hai mốc, tiến độ đi theo đường cong smoothstep, nên camera "dừng" ở đầu mỗi section và bay nhanh trong thẻ tiêu đề.
- `scripts/journey-three.js` dựng thành phố bằng Three.js r180 local: khoảng 1.000 tòa nhà instanced (cửa sổ vẽ bằng shader), vệt xe, tháp, biểu đồ, mạng lưới, cột đèn, bầu trời. Camera đi theo spline qua 16 khung hình chính.
- Bloom (`assets/vendor/addons`) chỉ bật trên desktop. Điện thoại không có bloom, tăng độ sáng, ít tòa nhà hơn, và camera lùi xa hơn khi màn hình dọc.
- Tiết kiệm pin: không render khi cảnh khuất, tab ẩn hoặc ở phần tĩnh. Sau khoảng 6 giây không cuộn và không di chuột, cảnh tự ngủ.
- Thêm `?tci-snap` vào URL để camera nhảy thẳng tới vị trí (dùng cho kiểm thử, ảnh chụp).

## Kiểm tra (Chromium + WebGL phần mềm)

| Bộ kiểm tra | Kết quả |
| --- | --- |
| `tests/regression.cjs` | 32/32 đạt (9 viewport, menu, báo cáo, giá/lịch/modal, chat, form giả lập, 3 trang con) |
| `tests/journey.cjs` | 19/19 đạt. Đã cập nhật: ảnh Góc nhìn mới, camera nội suy smoothstep, cảnh ngủ sau khi đứng yên, chờ cuộn mượt kết thúc |

Chưa đo FPS trên GPU thật, Safari hoặc iPhone. WebGL phần mềm chỉ chạy được khoảng 1–5 khung hình/giây nên không phản ánh độ mượt thực tế.
