# GIsland — Kế hoạch triển khai MVP

**Phiên bản:** 1.0  
**Cơ sở:** Blueprint GIsland 1.0, OpenAPI 3.1 và PostgreSQL Core Schema  
**Thời lượng tham chiếu:** 16 tuần, một người full-stack làm toàn thời gian  
**Trạng thái hiện tại:** Có đặc tả và thiết kế; chưa có mã nguồn ứng dụng trong `Front_End/` và `Back_End/`.

## 1. Mục tiêu và cách dùng kế hoạch

Mục tiêu là đưa GIsland từ bộ tài liệu sang một MVP chạy được, có thể demo và phát hành thử nghiệm. Sản phẩm cần hoàn tất vòng lặp chính: đăng ký → tạo hồ sơ → thêm phương tiện → đăng bài có ảnh → được khám phá → tương tác và theo dõi.

Kế hoạch dưới đây dùng tuần tương đối kể từ ngày khởi động. Mỗi tuần nên kết thúc bằng một phần sản phẩm chạy được và có thể review. Nếu tiến độ trễ, cắt phạm vi Phase 2/3 và phần trang trí trước; không cắt kiểm tra quyền, bảo vệ upload, backup/restore hoặc luồng MVP.

### Ngoài phạm vi MVP

Chat realtime, livestream/video, marketplace/giao dịch, thanh toán, nhóm nâng cao, sự kiện/chuyến đi, ứng dụng native, định vị realtime và recommendation ML.

## 2. Nguyên tắc triển khai

1. Dùng modular monolith: SvelteKit chạy Node.js, PostgreSQL, object storage tương thích S3 và worker nhẹ cho tác vụ nền.
2. Dùng một mô hình `vehicles` cùng `vehicle_types` cho mọi phương tiện; thuộc tính riêng loại xe nằm trong JSONB có validation.
3. OpenAPI là hợp đồng API; mọi thay đổi endpoint/schema phải cập nhật đồng thời đặc tả và implementation.
4. Quyền sở hữu, visibility, status và block được áp dụng server-side trước khi trả dữ liệu.
5. Ảnh chỉ được gắn vào bài khi trạng thái media là `ready`; file lưu ở object storage, không lưu binary trong PostgreSQL.
6. Like/save/follow dùng quan hệ có unique constraint; số đếm là dữ liệu dẫn xuất, không phải nguồn sự thật.
7. Mỗi tính năng hoàn tất kèm acceptance criteria, xử lý lỗi, phân quyền, logging phù hợp và tài liệu cập nhật.

## 3. Cổng quyết định trước khi bắt đầu xây dựng

Hoàn tất trong tuần 1–2; ghi quyết định vào `Document/decisions/` hoặc một ADR tương ứng.

| Quyết định | Phương án mặc định để lập kế hoạch | Cần chốt trước |
|---|---|---|
| Phạm vi trình diễn | Web responsive, tiếng Việt, người dùng Việt Nam | Người dùng mục tiêu và luồng demo chính |
| Công nghệ | SvelteKit + Node adapter, PostgreSQL, TypeScript | Phiên bản runtime/framework và quản lý package |
| ORM/truy vấn DB | Chưa khóa; chọn một công cụ migration có rollback/forward rõ ràng | ORM/query builder và quy ước migration |
| Đăng nhập | Email + mật khẩu, session cookie, xác minh email | Nhà cung cấp email và cách chạy local |
| Ảnh | S3-compatible storage, upload trực tiếp bằng signed URL hoặc proxy | Nhà cung cấp, giới hạn dung lượng, quota và chi phí |
| Triển khai | Một môi trường staging trước release | Hosting, domain, secrets, log/metrics và backup |
| Chính sách | Nội dung công khai theo lựa chọn, report/block, xóa dữ liệu | Quy tắc moderation, retention và quy trình yêu cầu xóa |

Không cấu hình credential thật trong Git. Dùng `.env.example` với tên biến và giá trị giả lập.

## 4. Kế hoạch theo tuần

### Giai đoạn A — Chốt sản phẩm và dựng nền

