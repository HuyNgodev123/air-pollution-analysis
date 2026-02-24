import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; 
import User from '../models/User.js';
import nodemailer from 'nodemailer'; 
import { OAuth2Client } from 'google-auth-library'; 
import dotenv from 'dotenv'; 

dotenv.config(); // Load biến môi trường

const router = express.Router();

// Lấy Client ID và Secret từ biến môi trường (Khuyên dùng) hoặc hardcode (không khuyến khích)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID_FROM_CLOUD || "your-google-client-id"; 
const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

// Tạo một client của Google
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- CẤU HÌNH GỬI MAIL (Thay bằng thông tin thật của bạn) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngoh0839@gmail.com', // Email của bạn
    pass: 'mptu asqv vgir oudb'  // App Password của bạn
  }
});

// --- HÀM TẠO TOKEN (để dùng chung) ---
const generateAppToken = (user) => {
  const appTokenPayload = {
    user: {
      id: user._id, // MongoDB dùng _id
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
  };

  return jwt.sign(
    appTokenPayload,
    JWT_SECRET,
    { expiresIn: "7d" } // Hết hạn trong 7 ngày
  );
};

// 1. API QUÊN MẬT KHẨU (Gửi Email thật)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Email không tồn tại trong hệ thống.' });
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Lưu token vào DB (Hashed)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    // Tạo link reset (Frontend URL - React thường chạy ở cổng 3000 hoặc 8080 tùy bạn config)
    // Nếu bạn đang chạy React ở port 3000 thì để 3000, nếu 8080 thì đổi thành 8080
    // Ở đây mình để theo config webpack của bạn là 8080 (hoặc 3000 tùy thực tế)
    const resetUrl = `http://localhost:8080/reset-password/${resetToken}`; 

    // Nội dung email
    const mailOptions = {
      from: '"Air Quality App" <no-reply@airqualityapp.com>',
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Xin chào ${user.name},</h2>
          <p>Bạn nhận được email này vì chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu (Link có hiệu lực trong 10 phút):</p>
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; font-weight: bold;">Đặt lại mật khẩu</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Hoặc copy đường dẫn sau vào trình duyệt: <br/> <a href="${resetUrl}">${resetUrl}</a></p>
          <p style="font-size: 12px; color: #999;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        </div>
      `
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    console.log(`Email reset sent to: ${email}`);
    res.json({ msg: 'Email đã được gửi. Vui lòng kiểm tra hộp thư của bạn.' });

  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    // Nếu lỗi thì xóa token đi để tránh rác DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ msg: 'Không thể gửi email. Vui lòng thử lại sau.' });
  }
});

// 2. API ĐẶT LẠI MẬT KHẨU MỚI
router.put('/reset-password/:resetToken', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: 'Mật khẩu đã được cập nhật thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi Server');
  }
});

// === TUYẾN ĐƯỜNG ĐĂNG NHẬP GOOGLE ===
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body; 

    if (!token) {
      return res.status(400).json({ error: "Không có token nào được gửi" });
    }

    // 1. Xác thực token với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // 2. Lấy thông tin người dùng từ Google
    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    if (!email || !googleId) {
      return res.status(400).json({ error: "Xác thực Google thất bại" });
    }

    // 3. Tìm hoặc Tạo người dùng trong DB
    let user = await User.findOne({ email: email });

    if (!user) {
      // Nếu email không tồn tại -> tạo user mới
      user = new User({
        googleId: googleId, // Lưu ý: Cần đảm bảo Model User có trường googleId nếu muốn lưu
        email: email,
        name: name,
        picture: picture,
      });
      await user.save();
    } else {
      // Nếu email đã tồn tại
      // user.googleId = user.googleId || googleId; // Model User có googleId không?
      user.name = user.name || name; 
      user.picture = picture; 
      await user.save();
    }

    // 4. Tạo và trả về token của app
    const appToken = generateAppToken(user);
    res.json({ token: appToken });
  } catch (err) {
    console.error("Lỗi xác thực /api/auth/google:", err.message);
    res.status(500).json({ error: "Lỗi Server Google Auth" });
  }
});

// === TUYẾN ĐƯỜNG ĐĂNG KÝ EMAIL/PASSWORD ===
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
      // 1. Kiểm tra xem email đã tồn tại chưa
      let user = await User.findOne({ email });

      if (user) {
        // Nếu người dùng đã tồn tại
        if (user.password) {
          return res.status(400).json({ errors: [{ msg: "Email đã được sử dụng" }] });
        } else {
          // Nếu họ tồn tại (qua Google) nhưng chưa có pass
          user.name = user.name || name; 
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          await user.save();

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
      res.status(500).send("Lỗi Server");
    }
  }
);

// === TUYẾN ĐƯỜNG ĐĂNG NHẬP EMAIL/PASSWORD ===
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      // 1. Tìm người dùng bằng email
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "Email hoặc mật khẩu không đúng" }] });
      }

      // 2. Kiểm tra xem người dùng có mật khẩu không
      if (!user.password) {
        return res.status(400).json({
          errors: [
            {
              msg: "Tài khoản này đã đăng nhập bằng Google. Vui lòng đăng nhập bằng Google.",
              needsGoogleLogin: true, 
            },
          ],
        });
      }

      // 3. So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Email hoặc mật khẩu không đúng" }] });
      }

      // 4. Nếu khớp, trả về token
      const appToken = generateAppToken(user);
      res.json({ token: appToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Lỗi Server");
    }
  }
);

export default router;
