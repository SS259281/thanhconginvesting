# Hành vi và dữ liệu phải giữ

Tài liệu này là hợp đồng kiểm tra hồi quy của bản `dev`. Thay đổi giá, số liệu, thông tin nhận tiền hoặc liên kết chuyển đổi phải được chủ sở hữu xác nhận riêng.

## Liên kết và liên hệ

- Mã chuyên gia SSI: `3186`; mở tài khoản: `https://www.ssi.com.vn/khach-hang-ca-nhan/mo-tai-khoan?mgm=3186`.
- Hướng dẫn mở/chuyển mã: `huong-dan-mo-tk-ssi.html`, `chuyen-ma-ssi.html`; giữ liên kết PDF Buổi 1 hiện có.
- Zalo: `https://zalo.me/0977921597`; điện thoại `0977 921 597`; email `contact.nhatradehoc@gmail.com`.
- Nhóm Zalo: `https://zalo.me/g/awu9n0xkftxzzocsrjlw`; Telegram Admin: `https://t.me/mmto1b`.

## Khóa học, giá và thanh toán

Khóa học giữ 8 buổi, học 1:1, online hoặc offline tại Hà Nội. Bộ chọn ngày bắt đầu tự chọn đúng thứ trong tuần; tối đa và bắt buộc hai ngày học. Khoảng cách vòng tuần giữa hai ngày ít nhất ba ngày, tương ứng hai ngày nghỉ. Giữ bốn khung giờ: 19h30–21h00, 21h00–22h30, 14h00–15h30, 09h00–10h30. Chưa bổ sung quy tắc cấm ngày bắt đầu trong quá khứ.

| Điều kiện hiển thị | VND | USDT/Binance Pay |
| --- | ---: | ---: |
| Trong 72 giờ của lượt truy cập đầu | 11.250.000 | 420 |
| Hết thời gian hiển thị | 15.000.000 | 555 |

Giữ khóa localStorage `tci_first_visit_started_at` và thời lượng 72 giờ. Đồng hồ, giá hiển thị và modal dùng cùng nguồn trạng thái; không dò giá từ chuỗi trong DOM. Khi storage bị chặn, ưu đãi của phiên hiện tại vẫn hiển thị. Đồng hồ thiết bị không phải cơ chế xác nhận quyền lợi ở máy chủ.

Thanh toán giữ Techcombank, tài khoản `689689259999`, chủ tài khoản `BUI THANH CONG`, nội dung `KHDT_TEN_SDT`; ví USDT `0x0b0661895a815cd929af65bcad8d55527d86f763` trên BEP20; Binance Pay ID `879904257`. Website chỉ hiển thị hướng dẫn và liên kết liên hệ, không xác nhận tiền đã nhận.

## Số liệu chứng minh

- SSI: 225 khách hàng, AUM 80 tỷ.
- MT5 kỳ 08–31.07.2026: đầu kỳ 30.602 USD; cuối kỳ 394.218,26 USD; lợi nhuận ròng 414.690,26 USD; profit factor 1,80; win rate 54,75%; drawdown 22,96%; 957 giao dịch.
- Crypto: ROI 90D +353,39%, cut-off 23.02.2026, ảnh `IMG_1261.jpg`.

Giữ toàn bộ điểm số dư nguồn và lưu ý rủi ro. Lợi nhuận ròng là số liệu báo cáo, không tính lại bằng chênh lệch số dư. Desktop/tab và mobile/accordion phải dùng cùng dữ liệu; không phục hồi số MT5 cũ 79.720 hoặc 90.346,99 USD.

## Biểu mẫu và chat

Endpoint giữ `https://formsubmit.co/ajax/contact.nhatradehoc@gmail.com`. Giữ trường tên, điện thoại, nhu cầu, NAV, email tùy chọn, kênh liên hệ, consent và honeypot. Giữ subject/template/captcha hiện có. Không gửi nếu thiếu consent, không hợp lệ hoặc honeypot có dữ liệu; không cho gửi trùng khi đang chờ.

Timeout 15 giây. Chỉ báo thành công và reset sau HTTP thành công **và** JSON `success` bằng `true`/`"true"`. Lỗi HTTP, JSON lỗi/từ chối hoặc timeout giữ dữ liệu để thử lại. Kiểm tra tự động phải giả lập mạng, không gửi yêu cầu thật.

Chat giữ menu và trả lời thông tin hiện có. Biểu mẫu nhỏ trước đây chỉ thông báo đã ghi nhận mà không gửi mạng; bản mới điền vào biểu mẫu chính, báo rõ **chưa được gửi**, yêu cầu kiểm tra/bổ sung và bấm gửi thật. Consent được kiểm tra lại ở biểu mẫu chính. Chat không tự gửi email hoặc xác nhận đã liên hệ.

Drawer/chat/modal hỗ trợ Escape, focus và đóng/mở có aria; tab hỗ trợ bàn phím. Chế độ giảm chuyển động/Save-Data không yêu cầu animation. Trang trí sự kiện mặc định tắt, preview chỉ trên local, không đổi giá hay số liệu.
