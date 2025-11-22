import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext'; // 1. Import hook
import { ShoppingCart, X, ArrowRight } from 'lucide-react'; 
import './style.css'; 

function Header() {
  // 2. Lấy thông tin user và hàm logout từ Context
  const { user, logout, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout(); // Xóa token
    navigate('/login'); // Chuyển hướng về trang đăng nhập
  };

  // Toggle giỏ hàng 
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  // Đợi context kiểm tra token từ localStorage xong
  // (Chúng ta return một header rỗng để tránh "nhấp nháy")
  if (!isAuthReady) {
    return (
        <header className="app-header">
             <div className=" container-1 header-container">
                 {/* Placeholder để giữ chiều cao */}
             </div>
        </header>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className=" container-1 header-container">
          <Link to="/" className="logo-container">
            <img 
              src="https://www.iqair.com/dl/assets/logos/ic-logo-iq-air-blue.svg"
              alt="Logo Trình theo dõi Không khí"
              className="header-logo"
            />
            <span className="header-title">Trình theo dõi Chất lượng Không khí</span>
          </Link>
          
          <nav className="header-nav">
            <HashLink to="/#products" className="nav-link">
              Trang Sản phẩm
            </HashLink>

            <HashLink to="/#map" className="nav-link">
              Bản đồ
            </HashLink>
            
            <HashLink to="/#dashboard" className="nav-link">
              Dashboard
            </HashLink>

            {/* === 3. LOGIC ĐĂNG NHẬP/ĐĂNG XUẤT === */}
            {user ? (
              // --- NẾU ĐÃ ĐĂNG NHẬP ---
              <>
                <span className="nav-link user-greeting">
                  Chào, {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      style={{
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        marginRight: '8px', 
                        verticalAlign: 'middle'
                      }}
                    />
                  ) : null} 
                  <strong>{user.name}</strong>
                </span>
                <button onClick={handleLogout} className="nav-link btn-logout">
                  Đăng xuất
                </button>
              </>
            ) : (
              // --- NẾU CHƯA ĐĂNG NHẬP ---
              <Link to="/login" className="nav-link login-link">
                Đăng nhập
              </Link>
              
            )}
            <button onClick={toggleCart} className="nav-link cart-icon-btn" aria-label="Giỏ hàng">
              <ShoppingCart size={24} />
            </button>
          </nav>

        </div>
      </header>
        {/* === PHẦN GIỎ HÀNG TRƯỢT (DRAWER) MỚI === */}
        
        {/* 1. Lớp phủ mờ (Overlay) */}
        <div 
          className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
          onClick={() => setIsCartOpen(false)}
        ></div>

        {/* 2. Khung giỏ hàng trượt từ phải sang */}
        <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-drawer-header">
            <h2>Giỏ hàng</h2>
            <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className="cart-drawer-body">
            <div className="empty-cart-content">
              <h3>Giỏ hàng của bạn hiện đang trống.</h3>
              <p>Bạn không biết nên bắt đầu từ đâu?<br/>Hãy thử những bộ sưu tập này:</p>
              
              <HashLink to="/products" className="suggestion-box" onClick={() => setIsCartOpen(false)}>
                <span>Giải pháp dân dụng</span>
                <ArrowRight size={20} />
              </HashLink>
            </div>
          </div>
        </div>
    </>
  );  
}

export default Header;