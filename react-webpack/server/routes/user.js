import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// --- MIDDLEWARE 1: Xác thực Token (Người dùng đã đăng nhập chưa?) ---
const auth = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ msg: "Không có token, từ chối truy cập" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Token không hợp lệ" });
  }
};

// --- MIDDLEWARE 2: Kiểm tra Admin (Người dùng có phải Admin không?) ---
const checkAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({
          msg: "Truy cập bị từ chối. Chức năng này chỉ dành cho Admin.",
        });
    }
    next();
  } catch (err) {
    res.status(500).send("Lỗi Server khi kiểm tra quyền");
  }
};

// Get Profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// Update Profile
router.put("/profile", auth, async (req, res) => {
  const { name, email } = req.body;
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;

  try {
    let user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// Save Search History
router.post("/history", auth, async (req, res) => {
  const { cityLabel, value, lat, lon } = req.body;
  try {
    const user = await User.findById(req.user.id);
    user.searchHistory = user.searchHistory.filter(
      (item) => item.value !== value
    );
    user.searchHistory.unshift({ cityLabel, value, lat, lon });

    if (user.searchHistory.length > 10)
      user.searchHistory = user.searchHistory.slice(0, 10);

    await user.save();
    res.json(user.searchHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// --- API MỚI: LƯU ĐƠN HÀNG (Order History) ---
router.post("/orders", auth, async (req, res) => {
  const { orderId, items, totalAmount, paymentMethod } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Tạo object đơn hàng mới
    const newOrder = {
      orderId,
      items,
      totalAmount,
      paymentMethod,
      createdAt: new Date(),
    };

    // Thêm vào đầu danh sách lịch sử mua hàng
    if (!user.orderHistory) {
      user.orderHistory = [];
    }
    user.orderHistory.unshift(newOrder);

    await user.save();
    res.json(user.orderHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server khi lưu đơn hàng");
  }
});


// 2. CÁC API QUẢN TRỊ (Chỉ Admin mới gọi được)
// Lấy danh sách TOÀN BỘ user
router.get("/all-users", auth, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// Xóa user theo ID
router.delete("/:id", auth, checkAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ msg: "Bạn không thể tự xóa tài khoản Admin của chính mình." });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy người dùng này để xóa." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: `Đã xóa người dùng ${userToDelete.name} thành công.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server");
  }
});

// --- LẤY TẤT CẢ ĐƠN HÀNG CỦA HỆ THỐNG ---
router.get("/all-orders", auth, checkAdmin, async (req, res) => {
  try {
    // 1. Lấy tất cả user có đơn hàng
    // $exists: true -> trường orderHistory tồn tại
    // $not: { $size: 0 } -> mảng không rỗng
    const users = await User.find({
      orderHistory: { $exists: true, $not: { $size: 0 } },
    }).select("name email orderHistory");

    // 2. Gom tất cả đơn hàng lại thành 1 mảng phẳng
    let allOrders = [];
    users.forEach((user) => {
      user.orderHistory.forEach((order) => {
        // Kèm thêm thông tin người mua vào mỗi đơn hàng để Admin biết ai mua
        allOrders.push({
          ...order.toObject(), // Chuyển mongoose object sang JS object
          customerName: user.name,
          customerEmail: user.email,
          userId: user._id,
        });
      });
    });

    // 3. Sắp xếp theo ngày tạo (Mới nhất lên đầu)
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Lỗi Server khi lấy danh sách đơn hàng");
  }
});

export default router;
