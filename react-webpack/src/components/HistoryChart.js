import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
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

// Mảng màu cho các đường line (để so sánh)
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#dc3545', '#007bff'];

/**
 * Props mới (đã nâng cấp):
 * data: { 'hanoi': [...], '@14642': [...] } (Object)
 * selectedCities: [{ value: 'hanoi', label: 'Hà Nội' }, ...] (Array)
 */
function HistoryChart({ data, selectedCities }) {
  const [selectedParam, setSelectedParam] = useState('aqi');

  // useMemo để chuẩn bị dữ liệu cho biểu đồ so sánh
  const chartData = useMemo(() => {
    
    // 1. Tạo một "kho" để gộp dữ liệu
    // Ví dụ: { '1678886400000': { timestamp: ..., time: '...', 'Hà Nội': 50, 'Vũng Tàu': 30 } }
    const combinedData = {};
    
    // 2. Duyệt qua từng thành phố ĐÃ CHỌN
    // (Kiểm tra 'selectedCities' có tồn tại không)
    if (!selectedCities || selectedCities.length === 0) {
      return [];
    }

    for (const city of selectedCities) {
      const cityId = city.value;
      const cityName = city.label.split(' (')[0]; // Lấy tên ngắn (ví dụ: 'Hà Nội')
      
      // 3. Kiểm tra xem 'data' (là Object) có dữ liệu cho thành phố này không
      if (data[cityId]) {
        // 4. Lọc lấy các bản ghi khớp với tham số (ví dụ: 'pm25')
        // (data[cityId] là một Mảng, nên .filter() hoạt động)
        const filteredCityData = data[cityId].filter(item => item.parameter === selectedParam);
        
        // 5. Thêm dữ liệu của thành phố này vào "kho"
        for (const item of filteredCityData) {
          const timestamp = item.timestamp; // Dùng timestamp gốc làm key
          
          if (!combinedData[timestamp]) {
            combinedData[timestamp] = {
              timestamp: timestamp,
              time: new Date(timestamp).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
              })
            };
          }
          
          combinedData[timestamp][cityName] = item.value;
        }
      }
    }

    // 6. Chuyển "kho" (Object) thành mảng (Array) và sắp xếp theo thời gian
    const sortedArray = Object.values(combinedData).sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    return sortedArray;

  }, [data, selectedCities, selectedParam]); // Chạy lại khi 3 thứ này thay đổi

  const currentParamInfo = CHARTABLE_PARAMS.find(p => p.key === selectedParam);

  return (
    <div className="history-chart-container">
      <h3>Biểu đồ Lịch sử ({currentParamInfo?.name})</h3>
      
      {/* Các nút để chọn tham số (Giữ nguyên) */}
      <div className="param-selector">
        {CHARTABLE_PARAMS.map(param => (
          <button
            key={param.key}
            className={`param-button ${selectedParam === param.key ? 'active' : ''}`}
            onClick={() => setSelectedParam(param.key)}
          >
            {param.name}
          </button>
        ))}
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="time" fontSize={12} minTickGap={15} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            
            {/* Vẽ nhiều line động (Giữ nguyên) */}
            {selectedCities.map((city, index) => {
              const cityName = city.label.split(' (')[0]; // Tên ngắn
              return (
                <Line 
                  key={city.value}
                  type="monotone" 
                  dataKey={cityName} 
                  name={cityName}     
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls 
                />
              );
            })}
            
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Không có dữ liệu lịch sử cho tham số {currentParamInfo?.name}.</p>
      )}
    </div>
  );
}

export default HistoryChart;

