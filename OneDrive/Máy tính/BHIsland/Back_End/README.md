# Back_End — GIsland server-side package

`Back_End` chứa dịch vụ server-side nội bộ của modular monolith SvelteKit. HTTP routes nằm trong `Front_End/src/routes/api`; các route gọi nghiệp vụ, bảo mật và truy cập DB từ package này. Đây không phải API service triển khai riêng trong MVP (ADR-001).

## Đã triển khai cho Phase B

- `src/auth.ts`: đăng ký, verify email, login/logout, session và password reset.
- `src/profiles.ts`: đọc/cập nhật hồ sơ và hồ sơ công khai.
- `src/vehicles.ts`: danh mục, CRUD xe, ownership, cursor pagination và cover media.
- `src/media.ts`: upload intent, xác minh/chuẩn hóa ảnh và kiểm soát quyền đọc.
- `src/db.ts`, `src/security.ts`, `src/rate-limit.ts`, `src/mail.ts`: nền tảng DB/bảo mật/mailbox phát triển.
- `migrations/`: schema có phiên bản; không sửa migration đã chạy ở môi trường dùng chung.

## Chạy local

Từ thư mục gốc repo, mở terminal 1:

```sh
npm install
npm run db:start
```

Terminal 2, sau khi DB báo sẵn sàng:

```sh
npm run db:migrate
```

Terminal 3 chạy giao diện/API: `npm run dev`. DB mặc định kết nối `127.0.0.1:5432` qua PGlite Socket. Có thể cấu hình bằng `.env` ở root; xem `.env.example`.

`npm run check --workspace=@gisland/backend` type-check package. `npm run db:migrate` có thể chạy lặp an toàn nhờ bảng migration và advisory lock.

## Quy ước

- API contract chuẩn là `Document/GIsland-OpenAPI.yaml`; sinh types bằng `npm run api:types`.
- Schema triển khai chuẩn là migrations trong thư mục này; `Document/GIsland-PostgreSQL-Core.sql` là tài liệu tham khảo.
- Kiểm tra auth, ownership, privacy và trạng thái ở server; validate input và dùng query tham số hóa.
- PGlite, mailbox local và filesystem media chỉ dùng cho local development. Production cần managed PostgreSQL, email provider và object storage.
