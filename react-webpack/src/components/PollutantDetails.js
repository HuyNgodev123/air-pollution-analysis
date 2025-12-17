import React from "react";
import "./style.css"; // Hoặc file css riêng của bạn

// Danh sách các chất ô nhiễm cần hiển thị
// 'key' phải khớp với tên thuộc tính trả về từ airQualityService.js
const POLLUTANT_PARAMS = [
  { key: "pm25", name: "PM2.5", unit: "µg/m³" },
  { key: "pm10", name: "PM10", unit: "µg/m³" },
  { key: "o3", name: "Ozone (O₃)", unit: "µg/m³" },
  { key: "no2", name: "NO₂", unit: "µg/m³" },
  { key: "so2", name: "SO₂", unit: "µg/m³" },
  { key: "co", name: "CO", unit: "µg/m³" },
  { key: "uv", name: "Tia cực tím (UV)", unit: "" },
];

function PollutantDetails({ data }) {
  // Nếu không có data hoặc data rỗng thì không hiện gì cả
  if (!data) return null;

  // --- HÀM FORMAT GIÁ TRỊ (để hiển thị đẹp hơn nếu cần, ví dụ làm tròn) ---
  // Lưu ý: Đây không phải formatPrice (tiền tệ) mà là format chỉ số ô nhiễm
  const formatValue = (val) => {
    if (val === null || val === undefined) return "-";
    return val;
  };

  return (
    <div className="details-container">
      <h3 className="details-title">Chi tiết các chỉ số đo lường</h3>

      <div className="details-grid">
        {POLLUTANT_PARAMS.map((param) => {
          // Lấy giá trị trực tiếp từ object data (VD: data.pm25)
          const value = data[param.key];

          // Chỉ hiển thị những chất có số liệu (khác null/undefined)
          if (value === undefined || value === null) return null;

          return (
            <div key={param.key} className="detail-item">
              <span className="detail-name">{param.name}</span>
              <div className="detail-value-group">
                <span className="detail-value">{formatValue(value)}</span>
                <span className="detail-unit">{param.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PollutantDetails;
