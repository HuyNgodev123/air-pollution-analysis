import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import './index.css'; 

const ResetPasswordPage = () => {
  // Lấy token từ URL (ví dụ: /reset-password/abc123xyz...)
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate cơ bản
    if (password !== confirmPassword) {
      return setError('Mật khẩu nhập lại không khớp.');
    }
    if (password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    setLoading(true);
    try {
      // Gọi API reset password với token trên URL
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(true);
        // Chuyển hướng sau 3 giây
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.msg || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err) {
      setLoading(false);
      setError('Lỗi kết nối Server. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container" style={{ maxWidth: '400px' }}>
        
        {success ? (
          // --- GIAO DIỆN THÀNH CÔNG ---
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 20px' }} />
            <h3 style={{ color: '#111827', marginBottom: '10px' }}>Đổi mật khẩu thành công!</h3>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Bạn có thể đăng nhập ngay bây giờ với mật khẩu mới.
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Đang chuyển hướng về trang đăng nhập...</p>
            <Link to="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', marginTop: '15px' }}>
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          // --- GIAO DIỆN NHẬP MẬT KHẨU ---
          <>
            <h2>Đặt lại mật khẩu</h2>
            <p className="subtitle">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Ít nhất 6 ký tự" 
                    required 
                    className="input-with-icon"
                  />
                  <div 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Nhập lại mật khẩu</label>
                <div className="input-icon-wrapper">
                  <Lock size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Xác nhận mật khẩu" 
                    required 
                    className="input-with-icon"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;