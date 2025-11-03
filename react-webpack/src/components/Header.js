import React from 'react';
import './style.css'; 

function Header() {
  return (
    <header className="app-header">
      <div className="container-header">
        <img 
            src="https://www.iqair.com/dl/assets/logos/ic-logo-iq-air-blue.svg"
            alt="Logo Trình theo dõi Không khí"
            className="header-logo"
        />
        <span className="header-title">Trình theo dõi Chất lượng Không khí</span>
        
        <nav className="header-nav">
          <a href="#map">Bản đồ</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
      </div>

    </header>
  );
}

export default Header;
