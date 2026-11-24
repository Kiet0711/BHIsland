# GIsland — MVP backlog

Backlog được sắp theo phụ thuộc và giá trị người dùng. Đây là danh sách khởi đầu; mỗi dòng lớn cần được tách thành ticket nhỏ trước khi đưa vào sprint. Chi tiết API/schema theo OpenAPI và SQL/migrations, không chép các định nghĩa đó vào backlog.

## P0 — Nền tảng và hành trình cốt lõi

| ID | Epic / story | Điều kiện nghiệm thu chính | Phụ thuộc |
|---|---|---|---|
| A-01 | Khởi tạo workspace, app và CI | Có hướng dẫn setup; app/DB health check; build tự động; env mẫu không chứa secret. | ADR nền tảng |
| A-02 | Migration baseline và seed | PostgreSQL local có thể khởi tạo từ rỗng; seed giả lập chạy lặp lại; migration được version. | A-01 |
| AUTH-01 | Đăng ký và xác minh email | Email normalized unique; token một lần/hết hạn; rate limit; không lộ email tồn tại ở các phản hồi nhạy cảm. | A-02, provider email |
| AUTH-02 | Đăng nhập/đăng xuất/session | Cookie an toàn; session có thể thu hồi; không lưu token thô trong DB. | AUTH-01 |
| AUTH-03 | Quên/đặt lại mật khẩu | Token một lần/hết hạn; rate limit; thu hồi session theo chính sách đã chốt. | AUTH-02 |
| USER-01 | Hồ sơ cá nhân và privacy | User cập nhật trường cho phép; username duy nhất; server enforce visibility. | AUTH-02 |
| VEH-01 | Danh mục loại phương tiện | Seed các loại ban đầu; dùng slug ổn định; admin có thể bật/tắt danh mục. | A-02 |
| VEH-02 | Gara CRUD | Chủ sở hữu CRUD phương tiện; JSONB attributes được kiểm schema theo loại; IDOR bị chặn. | USER-01, VEH-01 |
| MEDIA-01 | Upload intent và complete | Auth, quota, allowlist, kích thước/checksum; xác minh object; trạng thái pending/processing/ready/rejected. | AUTH-02, storage |
| MEDIA-02 | Xử lý ảnh | Kiểm tra bytes; re-encode/thumbnail; loại EXIF nhạy cảm; cleanup file lỗi/bỏ dở. | MEDIA-01, worker |
| POST-01 | Tạo/sửa/xóa bài | 0–10 media; tối đa 3.000 ký tự; chỉ media ready; quyền tác giả; status/visibility server-side. | USER-01, VEH-02, MEDIA-02 |
| POST-02 | Hashtag và liên kết phương tiện | Chuẩn hóa tag; không tạo tag trùng theo slug; liên kết đúng quyền/visibility. | POST-01 |
| FEED-01 | Feed public và profile feed | Cursor ổn định; loại bài hidden/deleted/private/blocked; SSR/SEO cho trang public. | POST-01 |
| SOCIAL-01 | Follow/unfollow | Idempotent; unique relation; không tự theo dõi; follower list có pagination. | USER-01 |
| SOCIAL-02 | Like/unlike và save/unsave | Idempotent; unique key; chỉ tương tác với bài có thể xem. | POST-01 |
| SOCIAL-03 | Comment CRUD | Giới hạn depth; kiểm tra tác giả; xử lý trạng thái xóa/ẩn; rate limit. | POST-01 |
| PRIV-01 | Block/unblock | Block áp dụng xuyên profile, feed, search và tương tác; server là nguồn quyết định. | USER-01, FEED-01 |

## P1 — Hoàn chỉnh MVP và vận hành

| ID | Epic / story | Điều kiện nghiệm thu chính | Phụ thuộc |
|---|---|---|---|
| FEED-02 | Following feed | Keyset/cursor ổn định; lọc privacy/block/status; query có index phù hợp. | FEED-01, SOCIAL-01, PRIV-01 |
| SEARCH-01 | Tìm user/post/vehicle | Giới hạn input/kết quả; filter loại xe/tag; thứ tự xác định; lọc quyền trước trả dữ liệu. | USER-01, VEH-02, POST-01, PRIV-01 |
| MOD-01 | Tạo report | Target hợp lệ; reason code; chống spam/duplicate theo chính sách; reporter không xem dữ liệu nội bộ. | POST-01, SOCIAL-03 |
| MOD-02 | Hàng đợi và xử lý report | Moderator role; hide/restore; reason bắt buộc; audit log append-only. | MOD-01, RBAC |
| NOTIF-01 | Outbox event | Ghi cùng transaction; retry idempotent; theo dõi attempts/failed events. | A-02, worker |
| NOTIF-02 | Notification inbox | Follow/like/comment; không tự notify; unread/read; không lộ thông tin của entity không còn xem được. | NOTIF-01, SOCIAL |
| ADMIN-01 | Quản lý danh mục và role | RBAC; thay đổi nhạy cảm có audit; kiểm soát quyền admin. | MOD-02 |
| UX-01 | Responsive/accessibility states | Luồng cốt lõi mobile/desktop, keyboard, focus, labels, alt, loading/empty/error. | FEED, POST, SOCIAL |
| OPS-01 | Logging, health và backup | Request ID; log không có secret; backup mã hóa; restore rehearsal; runbook. | A-01, staging |

## P2 — Sau MVP

Nhóm nâng cao, sự kiện/chuyến đi, email notification tùy chọn, album, export/xóa tài khoản nâng cao, chat, video, marketplace, native app và recommendation. Không đưa vào MVP nếu chưa có quyết định scope mới.

## Quy tắc đưa backlog vào sprint

- Task nên hoàn thành và review được trong 1–2 ngày; nếu lớn hơn, tách theo vertical slice.
- Mỗi story có owner, phụ thuộc, acceptance criteria, trạng thái và link contract/migration liên quan.
- Không bắt đầu story có phụ thuộc OPEN trong `DECISIONS.md`.
- Ưu tiên end-to-end slice chạy được; không gom toàn bộ backend hoặc toàn bộ UI thành các giai đoạn tách rời.

