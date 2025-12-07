import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAirQuality } from '../services/airQualityService';
import './style.css';

// --- DANH SÁCH CÁC ĐIỂM ĐO MẶC ĐỊNH (VIỆT NAM) ---
const LOCATIONS = [
  // Miền Bắc
  { id: 'hanoi', name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { id: 'haiphong', name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { id: 'halong', name: 'Hạ Long (Quảng Ninh)', lat: 20.9069, lon: 107.0733 },
  { id: 'sapa', name: 'Sapa (Lào Cai)', lat: 22.3364, lon: 103.8438 },
  { id: 'ninhbinh', name: 'Ninh Bình', lat: 20.2599, lon: 105.9753 },
  { id: 'thanhhoa', name: 'Thanh Hóa', lat: 19.8075, lon: 105.7764 },
  
  // Miền Trung
  { id: 'vinh', name: 'Vinh (Nghệ An)', lat: 18.6733, lon: 105.6853 },
  { id: 'hue', name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { id: 'danang', name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { id: 'hoian', name: 'Hội An (Quảng Nam)', lat: 15.8801, lon: 108.3380 },
  { id: 'quynhon', name: 'Quy Nhơn (Bình Định)', lat: 13.7820, lon: 109.2192 },
  { id: 'nhatrang', name: 'Nha Trang (Khánh Hòa)', lat: 12.2388, lon: 109.1967 },
  { id: 'dalat', name: 'Đà Lạt (Lâm Đồng)', lat: 11.9404, lon: 108.4583 },
  { id: 'buonmathuot', name: 'Buôn Ma Thuột (Đắk Lắk)', lat: 12.6668, lon: 108.0382 },
  { id: 'phanThiet', name: 'Phan Thiết (Bình Thuận)', lat: 10.9289, lon: 108.1021 },

  // Miền Nam
  { id: 'hcm', name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { id: 'vungtau', name: 'Vũng Tàu', lat: 10.3460, lon: 107.0843 },
  { id: 'cantho', name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
  { id: 'rachgia', name: 'Rạch Giá (Kiên Giang)', lat: 10.0119, lon: 105.0809 },
  { id: 'camau', name: 'Cà Mau', lat: 9.1769, lon: 105.1501 }
];

const AQIMap = () => {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Gọi API song song cho tất cả các địa điểm
      const promises = LOCATIONS.map(async (loc) => {
        const data = await fetchAirQuality(loc.lat, loc.lon, today, today);
        if (data && data.current) {
          // Gộp thông tin địa điểm với dữ liệu đo được
          return { 
            ...loc, 
            aqi: data.current.aqi, 
            data: data.current 
          };
        }
        return null;
      });

      const results = await Promise.all(promises);
      // Lọc bỏ những nơi bị lỗi (null) và cập nhật state
      setMarkers(results.filter(item => item !== null));
    };

    fetchAllData();
  }, []);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#009966';
    if (aqi <= 100) return '#ffde33';
    if (aqi <= 150) return '#ff9933';
    if (aqi <= 200) return '#cc0033';
    if (aqi <= 300) return '#660099';
    return '#7e0023';
  };

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return 'Tốt';
    if (aqi <= 100) return 'Trung bình';
    if (aqi <= 150) return 'Kém';
    if (aqi <= 200) return 'Xấu';
    if (aqi <= 300) return 'Rất xấu';
    return 'Nguy hại';
  };

  return (
    <div className="aqi-map-wrapper">
      <MapContainer 
        center={[16.0, 106.0]} // Tọa độ trung tâm Việt Nam
        zoom={5} // Zoom vừa đủ để thấy cả nước
        scrollWheelZoom={true} 
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render danh sách các điểm đo */}
        {markers.map((marker) => (
          <CircleMarker 
            key={marker.id}
            center={[marker.lat, marker.lon]}
            pathOptions={{ 
              color: 'white',
              weight: 1,
              fillColor: getAQIColor(marker.aqi),
              fillOpacity: 0.8,
            }}
            radius={15} // Kích thước chấm tròn
          >
            <Popup className="aqi-popup">
              <div className="popup-content">
                <h3 className="popup-title">{marker.name}</h3>
                
                <div 
                  className="aqi-circle"
                  style={{ backgroundColor: getAQIColor(marker.aqi) }}
                >
                  <span className="aqi-number">{marker.aqi}</span>
                  <span className="aqi-label">US AQI</span>
                </div>
                
                <p className="aqi-status" style={{ color: getAQIColor(marker.aqi) }}>
                  {getAQIStatus(marker.aqi)}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AQIMap;