import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import './style.css'; 

// Hàm lấy màu dựa trên AQI
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#28a745'; 
  if (aqi <= 100) return '#ffc107'; 
  if (aqi <= 150) return '#fd7e14'; 
  if (aqi <= 200) return '#dc3545'; 
  if (aqi <= 300) return '#6f42c1'; 
  return '#8b0000'; 
};

function AQIMap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tọa độ trung tâm của Việt Nam
  const mapCenter = [16.047079, 108.206230]; // (Đà Nẵng)

  useEffect(() => {
    // Component này tự gọi API của chính nó
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/measurements/latest-all');
        setData(res.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu bản đồ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // [] = Chạy 1 lần

  if (loading) {
    return <p>Đang tải bản đồ...</p>;
  }

  return (
    <div className="map-container">
      <h3>Bản đồ Chất lượng không khí</h3>
      <MapContainer center={mapCenter} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.map(item => {
          // API WAQI (và 'measurements') lưu [lon, lat]
          // Leaflet yêu cầu [lat, lon]
          const position = [
            item.coordinates.coordinates[1], // Lat
            item.coordinates.coordinates[0]  // Lon
          ];
          const color = getAQIColor(item.value);
          
          return (
            <CircleMarker
              key={item._id}
              center={position}
              radius={10}
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.7 }}
            >
              <Popup>
                <b>{item.locationInfo.displayName}</b>
                <br />
                AQI: {item.value}
                <br />
                Cập nhật: {new Date(item.timestamp).toLocaleString('vi-VN')}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default AQIMap;
