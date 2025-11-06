import React, { useState, useRef, useEffect } from 'react';
import './style.css'; // Import file CSS

// 1. "Database" nội dung (giữ nguyên)
const pollutantData = {
  aqi: {
    id: 'aqi',
    name: 'AQI',
    title: 'Chỉ số chất lượng không khí',
    description: 'AQI (Chỉ số Chất lượng Không khí) là một hệ thống chuyên đổi các phép đo nồng độ chất ô nhiễm... để hiểu rủi ro sức khỏe do ô nhiễm không khí.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Người+xem+AQI'
  },
  pm1: {
    id: 'pm1',
    name: 'PM1',
    title: 'Hạt siêu nhỏ',
    description: 'Vật chất hạt (PM) có kích thước nhỏ hơn 1 micron (PM1.0). PM1.0 được coi là đặc biệt nguy hiểm... Các hạt nhỏ như PM1.0 có thể xâm nhập vào màng phổi và vào máu, gây ra các ảnh hưởng sức khỏe toàn thân.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Khí+thải+Oto'
  },
  pm25: {
    id: 'pm25',
    name: 'PM2.5',
    title: 'Hạt mịn',
    description: 'Các hạt PM2.5 có đường kính 2.5 micron hoặc nhỏ hơn. Hạt PM2.5 nhỏ đến mức chỉ có thể nhìn thấy bằng kính hiển vi điện tử... Chúng có thể tồn tại trong không khí trong thời gian dài và được hít sâu vào máu.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Thành+phố+ô+nhiễm'
  },
  pm10: {
    id: 'pm10',
    name: 'PM10',
    title: 'Hạt thô',
    description: 'PM10 là vật chất hạt thô (có thể hít vào) có đường kính 10 micromet (µm) hoặc nhỏ hơn. So sánh, một sợi tóc người có đường kính từ 50 đến 70 µm.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Khói+nhà+máy'
  },
  nhietdo: {
    id: 'nhietdo',
    name: 'Nhiệt độ',
    title: 'Nhiệt độ',
    description: 'Nhiệt độ có vai trò quan trọng trong việc giám sát chất lượng không khí... Nhiệt độ cao có thể làm tăng ô nhiễm, trong khi đó nhiệt độ thấp có thể làm giảm chất lượng không khí.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Bản+đồ+Nhiệt+độ'
  },
  doam: {
    id: 'doam',
    name: 'Độ ẩm',
    title: 'Độ ẩm tương đối',
    description: 'Độ ẩm quan trọng trong việc giám sát chất lượng không khí... Độ ẩm cao có thể làm tăng các vấn đề về hô hấp, thúc đẩy sự phát triển của nấm mốc và thay đổi nồng độ chất ô nhiễm.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Mưa+trên+cửa+kính'
  },
  apsuat: {
    id: 'apsuat',
    name: 'Áp kế',
    title: 'Áp suất khí quyển',
    description: 'Áp suất khí quyển quan trọng vì nó ảnh hưởng đến sự di chuyển và phân tán của các chất ô nhiễm... Áp suất cao có thể giữ các chất ô nhiễm gần mặt đất.',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Bản+đồ+Áp+suất'
  },
  co2: {
    id: 'co2',
    name: 'CO2*',
    title: 'Mô-đun CO2 tùy chọn',
    description: 'Ở nhiệt độ phòng, carbon dioxide (CO2) là một loại khí không màu, không mùi... Ở nồng độ cao, CO2 được coi là "bẩn".',
    image: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Ảnh+Ống+khói+CO2'
  }
};

const tabKeys = Object.keys(pollutantData);

function PollutantInfoTabs() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [trackOffset, setTrackOffset] = useState(0); // State lưu vị trí trượt (px)
  const trackRef = useRef(null); // Ref để tham chiếu đến "thanh trượt"

  // 2. Logic tính toán vị trí trượt
  useEffect(() => {
    // Kiểm tra xem 'trackRef' đã được render chưa
    if (trackRef.current && trackRef.current.children[activeTabIndex]) {
      // Lấy thẻ <li> (card) đang active
      const activeCard = trackRef.current.children[activeTabIndex];
      // Lấy vị trí bên trái (offsetLeft) của thẻ đó so với 'track'
      const newOffset = activeCard.offsetLeft;
      
      // Lấy padding-left của .tabs-track (từ CSS) để căn giữa
      const trackPadding = parseInt(window.getComputedStyle(trackRef.current).paddingLeft, 10);

      // Cập nhật state để di chuyển thanh trượt
      // (Dấu trừ (-) để trượt sang trái)
      setTrackOffset(-(newOffset - trackPadding));
    }
  }, [activeTabIndex]); // Chạy lại mỗi khi activeTabIndex thay đổi

  return (
    <div className="tabs-section-container">
      {/* 3. Wrapper (Cửa sổ)
          (Bắt buộc phải có overflow: hidden) */}
      <div className="tabs-content-wrapper">
        
        {/* 4. Track (Thanh trượt chứa tất cả các thẻ)
            (Style 'transform' được cập nhật động) */}
        <ul 
          className="tabs-track" 
          ref={trackRef} 
          style={{ transform: `translateX(${trackOffset}px)` }}
        >
          {/* 5. Render TẤT CẢ 8 thẻ (không chỉ 1) */}
          {tabKeys.map((key, index) => {
            const content = pollutantData[key];
            const isActive = index === activeTabIndex;
            
            return (
              <li 
                key={content.id}
                /* 6. Hiệu ứng Mờ/Rõ (như trong ảnh) */
                className={`tab-content-card ${isActive ? 'active' : 'inactive'}`}
              >
                <div className="content-image-col">
                  <img 
                    src={content.image} 
                    alt={content.title} 
                    className="content-image"
                  />
                </div>
                <div className="content-text-col">
                  <h3 className="content-title">{content.title}</h3>
                  <p className="content-description">{content.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 7. Thanh điều hướng (Giữ nguyên logic) */}
      <div className="tabs-nav-bar">
        {tabKeys.map((key, index) => {
          const tab = pollutantData[key];
          const isActive = activeTabIndex === index;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabIndex(index)} // Cập nhật state 'index'
              className={`tab-button ${isActive ? 'active' : 'inactive'}`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PollutantInfoTabs;