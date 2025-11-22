import React, { useState, useEffect } from 'react';
import axios from 'axios';
// (Chúng ta sẽ dùng component tìm kiếm "bất đồng bộ")
import AsyncSelect from 'react-select/async'; 
import ReactPlayer from 'react-player';
// Import các component con
import CurrentStatus from './CurrentStatus';
import PollutantDetails from './PollutantDetails';
import HistoryChart from './HistoryChart';
import AQIMap from './AQIMap';
import PollutantInfoTabs from './PollutantInfoTabs';
import VideoSection from './VideoSection';
import './style.css';

// Hàm helper (giữ nguyên)
const getISODate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

function Dashboard() {
  // === 2. SỬA LẠI STATE ===
  // Bỏ state 'locations', vì 'AsyncSelect' sẽ tự tải
  const [selectedCities, setSelectedCities] = useState([]); // Giữ nguyên
  const [fromDate, setFromDate] = useState(getISODate(-7)); 
  const [toDate, setToDate] = useState(getISODate(1));   
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false); // Đặt mặc định là 'false'
  const [error, setError] = useState(null);

  // === 3. XÓA useEffect (fetchLocations) ===
  // (Chúng ta không cần nó nữa, vì 'AsyncSelect' tự làm)
  // useEffect(() => { ... fetchLocations ... }, []); // <-- XÓA BỎ HOÀN TOÀN

  
  // === useEffect (fetchData) (Giữ nguyên) ===
  // (Effect này vẫn hoạt động hoàn hảo)
  useEffect(() => {
    if (selectedCities.length === 0 || !fromDate || !toDate) {
      setLoading(false);
      setData({}); 
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = selectedCities.map(city =>
          axios.get('/api/measurements', {
            params: { city: city.value, from: fromDate, to: toDate }
          })
        );
        const responses = await Promise.all(promises);
        const newData = {};
        responses.forEach((res, index) => {
          const cityId = selectedCities[index].value;
          newData[cityId] = res.data.results;
        });
        setData(newData);
      } catch (err) {
        console.error("Lỗi khi gọi API đo lường:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCities, fromDate, toDate]); 

  // === 4. THÊM HÀM TẢI TÙY CHỌN (CHO THANH TÌM KIẾM) ===
  /**
   * Hàm này được 'AsyncSelect' gọi mỗi khi người dùng gõ
   * @param {string} inputValue Từ khóa người dùng gõ (ví dụ: "vung")
   */
  const loadOptions = async (inputValue) => {
    // Chỉ tìm khi người dùng gõ 2+ ký tự
    if (inputValue.length < 2) return []; 
    
    try {
      // Gọi API search mới mà chúng ta đã tạo
      const res = await axios.get(`/api/locations/search?q=${inputValue}`);
      return res.data; // API đã trả về format { value: '...', label: '...' }
    } catch (err) {
      console.error("Lỗi tìm kiếm địa điểm:", err);
      return []; // Trả về mảng rỗng nếu lỗi
    }
  };
  
  // === renderContent() (Giữ nguyên) ===
  const renderContent = () => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>Lỗi: {error.message}</p>; // (Sửa lại: error.message)
    
    // Sửa lại logic hiển thị
    if (Object.keys(data).length === 0 && selectedCities.length > 0 && !loading) {
      return <p>Không tìm thấy dữ liệu cho địa điểm và ngày đã chọn.</p>;
    }
    if (Object.keys(data).length === 0) {
      return <p>Vui lòng tìm và chọn một địa điểm để xem dữ liệu.</p>;
    }
    
    return (
      <div>
        <div className="current-status-grid">
          {selectedCities.map(city => {
            const cityData = data[city.value] || [];
            return cityData.length > 0 ? (
              <CurrentStatus key={city.value} data={cityData} />
            ) : (
              // Trường hợp đã chọn nhưng không có data (do API lỗi)
              <p key={city.value}>Không có dữ liệu cho {city.label} trong khoảng thời gian này.</p>
            );
          })}
        </div>
        {selectedCities.length === 1 && (
          <PollutantDetails data={data[selectedCities[0].value] || []} />
        )}
        <HistoryChart data={data} selectedCities={selectedCities} />
      </div>
    );
  };

  return (
    <div className="dashboard-container">

      <VideoSection />

      <div className='machine'>
        <div className='mechine-info-1'> 
          <h2>Các máy đo chất lượng không khí AirVisual được thiết kế để phát hiện các chất ô nhiễm này</h2>
        </div>
        <div className='mechine-info-2'>
          <p> <b>AirVisual Pro</b> có thể theo dõi tới 5 thông số môi trường; AQI,
             PM2.5, CO2, Nhiệt độ và Độ ẩm.
            Trong khi <b>AirVisual Outdoor</b> có thể theo dõi tới 8 thông số môi trường; 
            AQI, PM1, PM2.5, PM10, Nhiệt độ, Độ ẩm, Áp suất khí quyển và tùy chọn CO2.</p>
        </div>
        
      </div>

      <div id="dashboard-info"> 
        <h2>Tìm hiểu về Chất ô nhiễm</h2>
        <PollutantInfoTabs /> 
      </div>


      <div id="map">
        <h2>Bản đồ Chất lượng không khí</h2>
        <AQIMap />
      </div>

      <div id="dashboard">
        <h2 className="dashboard-desc">Dashboard Phân tích</h2>
        <div className="controls-grid">
          <div className="control-item">
            <label>Tìm & So sánh Địa điểm</label>
            
            {/* THAY THẾ 'Select' (hoặc <select>) BẰNG 'AsyncSelect' */}
            <AsyncSelect
              isMulti // Cho phép chọn nhiều
              cacheOptions // Lưu kết quả tìm kiếm (ví dụ: "vung tau")
              loadOptions={loadOptions} // Hàm tìm kiếm (Bước 4)
              value={selectedCities}
              onChange={(selectedOptions) => setSelectedCities(selectedOptions || [])}
              placeholder="Gõ tên tỉnh/trạm (ví dụ: Vũng Tàu...)"
            />
          </div>
          
          {/* Bộ lọc Ngày (Giữ nguyên) */}
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
      </div>

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;

