# Cập nhật trang trí theo sự kiện

Hệ thống chỉ thêm một nhãn nhỏ và họa tiết nền ở vùng trống đầu Hero. Logo, màu thương hiệu, vị trí nội dung, CTA, giá, lịch khóa học, ưu đãi và dữ liệu đầu tư giữ nguyên. Mặc định sự kiện và chuyển động đều **tắt**.

## Xem thử Tết trên máy

1. Chạy web bằng HTTP local theo hướng dẫn của dự án; không mở trực tiếp file HTML.
2. Mở `http://127.0.0.1:4173/thanhconginvesting/?tci-event=tet-demo` (thay `4173` bằng cổng server đang chạy), hoặc URL `localhost` tương ứng.
3. Xem desktop 1440px và điện thoại 320px/390px. Kiểm tra nhãn không chạm tiêu đề, họa tiết không che nội dung, menu/chat/form/CTA vẫn thao tác được.
4. Bỏ `?tci-event=tet-demo` để về giao diện thường. Tham số xem thử bị bỏ qua trên mọi hostname công khai, kể cả website production.

`tet-demo` là ví dụ, không phải chiến dịch đã duyệt. Lịch 25/01–20/02/2027 chỉ minh họa cấu trúc. Không cần sửa `enabled` để xem bản demo local. `killSwitch: true` sẽ tắt cả bản xem thử.

## Các ô cần sửa trong `content/events.json`

| Ô | Ý nghĩa | Mặc định |
| --- | --- | --- |
| `enabled` ở đầu file | Công tắc toàn bộ hệ thống theo lịch | `false` |
| `killSwitch` | Tắt khẩn cấp tất cả, kể cả preview | `false` |
| `activeTheme` | Tên sự kiện đã được duyệt sẽ dùng | `tet-demo` |
| `features.enhancedMotion` | Chuyển động rất nhẹ riêng của họa tiết | `false` |
| `themes.<tên>.enabled` | Cho phép sự kiện này chạy | `false` |
| `themes.<tên>.previewOnly` | Chỉ dùng để xem thử local | `true` với demo |
| `variant` | Mẫu trang trí hiện có | `tet` |
| `startsAt` / `endsAt` | Bắt đầu/kết thúc theo giờ Việt Nam | Chuỗi `YYYY-MM-DDTHH:mm:ss+07:00` |
| `title` | Nhãn trang trí ngắn, tối đa 64 ký tự | Nhãn demo |
| `visualAsset` | File họa tiết trong `assets/campaigns/` | `../assets/campaigns/tet-motif.svg` |
| `decorations` | Các phần cần hiển thị | `hero-badge`, `hero-motif` |

File JSON dùng dấu ngoặc kép, không cho phép dấu phẩy sau ô cuối cùng hoặc chú thích `//`. Đường dẫn ảnh tính từ `content/events.json`; chỉ nhận file SVG/PNG/WebP/AVIF cùng website, trong `assets/campaigns/`. Ghi tác giả/quyền sử dụng vào `assetCredit`. Không đưa mật khẩu hoặc khóa dịch vụ vào file này.

## Chuẩn bị chiến dịch đã duyệt

1. Làm trên nhánh `dev`/nhánh tính năng; giữ một bản sao cấu hình cũ trong Git.
2. Sao chép khối `tet-demo`, đặt tên riêng (ví dụ `tet-2027-approved`), sửa nhãn, asset và thời gian đã được chủ sở hữu xác nhận. Mẫu hiện hỗ trợ `variant: "tet"`; dịp lễ khác cần mẫu trang trí riêng trước khi dùng.
3. Dùng họa tiết nhẹ, nền trong suốt, tỷ lệ 240×180. Không đặt giá, lời hứa lợi nhuận hoặc CTA vào ảnh. SVG phải do người tạo đáng tin cậy cung cấp và không chứa script/liên kết ngoài.
4. Giữ toàn cục `enabled: false`; xem trên local bằng `?tci-event=tet-2027-approved`. Kiểm tra thêm `prefers-reduced-motion` và Save-Data; cả hai đều dùng hình tĩnh dù công tắc chuyển động bật.
5. Sau khi nội dung và giao diện được duyệt, đặt `activeTheme` đúng tên; đặt sự kiện đó `enabled: true`, `previewOnly: false`, đặt toàn cục `enabled: true`, giữ `killSwitch: false`. Chỉ đưa lên main/production sau xác nhận của chủ sở hữu.
6. Khi trang đang mở, module bật/tắt theo mốc lịch; khi quay lại tab, nó kiểm tra lại thời gian. Hệ thống dựa vào đồng hồ thiết bị và chỉ dùng cho trang trí, không dùng để xác định hạn ưu đãi hay điều kiện tài chính.

## Tắt khẩn cấp và khôi phục

Đặt `killSwitch: true` trong cấu hình để tắt toàn bộ. Hoặc đặt toàn cục `enabled: false` để ngừng lịch sự kiện nhưng vẫn cho xem thử local. Không cần sửa CSS, logo hay token màu. Hiệu lực đến người dùng sau khi cấu hình mới được triển khai và trang tải lại; tab cũ không tự tải lại JSON. Bộ nhớ đệm/CDN có thể làm chậm việc nhận file mới.

Khôi phục bằng cấu hình đã duyệt trong Git hoặc commit revert thông thường. Không dùng force push/reset lịch sử. Nếu cần tắt ngay trong một phiên debug local, module xuất `disableEventTheme()` để dọn lớp trang trí và listener; đây không phải công tắc thay đổi cấu hình trên máy chủ.

## Nghiệm thu tối thiểu

- URL thường: không có nhãn, họa tiết hay stylesheet sự kiện khi công tắc tắt.
- URL local preview: thấy nhãn “Bản xem thử”, motif nhẹ, không dịch bố cục desktop/mobile.
- Hostname công khai: query preview không được bật theme tắt hoặc chỉ xem thử.
- Thời gian trước/sau chiến dịch: không có trang trí; `killSwitch: true` luôn tắt.
- Reduced motion/Save-Data: không chạy animation. Không có lớp trang trí nhận focus hoặc chặn chạm.
- Không sửa màu `--private-*`, dữ liệu, giá, SSI code 3186 hoặc liên kết chuyển đổi.

Ở bản nâng cấp này chưa publish, chưa push và chưa đổi nhánh production.
