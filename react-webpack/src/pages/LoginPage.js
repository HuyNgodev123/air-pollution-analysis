import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './index.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tạm thời chỉ log ra, sau này sẽ gọi API backend
    console.log('Đăng nhập với:', { email, password });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    console.log("Đăng nhập Google thành công:", credentialResponse);
    const token = credentialResponse.credential;
    // TODO: Gửi 'token' này về Backend
  };

  const handleGoogleError = () => {
    console.error('Đăng nhập Google thất bại');
  };
  
  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <h2>Chào mừng trở lại</h2>
        <p className="subtitle">
          Chưa có tài khoản? <a href="/register">Tạo tài khoản</a>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <a href="/forgot-password" className="forgot-password">
            Quên mật khẩu?
          </a>

          <button type="submit" className="btn btn-primary">
            Đăng nhập bằng email
          </button>
        </form>

        <div className="divider">Hoặc đăng nhập với</div>

        <div className="social-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
          />
        
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
}

export default LoginPage;