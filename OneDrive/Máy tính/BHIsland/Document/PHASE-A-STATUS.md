# GIsland — Theo dõi giai đoạn A

**Cập nhật:** 2026-11-24  
**Phạm vi:** Chốt sản phẩm/nền tảng, UX/dữ liệu/threat model, khung local/CI theo `PROJECT-PLAN.md`.

## Tiến độ

| Tuần | Trạng thái | Đầu ra hiện có | Còn lại |
|---|---|---|---|
| 1 — Khởi động và đóng phạm vi | Baseline hoàn thành | Product brief, backlog MVP, ADR-001 chốt ranh giới app. | Các nội dung product/provider còn có thể được chủ dự án điều chỉnh; chốt provider/tooling trước phần phụ thuộc. |
| 2 — UX, dữ liệu và threat model | Baseline hoàn thành | UX flows kèm wireframe low-fidelity, data dictionary, threat model, đối chiếu nguồn chuẩn. | Prototype trực quan và rà accessibility sẽ tiếp tục cùng giai đoạn UI; chốt ADR-002/003. |
| 3 — Repo, app skeleton và môi trường local | Chưa bắt đầu | Runtime Node.js 24.18.0 và npm 11.16.0 hiện có; đã xác nhận thư mục code chưa phát sinh file scaffold. | Chốt phần tooling; tạo app/workspace, PostgreSQL local, health endpoint, CI và setup guide. Lệnh lấy Svelte CLI từ npm registry không trả output sau 30 giây và đã dừng; cần registry khả dụng để scaffold đúng phiên bản. |

## Quyết định đã chốt

- ADR-001: một app SvelteKit duy nhất; UI/SSR và REST `/api/v1` cùng deploy; `Back_End/` là package server-side nội bộ, `Front_End/` chứa app và route handlers.
- Dùng tài liệu trong `Document/` làm nguồn yêu cầu/API; migrations backend là nguồn schema thực thi.

## Quyết định còn mở ảnh hưởng tuần 3

- ADR-002: package manager, ORM/query tool, migration runner, OpenAPI type generation và cách kiểm contract.
- ADR-003: email, object storage/worker và hosting/staging.
- Database dev local: PostgreSQL cài local hay container; cần quyết định theo công cụ sẵn có.

## Tiêu chí hoàn thành giai đoạn A

- Phạm vi MVP, non-goals, user journey và acceptance criteria có baseline.
- Quyết định kiến trúc app đã được ghi nhận; mọi quyết định cần cho scaffold có owner/trạng thái.
- Wireframe chính, data dictionary và threat model được review.
- Workspace chạy local theo hướng dẫn; PostgreSQL health check; build/CI cơ bản; `.env.example` không chứa secret.

