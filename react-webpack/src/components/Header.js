import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 
// --- SỬA LỖI TẠI ĐÂY: Thêm Plus, Minus, Trash2 vào import ---
import { ShoppingCart, X, ArrowRight, Trash2, Plus, Minus } from 'lucide-react'; 
import './style.css'; 

function Header() {
  const { user, logout, isAuthReady } = useAuth();
  
  // Lấy dữ liệu từ CartContext
  const { cartItems, cartCount, cartTotal, addToCart, removeFromCart, deleteItem } = useCart(); 
  
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  // Hàm format giá tiền (Đã khai báo đúng chỗ)
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!isAuthReady) {
    return <header className="app-header"><div className="container-1 header-container"></div></header>;
  }

  return (
    <>
      <header className="app-header">
        <div className="container-1 header-container">
          <Link to="/" className="logo-container">
            <img src="https://www.iqair.com/dl/assets/logos/ic-logo-iq-air-blue.svg" alt="Logo" className="header-logo" />
            <span className="header-title">Trình theo dõi Chất lượng Không khí</span>
          </Link>
          
          <nav className="header-nav">
            <Link to="/products" className="nav-link">Trang Sản phẩm</Link>
            <HashLink to="/#map" className="nav-link">Bản đồ</HashLink>
            <HashLink to="/#dashboard" className="nav-link">Dashboard</HashLink>

            {user ? (
              <>
                <span className="nav-link user-greeting">
                  Chào, <strong>{user.name}</strong>
                </span>
                <button onClick={handleLogout} className="nav-link btn-logout">Đăng xuất</button>
              </>
            ) : (
              <Link to="/login" className="nav-link login-link">Đăng nhập</Link>
            )}

            {/* NÚT GIỎ HÀNG */}
            <button onClick={toggleCart} className="nav-link cart-icon-btn" aria-label="Giỏ hàng" style={{position: 'relative'}}>
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="cart-badge" style={{
                  position: 'absolute', top: '-5px', right: '-5px', 
                  background: '#ef4444', color: 'white', 
                  borderRadius: '50%', width: '20px', height: '20px', 
                  fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* --- GIỎ HÀNG DRAWER --- */}
      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>

      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Giỏ hàng ({cartCount})</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>

        <div className="cart-drawer-body" style={{ justifyContent: cartItems.length === 0 ? 'center' : 'flex-start', overflowY: 'auto' }}>
          
          {cartItems.length > 0 ? (
            <div className="cart-items-list" style={{ width: '100%' }}>
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item" style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #eee', borderRadius: '8px' }} />
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#2563eb' }}>{formatPrice(item.price)}</p>
                    
                    <div className="quantity-controls" style={{ display: 'flex', alignItems: 'center', marginTop: '10px', gap: '10px' }}>
                      <button onClick={() => removeFromCart(item._id)} style={{ padding: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.quantity}</span>
                      <button onClick={() => addToCart(item)} style={{ padding: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', borderRadius: '4px' }}>
                        <Plus size={14} />
                      </button>
                      
                      <button onClick={() => deleteItem(item._id)} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="cart-summary" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Tổng tiền:</span>
                  <span style={{ color: '#2563eb' }}>{formatPrice(cartTotal)}</span>
                </div>
                <button style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Thanh toán ngay
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-cart-content">
              <h3>Giỏ hàng của bạn đang trống.</h3>
              <p>Bạn không biết nên bắt đầu từ đâu?<br/>Hãy thử những bộ sưu tập này:</p>
              <Link to="/products" className="suggestion-box" onClick={() => setIsCartOpen(false)}>
                <span>Giải pháp dân dụng</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;