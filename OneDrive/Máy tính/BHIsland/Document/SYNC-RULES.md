# Quy tắc đồng bộ Frontend, Backend và tài liệu

Mục tiêu của quy tắc này là giữ một nguồn chuẩn cho mỗi loại thông tin và buộc mọi thay đổi liên quan phải được cập nhật cùng nhau. Không thể bảo đảm tuyệt đối không có lỗi, nhưng quy trình này giúp phát hiện lệch trước khi merge hoặc phát hành.

## 1. Nguồn chuẩn duy nhất

| Thông tin | Nguồn chuẩn | Không làm |
|---|---|---|
| Yêu cầu, vai trò và phạm vi MVP | `Document/GIsland-Technical-Blueprint.md` cộng quyết định đã chấp thuận trong `Document/DECISIONS.md` | Không để UI tự suy ra quyền hay thêm yêu cầu ngầm. |
| API path, method, auth, request, response, lỗi và status | `Document/GIsland-OpenAPI.yaml` | Không viết endpoint mới chỉ trong frontend hoặc backend. |
| Schema database đã áp dụng | Migration có version trong `Back_End/` | Không sửa migration đã chạy ở môi trường chia sẻ; tạo migration mới. |
| Schema gốc tham khảo | `Document/GIsland-PostgreSQL-Core.sql` | Không coi file tham khảo là migration chạy trực tiếp sau khi đã có migrations. |
| Enum, trạng thái và quy tắc nghiệp vụ | Backend validation/domain logic; OpenAPI mô tả giá trị trao đổi; blueprint/decision ghi ý nghĩa | Không tạo enum khác tên/ý nghĩa ở frontend. |
| Kiểu API phía frontend | Sinh tự động từ OpenAPI hoặc type được kiểm tra contract | Không duy trì DTO thủ công trùng với API. |
| UI states và luồng người dùng | `Front_End/` theo yêu cầu đã thống nhất | Không dùng UI để thay thế kiểm tra quyền server. |

## 2. Quy trình thay đổi API

Thực hiện đúng thứ tự dưới đây trong cùng nhánh/đợt thay đổi:

1. Viết/chỉnh hợp đồng trong `Document/GIsland-OpenAPI.yaml` trước khi code.
2. Nếu thay đổi hành vi, quyền, trạng thái hoặc scope, cập nhật blueprint hoặc ghi quyết định trong `Document/DECISIONS.md`.
3. Cập nhật backend implementation, validation và response theo hợp đồng.
4. Cập nhật migration nếu thay đổi cần schema; migration mới phải có tên/version rõ, thứ tự chạy, dữ liệu chuyển đổi và phương án forward-fix/rollback.
5. Sinh lại API types/client phía frontend bằng lệnh thống nhất; không chỉnh tay output đã sinh.
6. Cập nhật UI/API calls, loading/error/empty states và xử lý status mới.
7. Chạy kiểm tra OpenAPI, contract và các test liên quan; ghi kết quả vào PR/commit description.
8. Rà lại `Back_End/README.md`, `Front_End/README.md` hoặc tài liệu vận hành nếu cách chạy/biến môi trường thay đổi.

Không merge thay đổi breaking trước khi backend và frontend cùng tương thích. Nếu phải triển khai nhiều bước, dùng thay đổi tương thích ngược: thêm field/endpoint → deploy backend → chuyển frontend → mới loại bỏ field/endpoint cũ qua thay đổi có version/plan.

## 3. Quy trình thay đổi dữ liệu

- Tạo migration mới cho mọi thay đổi schema; không sửa migration đã áp dụng ở shared/staging/production.
- Migration phải nêu ảnh hưởng tới dữ liệu hiện hữu, tính nullable/default, index/constraint và cách deploy an toàn.
- Backend model/validation cập nhật cùng migration. OpenAPI cập nhật nếu request/response nhìn thấy thay đổi.
- Frontend không truy cập database và không chứa bản sao schema SQL.
- Seed data là dữ liệu giả lập, xác định được và có thể nạp lặp lại; không dùng tài khoản hoặc dữ liệu cá nhân thật.

## 4. Quy tắc quyền và trạng thái

- Mọi quyết định authorization được kiểm tra ở server cho từng tài nguyên: role, owner, visibility, status và block.
- Frontend chỉ ẩn/hiện control theo dữ liệu trả về để cải thiện trải nghiệm; backend vẫn phải từ chối request sai quyền.
- Khi thêm trạng thái mới cho post/media/comment/report/user, cập nhật đồng bộ domain/backend, OpenAPI, UI state, moderation/feed/search filter và kiểm thử.
- Từ chối request dùng status/error shape đã định nghĩa; không trả lỗi có thể tiết lộ tài nguyên riêng tư.

## 5. Phiên bản và file sinh tự động

- Khóa phiên bản runtime, package manager và dependency bằng file cấu hình/lockfile khi scaffold ứng dụng.
- Chọn một cách sinh OpenAPI types/client và một lệnh chuẩn; ghi lệnh vào README hai phần, chạy trong CI.
- File sinh tự động có header/source marker; không sửa trực tiếp. Thay đổi phải quay về nguồn sinh.
- CI cần kiểm tra tối thiểu: build backend, build frontend, OpenAPI lint, migration/schema consistency và contract checks.
- Nếu chưa cài được một kiểm tra CI, ghi rõ trong `DECISIONS.md` hoặc issue cùng owner và hạn xử lý; không giả định kiểm tra đã chạy.

## 6. Checklist trước khi hoàn tất thay đổi

```text
[ ] Yêu cầu hoặc quyết định liên quan đã được cập nhật.
[ ] OpenAPI khớp endpoint, auth, schema, status và lỗi thực tế.
[ ] Migration mới an toàn và backend model/validation khớp.
[ ] Frontend dùng loại API mới nhất; không còn DTO trùng hoặc endpoint hard-coded khác hợp đồng.
[ ] Quyền/visibility/block được enforce tại server.
[ ] Loading, empty, success, validation error và server error đã được xử lý phù hợp.
[ ] Test/contract/build liên quan đã chạy; kết quả được ghi lại.
[ ] README/env/setup được cập nhật khi có thay đổi cách chạy.
[ ] Không commit secret, dữ liệu cá nhân hoặc file sinh lỗi thời.
```

## 7. Quy tắc đồng bộ OneDrive và Git

- Không chỉnh cùng một file từ hai thiết bị/nhánh khi OneDrive còn đang đồng bộ; chờ trạng thái đồng bộ hoàn tất trước khi chuyển máy.
- Dùng Git commit nhỏ, có nội dung rõ; không dùng file `conflicted copy` làm nguồn chuẩn.
- Không để build output, cache, dependency hoặc file `.env` trong thư mục tài liệu.
- Nếu xuất hiện bản conflict, dừng triển khai phần liên quan, so sánh thay đổi, chọn nội dung đúng rồi cập nhật một file chuẩn duy nhất.
- Trước khi đổi máy/nhánh: commit hoặc stash; đồng bộ xong; xác nhận `git status` sạch; sau khi chuyển tiếp tục kiểm tra commit mới nhất.