| Tuần | Công việc chính | Đầu ra | Điều kiện hoàn tất |
|---|---|---|---|
| **1 — Khởi động và đóng phạm vi** | Xác nhận persona, hành trình thành viên/khách/moderator; sắp xếp backlog MVP; kiểm kê tài liệu và cấu trúc workspace; lập ADR cho quyết định chưa khóa. | Product brief ngắn; backlog theo ưu tiên; danh sách quyết định và rủi ro. | MVP/non-goals được thống nhất; mọi hạng mục MVP có mô tả và tiêu chí chấp nhận; không còn quyết định chặn tạo repo/app. |
| **2 — UX, dữ liệu và threat model** | Vẽ wireframe mobile/desktop cho đăng nhập, feed, hồ sơ, gara, tạo bài, chi tiết bài, thông báo và moderation; rà SRS ↔ API ↔ SQL; lập threat model theo luồng auth/media/social. | Wireframe; luồng điều hướng; data dictionary; threat checklist; danh sách chênh lệch tài liệu. | Luồng chính được review; trường bắt buộc, trạng thái và quyền nhất quán; quyết định auth, upload và storage đã chốt. |
| **3 — Repo, app skeleton và môi trường local** | Chuẩn hóa `Front_End/` và `Back_End/` theo quyết định framework (hoặc một app SvelteKit duy nhất nếu modular monolith); cấu hình TypeScript, lint/format, env validation, health check, PostgreSQL local, logging và CI build. | App khởi động local; CI build; `.env.example`; hướng dẫn setup; endpoint health. | Người khác có thể clone/setup theo README; build thành công; health check xác nhận app và DB; không có secret trong repo. |

### Giai đoạn B — Tài khoản, hồ sơ, gara và media

| Tuần | Công việc chính | Đầu ra | Điều kiện hoàn tất |
|---|---|---|---|
| **4 — Auth và session** | Migration users/sessions/token; đăng ký, login/logout; xác minh email; quên/đặt lại mật khẩu; cookie an toàn, CSRF/Origin check và rate limit auth. | Luồng auth hoạt động end-to-end; email provider local/staging; audit log cho sự kiện nhạy cảm phù hợp. | Email trùng được xử lý; phản hồi reset không tiết lộ email tồn tại; token một lần/hết hạn; session thu hồi được; cookie flags đúng. |
| **5 — Hồ sơ, privacy và taxonomy phương tiện** | Đọc/cập nhật hồ sơ; username/slug; avatar metadata; privacy; seed vehicle types; UI trang profile và trạng thái rỗng/lỗi. | Profile API/UI; danh mục loại phương tiện ban đầu. | Username unique; profile public/private được áp dụng server-side; danh mục có motorcycle/car/bicycle/truck/offroad/electric/classic/other hoặc taxonomy đã chốt. |
| **6 — Gara CRUD** | Migration vehicles; tạo/sửa/xóa mềm/xem phương tiện; validation trường chung và JSONB theo vehicle type; kiểm tra ownership; UI gara. | Garage API/UI và dữ liệu seed demo. | Chủ sở hữu mới sửa/xóa được; user khác không thể sửa bằng cách đổi ID; hỗ trợ phương tiện khác nhau qua cùng mô hình dữ liệu. |
| **7 — Upload ảnh an toàn** | Upload intent/complete; quota và giới hạn byte/pixel; kiểm MIME/magic bytes; xác thực owner; xử lý `pending → processing → ready/rejected`; re-encode/thumbnail/xóa EXIF; signed URL; cleanup file bỏ dở. | Media pipeline tối thiểu chạy được trên storage đã chọn. | Chỉ media `ready` mới sử dụng được; ảnh không hợp lệ bị từ chối; file của user khác không gắn được; lỗi/cleanup có thể quan sát. |

### Giai đoạn C — Bài đăng và vòng lặp xã hội

| Tuần | Công việc chính | Đầu ra | Điều kiện hoàn tất |
|---|---|---|---|
| **8 — Bài đăng và hashtag** | Tạo/xem/sửa/xóa mềm bài; tối đa 3.000 ký tự và 0–10 ảnh; gắn phương tiện; chuẩn hóa hashtag; status/visibility; transaction media và post. | Post API/UI; migration và cập nhật OpenAPI. | Chỉ tác giả sửa/xóa; giới hạn ảnh/ký tự được enforce server-side; ảnh chưa ready không publish; deleted/hidden không xuất hiện ở truy vấn public. |
| **9 — Feed công khai và hồ sơ** | Feed mới nhất với keyset cursor `(published_at,id)`; profile feed; query/index; SSR và metadata SEO; lazy loading ảnh. | Feed khám phá và timeline hồ sơ. | Pagination ổn định, không lặp/mất bài trong điều kiện bình thường; bài private/hidden/deleted hoặc bị block bị lọc trước serialize. |
| **10 — Follow, like, save và comment** | Tạo/bỏ follow; like/unlike; save/unsave; comment CRUD và giới hạn depth; unique constraints/idempotency; transaction và counter query/cache nếu cần. | Tương tác xã hội hoàn chỉnh trên bài và profile. | Thao tác lặp không tạo bản ghi trùng; không tự follow; user chỉ sửa/xóa comment của mình; block/visibility được áp dụng ở API. |
| **11 — Feed theo dõi, block và thông báo** | Following feed; block/unblock; thông báo follow/like/comment qua outbox; worker retry idempotent; đánh dấu đã đọc. | Following feed và inbox notification. | Block có hiệu lực ở profile/feed/search/tương tác; không tự thông báo cho actor; retry outbox không nhân đôi thông báo; lỗi worker có retry và quan sát được. |

