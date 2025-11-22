import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Thêm thư viện hash mật khẩu
// import { check, validationResult } from 'express-validator'; // (Tùy chọn) Để xác thực
import User from '../models/User.js'; // Đảm bảo đường dẫn này đúng

const router = express.Router();

// Lấy Client ID và Secret từ file .env
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID_FROM_CLOUD;
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

// Tạo một client của Google
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- HÀM TẠO TOKEN (để dùng chung) ---
const generateAppToken = (user) => {
  const appTokenPayload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
  };

  return jwt.sign(
    appTokenPayload,
    JWT_SECRET,
    { expiresIn: '7d' } // Hết hạn trong 7 ngày
  );
};


// === TUYẾN ĐƯỜNG ĐĂNG NHẬP GOOGLE ===

/**
 * @route   POST /api/auth/google
 * @desc    Xác thực người dùng bằng Google Token (thường là idToken)
 */
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body; // 'token' này là idToken từ Google Sign-In

    if (!token) {
      return res.status(400).json({ error: 'Không có token nào được gửi' });
    }

    // 1. Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // 2. Lấy thông tin người dùng từ Google
    const {
      sub: googleId, // 'sub' là ID duy nhất của Google
      email,
      name,
      picture,
    } = payload;

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Xác thực Google thất bại' });
    }

    // 3. Tìm hoặc Tạo người dùng trong DB
    let user = await User.findOne({ email: email }); // Tìm bằng EMAIL

    if (!user) {
      // Nếu email không tồn tại -> tạo user mới
      user = new User({
        googleId: googleId,
        email: email,
        name: name,
        picture: picture,
      });
      await user.save();
    } else {
      // Nếu email đã tồn tại
      // Cập nhật googleId (nếu chưa có) và ảnh (nếu họ đổi)
      user.googleId = user.googleId || googleId;
      user.name = user.name || name; // Ưu tiên tên cũ nếu họ đã đăng ký email/pass
      user.picture = picture; // Luôn cập nhật ảnh mới từ Google
      await user.save();
    }

    // 4. Tạo và trả về token của app
    const appToken = generateAppToken(user);
    res.json({ token: appToken });

  } catch (err) {
    console.error('Lỗi xác thực /api/auth/google:', err.message);
    if (err.message.includes('Token used too late')) {
        return res.status(401).json({ error: 'Token đã hết hạn hoặc không hợp lệ.'});
    }
    res.status(500).json({ error: 'Lỗi Server' });
  }
});


// === TUYẾN ĐƯỜNG ĐĂNG KÝ EMAIL/PASSWORD ===

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản mới bằng Email & Mật khẩu
 */
router.post(
  '/register',
  // (Tùy chọn: Thêm xác thực đầu vào từ 'express-validator' ở đây)
  // [
  //   check('name', 'Tên là bắt buộc').not().isEmpty(),
  //   check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
  //   check('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 })
  // ],
  async (req, res) => {
    // (Tùy chọn: Kiểm tra lỗi xác thực)
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { name, email, password } = req.body;

    try {
      // 1. Kiểm tra xem email đã tồn tại chưa
      let user = await User.findOne({ email });

      if (user) {
        // Nếu người dùng đã tồn tại
        if (user.password) {
          // Nếu họ đã có mật khẩu -> Lỗi
          return res.status(400).json({ errors: [{ msg: 'Email đã được sử dụng' }] });
        } else {
          // Nếu họ tồn tại (qua Google) nhưng chưa có pass
          // -> Cập nhật tài khoản của họ với mật khẩu mới
          user.name = user.name || name; // Giữ tên Google nếu có
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();
          
          // Đăng nhập và trả token
          const appToken = generateAppToken(user);
          return res.json({ token: appToken });
        }
      }

      // 2. Nếu là người dùng mới hoàn toàn
      user = new User({
        name,
        email,
        password,
      });

      // 3. Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // 4. Lưu vào CSDL
      await user.save();

      // 5. Tạo và trả về token
      const appToken = generateAppToken(user);
      res.json({ token: appToken });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Lỗi Server');
    }
  }
);

// === TUYẾN ĐƯỜNG ĐĂNG NHẬP EMAIL/PASSWORD ===

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập bằng Email & Mật khẩu
 */
router.post(
  '/login',
  // (Tùy chọn: Xác thực)
  // [
  //   check('email', 'Vui lòng nhập email hợp lệ').isEmail(),
  //   check('password', 'Mật khẩu là bắt buộc').exists()
  // ],
  async (req, res) => {
    // (Tùy chọn: Kiểm tra lỗi xác thực)
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    const { email, password } = req.body;

    try {
      // 1. Tìm người dùng bằng email
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Email hoặc mật khẩu không đúng' }] });
      }

      // 2. Kiểm tra xem người dùng có mật khẩu không
      // (Trường hợp họ đăng ký bằng Google và chưa tạo pass)
      if (!user.password) {
        return res.status(400).json({ 
          errors: [{ 
            msg: 'Tài khoản này đã đăng nhập bằng Google. Vui lòng đăng nhập bằng Google.',
            needsGoogleLogin: true // Gửi cờ này về để frontend xử lý
          }] 
        });
      }

      // 3. So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Email hoặc mật khẩu không đúng' }] });
      }

      // 4. Nếu khớp, trả về token
      const appToken = generateAppToken(user);
      res.json({ token: appToken });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Lỗi Server');
    }
  }
);


export default router;