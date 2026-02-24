import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // 'email' là định danh duy nhất
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    // Thêm trường password (không bắt buộc)
    password: {
      type: String,
      required: false, // Không bắt buộc, vì Google User không có
    },
    // Google ID (không bắt buộc)
    googleId: {
      type: String,
      required: false, // Không bắt buộc, vì Email User không có
      unique: true,
      sparse: true, // Cho phép 'null' là duy nhất
    },
    picture: {
      type: String,
    },
    role: {
      type: String,
      default: "user", // Mặc định ai đăng ký cũng là 'user'
      enum: ["user", "admin"], // Chỉ chấp nhận 2 giá trị này
    },

    resetPasswordToken: String,

    resetPasswordExpire: Date,
    
    searchHistory: [
      {
        cityLabel: String, // Tên hiển thị (VD: Hanoi, Vietnam)
        value: String, // ID định danh
        lat: Number,
        lon: Number,
        searchedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    orderHistory: [
      {
        orderId: String, // Mã đơn hàng (VD: DH1234)
        items: [
          {
            // Danh sách sản phẩm
            name: String,
            price: Number,
            quantity: Number,
            image: String,
          },
        ],
        totalAmount: Number, // Tổng tiền
        paymentMethod: String, // COD hoặc Banking
        status: { type: String, default: "Thành công" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
