# Rủi ro và phần cần xác minh

| Vấn đề | Ảnh hưởng | Cách xử lý/trạng thái |
| --- | --- | --- |
| FormSubmit chưa gửi thật | Test giả lập không chứng minh email đến hộp thư | Chủ sở hữu kiểm tra một yêu cầu có chủ đích trước phát hành |
| VietQR/QRServer chưa xác minh trực tiếp | QR có thể không tải khi mất mạng/dịch vụ lỗi | Luôn giữ thông tin nhận tiền dạng chữ; kiểm tra QR thật trước phát hành |
| Website không có backend thanh toán | Không thể xác nhận giao dịch hoặc điều kiện ưu đãi | Đối soát thủ công với Admin; không thêm thông báo thanh toán thành công |
| localStorage/đồng hồ thiết bị | Người dùng có thể đổi thời gian/xóa dữ liệu; storage có thể bị chặn | Giữ hành vi 72 giờ cũ, dùng chung trạng thái giá; xác nhận điều kiện thực tế khi đăng ký |
| Tài nguyên PNG/TTF còn lớn | HTML nhỏ hơn không đảm bảo tải nhanh trên mạng yếu | Đo Lighthouse và mạng yếu trước khi chọn chuyển đổi định dạng |
| Giấy phép font chưa xác minh | Chưa đủ chứng cứ quyền phân phối font | Giữ byte nguồn, chưa chuyển đổi; bổ sung giấy phép trước phát hành |
| Legacy CSS còn nhiều lớp | Dễ mất cascade nếu đổi thứ tự/xóa file | Giữ thứ tự hiện tại; đối chiếu ảnh và style trước khi tinh gọn tiếp |
| iOS/Android thật chưa kiểm tra | Bàn phím, safe area, Safari hoặc date input có thể khác Chromium | Kiểm tra ít nhất Safari iOS và Chrome Android trên thiết bị thật |
| Lighthouse chưa chạy | Chưa có điểm hiệu năng/a11y/SEO đo được | Không công bố điểm; bổ sung báo cáo trước khi cân nhắc phát hành |
| Số liệu tài chính giữ nguyên nguồn | Nội dung nâng cấp không đồng nghĩa xác minh báo cáo/điều kiện | Chủ sở hữu rà lại số liệu, quyền lợi và ngày cập nhật |
| Lịch sự kiện dùng giờ thiết bị | Nhãn trang trí có thể lệch khi đồng hồ sai | Chỉ dùng trang trí; mặc định tắt, có kill switch, không quyết định giá |
| Dữ liệu JSON không tải | Tab nâng cao có thể không khởi tạo | Giữ HTML chứng minh sẵn có; theme lỗi không ảnh hưởng luồng chính |

QA Chromium local đã hoàn tất và được ghi tại `qa-report.md`; các bước dịch vụ live, thiết bị thật và phát hành vẫn chưa thực hiện. Không có triển khai, thay đổi `main` hoặc push remote trong đợt làm hiện tại.
