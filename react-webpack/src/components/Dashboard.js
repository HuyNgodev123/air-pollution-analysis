import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 1. IMPORT CÁC THƯ VIỆN/COMPONENT MỚI
import Select from 'react-select'; // (Từ 'npm install react-select')
import AQIMap from './AQIMap'; 
// (Import các component con cũ)
import CurrentStatus from './CurrentStatus';
import PollutantDetails from './PollutantDetails';
import HistoryChart from './HistoryChart';

// Hàm helper để lấy ngày hôm nay/7 ngày trước cho Bộ lọc Thời gian
const getISODate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0]; // Format chuẩn: YYYY-MM-DD
};

function Dashboard() {
  // === 2. NÂNG CẤP STATE ===
  
  // State quản lý danh sách địa điểm (lấy từ /api/locations)
  const [locations, setLocations] = useState([]); // Ví dụ: [{ value: '@123', label: 'Vũng Tàu' }]
  
  // State quản lý các địa điểm ĐANG CHỌN (có thể nhiều)
  const [selectedCities, setSelectedCities] = useState([]); // Ví dụ: [{ value: 'hanoi', ... }]
  
  // State cho Bộ lọc Thời gian
  const [fromDate, setFromDate] = useState(getISODate(-7)); // 7 ngày trước
  const [toDate, setToDate] = useState(getISODate(1));   // +1 ngày (để bao gồm cả ngày hôm nay)
  
  // State dữ liệu (giờ là 1 object, không còn là mảng)
  // Ví dụ: { 'hanoi': [...data...], '@14642': [...data...] }
  const [data, setData] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === useEffect 1: Lấy danh sách địa điểm (Chạy 1 lần) ===
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/api/locations');
        // Chuyển đổi format cho 'react-select'
        const options = res.data.map(loc => ({
          value: loc.locationId, // ID (ví dụ: 'hanoi', '@14642')
          label: loc.displayName   // Tên (ví dụ: 'Hà Nội (Tổng hợp)')
        }));
        
        setLocations(options);
        
        // Tự động chọn Hà Nội làm mặc định khi tải trang
        if (options.length > 0) {
          const hanoi = options.find(o => o.value === 'hanoi');
          setSelectedCities(hanoi ? [hanoi] : [options[0]]); // Chọn Hà Nội
        }
      } catch (err) {
        console.error("Lỗi khi tải địa điểm:", err);
        setError(err.message);
      } finally {
        // (Loading sẽ được set 'false' ở useEffect 2)
      }
    };
    fetchLocations();
  }, []); // [] = Chạy 1 lần khi mount

  
  // === useEffect 2: Lấy dữ liệu đo lường (Chạy khi thay đổi) ===
  useEffect(() => {
    // Chỉ chạy nếu có địa điểm được chọn VÀ có ngày
    if (selectedCities.length === 0 || !fromDate || !toDate) {
      setLoading(false);
      setData({}); // Xóa data cũ
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Tạo một mảng các "lời hứa" (promises)
        // Mỗi 'promise' là một API call cho 1 thành phố
        const promises = selectedCities.map(city =>
          axios.get('/api/measurements', {
            params: {
              city: city.value, // city.value là ID ('hanoi', '@14642')
              from: fromDate,   // Gửi 'from' (từ ngày)
              to: toDate,       // Gửi 'to' (đến ngày)
              // Bỏ 'limit=200'. API sẽ trả về TẤT CẢ data trong khoảng ngày
            }
          })
        );
        
        // Chờ tất cả API call hoàn thành
        const responses = await Promise.all(promises);
        
        // Biến mảng kết quả thành 1 object
        const newData = {};
        responses.forEach((res, index) => {
          const cityId = selectedCities[index].value;
          newData[cityId] = res.data.results; // Ví dụ: { 'hanoi': [...], '@14642': [...] }
        });

        setData(newData); // Cập nhật state dữ liệu chính
        
      } catch (err) {
        console.error("Lỗi khi gọi API đo lường:", err);
        setError(err.message);
      } finally {
        setLoading(false); // Hoàn thành tải
      }
    };

    fetchData();
  }, [selectedCities, fromDate, toDate]); // <-- Chạy lại khi 3 state này thay đổi


  // === 3. NÂNG CẤP HÀM RENDER ===
  const renderContent = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>Lỗi: {error}</p>;
    if (Object.keys(data).length === 0) {
      return <p>Vui lòng chọn địa điểm.</p>;
    }

    return (
      <div>
        {/* Logic mới: Hiển thị 1 thẻ cho MỖI thành phố được chọn */}
        <div className="current-status-grid">
          {selectedCities.map(city => {
            const cityData = data[city.value] || []; // Lấy data của thành phố này
            return cityData.length > 0 ? (
              <CurrentStatus key={city.value} data={cityData} />
            ) : (
              <p key={city.value}>Không có dữ liệu cho {city.label}</p>
            );
          })}
        </div>
        
        {/* Logic mới: Chỉ hiển thị chi tiết nếu 1 thành phố được chọn */}
        {selectedCities.length === 1 && (
          <PollutantDetails data={data[selectedCities[0].value] || []} />
        )}
        
        {/* Truyền props (dạng object) mới cho Biểu đồ */}
        <HistoryChart data={data} selectedCities={selectedCities} />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard Chất lượng không khí</h1>
      
      {/* 4. THÊM COMPONENT BẢN ĐỒ */}
      <AQIMap />

      {/* 5. NÂNG CẤP BỘ LỌC (CONTROLS) */}
      <div className="controls-grid">
        {/* Dropdown chọn nhiều (Tính năng So sánh) */}
        <div className="control-item">
          <label>Chọn Địa điểm (có thể chọn nhiều)</label>
          <Select
            isMulti // Cho phép chọn nhiều
            options={locations}
            isLoading={locations.length === 0}
            value={selectedCities}
            onChange={(selectedOptions) => setSelectedCities(selectedOptions || [])}
            placeholder="Chọn hoặc so sánh các địa điểm..."
          />
        </div>
        
        {/* Bộ lọc Thời gian (Date Filter) */}
        <div className="control-item">
          <label>Từ ngày</label>
          <input 
            type="date" 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="control-item">
          <label>Đến ngày</label>
          <input 
            type="date" 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Vùng hiển thị nội dung chính */}
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;

