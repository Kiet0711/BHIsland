# GIsland — Theo dõi giai đoạn B

**Cập nhật:** 2026-11-24  
**Phạm vi:** nền tảng MVP, Auth/session, hồ sơ, gara phương tiện và media theo `PROJECT-PLAN.md`.

## Trạng thái

Đã triển khai mã cho vertical slice Phase B: ứng dụng SvelteKit, API server-side, schema/migration, luồng giao diện, sinh kiểu API từ OpenAPI và dịch vụ nghiệp vụ. Build production và type-check thành công. Database được cấu hình là PGlite local tương thích giao thức PostgreSQL; media dùng filesystem và email dùng mailbox giả lập chỉ dành cho phát triển. Chưa xác nhận được chạy ứng dụng end-to-end trong phiên này vì sandbox chặn bind cổng DB local.

| Nhóm | Đã có | Ranh giới hiện tại |
|---|---|---|
| Nền tảng | npm workspace và lockfile root, SvelteKit + Node adapter, cấu hình môi trường, API type generation, migration runner có advisory lock | Chưa có production deployment/CI |
| Auth/session | Đăng ký, xác minh email, đăng nhập/đăng xuất, session cookie, quên/đặt lại mật khẩu, Argon2id, token dùng một lần, rate limit | Email link được ghi vào mailbox local; chưa tích hợp email provider |
| Hồ sơ | Cập nhật hồ sơ và privacy; trang hồ sơ cá nhân công khai | Chưa có block/report/moderation |
| Gara | Danh mục loại xe, CRUD có ownership, cursor pagination, thuộc tính theo loại, chọn ảnh bìa | Chưa có tìm kiếm/hoạt động xã hội |
| Media | Upload intent, upload, kiểm tra MIME/nội dung/giới hạn, giải mã và re-encode WebP, loại EXIF, quyền đọc | Filesystem local; production cần object storage và quy trình dọn upload bỏ dở |
| Hợp đồng/schema | OpenAPI và types sinh ra; migration Phase B | Migration phải được áp dụng ở máy local qua các bước bên dưới |

## Cách chạy local

Yêu cầu Node.js 24 và npm. Tại thư mục gốc repo, dùng ba terminal:

```sh
npm install
npm run db:start
```

Terminal thứ hai, chạy migration một lần sau khi database đã báo sẵn sàng:

```sh
npm run db:migrate
```

Terminal thứ ba:

```sh
npm run dev
```

Mở `http://localhost:5173`. Email xác minh và reset được xem trong `http://localhost:5173/__dev/mailbox` (chỉ bật ngoài production). Dữ liệu local nằm trong `.local-data/`, đã được gitignore.

Các lệnh chất lượng hiện có: `npm run check`, `npm run build`, `npm run api:types`.

## Điều kiện trước production

- Dùng PostgreSQL quản lý thay PGlite local, cấu hình backup, TLS và secret manager.
- Tích hợp nhà cung cấp email; không dùng local mailbox ở production.
- Tích hợp object storage/CDN và dọn media intent hết hạn.
- Bổ sung CI, logging/monitoring, kiểm tra bảo mật và rà soát schema/API khi mở thêm tính năng.

## Bằng chứng hoàn thành

- `npm run check`: type-check frontend và backend.
- `npm run build`: production build SvelteKit.
- Chạy toàn bộ migration trên một PGlite in-memory mới: thành công; taxonomy tạo 8 vehicle types.
- `npm run api:types`: sinh TypeScript types từ OpenAPI.

Lệnh chạy PGlite Socket trên cổng 5432 bị môi trường thực thi từ chối bind (`EACCES`), kể cả khi yêu cầu quyền nâng cao. Vì vậy chưa xác nhận được `npm run db:migrate` qua socket runner hoặc luồng UI/API end-to-end trong phiên này. Khi chạy trên máy người dùng, hoàn tất bước này theo hướng dẫn local ở trên.

Chi tiết các giới hạn môi trường và xác minh trong `Document/PROJECT-PLAN.md`, `Document/DECISIONS.md` và README của hai workspace.