### Giai đoạn D — Tìm kiếm, kiểm duyệt và hoàn thiện

| Tuần | Công việc chính | Đầu ra | Điều kiện hoàn tất |
|---|---|---|---|
| **12 — Search và report** | Tìm người/bài/phương tiện theo phạm vi MVP; filter loại xe/hashtag; tạo report với reason; rate limit/anti-spam; trang report queue. | Search API/UI và quy trình gửi báo cáo. | Input có giới hạn; thứ tự kết quả xác định; kết quả ẩn/private/blocked bị loại; duplicate/abusive reports được hạn chế. |
| **13 — Moderation và admin căn bản** | Moderator xử lý report, ẩn/khôi phục nội dung và ghi reason; audit log append-only; quản trị danh mục tối thiểu; RBAC. | Luồng moderator; trang quản lý tối thiểu; audit trail. | Moderator không có quyền admin ngoài phạm vi; hành động moderation có actor/reason/time; mọi thay đổi quyền/danh mục nhạy cảm có audit. |
| **14 — Hoàn thiện UI, accessibility và contract** | Responsive states; keyboard/focus/labels/alt/contrast; empty/loading/error states; OpenAPI contract lint; đồng bộ status/payload; metadata SEO. | UI MVP hoàn chỉnh; API contract khớp implementation. | Luồng cốt lõi dùng được ở viewport nhỏ và bàn phím; API schema không lệch; không có lỗi nghiêm trọng trong acceptance review. |

### Giai đoạn E — Kiểm chứng và phát hành

| Tuần | Công việc chính | Đầu ra | Điều kiện hoàn tất |
|---|---|---|---|
| **15 — QA, bảo mật, hiệu năng và vận hành** | Unit/integration/E2E cho journey; kiểm tra IDOR, CSRF, XSS, rate limit, upload; dependency/secret scan; seed dataset; đo p95; backup và diễn tập restore; kiểm tra log/request ID. | Báo cáo QA và security; baseline hiệu năng; hướng dẫn backup/restore/runbook. | Không còn issue severity cao; dữ liệu backup khôi phục được; p95 mục tiêu đo trên staging hoặc có quyết định xử lý/giảm phạm vi. |
| **16 — UAT và release candidate** | UAT trên các vai trò; bug bash; hoàn thiện legal/privacy/moderation copy; staging/production config; rollback; demo script, README và case study. | Release candidate; checklist phát hành; link demo nếu hạ tầng sẵn sàng. | Journey MVP qua UAT; rollback/restore đã diễn tập; secrets/config đúng môi trường; tài liệu vận hành và demo hoàn chỉnh. |

## 5. Thứ tự backlog theo phụ thuộc

```text
Quyết định nền tảng
  → App/DB/migrations
  → Auth/session
  → Profile/privacy + vehicle taxonomy
  → Garage
  → Media pipeline
  → Posts/tags
  → Public feed
  → Follow/like/save/comment
  → Following feed + block + notifications
  → Search + reports
  → Moderation/admin
  → QA/UAT/release
```

Các mối phụ thuộc cần giữ: media trước post có ảnh; post trước feed và tương tác; block trước khi gọi MVP hoàn chỉnh; outbox cần transaction DB; moderator queue cần report và trạng thái nội dung; triển khai production cần secrets, backup, restore và chính sách dữ liệu.

## 6. Definition of Done cho mỗi hạng mục

