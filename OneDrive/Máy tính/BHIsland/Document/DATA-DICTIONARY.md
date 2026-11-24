# GIsland — Data dictionary MVP

Tóm tắt miền dữ liệu giúp frontend/backend dùng nhất quán cùng từ vựng. Schema chi tiết được theo dõi ở `GIsland-PostgreSQL-Core.sql` ban đầu và migrations thật trong `Back_End/` sau khi khởi tạo.

## Thực thể cốt lõi

| Thực thể | Ý nghĩa | Quy tắc quan trọng |
|---|---|---|
| User | Tài khoản, thông tin đăng nhập và role/status | Email normalized và username duy nhất; account mới `pending` tới khi xác minh email rồi mới `active`; session/token không lưu plaintext; soft delete khi cần. |
| User profile | Thông tin hiển thị và privacy | Không đồng nhất privacy của profile với visibility của từng bài/phương tiện. |
| Vehicle type | Taxonomy cấu hình loại phương tiện | Slug ổn định; loại inactive không dùng cho bản ghi mới nhưng dữ liệu cũ vẫn đọc được. |
| Vehicle | Một phương tiện trong gara của user | Dùng bảng chung; thuộc tính chung dạng cột, ảnh bìa liên kết media ready của owner, đặc thù type-specific là JSONB có validation. |
| Media asset | File ảnh trong object storage và metadata | Có owner, storage key, MIME/size/checksum, trạng thái `pending/processing/ready/rejected/deleted`; chỉ `ready` được gắn nội dung. |
| Post | Bài viết của user, tùy chọn gắn vehicle | Visibility/status quyết định khả năng xuất hiện; body tối đa 3.000 ký tự; 0–10 media. |
| Tag | Hashtag chuẩn hóa | `slug` duy nhất, `display_name` phục vụ hiển thị; quan hệ post-tag là many-to-many. |
| Follow | Quan hệ follower → followee | Cặp user duy nhất; không self-follow; idempotent. |
| Like / save | Quan hệ user với post | Unique theo user+post; count nếu cache là giá trị dẫn xuất. |
| Comment | Bình luận trên post, có thể có parent giới hạn depth | Có author/status/deleted_at; kiểm tra quyền sửa/xóa. |
| Block | Quan hệ blocker → blocked | Có hiệu lực phía server trên profile, feed, search và tương tác. |
| Report | Báo cáo target bởi member | Có reason/status/assignee/resolution timestamps; moderator action cần reason. |
| Notification | Sự kiện hiển thị trong inbox recipient | Actor có thể null; dedupe khi worker retry; read_at null nghĩa là chưa đọc. |
| Outbox event | Sự kiện nền được ghi cùng transaction nghiệp vụ | Worker retry idempotent; processed_at null là chưa xử lý xong. |
| Audit log | Dấu vết hành động nhạy cảm/moderation/admin | Append-only; không đưa secret/private payload vào metadata. |

## Quy ước dữ liệu

- ID: UUID. Timestamp: `timestamptz` lưu UTC; hiển thị theo timezone user/product.
- Chuỗi so sánh định danh: normalize ở backend trước unique check; giữ display form tách riêng khi cần.
- Username được chuẩn hóa lowercase trước lưu; email được trim/lowercase trước lưu. Không để frontend tự quyết định cách chuẩn hóa duy nhất.
- Soft delete và moderation status là hai khái niệm khác nhau; đừng gộp thành một trạng thái mơ hồ.
- Visibility là quyền đọc; status là vòng đời xử lý. Cả hai phải được xét trước query/API serialization.
- JSONB chỉ chứa thuộc tính riêng theo loại phương tiện có schema validation; không thay thế cột/quan hệ nghiệp vụ cốt lõi.
- Thuộc tính MVP được giới hạn theo loại: motorcycle (`displacementCc`, `engineType`, `color`, `modifications`); car (`bodyStyle`, `fuelType`, `transmission`, `color`, `driveType`); bicycle (`bicycleType`, `frameMaterial`, `frameSize`, `color`); truck (`payloadKg`, `axleCount`, `truckBody`, `fuelType`); offroad (`suspension`, `drivetrain`, `tireSize`, `modifications`); electric (`batteryKwh`, `rangeKm`, `motorPowerKw`, `chargingConnector`); classic (`manufacturingYear`, `origin`, `restorationStatus`); other (`category`, `notes`). Giá trị là chuỗi/số/boolean/null; tối đa 12 khóa.
- Các giá trị enum trong API phải có mô tả OpenAPI và validation server-side; khi thêm giá trị, cập nhật UI fallback và mọi filter liên quan.

## Từ vựng trạng thái ban đầu

Các giá trị chính xác phải khớp API/schema trước khi implementation; bảng sau ghi ngữ nghĩa đang dự kiến, không tạo enum riêng ở frontend:

| Đối tượng | Trạng thái/ý nghĩa dự kiến |
|---|---|
| Media | `pending`: đang chờ upload/kiểm tra; `processing`: worker xử lý; `ready`: dùng được; `rejected`: file không đạt hoặc xử lý thất bại; `deleted`: đã xóa. |
| Post | Draft/published/hidden/deleted theo blueprint; visibility public/follower/private theo quyết định sản phẩm cuối. |
| Report | Open/assigned/resolved/dismissed theo workflow moderation được chốt. |
| Notification | Unread khi `read_at` null; read khi có timestamp. |

