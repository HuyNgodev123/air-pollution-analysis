import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import './style.css'; 

function Header() {
  return (
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
          <HashLink to="/#map" className="nav-link">
            Bản đồ
          </HashLink>
          
          <HashLink to="/#dashboard" className="nav-link">
            Dashboard
          </HashLink>
          {/* Link mới: Dùng 'Link' thay vì 'a' để không tải lại trang */}
          <Link to="/login" className="nav-link login-link">
            Đăng nhập
          </Link>
        </nav>

      </div>

    </header>
  );
}

export default Header;