- Tiêu chí chấp nhận được ghi trong backlog và đạt trên luồng thành công cùng lỗi chính.
- Validation được thực hiện ở server; quyền ownership/role/visibility được kiểm tra ở server.
- Migration có cách tiến/lùi hoặc quy trình forward-fix rõ; dữ liệu seed không chứa thông tin thật.
- OpenAPI và ví dụ payload được cập nhật cùng implementation.
- Có logging/request ID; không ghi mật khẩu, token, signed URL hoặc nội dung riêng tư vào log.
- UI có loading, empty, success và error state; responsive và dùng được bằng bàn phím ở luồng cốt lõi.
- Có kiểm thử phù hợp với rủi ro của thay đổi; không phát hành khi còn lỗi nghiêm trọng chưa xử lý.

## 7. Cổng phát hành MVP

Chỉ phát hành khi tất cả nhóm điều kiện sau đạt:

1. **Sản phẩm:** Thành viên hoàn tất đăng ký → hồ sơ → phương tiện → bài ảnh → khám phá → tương tác.
2. **Quyền:** Không thể sửa/xóa tài nguyên người khác bằng cách đổi ID; privacy, block, hidden/deleted được áp dụng nhất quán ở API.
3. **Media:** Có giới hạn/kiểm tra file; ảnh chưa sẵn sàng không publish; metadata EXIF nhạy cảm được loại bỏ.
4. **Moderation:** Có report, queue, hành động có lý do và audit log.
5. **Chất lượng:** Contract/API, migration, test và seed nhất quán; không có lỗi severity cao.
6. **Vận hành:** HTTPS, secrets tách khỏi repo, log/request ID, backup mã hóa và restore được diễn tập, có rollback/runbook.
7. **Trải nghiệm:** Luồng chính hoạt động trên viewport di động và desktop; keyboard/focus/labels/alt được rà soát.

## 8. Rủi ro và cách ứng phó

| Rủi ro | Dấu hiệu sớm | Cách ứng phó |
|---|---|---|
| Một người không thể hoàn tất toàn bộ trong 16 tuần | Auth/media chiếm quá dự kiến hoặc tuần 8 chưa có post end-to-end | Giữ vòng lặp MVP; bỏ polish nâng cao, nhóm/sự kiện, email notification tùy chọn và search nâng cao. |
| Chọn storage/email/hosting muộn | Tuần 3 chưa có môi trường tích hợp | Chốt provider hoặc adapter giả lập sớm; dùng local service cho dev nhưng xác nhận staging trước tuần 7. |
| Quyền riêng tư/block bị áp dụng không nhất quán | Mỗi endpoint tự lọc khác nhau | Đưa visibility/block policy vào service dùng chung; thêm acceptance tests cho feed, search, profile và interaction. |
| Tài liệu SQL/API lệch nhau | Schema hoặc path trùng/thiếu khi dựng app | Rà OpenAPI và SQL trước migration đầu; contract lint và kiểm tra migration/schema ở CI. |
| Upload tạo chi phí/lỗ hổng | Không có quota, cleanup hoặc xác thực nội dung | Giới hạn file, quota người dùng, object lifecycle, re-encode, signed URL ngắn hạn và theo dõi storage. |
| Chưa rõ chính sách dữ liệu/kiểm duyệt | UAT phát hiện không biết xử lý xóa, report hoặc retention | Chốt owner và chính sách trước staging public; chưa mở đăng ký rộng khi chính sách còn thiếu. |

## 9. Nhịp theo dõi

- **Đầu tuần:** chọn mục tiêu tuần và tối đa 3 kết quả có thể demo.
- **Mỗi ngày:** cập nhật trạng thái backlog, blocker và rủi ro mới.
- **Cuối tuần:** demo phần chạy được; rà acceptance criteria; cập nhật OpenAPI/ERD/ADR; điều chỉnh phạm vi tuần sau.
- **Trạng thái hạng mục:** `Backlog → Ready → In Progress → Review → Done`; blocker ghi rõ nguyên nhân và quyết định cần có.
- **Bảng theo dõi tối thiểu:** hạng mục, owner, tuần mục tiêu, phụ thuộc, trạng thái, tiêu chí nghiệm thu, rủi ro.

## 10. Việc nên làm ngay sau kế hoạch

1. Chốt các quyết định ở mục 3, đặc biệt repo/runtime, DB migration, email, object storage và nơi deploy.
2. Tạo backlog từ từng dòng công việc tuần 1–3; chia các mục lớn thành task dưới 1–2 ngày.
3. Rà chéo OpenAPI và SQL; tạo ADR cho các thay đổi so với blueprint.
4. Dựng ứng dụng tối thiểu và PostgreSQL local; xác nhận setup sạch từ đầu trước khi bắt đầu auth.

