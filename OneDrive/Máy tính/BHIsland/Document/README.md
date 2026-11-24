# GIsland — Tài liệu dự án

Thư mục này là nơi lưu **đặc tả có thẩm quyền, quyết định kiến trúc và quy trình đồng bộ**. Mã chạy được nằm trong `Back_End/` và `Front_End/`; không đặt bản sao tài liệu kỹ thuật trong hai thư mục đó ngoại trừ README hướng dẫn từng phần.

## Tài liệu

| Tài liệu | Vai trò |
|---|---|
| [GIsland-Technical-Blueprint.md](GIsland-Technical-Blueprint.md) | Nguồn yêu cầu sản phẩm, kiến trúc mục tiêu, ERD logic, bảo mật và tiêu chí chất lượng. |
| [GIsland-OpenAPI.yaml](GIsland-OpenAPI.yaml) | Hợp đồng API chuẩn để backend triển khai và frontend tích hợp. |
| [GIsland-PostgreSQL-Core.sql](GIsland-PostgreSQL-Core.sql) | Schema tham khảo ban đầu; không thay thế migrations đã chạy trong backend. |
| [PROJECT-PLAN.md](PROJECT-PLAN.md) | Kế hoạch MVP 16 tuần, đầu ra và cổng nghiệm thu. |
| [SYNC-RULES.md](SYNC-RULES.md) | Quy trình thay đổi để tránh lệch API, dữ liệu, quyền và hành vi UI. |
| [DECISIONS.md](DECISIONS.md) | Nhật ký quyết định; các mục OPEN phải được chốt trước phần việc phụ thuộc. |
| [PRODUCT-BRIEF.md](PRODUCT-BRIEF.md) | Mục tiêu, người dùng, giá trị và phạm vi MVP. |
| [MVP-BACKLOG.md](MVP-BACKLOG.md) | Epics/story khởi đầu theo thứ tự phụ thuộc và mức ưu tiên. |
| [UX-FLOWS.md](UX-FLOWS.md) | Luồng người dùng và trạng thái UI tối thiểu để làm wireframe. |
| [DATA-DICTIONARY.md](DATA-DICTIONARY.md) | Từ vựng nghiệp vụ và quy ước dữ liệu chung. |
| [THREAT-MODEL.md](THREAT-MODEL.md) | Tài sản, trust boundaries, abuse cases và security release gate. |
| [PHASE-A-STATUS.md](PHASE-A-STATUS.md) | Tiến độ các đầu ra giai đoạn A và quyết định còn mở. |
| [PHASE-B-STATUS.md](PHASE-B-STATUS.md) | Tiến độ auth, profile, garage, media và phụ thuộc môi trường. |
| [../Back_End/migrations/0001_phase_b_identity_garage_media.sql](../Back_End/migrations/0001_phase_b_identity_garage_media.sql) | Migration baseline cho tài khoản/session/token, hồ sơ, loại xe, media và gara; chưa áp dụng vào DB. |

## Quy tắc nguồn chuẩn

- Yêu cầu và phạm vi: `GIsland-Technical-Blueprint.md`; khi có quyết định mới hơn, ghi vào `DECISIONS.md` và cập nhật blueprint nếu thay đổi chính thức.
- API request/response/status/path: `GIsland-OpenAPI.yaml`.
- Schema đã triển khai: migration trong `Back_End/`; file SQL Core chỉ là tham chiếu ban đầu.
- Trạng thái dữ liệu thật: database migrations và model backend; không duy trì một schema thủ công thứ hai ở frontend.
- Kiểu dữ liệu API dùng ở frontend: sinh từ OpenAPI hoặc được kiểm tra tự động với OpenAPI; không tự khai báo lại các DTO tương đương.
- Mỗi thay đổi phải theo [SYNC-RULES.md](SYNC-RULES.md), có cập nhật các bên liên quan trong cùng nhánh/đợt làm việc.

