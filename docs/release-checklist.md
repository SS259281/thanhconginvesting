# Checklist xem trước và phát hành

Hiện tại chỉ xem trước trên `dev`. Danh sách chưa đánh dấu là việc cần hoàn tất hoặc cập nhật từ bằng chứng QA; không phải kết quả đã đạt.

## Bằng chứng đã có

- Mốc asset `9edb4ea`: HTML 10.754.371 → 71.797 byte; bốn PNG/hai TTF giữ byte và SHA-256 trong `asset-inventory.json`.
- Bốn module navigation/config/lead/chat đã qua kiểm tra cú pháp.
- Biểu mẫu đã qua sáu trường hợp mạng giả lập: thành công được xác nhận, lỗi HTTP, JSON từ chối, JSON hỏng, timeout, honeypot. Không gửi email thật.

31 mục browser regression, 5 kiểm tra mobile bổ sung và 17 event contracts đã đạt; desktop1440/1280 đạt0pixel khác biệt. Xem `qa-report.md`.

## Xem trước local

- [x] Mở `http://127.0.0.1:4173/thanhconginvesting/`; không lỗi console, file 404 hoặc ảnh/font hỏng.
- [x] So sánh ảnh trước/sau trên desktop và 320/360/375/390/430/768px; không cuộn ngang, che CTA hoặc lệch nội dung.
- [ ] Kiểm tra drawer, sticky CTA, mở SSI, chuyển mã, Zalo, PDF và sao chép mã khi clipboard bị từ chối.
- [x] Kiểm tra tab/accordion SSI–MT5–Crypto, số liệu và SVG tương ứng nguồn hiệu lực.
- [x] Kiểm tra offer mới/hết hạn/storage chặn; giá trong thẻ, scheduler và modal nhất quán.
- [x] Kiểm tra ngày tự chọn, tối đa hai ngày, thiếu ngày và khoảng nghỉ; modal đóng bằng Escape, có focus/return focus và tab bàn phím.
- [x] Biểu mẫu lỗi giữ dữ liệu; success chỉ sau phản hồi được xác nhận; timeout/consent/honeypot/gửi trùng đúng.
- [x] Chat không báo đã gửi khi chỉ prefill; người dùng còn phải gửi biểu mẫu chính.
- [ ] Reduced-motion/Save-Data dùng giao diện tĩnh; kiểm tra bàn phím và thứ tự focus.
- [x] Preview `?tci-event=tet-demo` chỉ hoạt động local; URL thường/kill switch không có trang trí; không đổi giá hoặc nội dung.
- [x] Chạy `node tests/regression.cjs` với Playwright/Chromium sẵn có, xem báo cáo và ảnh trong `.qa/`; ghi kết quả thực tế.

## Trước khi chủ sở hữu cho phép phát hành

- [ ] Chủ sở hữu duyệt giao diện ban đầu trên `dev` và quyết định phạm vi cần chỉnh tiếp.
- [ ] Kiểm tra Safari iOS/Chrome Android trên thiết bị thật, gồm bàn phím và safe area.
- [ ] Chạy Lighthouse, lưu điều kiện đo và kết quả; không suy điểm từ dung lượng HTML.
- [ ] Xác minh giấy phép font và quyền sử dụng tài nguyên.
- [ ] Xác minh FormSubmit/email bằng yêu cầu có chủ đích; kiểm tra QR, thông tin nhận tiền và liên kết ngoài thật. Không thanh toán thử tự động.
- [ ] Rà lại dữ liệu, điều kiện ưu đãi và các thông tin tài chính với chủ sở hữu.
- [ ] Có bản sao/commit tách phạm vi, phương án khôi phục và diff được duyệt.
- [ ] Nhận chỉ dẫn rõ ràng của chủ sở hữu trước đưa lên `main`, push remote hoặc triển khai.
