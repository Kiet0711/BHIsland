# GIsland — Threat model MVP

**Trạng thái:** Baseline cho design review; cần cập nhật khi auth/storage/deploy và moderation providers được chốt.  
**Phương pháp:** Tài sản → trust boundaries → misuse cases → kiểm soát → tiêu chí release.

## Tài sản cần bảo vệ

- Credentials, session cookies, password-reset/email-verification tokens.
- Email, profile data, private posts/vehicles, block/report history.
- Nội dung do user tạo và media gốc (có thể chứa EXIF GPS hoặc payload độc hại).
- Quyền moderator/admin, taxonomy/configuration và audit log.
- Database, backups, object storage, signed URLs, secrets và logs.

## Trust boundaries

1. Browser và mọi dữ liệu gửi từ client đều không đáng tin cậy.
2. SvelteKit HTTP handlers là biên HTTP; xác thực, CSRF/Origin, rate limit, validation, request ID được áp dụng ở biên này.
3. Backend domain services có trách nhiệm kiểm tra role, ownership, privacy, status và block; không tin rằng route/UI đã kiểm tra đủ.
4. PostgreSQL là nguồn dữ liệu chuẩn cho quyền/trạng thái nghiệp vụ.
5. Object storage không public theo mặc định; chỉ URL có scope/hạn dùng phù hợp được cấp sau khi kiểm tra quyền.
6. Worker nhận sự kiện outbox và file untrusted; xử lý cần giới hạn tài nguyên, idempotency và quyền DB/storage tối thiểu.
7. Email provider, hosting, storage và monitoring là bên thứ ba; không gửi secret hoặc dữ liệu nhạy cảm trong log/metadata không cần thiết.

## Abuse cases và kiểm soát thiết kế

| Mối đe dọa | Kiểm soát cần có | Cổng xác minh |
|---|---|---|
| Credential stuffing, brute force, account takeover | Argon2id/bcrypt; rate limit login/register/reset; session rotate/revoke; reset token một lần; MFA admin trước production. | Auth journey; lock/rate-limit behavior; session invalidation. |
| IDOR/mass assignment | Authorization trong domain service cho từng resource; allowlist writable fields; ownership check theo resource và actor. | Thử đổi UUID ở mọi CRUD/report/moderation path. |
| CSRF và session theft | HttpOnly/Secure/SameSite cookie; CSRF token hoặc Origin validation cho mutation; HTTPS; không đưa token vào URL/localStorage. | Mutation cross-origin bị từ chối; cookie flags xác nhận ở staging. |
| Stored XSS/HTML injection | Không render HTML tùy ý; escape theo context; CSP; validate URL/alt/text; sanitize khi cần rich text trong tương lai. | Payload script hiển thị như text và không thực thi. |
| SQL injection/unsafe filters | Query parameterization; schema validation; allowlist sort/filter; không nối SQL từ input. | Review các search/order/filter query. |
| Upload polyglot, malware, decompression/pixel bomb | Allowlist MIME/extension; magic-byte validation; byte/pixel limits; re-encode; malware scan nếu khả dụng; quota, timeout, cleanup. | File giả MIME, file quá lớn và file lỗi bị từ chối; media không ready không publish. |
| Lộ vị trí/metadata ảnh | Xóa EXIF GPS và metadata không cần; re-encode; access qua signed URL ngắn hạn/CDN policy. | Inspect output image metadata và quyền truy cập object. |
| Privacy leak qua feed/search/notification | Policy dùng chung; lọc visibility/status/block trước serialize; notification không preview nội dung không xem được; signed media access có authorization. | Kiểm tra public/private/blocked/deleted trên mọi read path. |
| Spam, harassment, report flooding | Rate limit; block/report; quota; moderator queue, reason, escalation và audit. | Abuse cases ở registration/comment/upload/report. |
| Moderator/admin abuse | Least privilege; role separation; reason bắt buộc; append-only audit; admin MFA trước production. | Audit actor/action/target/reason và permission matrix. |
| Outbox replay/notification duplication | Dedupe key; worker idempotent; bounded retry/backoff; dead-letter/monitoring strategy. | Replay cùng event không tạo notification trùng. |
| Secret/backup/log exposure | Secret manager/env; TLS; least-privilege DB/storage; encrypted backup; restore rehearsal; redact logs. | Secret scan, config review, restore rehearsal. |

## Quy tắc xử lý sự cố

- Lỗi auth/authorization mặc định deny; lỗi policy hoặc dependency không được biến thành public allow.
- Log request ID, actor/resource identifiers ở mức cần thiết, nhưng không log password, token, signed URL, raw private payload hoặc nội dung report nhạy cảm.
- Có quy trình thu hồi session, vô hiệu hóa signed access, khóa tài khoản/role và dừng worker khi phát hiện abuse.
- Trước đăng ký public, xác định người phụ trách moderation, retention/xóa dữ liệu, quy trình phản hồi report và kênh báo sự cố.

## Release gate an toàn

- Không còn lỗi nghiêm trọng về auth, IDOR, privacy, upload hoặc XSS.
- Kiểm tra quyền cho cả route HTTP và domain service; private/blocked/deleted được lọc đồng nhất.
- Secrets không nằm trong repository; staging dùng HTTPS; backup mã hóa và có bằng chứng restore rehearsal.
- Upload có giới hạn, kiểm tra/re-encode và cleanup; media chưa `ready` không publish.
- Moderator action có reason và audit log; quyền admin được giới hạn.
- Threat model được rà lại sau khi chốt ADR-003 (providers) và trước public release.

