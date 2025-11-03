import React from 'react';
import './style.css'; 

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>
          Đồ án thực tập - Phát triển bởi Student F8.
          <br />
          Dữ liệu được cung cấp bởi <a href="https://waqi.info/" target="_blank" rel="noopener noreferrer">WAQI</a>.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
