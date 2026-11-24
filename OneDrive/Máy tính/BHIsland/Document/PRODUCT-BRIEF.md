# GIsland — Product brief MVP

**Trạng thái:** Baseline để bắt đầu thiết kế và triển khai.  
**Đối tượng:** Người chơi và người sưu tầm nhiều loại phương tiện tại Việt Nam.  
**Nền tảng:** Web responsive, tiếng Việt trước tiên.

## Vấn đề và cơ hội

Cộng đồng về phương tiện thường bị chia theo từng loại xe và nội dung. GIsland tạo một không gian chung để người dùng giới thiệu bản thân, lưu gara của mình và chia sẻ bài viết gắn với phương tiện, rồi khám phá và tương tác với cộng đồng.

## Giá trị cốt lõi

Người chơi có thể thể hiện chiếc xe/phương tiện và câu chuyện của mình trong một cộng đồng bao gồm nhiều thể loại, thay vì buộc phải chọn một loại phương tiện duy nhất.

## Người dùng và nhu cầu

| Nhóm | Nhu cầu MVP |
|---|---|
| Khách | Xem nội dung public, hồ sơ public và tìm kiếm; đăng ký/đăng nhập để tham gia. |
| Thành viên | Quản lý hồ sơ/gara; đăng bài ảnh; theo dõi, like, comment, save; block và report. |
| Moderator | Xem hàng đợi report; ẩn/khôi phục nội dung; ghi lý do và để lại audit trail. |
| Admin | Quản lý danh mục và quyền; xem audit log. |

## Hành trình giá trị đầu tiên

1. Người dùng tạo tài khoản và xác minh email.
2. Hoàn thiện hồ sơ công khai theo lựa chọn.
3. Thêm ít nhất một phương tiện vào gara.
4. Đăng bài có văn bản, ảnh, hashtag và phương tiện gắn kèm.
5. Bài xuất hiện trong feed public nếu visibility/status cho phép.
6. Người khác khám phá, theo dõi, thích, bình luận hoặc lưu bài.

## Phạm vi MVP

- Tài khoản, session, xác minh email và reset mật khẩu.
- Hồ sơ và quyền riêng tư cơ bản.
- Gara nhiều loại phương tiện với thuộc tính chung và mở rộng theo loại.
- Upload ảnh an toàn; bài viết, hashtag và liên kết phương tiện.
- Feed public và following; profile feed; tìm kiếm cơ bản.
- Follow, like, comment, save, block.
- Report, moderation queue, notification in-app và audit log.
- Responsive UI, accessibility cơ bản, SEO cho trang public.

## Ngoài phạm vi MVP

Chat realtime, nhóm nâng cao, sự kiện/chuyến đi, marketplace/giao dịch, thanh toán, livestream/video, native app, realtime location, ML recommendation và quảng cáo trả phí.

## Chỉ số đánh giá demo/UAT

- Tỷ lệ hoàn thành journey đăng ký → hồ sơ → phương tiện → bài viết không bị chặn bởi lỗi.
- Số lỗi nghiêm trọng về ownership, privacy, block hoặc media trong các luồng nghiệm thu.
- Thời gian phản hồi feed/search trên staging với dữ liệu mẫu theo mục tiêu blueprint.
- Khả năng một thành viên mới hiểu cách thêm phương tiện và đăng bài mà không cần hướng dẫn trực tiếp.

## Giả định và câu hỏi chưa giải quyết

- MVP dùng tiếng Việt, timezone hiển thị Asia/Ho_Chi_Minh, thời gian lưu UTC.
- Mặc định không công khai nội dung của thành viên trừ khi người dùng chọn public.
- Trước khi mở đăng ký public cần chốt chính sách moderation, yêu cầu xóa/retention, chi phí lưu media, domain và nhà cung cấp dịch vụ.
- Chi tiết đặc tả chức năng tiếp tục lấy từ `GIsland-Technical-Blueprint.md`; brief này chỉ tóm tắt mục tiêu và phạm vi.

