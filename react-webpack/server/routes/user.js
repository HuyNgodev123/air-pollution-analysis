import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware kiểm tra đăng nhập đơn giản
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'Không có token, từ chối truy cập' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token không hợp lệ' });
  }
};


// --- MIDDLEWARE 2: Kiểm tra Admin  ---
const checkAdmin = async (req, res, next) => {
  try {
    // Tìm user trong DB dựa vào ID lấy từ token
    const user = await User.findById(req.user.id);
    
    // Nếu không tìm thấy user hoặc role không phải 'admin'
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Truy cập bị từ chối. Bạn không phải Admin.' });
    }
    
    next(); // Cho phép đi tiếp
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server khi kiểm tra quyền Admin');
  }
};


// 1. Lấy thông tin user + lịch sử tìm kiếm
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});

// 2. Lưu lịch sử tìm kiếm
router.post('/history', auth, async (req, res) => {
  const { cityLabel, value, lat, lon } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    // Xóa trùng lặp (nếu đã tìm rồi thì xóa cũ thêm mới để lên đầu)
    user.searchHistory = user.searchHistory.filter(item => item.value !== value);
    
    // Thêm vào đầu mảng
    user.searchHistory.unshift({ cityLabel, value, lat, lon });
    
    // Giới hạn chỉ lưu 10 lịch sử gần nhất
    if (user.searchHistory.length > 10) {
      user.searchHistory = user.searchHistory.slice(0, 10);
    }

    await user.save();
    res.json(user.searchHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});

// --- 3.CẬP NHẬT THÔNG TIN USER ---
router.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;

  // Tạo object chứa các trường cần update
  const userFields = {};
  if (name) userFields.name = name;
  if (email) userFields.email = email;

  try {
    let user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: 'Không tìm thấy người dùng' });

    // Thực hiện update
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true } // Trả về dữ liệu mới sau khi update
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});


// --- API MỚI: LƯU ĐƠN HÀNG (Order History) ---
router.post('/orders', auth, async (req, res) => {
  const { orderId, items, totalAmount, paymentMethod } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Tạo object đơn hàng mới
    const newOrder = {
      orderId,
      items,
      totalAmount,
      paymentMethod,
      createdAt: new Date()
    };

    // Thêm vào đầu danh sách lịch sử mua hàng
    // (Đảm bảo model User đã có trường orderHistory như bạn đã cập nhật)
    if (!user.orderHistory) {
        user.orderHistory = [];
    }
    user.orderHistory.unshift(newOrder);
    
    await user.save();
    res.json(user.orderHistory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server khi lưu đơn hàng');
  }
});


// 2. CÁC API QUẢN TRỊ (Chỉ Admin mới gọi được)
// Lấy danh sách TOÀN BỘ user
router.get('/all-users', auth, checkAdmin, async (req, res) => {
  try {
    // Lấy tất cả user, trừ trường password, sắp xếp người mới nhất lên đầu
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});

// Xóa user theo ID
router.delete('/:id', auth, checkAdmin, async (req, res) => {
  try {
    // Chặn Admin tự xóa chính mình
    if (req.params.id === req.user.id) {
        return res.status(400).json({ msg: 'Bạn không thể tự xóa tài khoản Admin của chính mình.' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
        return res.status(404).json({ msg: 'Không tìm thấy người dùng này để xóa.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: `Đã xóa người dùng ${userToDelete.name} thành công.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});


export default router;