import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import hook
import { GoogleLogin } from '@react-oauth/google'; // Import nút Google
import './index.css'; 

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Lấy hàm login từ context
  const navigate = useNavigate();
  
  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * @desc XỬ LÝ ĐĂNG KÝ EMAIL/PASSWORD
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw data; // Server trả về lỗi (ví dụ: email đã tồn tại)

      // Đăng ký thành công, tự động đăng nhập
      login(data.token); // Lưu token vào context
      navigate('/'); // Chuyển hướng

    } catch (err) {
      setLoading(false);
      console.error(err);
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].msg); // Hiển thị lỗi từ server
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    }
  };

  /**
   * @desc XỬ LÝ KHI GOOGLE TRẢ VỀ (Giống hệt LoginPage)
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const googleToken = credentialResponse.credential;
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) throw data;
      login(data.token);
      navigate('/');
    } catch (err) {
      setLoading(false);
      setError(err.error || 'Xác thực Google thất bại.');
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại.');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Tạo tài khoản</h2>
        <p className="subtitle">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>

        {/* Form email */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên hiển thị</label>
            <input 
              type="text" 
              id="name" 
              name="name"
              value={name} 
              onChange={handleChange}
              placeholder="Tên của bạn" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              value={email} 
              onChange={handleChange}
              placeholder="Email" 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              value={password} 
              onChange={handleChange}
              placeholder="Nhập mật khẩu" 
              required 
              minLength="6"
            />
          </div>
           <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận Mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              value={confirmPassword} 
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu" 
              required 
            />
          </div>
          
          {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="divider" style={{ textAlign: 'center' }}>
          Hoặc đăng ký với
        </div>

        {/* Nút Google "thật" */}
        <div className="social-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;