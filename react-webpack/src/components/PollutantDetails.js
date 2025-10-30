import React from 'react';
import './style.css'; 

// Danh sách các chất ô nhiễm chính chúng ta muốn hiển thị
// Tên (key) phải khớp với 'parameter' đã chuẩn hóa trong service
const POLLUTANT_PARAMS = [
  { key: 'pm25', name: 'PM2.5' },
  { key: 'pm10', name: 'PM10' },
  { key: 'o3', name: 'Ozone (O₃)' },
  { key: 'no2', name: 'NO₂' },
  { key: 'so2', name: 'SO₂' },
  { key: 'co', name: 'CO' },
  { key: 't', name: 'Nhiệt độ' },
];

/**
 * Component này nhận toàn bộ mảng 'data'
 * và trích xuất giá trị mới nhất cho từng chất ô nhiễm
 */
function PollutantDetails({ data }) {
  
  // Tạo một đối tượng (Map) để lưu giá trị mới nhất của từng chất
  // Vì 'data' đã được sắp xếp mới nhất -> cũ nhất,
  // chúng ta chỉ cần tìm bản ghi đầu tiên khớp với 'parameter'
  const latestDetails = new Map();

  for (const param of POLLUTANT_PARAMS) {
    const item = data.find(d => d.parameter === param.key);
    if (item) {
      latestDetails.set(param.key, {
        ...param,
        value: item.value,
        unit: item.unit || '',
      });
    }
  }

  // Chuyển Map thành mảng để render
  const detailsList = Array.from(latestDetails.values());

  if (detailsList.length === 0) {
    return null; // Không hiển thị gì nếu không có dữ liệu chi tiết
  }

  return (
    <div className="details-container">
      <h3>Chi tiết các chỉ số</h3>
      <div className="details-grid">
        {detailsList.map(item => (
          <div key={item.key} className="detail-item">
            <span className="detail-name">{item.name}</span>
            <span className="detail-value">
              {item.value} 
              <span className="detail-unit">{item.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PollutantDetails;