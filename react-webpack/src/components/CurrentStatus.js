import React from 'react';
import './style.css'; 

/**
 * Helper function để lấy thông tin (mức độ, màu sắc)
 * dựa trên chỉ số AQI
 */
const getAQIInfo = (aqi) => {
  if (aqi <= 50) return { level: 'Tốt', colorClass: 'green' };
  if (aqi <= 100) return { level: 'Trung bình', colorClass: 'yellow' };
  if (aqi <= 150) return { level: 'Kém', colorClass: 'orange' };
  if (aqi <= 200) return { level: 'Xấu', colorClass: 'red' };
  if (aqi <= 300) return { level: 'Rất xấu', colorClass: 'purple' };
  return { level: 'Nguy hại', colorClass: 'maroon' };
};

// Hàm helper mới để lấy lời khuyên sức khỏe
const getHealthAdvice = (level) => {
  switch (level) {
    case 'Tốt':
      return 'Chất lượng không khí tuyệt vời. Tận hưởng các hoạt động ngoài trời!';
    case 'Trung bình':
      return 'Chất lượng không khí ở mức chấp nhận được. Người nhạy cảm nên giảm bớt các hoạt động ngoài trời.';
    case 'Kém':
      return 'Người nhạy cảm có thể gặp vấn đề sức khỏe. Mọi người nên giảm bớt các hoạt động ngoài trời.';
    case 'Xấu':
      return 'Mọi người có thể bắt đầu gặp các vấn đề sức khỏe. Nên giảm các hoạt động ngoài trời và đeo khẩu trang nếu ra ngoài.';
    case 'Rất xấu':
      return 'Cảnh báo sức khỏe nghiêm trọng. Tránh mọi hoạt động ngoài trời.';
    case 'Nguy hại':
      return 'Cảnh báo nguy hiểm! Mọi người nên ở trong nhà và đóng kín cửa sổ.';
    default:
      return '';
  }
};

function CurrentStatus({ data }) {
  // Vì 'data' chứa tất cả (pm25, pm10, aqi...),
  // chúng ta cần tìm bản ghi 'aqi' mới nhất.
  // Do data đã sắp xếp theo timestamp giảm dần, 
  // bản ghi 'aqi' đầu tiên tìm thấy chính là mới nhất.
  let latestData = data.find(item => item.parameter === 'aqi');
  let isPm25Fallback = false;

  // 2. Nếu không có 'aqi', tìm 'pm25' để thay thế
  if (!latestData) {
    latestData = data.find(item => item.parameter === 'pm25');
    if (latestData) {
      isPm25Fallback = true;
    }
  }
  
  // 3. Nếu không có cả hai, mới báo lỗi
  if (!latestData) {
    return <div className="current-status-card">Không tìm thấy dữ liệu AQI.</div>;
  }

  const { value, timestamp } = latestData;
  const { level, colorClass } = getAQIInfo(value);
  const advice = getHealthAdvice(level);
  // Format lại thời gian cho dễ đọc
  const time = new Date(timestamp).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
  });

  return (
    // Dùng class màu động để thay đổi background
    <div className={`current-status-card aqi-${colorClass}`}>
      <div className="aqi-value-large">{value}</div>
      <div className="aqi-level">{level}</div>
      <p className="timestamp">Cập nhật lúc: {time}</p>
      <p className="health-advice">{advice}</p>
    </div>
  );
}

export default CurrentStatus;