import axios from "axios";

// 1. HÀM TÌM KIẾM ĐỊA ĐIỂM (Giữ nguyên)
export const searchCity = async (query) => {
  try {
    if (!query || query.length < 2) return [];

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`;
    const response = await axios.get(url);

    if (!response.data.results) return [];

    return response.data.results.map((city) => ({
      value: city.id,
      label: `${city.name}, ${city.country}`,
      lat: city.latitude,
      lon: city.longitude,
      timezone: city.timezone,
    }));
  } catch (error) {
    console.error("Lỗi tìm kiếm địa điểm:", error);
    return [];
  }
};

// 2. Hàm lấy dữ liệu (CẬP NHẬT: LẤY FULL LỊCH SỬ)
export const fetchAirQuality = async (lat, lon, fromDate, toDate) => {
  try {
    // Thêm: ozone, nitrogen_dioxide, sulphur_dioxide, carbon_monoxide, uv_index vào hourly
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index&hourly=pm10,pm2_5,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index&timezone=auto&start_date=${fromDate}&end_date=${toDate}`;

    const response = await axios.get(url);
    const data = response.data;

    return {
      current: {
        aqi: data.current.us_aqi,
        pm25: data.current.pm2_5,
        pm10: data.current.pm10,
        o3: data.current.ozone,
        no2: data.current.nitrogen_dioxide,
        so2: data.current.sulphur_dioxide,
        co: data.current.carbon_monoxide,
        uv: data.current.uv_index,
        time: data.current.time,
      },
      history: {
        times: data.hourly.time,
        // Map đúng tên từ API sang key ngắn gọn
        aqi: data.hourly.us_aqi,
        pm25: data.hourly.pm2_5,
        pm10: data.hourly.pm10,
        o3: data.hourly.ozone,
        no2: data.hourly.nitrogen_dioxide,
        so2: data.hourly.sulphur_dioxide,
        co: data.hourly.carbon_monoxide,
        uv: data.hourly.uv_index,
      },
    };
  } catch (error) {
    console.error("Lỗi lấy dữ liệu AQI:", error);
    return null;
  }
};
