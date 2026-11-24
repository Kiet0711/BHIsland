# Front_End — GIsland web app

Frontend là ứng dụng SvelteKit chạy SSR bằng Node adapter. Các API handlers cũng ở trong app (`src/routes/api/v1`) và gọi nghiệp vụ từ workspace `@gisland/backend`.

## Chạy local

Từ thư mục gốc repo, chạy `npm install`, sau đó khởi động database và áp dụng migration:

```sh
npm run db:start
npm run db:migrate
```

Trong terminal khác, chạy:

```sh
npm run dev
```

Mở `http://localhost:5173`. Mailbox phát triển ở `/__dev/mailbox` hiển thị liên kết xác minh/reset do ứng dụng gửi giả lập.

Các trang Phase B gồm đăng ký/đăng nhập, verify/reset mật khẩu, hồ sơ cá nhân/công khai và gara CRUD phương tiện cùng chọn ảnh.

## Lệnh tại root

- `npm run check`: Svelte/TypeScript frontend và TypeScript backend.
- `npm run build`: production build.
- `npm run api:types`: sinh `src/lib/api/generated.ts` từ `Document/GIsland-OpenAPI.yaml`.

Không thêm dependency lockfile riêng trong workspace; root `package-lock.json` là nguồn duy nhất. Xem `Document/SYNC-RULES.md` khi thay đổi hợp đồng/schema dùng chung.
