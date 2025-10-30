import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import các component con
import CurrentStatus from './CurrentStatus';
import PollutantDetails from './PollutantDetails';
import HistoryChart from './HistoryChart';

function Dashboard() {
  // === State ===
  const [city, setCity] = useState(''); 
  const [locations, setLocations] = useState([]);
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  // === useEffect ===

  useEffect(() => {
    // Chạy 1 lần duy nhất khi component tải
    const fetchLocations = async () => {
      try {
        const res = await axios.get('/api/locations');
        setLocations(res.data); // Lưu danh sách vào state
        
        // Tự động chọn địa điểm đầu tiên trong danh sách làm mặc định
        if (res.data && res.data.length > 0) {
          // (Chúng ta sẽ tự động chọn 'hanoi' nếu có)
          const hanoi = res.data.find(loc => loc.locationId === 'hanoi');
          if (hanoi) {
            setCity(hanoi.locationId);
          } else {
            setCity(res.data[0].locationId); // Hoặc chọn cái đầu tiên
          }
        } else {
          setLoading(false); // Không có địa điểm nào để tải
        }
      } catch (err) {
        console.error("Lỗi khi tải địa điểm:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []); // [] = Chạy 1 lần khi mount

  // Tự động gọi API khi 'city' thay đổi
  useEffect(() => {
    // Chỉ chạy nếu 'city' đã được chọn (không phải chuỗi rỗng)
    if (!city) {
      // Nếu không có city, không cần loading, chỉ cần set data rỗng
      setData([]);
      setLoading(false);
      return; 
    }

    const fetchData = async () => {
      setLoading(true); 
      setError(null);   
      try {
        const res = await axios.get(`/api/measurements?city=${city}&limit=200`);
        setData(res.data.results);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message);
      } finally {
        setLoading(false); 
      }
    };

    fetchData(); 
  }, [city]); // <-- Chạy lại khi 'city' thay đổi

  
  // === Render ===
  const renderContent = () => {
    if (loading) {
      return <p>Đang tải dữ liệu cho {city}...</p>;
    }

    if (error) {
      return <p>Lỗi: {error}</p>;
    }

    if (data.length === 0) {
      return <p>Không tìm thấy dữ liệu cho {city}.</p>;
    }

    // Nếu có dữ liệu, ta sẽ render các component con
    return (
      <div>
        <CurrentStatus data={data} />
        <PollutantDetails data={data} />
        <HistoryChart data={data} />
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard Chất lượng không khí</h1>
      
      <div className="controls">
        <label>Chọn địa điểm: </label>
        
        {/* === BẮT ĐẦU SỬA: TẠO DROPDOWN ĐỘNG === */}
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          {/* Bây giờ dropdown sẽ tự động điền (render)
            danh sách địa điểm lấy từ database (API)
          */}
          {locations.length === 0 ? (
            <option disabled value="">Đang tải địa điểm...</option>
          ) : (
            locations.map(loc => (
              <option key={loc.locationId} value={loc.locationId}>
                {/* Dùng 'displayName' từ DB, ví dụ: "Hà Nội (Tổng hợp)" */}
                {loc.displayName} 
              </option>
            ))
          )}
        </select>
        {/* === KẾT THÚC SỬA === */}
      </div>

      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;

