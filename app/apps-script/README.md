# Kết nối Google Sheet để lưu kết quả (ẩn danh)

Làm theo đúng thứ tự sau. Không cần biết lập trình, chỉ cần làm chậm và kiểm tra từng bước.

## 1. Tạo Google Sheet

1. Mở [sheets.new](https://sheets.new) để tạo một trang tính mới.
2. Đặt tên, ví dụ: `Nghiên cứu NBN`.
3. Không cần tạo cột hay nhập gì — trang tính phải để trống. Tệp `sheet.gs` sẽ tự ghi dòng tiêu đề khi có dữ liệu đầu tiên.

## 2. Mở Apps Script

1. Trong trang tính, bấm **Extensions** (Tiện ích mở rộng) trên thanh menu.
2. Chọn **Apps Script**.
3. Một tab mới mở ra. Xoá hết đoạn mã mẫu đang có.

## 3. Dán mã

1. Mở tệp `apps-script/sheet.gs` trong thư mục dự án này.
2. Sao chép **toàn bộ** nội dung.
3. Dán vào ô soạn mã trong Apps Script (thay cho đoạn mã vừa xoá).
4. Bấm biểu tượng **Save** (lưu) hoặc nhấn `Ctrl + S`.

## 4. Triển khai thành Web app

1. Bấm **Deploy** (Triển khai) > **New deployment** (Triển khai mới).
2. Ở dòng **Select type**, bấm biểu tượng bánh răng và chọn **Web app**.
3. Điền:
   - **Description**: `NBN sheet` (tên gì cũng được).
   - **Execute as**: chọn **Me** (Tôi).
   - **Who has access**: chọn **Anyone** (Mọi người).
4. Bấm **Deploy**.
5. Google sẽ hỏi quyền: bấm **Authorize access**, chọn tài khoản của bạn, bấm **Advanced** > **Go to ... (unsafe)** nếu cần, rồi bấm **Allow**.
6. Khi triển khai xong, bấm **Copy** để sao chép đường dẫn kết thúc bằng `/exec`.

## 5. Đưa đường dẫn vào ứng dụng

1. Trong thư mục dự án, mở tệp `app/.env.local`.
2. Thêm dòng sau (dán đường dẫn `/exec` vừa sao chép):

   ```
   VITE_SHEET_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```

3. Lưu tệp và khởi động lại ứng dụng (`npm run dev`).
4. Khi đưa ứng dụng lên Vercel: vào **Project Settings** > **Environment Variables**, thêm biến `VITE_SHEET_URL` với đúng đường dẫn trên, rồi **Redeploy** dự án trên Vercel.

## 6. Những điều cần biết

- Dữ liệu gửi lên **hoàn toàn ẩn danh**: chỉ có mã ẩn danh ngẫu nhiên, ngày, khối lớp, giới tính và điểm — không có tên, email hay số điện thoại. Ngày 1 là bài kiểm tra đầu, ngày 21 là bài kiểm tra cuối (dòng ngày 7 của bản cũ vẫn được tính là bài cuối). Học sinh không đồng ý thì ứng dụng không gửi gì cả.
- Khi sửa mã trong Apps Script, phải triển khai lại: **Deploy** > **Manage deployments** > chọn bản đang dùng > bấm bút chì > **Version: New version** > **Deploy**. Nếu chỉ bấm Save mà không tạo version mới, thay đổi sẽ không có tác dụng với đường dẫn `/exec` đang dùng.
- Nếu đổi sang một bản triển khai mới hoàn toàn, nhớ cập nhật lại `VITE_SHEET_URL` trong `app/.env.local` và trong biến môi trường của Vercel.
