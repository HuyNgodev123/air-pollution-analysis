#🌿 Air Quality Tracker & E-commerce Platform

Một ứng dụng kết hợp giữa theo dõi chất lượng không khí thời gian thực và nền tảng thương mại điện tử cho các sản phẩm làm sạch không khí.

📖 Giới thiệu

Dự án này cung cấp giải pháp toàn diện cho người dùng quan tâm đến sức khỏe hô hấp. Hệ thống cho phép người dùng theo dõi chỉ số AQI, bụi mịn (PM2.5, PM10) tại bất kỳ địa điểm nào trên thế giới thông qua dữ liệu vệ tinh, đồng thời cung cấp cửa hàng trực tuyến để mua sắm các thiết bị lọc khí với quy trình thanh toán hiện đại.

🚀 Tính năng Chính

🌍 1. Theo dõi Môi trường (Dashboard)

Dữ liệu Real-time: Tích hợp API Open-Meteo để lấy dữ liệu AQI, PM2.5, PM10, CO, Ozone, SO2, UV Index chuẩn xác theo thời gian thực.

Tìm kiếm & Định vị:

Tìm kiếm địa điểm trên toàn cầu.

Tự động định vị GPS (Geolocation) vị trí hiện tại của người dùng.

Trực quan hóa:

Bản đồ tương tác (AQI Map): Sử dụng Leaflet + Esri Maps để hiển thị mức độ ô nhiễm của 20+ tỉnh thành Việt Nam (bao gồm Hoàng Sa, Trường Sa).

Biểu đồ lịch sử (History Chart): Vẽ biểu đồ xu hướng ô nhiễm theo thời gian.

Cảnh báo: Hiển thị màu sắc (Xanh, Vàng, Đỏ...) và lời khuyên sức khỏe dựa trên mức độ ô nhiễm.

🛒 2. Thương mại điện tử (E-commerce)

Danh sách sản phẩm: Xem, lọc sản phẩm theo danh mục (Trong phòng, Cá nhân, Xe hơi...).

Giỏ hàng (Shopping Cart): Thêm/sửa/xóa sản phẩm, tính tổng tiền tự động.

Thanh toán (Checkout):

Hỗ trợ thanh toán COD.

Thanh toán VietQR: Tự động sinh mã QR ngân hàng chứa sẵn số tiền và nội dung đơn hàng (QuickLink).

Quản lý đơn hàng: Lưu lịch sử mua hàng vào cơ sở dữ liệu.

👤 3. Người dùng & Xác thực

Authentication: Đăng ký/Đăng nhập (Email & Password) hoặc Google Login.

Bảo mật: Sử dụng JWT (JSON Web Token) để xác thực phiên làm việc.

Quên mật khẩu: Gửi email chứa link đặt lại mật khẩu (sử dụng Nodemailer).

Hồ sơ cá nhân:

Xem lịch sử các địa điểm đã tìm kiếm.

Theo dõi trạng thái đơn hàng đã mua.

🛡️ 4. Trang Quản trị (Admin Dashboard)

Phân quyền (RBAC): Chỉ tài khoản role: 'admin' mới truy cập được.

Quản lý Người dùng: Xem danh sách, xóa người dùng vi phạm.

Quản lý Đơn hàng: Xem toàn bộ đơn hàng của hệ thống, chi tiết từng đơn.

Quản lý Dữ liệu: Seed Data (Tạo dữ liệu mẫu) hoặc Reset Database.

🛠️ Công nghệ Sử dụng

Frontend

React.js: Library xây dựng UI.

React Router v6: Quản lý điều hướng.

Context API: Quản lý trạng thái toàn cục (Auth, Cart).

Axios / Fetch: Gọi API.

Recharts: Vẽ biểu đồ.

React-Leaflet: Bản đồ số.

Lucide-React: Bộ icon.

Backend

Node.js & Express.js: RESTful API Server.

MongoDB & Mongoose: Cơ sở dữ liệu NoSQL.

JWT & Bcryptjs: Xác thực và mã hóa mật khẩu.

Nodemailer: Gửi email tự động.

External APIs

Open-Meteo API: Dữ liệu thời tiết & Geocoding (Miễn phí, không cần Key).

VietQR API: Tạo mã QR thanh toán chuyển khoản.

⚙️ Cài đặt & Chạy dự án

Yêu cầu

Node.js (v14 trở lên)

MongoDB (đã cài đặt Local hoặc có URL MongoDB Atlas)

Bước 1: Clone dự án

git clone [(https://github.com/HuyNgodev123/air-pollution-analysis.git)]
cd project-name


Bước 2: Cài đặt thư viện

npm install


Bước 3: Cấu hình biến môi trường

Tạo file .env tại thư mục gốc và điền các thông tin sau:

# Cấu hình Server & DB
PORT=5000
MONGO_URI=mongodb://localhost:27017/air-quality-db
# Hoặc URL MongoDB Atlas của bạn

# Bảo mật
JWT_SECRET=ma_bi_mat_cua_ban_123

# Google OAuth (Lấy từ Google Cloud Console)
GOOGLE_CLIENT_ID_FROM_CLOUD=your_google_client_id

# Cấu hình gửi mail (Nodemailer - Dùng App Password của Gmail)
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password_16_chars


Bước 4: Chạy ứng dụng

Bạn cần mở 2 Terminal riêng biệt:

Terminal 1: Chạy Backend (Server)

npm run server
# Server sẽ chạy tại http://localhost:5000


Terminal 2: Chạy Frontend (React)

npm start
# Web sẽ mở tại http://localhost:8080 (hoặc 3000 tùy cấu hình)


🗂️ Cấu trúc Thư mục

root/
├── public/                 # File tĩnh (index.html, images...)
├── server/                 # --- BACKEND ---
│   ├── config/             # Cấu hình DB
│   ├── models/             # Mongoose Models (User, Product)
│   ├── routes/             # API Routes (auth, user, products)
│   ├── server.js           # Entry point của Backend
│   └── setAdmin.js         # Script cấp quyền Admin
│
├── src/                    # --- FRONTEND ---
│   ├── components/         # Các component tái sử dụng (Header, Chart, Map...)
│   ├── context/            # AuthContext, CartContext
│   ├── pages/              # Các trang chính (Dashboard, Products, Admin...)
│   ├── services/           # Các hàm gọi API (airQualityService)
│   ├── index.js            # Entry point của React
│   └── setupProxy.js       # Cấu hình Proxy
│
├── .env                    # Biến môi trường
├── package.json            # Khai báo thư viện
└── webpack.config.js       # Cấu hình Webpack


🔑 Tài khoản Demo

Để trải nghiệm quyền Admin, bạn có thể tự tạo tài khoản rồi chạy script node server/setAdmin.js hoặc sử dụng tài khoản sau (nếu đã seed DB):

Email: admin@gmail.com

Password: 123456

🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Hãy tạo Pull Request hoặc mở Issue nếu bạn tìm thấy lỗi.

📄 License

Dự án được phát
