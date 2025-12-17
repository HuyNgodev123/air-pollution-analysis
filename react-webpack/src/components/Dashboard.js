import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import ReactPlayer from "react-player";

import { useLocation } from "react-router-dom"; // <--- 1. Import để nhận dữ liệu từ trang Profile
import { useAuth } from "../context/AuthContext"; // <--- 2. Import Auth để biết user nào đang đăng nhập
// Import service lấy dữ liệu (Open-Meteo)
import { searchCity, fetchAirQuality } from "../services/airQualityService";

// Import các component con
import CurrentStatus from "./CurrentStatus";
import PollutantDetails from "./PollutantDetails";
import HistoryChart from "./HistoryChart";
import AQIMap from "./AQIMap";
import PollutantInfoTabs from "./PollutantInfoTabs";
import VideoSection from "./VideoSection";
import { MapPin } from "lucide-react";
import "./style.css";

const getISODate = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

function Dashboard() {
  const [selectedCities, setSelectedCities] = useState([]);
  const [fromDate, setFromDate] = useState(getISODate(-3)); // 3 ngày gần nhất
  const [toDate, setToDate] = useState(getISODate(0));
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const location = useLocation();

  // === 1. LOGIC NHẬN DỮ LIỆU TỪ TRANG HISTORY (PROFILE) ===
  useEffect(() => {
    // Nếu có dữ liệu được gửi từ trang Profile (khi click vào lịch sử)
    if (location.state && location.state.selectedLocation) {
      const loc = location.state.selectedLocation;

      // Tự động thêm vào danh sách thành phố đã chọn
      setSelectedCities((prev) => {
        // Kiểm tra nếu đã có rồi thì không thêm nữa
        if (prev.find((c) => c.value === loc.value)) return prev;
        return [loc, ...prev]; // Thêm vào đầu danh sách
      });

      // Xóa state để tránh lặp lại khi refresh (Optional)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // === 2. HÀM LƯU LỊCH SỬ VÀO DATABASE ===
  const saveSearchHistory = async (city) => {
    // Chỉ lưu nếu user đã đăng nhập và city hợp lệ
    if (!user || !city || !city.lat) return;

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("/api/user/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          cityLabel: city.label,
          value: city.value,
          lat: city.lat,
          lon: city.lon,
        }),
      });
    } catch (error) {
      console.error("Không thể lưu lịch sử:", error);
    }
  };

  // === 3. Tải dữ liệu khi chọn thành phố ===
  useEffect(() => {
    if (selectedCities.length === 0) {
      setData({});
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const newData = {};

        // Gọi API song song cho tất cả thành phố đã chọn
        const promises = selectedCities.map(async (city) => {
          // Gọi service lấy dữ liệu từ Open-Meteo
          const result = await fetchAirQuality(
            city.lat,
            city.lon,
            fromDate,
            toDate
          );

          if (result) {
            newData[city.value] = result; // Lưu kết quả theo ID thành phố
          }
        });

        await Promise.all(promises);
        setData(newData);
      } catch (err) {
        console.error("Lỗi dashboard:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCities, fromDate, toDate]);

  // === 2. Hàm tìm kiếm cho thanh Search ===
  const loadOptions = async (inputValue) => {
    // Gọi hàm tìm kiếm từ service
    return await searchCity(inputValue);
  };

  // ---HÀM XỬ LÝ LẤY VỊ TRÍ NGƯỜI DÙNG ---
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Tạo một địa điểm mới từ tọa độ GPS
        const currentLocation = {
          value: `gps-${latitude}-${longitude}`, // ID duy nhất
          label: "📍 Vị trí của bạn",
          lat: latitude,
          lon: longitude,
        };

        // Thêm vào danh sách đã chọn (tránh trùng lặp)
        setSelectedCities((prev) => {
          // Nếu đã có "Vị trí của bạn" rồi thì không thêm nữa
          const exists = prev.find((c) => c.label === "📍 Vị trí của bạn");
          if (exists) return prev;
          return [currentLocation, ...prev];
        });

        setLoading(false);
      },
      (error) => {
        console.error("Lỗi định vị:", error);
        alert("Không thể lấy vị trí. Vui lòng cấp quyền truy cập GPS.");
        setLoading(false);
      }
    );
  };
  const renderContent = () => {
    if (loading)
      return <p className="text-center py-4">Đang tải dữ liệu từ vệ tinh...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    // Nếu chưa chọn gì cả
    if (selectedCities.length === 0) {
      return (
        <p className="text-center py-10 text-gray-500">
          Vui lòng tìm và chọn một địa điểm để xem dữ liệu.
        </p>
      );
    }

    // Nếu đã chọn nhưng API chưa trả về data (hoặc lỗi mạng)
    if (Object.keys(data).length === 0 && !loading) {
      return (
        <p className="text-center text-gray-500">
          Không tìm thấy dữ liệu cho địa điểm này.
        </p>
      );
    }

    return (
      <div>
        <div className="current-status-grid">
          {selectedCities.map((city) => {
            const cityData = data[city.value];
            // Truyền đúng phần 'current' và tên thành phố vào CurrentStatus
            return cityData ? (
              <CurrentStatus
                key={city.value}
                data={cityData.current}
                cityName={city.label}
              />
            ) : null;
          })}
        </div>

        {/* Chỉ hiện chi tiết khi chọn 1 thành phố để tránh rối */}
        {selectedCities.length === 1 && data[selectedCities[0].value] && (
          <PollutantDetails data={data[selectedCities[0].value].current} />
        )}

        <div className="mt-8">
          <HistoryChart data={data} selectedCities={selectedCities} />
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <VideoSection />

      <div className="machine">
        <div className="mechine-info-1">
          <h2>
            Các máy đo chất lượng không khí AirVisual được thiết kế để phát hiện
            các chất ô nhiễm này
          </h2>
        </div>
        <div className="mechine-info-2">
          <p>
            {" "}
            <b>AirVisual Pro</b> có thể theo dõi tới 5 thông số môi trường; AQI,
            PM2.5, CO2, Nhiệt độ và Độ ẩm. Trong khi <b>AirVisual Outdoor</b> có
            thể theo dõi tới 8 thông số môi trường; AQI, PM1, PM2.5, PM10, Nhiệt
            độ, Độ ẩm, Áp suất khí quyển và tùy chọn CO2.
          </p>
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
            <label>Tìm địa điểm (Toàn cầu)</label>
            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions
              loadOptions={loadOptions}
              value={selectedCities}
              onChange={(selectedOptions) => {
                const newOptions = selectedOptions || [];
                // Nếu danh sách mới dài hơn cũ => Có địa điểm mới được thêm vào
                if (newOptions.length > selectedCities.length) {
                  const lastAdded = newOptions[newOptions.length - 1];
                  saveSearchHistory(lastAdded); // Gọi hàm lưu vào DB
                }
                setSelectedCities(newOptions);
              }}
              placeholder="Gõ tên thành phố (Vd: Hanoi, Tokyo...)"
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>
          <div className="control-item location-item">
            <label className="invisible-label">GPS</label>{" "}
            {/* Label ẩn để căn dòng */}
            <button
              onClick={handleGetCurrentLocation}
              title="Vị trí hiện tại của bạn"
              className="btn-gps"
            >
              <MapPin size={20} />
            </button>
          </div>

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

      <div className="main-content">{renderContent()}</div>
    </div>
  );
}

export default Dashboard;
