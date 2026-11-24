# GIsland — Nhật ký quyết định kiến trúc

Ghi quyết định có ảnh hưởng tới nhiều phần trước khi implementation phụ thuộc vào chúng. Mỗi quyết định mới cần có ngày, trạng thái, lý do, hệ quả và tài liệu/file cần cập nhật. Không xóa quyết định cũ; đánh dấu superseded và liên kết quyết định thay thế.

## Trạng thái

- `OPEN`: cần quyết định; không tự giả định khi implementation phụ thuộc trực tiếp.
- `ACCEPTED`: đã chốt, các phần phải làm theo.
- `SUPERSEDED`: đã bị quyết định mới thay thế.

## ADR-001 — Ranh giới Front_End và Back_End

- **Trạng thái:** ACCEPTED
- **Ngày:** 2026-11-24
- **Bối cảnh:** Blueprint đề xuất modular monolith: SvelteKit SSR và REST API cùng chạy trên Node.js. Workspace hiện có hai thư mục riêng `Front_End/` và `Back_End/`; hai thư mục này chưa có mã nguồn.
- **Quyết định:** Chọn phương án 1. `Front_End/` sẽ là ứng dụng SvelteKit duy nhất, gồm UI/SSR và HTTP route handlers `/api/v1`. `Back_End/` là package server-side nội bộ chứa domain modules, DB, security, storage và jobs; package này không chạy như một API service/deployable riêng trong MVP. Cả hai nằm trong một npm workspace, được build/deploy cùng nhau.
- **Lý do:** Bám sát blueprint modular monolith, giảm CORS/session/deploy/observability vận hành, đồng thời giữ hai vùng mã nguồn rõ theo cách tổ chức thư mục người dùng đã tạo.
- **Hệ quả:** HTTP routes ở `Front_End/` chỉ làm lớp transport và gọi service ở `Back_End/`; module backend không import UI. Chỉ server code được phép import package backend. Mọi thay đổi sang hai service độc lập cần ADR mới và cập nhật blueprint.
- **File cần cập nhật:** README hai phần, cấu hình workspace, API/auth architecture và CI khi dựng khung.

## ADR-002 — ORM, migration và API type generation

- **Trạng thái:** ACCEPTED
- **Ngày:** 2026-11-24
- **Bối cảnh:** SQL hiện tại là schema tham chiếu, chưa có migration runner hay code backend; frontend cần tiêu thụ đúng contract.
- **Quyết định:** Dùng npm workspaces ở root, một `package-lock.json`; Node.js 24 LTS; `node-postgres` (`pg`) với câu SQL tham số hóa thay ORM; SQL migration có version chạy qua runner dùng `pg`; tạo TypeScript API types từ OpenAPI bằng `openapi-typescript`.
- **Lý do:** Giữ migrations SQL hiện có làm nguồn chuẩn, giảm lớp mapping giữa schema và DB, dùng cùng driver cho PostgreSQL thật và PGlite Socket local; generation giúp frontend/backend nói cùng contract.
- **Hệ quả:** repository phải dùng placeholders `$1...` và không nối input vào SQL; migration runner ghi `app_migrations`; generated API types không được sửa tay. Contract runtime validation vẫn do schema/domain validation phía backend đảm nhiệm.

## ADR-003 — Email, media storage và hosting

- **Trạng thái:** OPEN
- **Ngày:** 2026-11-24
- **Bối cảnh:** Auth cần email xác minh/reset; media cần signed upload, xử lý ảnh và lưu object; MVP cần staging, secrets, logs và backup.
- **Cần chốt:** provider email, S3-compatible storage, worker execution, hosting/domain, backup retention và budget.
- **Tiêu chí chọn:** dùng được ở Việt Nam, có môi trường local/staging, chi phí demo dự đoán được, có TLS/secrets/backup và không khóa vào URL public tĩnh.
- **Hệ quả khi chốt:** cấu hình `.env.example`, adapter/local development, health checks, runbook và chính sách giữ/xóa file.

## ADR-004 — Dịch vụ local để chạy Phase B

- **Trạng thái:** ACCEPTED
- **Ngày:** 2026-11-24
- **Bối cảnh:** Máy phát triển không có PostgreSQL CLI/Docker; Phase B cần email xác minh/reset và upload để kiểm tra journey.
- **Quyết định:** Local DB dùng PGlite Socket persistent trên loopback, kết nối qua `pg`; email local ghi vào mailbox bị Git ignore và đọc được qua dev-only page; media local ghi vào filesystem bị Git ignore và được re-encode bằng Sharp. Các adapter local chỉ dành cho development; production vẫn cần PostgreSQL managed, email provider và object storage S3-compatible.
- **Lý do:** Cho phép phát triển/nhập liệu local mà không cài dịch vụ hệ thống hoặc gửi email/ảnh ra ngoài; giữ cùng Postgres wire protocol và service contracts.
- **Hệ quả:** Local PGlite có giới hạn một database engine/ít connection và không phải cấu hình production. Không bind ngoài `127.0.0.1`; dữ liệu nằm trong `.local-data/` và không commit.

## ADR-005 — Thời hạn session và auth token

- **Trạng thái:** ACCEPTED
- **Ngày:** 2026-11-24
- **Quyết định:** Session tồn tại 7 ngày; email verification token 24 giờ; password reset token 30 phút; mỗi token dùng một lần. Tất cả token ngẫu nhiên tối thiểu 32 bytes; chỉ hash SHA-256 lưu DB.
- **Lý do:** Defaults cụ thể để Phase B có thể triển khai nhất quán; có thể điều chỉnh trước production theo threat review.
- **Hệ quả:** Giá trị mặc định có thể override bằng env trong môi trường dev; log/email spool không được ghi vào Git; reset password thu hồi mọi session hiện hành.

## Mẫu quyết định mới

```markdown
## ADR-NNN — Tiêu đề
- **Trạng thái:** OPEN | ACCEPTED | SUPERSEDED
- **Ngày:** YYYY-MM-DD
- **Bối cảnh:** ...
- **Quyết định:** ...
- **Lý do:** ...
- **Hệ quả:** ...
- **File cần cập nhật:** ...
```

