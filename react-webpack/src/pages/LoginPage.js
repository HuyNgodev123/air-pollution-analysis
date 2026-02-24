import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import hook
import { GoogleLogin } from '@react-oauth/google'; // Import nút Google

import './index.css'; 

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Lấy hàm login từ context
  const navigate = useNavigate();
  
  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @desc XỬ LÝ ĐĂNG NHẬP EMAIL/PASSWORD (Giữ nguyên)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw data;

      login(data.token); // Lưu token vào context
      navigate('/'); // Chuyển hướng

    } catch (err) {
      setLoading(false);
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].msg);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  };

  /**
   * @desc XỬ LÝ KHI GOOGLE TRẢ VỀ (Cập nhật)
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log("Đăng nhập Google thành công, đang gửi về backend...", credentialResponse);
    setError('');
    setLoading(true); // Hiển thị loading khi đang xác thực backend

    try {
      const googleToken = credentialResponse.credential;

      // Gửi token này về Backend
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw data;

      // Đã nhận token của app, LƯU VÀO CONTEXT
      login(data.token);

      console.log("Đã nhận token của app, đang chuyển về trang dashboard...");
      navigate('/'); // Chuyển hướng

    } catch (err) {
      setLoading(false);
      console.error('Lỗi khi gửi token về backend:', err);
      setError(err.error || 'Xác thực Google thất bại. Vui lòng thử lại.');
    }
  };

  const handleGoogleError = () => {
    console.error('Đăng nhập Google thất bại');
    setError('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  // Sử dụng cấu trúc JSX (Đã xóa style inline)
  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Chào mừng trở lại</h2>
        <p className="subtitle">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
        </p>

        {/* Form email */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" // Thêm name
              value={email} 
              onChange={handleChange} // Sử dụng handleChange
              placeholder="Email" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              name="password" // Thêm name
              value={password} 
              onChange={handleChange} // Sử dụng handleChange
              placeholder="Nhập mật khẩu" 
              required 
            />
          </div>
          
          <Link to="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </Link>
          
          {/* Giữ lại style inline cho thông báo lỗi */}
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            // style đã bị xóa
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập bằng email'}
          </button>
        </form>

        <div className="divider" style={{ textAlign: 'center' }}>
          Hoặc đăng nhập với
        </div>

        {/* Nút Google "thật" */}
        <div className="social-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
          />
        </div>
        
        {/* Các nút (giả) còn lại nếu bạn muốn */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
          <button type="button" className="btn social-btn facebook">
            Facebook
          </button>
          <button type="button" className="btn social-btn apple">
            Apple
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;