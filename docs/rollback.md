# Khôi phục an toàn

Mốc đối chiếu trước nâng cấp: `9edb4ea`. Công việc hiện nằm trên `dev`; không giả định đã tạo commit cho bản nâng cấp. Ưu tiên khôi phục có thể đảo lại, giữ bản làm hiện tại và mọi thay đổi của người khác.

## Trước khi khôi phục

1. Kiểm tra `git branch --show-current`, `git status --short` và diff; xác định chính xác phần cần khôi phục.
2. Sao lưu các file sửa cùng toàn bộ file mới chưa được Git theo dõi ra thư mục riêng có ngày giờ. Lưu thêm `git diff --binary`; diff một mình không chứa file untracked.
3. Dừng server local nếu đang xem kết quả cũ trong cache. Không dùng `reset --hard`, `clean -fd`, xóa đệ quy hoặc force push để khôi phục.

## Khi thay đổi chưa được commit

Khôi phục từ bản sao theo từng file sau khi đối chiếu, hoặc lấy file cần thiết ở `9edb4ea` bằng Git sau khi đã sao lưu. Bản cũ dùng HTML có tài nguyên/JavaScript inline và `index-aug04.js`; khôi phục HTML cũ phải đi cùng tham chiếu asset/script của đúng mốc. Không trộn HTML cũ với module mới đang hoạt động.

Các file mới có thể giữ trong bản sao ngoài thư mục phục vụ. Không cần xóa tài nguyên dư để giao diện cũ chạy; chỉ loại khỏi bản phát hành sau khi kiểm tra không còn tham chiếu.

## Khi đã có commit riêng cho nâng cấp

Dùng `git revert <commit-nâng-cấp>` trên nhánh làm việc đã xác nhận để tạo commit đảo thay đổi, rồi kiểm tra lại diff và preview. Không revert nhầm commit của người khác; nếu commit chứa nhiều phạm vi, khôi phục từng file/khối phù hợp thay vì đảo cả commit.

## Tắt riêng trang trí sự kiện

Đặt `killSwitch: true` trong `content/events.json` để tắt cả lịch và preview, hoặc `enabled: false` để tắt lịch nhưng vẫn cho preview local. Tab đã mở cần tải lại cấu hình; đây không phải thao tác triển khai. Xem [SOP sự kiện](event-update-sop.md).

Sau khôi phục, kiểm tra trang chủ, mobile menu, SSI/Zalo/PDF, tab số liệu, giá/lịch, modal và biểu mẫu bằng mạng giả lập. Chủ sở hữu xem lại trước mọi thao tác lên `main`/remote/production.
