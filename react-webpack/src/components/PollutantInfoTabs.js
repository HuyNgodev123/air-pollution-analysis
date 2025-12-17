import React, { useState, useRef, useEffect } from "react";
import "./style.css";

// 1. "Database" nội dung (giữ nguyên)
const pollutantData = {
  aqi: {
    id: "aqi",
    name: "AQI",
    title: "Chỉ số chất lượng không khí",
    description:
      "AQI, hay Chỉ số Chất lượng Không khí, là một hệ thống chuyển đổi các phép đo nồng độ chất ô nhiễm đôi khi gây nhầm lẫn hoặc không trực quan thành một thang đo dễ hiểu để thể hiện rõ ràng rủi ro sức khỏe do ô nhiễm không khí môi trường gây ra.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/PDP_DesigntoDetect_AQI.jpg?v=1750881604&width=400&crop=center",
  },
  pm1: {
    id: "pm1",
    name: "PM1",
    title: "Hạt siêu nhỏ",
    description:
      "Vật chất hạt (PM) có kích thước nhỏ hơn 1 micron được gọi là PM1 (đôi khi là PM1.0). PM1 được coi là đặc biệt nguy hiểm do kích thước cực nhỏ của nó. Đường kính hạt càng nhỏ thì thường gây hại càng lớn. Các hạt nhỏ như PM1 đủ nhỏ để xâm nhập vào mô phổi và vào máu. PM1 sau đó có thể lưu thông khắp cơ thể và gây ra các ảnh hưởng sức khỏe toàn thân.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/PDP_DesigntoDetect_PM1.jpg?v=1750881604&width=400&crop=center",
  },
  pm25: {
    id: "pm25",
    name: "PM2.5",
    title: "Hạt mịn",
    description:
      "Các hạt PM2.5 có đường kính 2,5 micron hoặc nhỏ hơn. Các hạt PM2.5 nhỏ đến mức chỉ có thể nhìn thấy bằng kính hiển vi điện tử. Trong tất cả các chỉ số ô nhiễm không khí, ô nhiễm PM2.5 là mối đe dọa sức khỏe lớn nhất (1). Do kích thước nhỏ, PM2.5 có thể tồn tại trong không khí trong thời gian dài và được hấp thụ sâu vào máu khi hít vào.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/PDP_DesigntoDetect_PM2.5.jpg?v=1750881604&width=400&crop=center",
  },
  pm10: {
    id: "pm10",
    name: "PM10",
    title: "Hạt thô",
    description:
      "PM10 là vật chất hạt thô lơ lửng, có thể là rắn hoặc lỏng, với đường kính 10 micromet (µm) hoặc nhỏ hơn. So sánh, một sợi tóc người trung bình có đường kính từ 50 đến 70 µm.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/PDP_DesigntoDetect_PM10.jpg?v=1750881604&width=400&crop=center",
  },
  nhietdo: {
    id: "nhietdo",
    name: "Nhiệt độ",
    title: "Nhiệt độ",
    description:
      "Nhiệt độ rất quan trọng trong việc giám sát chất lượng không khí vì nó ảnh hưởng đến sự hình thành, phân tán chất ô nhiễm và độ chính xác của cảm biến. Nhiệt độ cao có thể làm tăng ô nhiễm, trong khi đảo nhiệt độ giữ chất ô nhiễm lại, làm giảm chất lượng không khí. Việc theo dõi giúp dự báo nguy cơ ô nhiễm và đảm bảo các chỉ số chính xác.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/temperature.jpg?v=1750881604&width=400&crop=center",
  },
  doam: {
    id: "doam",
    name: "Độ ẩm",
    title: "Độ ẩm tương đối",
    description:
      "Độ ẩm quan trọng trong việc giám sát chất lượng không khí vì nó ảnh hưởng đến sức khỏe, hành vi của chất ô nhiễm và độ chính xác của cảm biến. Độ ẩm cao có thể làm trầm trọng thêm các vấn đề về hô hấp, thúc đẩy sự phát triển của nấm mốc và thay đổi mức độ chất ô nhiễm, trong khi độ ẩm thấp làm tăng sự lây lan của virus. Việc theo dõi độ ẩm giúp đảm bảo một môi trường lành mạnh hơn.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/humidity.jpg?v=1750881604&width=400&crop=center",
  },
  apsuat: {
    id: "apsuat",
    name: "Áp kế",
    title: "Áp suất khí quyển",
    description:
      "Áp suất khí quyển quan trọng trong việc giám sát chất lượng không khí vì nó ảnh hưởng đến sự di chuyển và phân tán của các chất ô nhiễm trong khí quyển. Hệ thống áp cao có thể gây ra điều kiện không khí tù đọng, giữ các chất ô nhiễm gần mặt đất và dẫn đến chất lượng không khí kém. Ngược lại, hệ thống áp thấp có thể tăng cường lưu thông không khí, phân tán các chất ô nhiễm hiệu quả hơn.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/Barometric-pressure.jpg?v=1750881604&width=400&crop=center",
  },
  co2: {
    id: "co2",
    name: "CO2*",
    title: "Mô-đun CO2 tùy chọn",
    description:
      "Ở nhiệt độ phòng, carbon dioxide (CO2) là một loại khí không màu, không mùi được tạo thành từ các nguyên tử cacbon và oxy. Là khí phổ biến thứ tư trong khí quyển trái đất, sau nitơ, oxy và argon, CO2 cũng có thể tồn tại ở dạng lỏng hoặc rắn. Ở dạng rắn, CO2 được gọi là băng khô.",
    image:
      "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/PDP_DesigntoDetect_CO2.jpg?v=1750881604&width=400&crop=center",
  },
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
      const trackPadding = parseInt(
        window.getComputedStyle(trackRef.current).paddingLeft,
        10
      );

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
                className={`tab-content-card ${
                  isActive ? "active" : "inactive"
                }`}
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
              className={`tab-button ${isActive ? "active" : "inactive"}`}
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
