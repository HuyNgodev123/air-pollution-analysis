import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./style.css"; 

// Các tham số vẽ biểu đồ (Key phải khớp với dữ liệu trả về từ Open-Meteo trong airQualityService.js)
const CHARTABLE_PARAMS = [
  { key: "aqi", name: "AQI (US)" },
  { key: "pm25", name: "PM2.5 (µg/m³)" },
  { key: "pm10", name: "PM10 (µg/m³)" },
  { key: "o3", name: "Ozone (µg/m³)" },
  { key: "no2", name: "NO₂ (µg/m³)" },
  { key: "so2", name: "SO₂ (µg/m³)" },
  { key: "co", name: "CO (µg/m³)" },
  { key: "uv", name: "UV Index" },
];

// Mảng màu sắc cho các đường line (Hà Nội màu tím, HCM màu xanh...)
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#dc3545", "#007bff"];

function HistoryChart({ data, selectedCities }) {
  // Mặc định hiển thị biểu đồ AQI trước
  const [selectedParam, setSelectedParam] = useState("aqi");

  // useMemo để tính toán dữ liệu biểu đồ mỗi khi data thay đổi (tránh tính lại không cần thiết)
  const chartData = useMemo(() => {
    // 1. Kiểm tra đầu vào: Nếu chưa chọn thành phố hoặc chưa có data thì thôi
    if (
      !selectedCities ||
      selectedCities.length === 0 ||
      !data ||
      Object.keys(data).length === 0
    ) {
      return [];
    }

    // 2. Tìm thành phố đầu tiên có dữ liệu lịch sử hợp lệ để lấy mốc thời gian làm trục hoành
    // (Open-Meteo trả về mảng thời gian giống nhau cho mọi địa điểm nếu cùng khung giờ)
    const firstCityIdWithData = Object.keys(data).find(
      (id) => data[id] && data[id].history && data[id].history.times
    );

    if (!firstCityIdWithData) return [];

    const timeLabels = data[firstCityIdWithData].history.times;

    // 3. Biến đổi dữ liệu thành dạng Recharts hiểu được:
    // Mảng các object: [{ time: '10:00', 'Hà Nội': 50, 'HCM': 45 }, ...]
    return timeLabels.map((time, index) => {
      // Tạo điểm dữ liệu cho mốc thời gian này
      const dataPoint = {
        // Format thời gian cho đẹp (VD: 07/12 10:00)
        time: new Date(time).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        originalTime: time, // Giữ lại thời gian gốc nếu cần sort
      };

      // Duyệt qua từng thành phố được chọn để lấy giá trị tại thời điểm 'index'
      selectedCities.forEach((city) => {
        const cityData = data[city.value];
        // Kiểm tra xem thành phố này có dữ liệu lịch sử cho tham số đang chọn (vd: pm25) không
        if (cityData && cityData.history && cityData.history[selectedParam]) {
          // Lấy giá trị tại vị trí tương ứng trong mảng
          dataPoint[city.label] = cityData.history[selectedParam][index];
        }
      });

      return dataPoint;
    });
  }, [data, selectedCities, selectedParam]);

  const currentParamInfo = CHARTABLE_PARAMS.find(
    (p) => p.key === selectedParam
  );

  // Nếu chưa chọn thành phố nào thì không hiện gì
  if (!selectedCities || selectedCities.length === 0) return null;

  return (
    <div
      className="history-chart-container"
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#333" }}>
          Biểu đồ Lịch sử ({currentParamInfo?.name})
        </h3>

        {/* Thanh chọn chỉ số (Scroll ngang nếu nhiều quá) */}
        <div
          className="param-selector"
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "5px",
          }}
        >
          {CHARTABLE_PARAMS.map((param) => (
            <button
              key={param.key}
              onClick={() => setSelectedParam(param.key)}
              style={{
                padding: "6px 12px",
                border: "1px solid #ddd",
                borderRadius: "20px",
                background: selectedParam === param.key ? "#2563eb" : "white",
                color: selectedParam === param.key ? "white" : "#666",
                cursor: "pointer",
                fontSize: "13px",
                whiteSpace: "nowrap", // Giữ chữ trên 1 dòng
                transition: "all 0.2s",
              }}
            >
              {param.name}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              dataKey="time"
              fontSize={12}
              tick={{ fill: "#666" }}
              minTickGap={30}
            />
            <YAxis fontSize={12} tick={{ fill: "#666" }} />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />

            {/* Vẽ đường line cho từng thành phố */}
            {selectedCities.map((city, index) => (
              <Line
                key={city.value}
                type="monotone" // Đường cong mềm mại
                dataKey={city.label} // Key khớp với tên thành phố trong dataPoint
                name={city.label}
                stroke={COLORS[index % COLORS.length]} // Chọn màu theo thứ tự
                strokeWidth={2}
                dot={false} // Ẩn các chấm tròn để biểu đồ đỡ rối
                activeDot={{ r: 6 }} // Hiện chấm to khi hover
                connectNulls // Nối liền các điểm nếu dữ liệu bị ngắt quãng
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          <p>Đang tải hoặc không có dữ liệu lịch sử...</p>
        </div>
      )}
    </div>
  );
}

export default HistoryChart;
