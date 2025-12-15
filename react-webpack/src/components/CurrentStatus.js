import React from 'react';
import './style.css'; 

// Hàm helper để lấy thông tin màu sắc và mức độ ô nhiễm
const getAQIInfo = (aqi) => {
  if (aqi <= 50) return { level: 'Tốt', colorClass: 'green' };
  if (aqi <= 100) return { level: 'Trung bình', colorClass: 'yellow' };
  if (aqi <= 150) return { level: 'Kém', colorClass: 'orange' };
  if (aqi <= 200) return { level: 'Xấu', colorClass: 'red' };
  if (aqi <= 300) return { level: 'Rất xấu', colorClass: 'purple' };
  return { level: 'Nguy hại', colorClass: 'maroon' };
};

// Hàm helper lấy lời khuyên sức khỏe
const getHealthAdvice = (level) => {
  switch (level) {
    case 'Tốt':
      return 'Không khí trong lành. Tuyệt vời cho các hoạt động ngoài trời!';
    case 'Trung bình':
      return 'Chất lượng không khí chấp nhận được. Nhóm nhạy cảm nên hạn chế vận động mạnh ngoài trời.';
    case 'Kém':
      return 'Người nhạy cảm có thể gặp vấn đề sức khỏe. Nên giảm bớt thời gian ở ngoài trời.';
    case 'Xấu':
      return 'Có hại cho sức khỏe mọi người. Nên đeo khẩu trang và hạn chế ra ngoài.';
    case 'Rất xấu':
      return 'Cảnh báo sức khỏe khẩn cấp. Mọi người nên ở trong nhà.';
    case 'Nguy hại':
      return 'Mức độ nguy hiểm cao. Đóng kín cửa sổ và tránh mọi hoạt động ngoài trời.';
    default:
      return '';
  }
};

function CurrentStatus({ data, cityName }) {
  // Kiểm tra dữ liệu đầu vào
  if (!data || data.aqi === undefined) {
    return <div className="current-status-card error">Không có dữ liệu AQI.</div>;
  }

  const { aqi, time } = data;
  const { level, colorClass } = getAQIInfo(aqi);
  const advice = getHealthAdvice(level);
  
  // Format thời gian
  const updateTime = time 
    ? new Date(time).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
    : 'Vừa cập nhật';

  return (
    <div className={`current-status-card aqi-${colorClass}`}>
      {/* Header card: Tên thành phố & Thời gian */}
      <div className="status-header">
        <h3 className="city-name">{cityName || 'Vị trí hiện tại'}</h3>
        <span className="timestamp">Tại thời điểm: {updateTime}</span>
      </div>

      {/* Phần hiển thị chỉ số chính */}
      <div className="status-main">
        <div className="aqi-badge">
          <span className="aqi-value">{aqi}</span>
          <span className="aqi-label">US AQI</span>
        </div>
        
        <div className="aqi-text">
          <div className="aqi-level">{level}</div>
          <p className="health-advice">{advice}</p>
        </div>
      </div>
    </div>
  );
}

export default CurrentStatus;