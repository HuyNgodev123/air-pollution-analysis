import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './style.css';

// Các tham số mà chúng ta cho phép vẽ biểu đồ
const CHARTABLE_PARAMS = [
  { key: 'aqi', name: 'AQI' },
  { key: 'pm25', name: 'PM2.5' },
  { key: 'pm10', name: 'PM10' },
  { key: 'o3', name: 'Ozone' },
  { key: 'no2', name: 'NO₂' },
  { key: 't', name: 'Nhiệt độ' },
];

function HistoryChart({ data }) {
  // State để lưu tham số đang được chọn (mặc định là 'aqi')
  const [selectedParam, setSelectedParam] = useState('aqi');

  // useMemo dùng để lọc và chuẩn bị dữ liệu
  // Nó chỉ chạy lại khi 'data' hoặc 'selectedParam' thay đổi
  const chartData = useMemo(() => {
    return data
      // 1. Lọc lấy các bản ghi khớp với tham số đã chọn
      .filter(item => item.parameter === selectedParam)
      // 2. Format lại 'timestamp' cho dễ đọc trên biểu đồ
      .map(item => ({
        ...item,
        // Format: "26/10 21:00"
        time: new Date(item.timestamp).toLocaleString('vi-VN', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        })
      }))
      // 3. Đảo ngược mảng (vì API trả về mới nhất -> cũ nhất)
      // Biểu đồ cần cũ nhất -> mới nhất (trái -> phải)
      .reverse(); 
  }, [data, selectedParam]);

  // Lấy ra tên "đẹp" (ví dụ: "PM2.5") để hiển thị
  const currentParamInfo = CHARTABLE_PARAMS.find(p => p.key === selectedParam);

  return (
    <div className="history-chart-container">
      <h3>Biểu đồ Lịch sử</h3>
      
      {/* Các nút để chọn tham số */}
      <div className="param-selector">
        {CHARTABLE_PARAMS.map(param => (
          <button
            key={param.key}
            // Nếu nút được chọn, thêm class 'active'
            className={`param-button ${selectedParam === param.key ? 'active' : ''}`}
            onClick={() => setSelectedParam(param.key)}
          >
            {param.name}
          </button>
        ))}
      </div>

      {chartData.length > 0 ? (
        // ResponsiveContainer giúp biểu đồ co giãn theo kích thước
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            {/* Trục X (thời gian) */}
            <XAxis dataKey="time" fontSize={12} />
            {/* Trục Y (giá trị) */}
            <YAxis fontSize={12} />
            {/* Tooltip khi di chuột vào */}
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" // Dữ liệu của trục Y
              name={currentParamInfo?.name || 'Giá trị'} // Tên "đẹp"
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Không có dữ liệu lịch sử cho tham số {currentParamInfo?.name}.</p>
      )}
    </div>
  );
}

export default HistoryChart;
