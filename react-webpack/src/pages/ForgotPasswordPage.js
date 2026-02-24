import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
// import './index.css'; // File này đã được import ở index.js nên không cần import lại ở đây

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Gọi API quên mật khẩu
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        // Nếu thành công, hiển thị thông báo
        setMessage('Link đặt lại mật khẩu đã được gửi vào email của bạn. Vui lòng kiểm tra hộp thư (cả mục spam).');
      } else {
        // Nếu thất bại, hiển thị lỗi từ server
        setError(data.msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (err) {
      setLoading(false);
      setError('Lỗi kết nối đến máy chủ.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        
        {/* TRƯỜNG HỢP 1: GỬI THÀNH CÔNG */}
        {message ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 20px', display: 'block' }} />
            <h3 style={{ margin: '0 0 10px', color: '#111827' }}>Đã gửi email!</h3>
            <p style={{ color: '#6b7280', marginBottom: '30px', lineHeight: '1.5' }}>
              {message}
            </p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: HIỂN THỊ FORM NHẬP EMAIL */
          <>
            <h2>Quên mật khẩu?</h2>
            <p className="subtitle">
              Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
            </p>

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email đăng ký</label>
                <div className="input-icon-wrapper">
                  <Mail size={18} />
                  <input 
                    type="email" 
                    id="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@example.com" 
                    required 
                    className="input-with-icon" 
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    textDecoration: 'none', 
                    color: '#6b7280', 
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                    <ArrowLeft size={16} /> Quay lại trang đăng nhập
                </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;