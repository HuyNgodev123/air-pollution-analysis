import axios from 'axios';
import Measurement from '../models/Measurement.js';

const WAQI_BASE = 'https://api.waqi.info/feed';
const TOKEN = process.env.WAQI_TOKEN;

if (!TOKEN) {
  console.warn('⚠️ WAQI_TOKEN not set in .env — fetchAndSaveWAQI will fail until configured');
}

// ... (Các hàm normalizeUnit, normalizeParamName, roundToMinute giữ nguyên)
function roundToMinute(date) {
  return new Date(Math.floor(date.getTime() / (60 * 1000)) * (60 * 1000));
}

function normalizeUnit(param) {
  if (!param) return '';
  const p = param.toLowerCase();
  if (p === 'aqi') return 'AQI';
  if (p === 'pm25' || p === 'pm2.5' || p === 'pm_2_5') return 'AQI';
  if (p === 'pm10') return 'AQI';
  if (['no2','so2','co','o3'].includes(p)) return 'AQI';
  if (p === 't' || p === 'temp' || p === 'temperature') return '°C';
  if (p === 'rh' || p === 'humidity') return '%';
  if (p === 'dew') return '°C';
  return ''; // unknown
}

function normalizeParamName(param) {
  if (!param) return param;
  return param.toString().toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]/g, '');
}


/**
 * Fetch data from WAQI for a city and upsert into Measurement collection.
 */
export async function fetchAndSaveWAQI(city = 'hanoi') { // <-- 'city' giờ có thể là 'hanoi' hoặc '@12345'
  if (!TOKEN) throw new Error('WAQI_TOKEN missing (set in .env)');

  // === BẮT ĐẦU SỬA LỖI URL (ĐÂY LÀ PHẦN BẠN ĐANG THIẾU) ===
  let cityParam;
  if (city.startsWith('@')) {
    cityParam = city; // Giữ nguyên, ví dụ: '@14642', không encode
  } else if (city.startsWith('geo:')) {
    cityParam = city; // Giữ nguyên
  } else {
    cityParam = encodeURIComponent(city); // Mã hóa ID Thành phố, ví dụ: 'hanoi'
  }
  // === KẾT THÚC SỬA LỖI URL ===

  const url = `${WAQI_BASE}/${cityParam}/?token=${TOKEN}`;

  try {
    const res = await axios.get(url);
    if (!res.data) throw new Error('Empty response from WAQI');
    if (res.data.status !== 'ok') {
      // (Lỗi "Unknown station" sẽ xảy ra ở đây nếu ID sai)
      console.warn(`[WAQI] API non-ok status for ${city}:`, res.data.status, res.data.data || '');
      return null;
    }

    const data = res.data.data;

    const rawTimestamp = data.time && data.time.s ? new Date(data.time.s) : new Date();
    const timestamp = roundToMinute(rawTimestamp);
    const locationName = (data.city && data.city.name) || city;
    
    let coords;
    if (data.city && Array.isArray(data.city.geo) && data.city.geo.length >= 2) {
      coords = { type: 'Point', coordinates: [data.city.geo[1], data.city.geo[0]] };
    }

    const docs = [];

    // (Code lọc dữ liệu 'NaN' của bạn đã đúng, giữ nguyên)
    // 1. Chỉ lưu 'aqi' chính nếu nó là một con số
    const mainAqiValue = parseFloat(data.aqi);
    if (!isNaN(mainAqiValue)) { 
      docs.push({
        city: city, 
        location: locationName, 
        parameter: 'aqi',
        value: mainAqiValue,
        unit: 'AQI',
        timestamp,
        coordinates: coords,
        source: 'waqi'
      });
    }

    // 2. Chỉ lưu 'iaqi' nếu 'v' (value) là một con số
    if (data.iaqi && typeof data.iaqi === 'object') {
      for (const [rawParam, obj] of Object.entries(data.iaqi)) {
        const iaqiValue = parseFloat(obj.v);
        if (obj && typeof obj.v !== 'undefined' && !isNaN(iaqiValue)) {
          const param = normalizeParamName(rawParam);
          const unit = normalizeUnit(param);
          docs.push({
            city: city, 
            location: locationName,
            parameter: param,
            value: iaqiValue,
            unit: unit,
            timestamp,
            coordinates: coords,
            source: 'waqi'
          });
        }
      }
    }

    if (!docs.length) {
      console.log(`🟡 WAQI [${city}]: No valid data to save (e.g., aqi was "-").`);
      return null;
    }

    // Bulk upsert
    const ops = docs.map((doc) => ({
      updateOne: {
        filter: {
          city: doc.city,
          location: doc.location,
          parameter: doc.parameter,
          timestamp: doc.timestamp
        },
        update: { $set: doc },
        upsert: true
      }
    }));

    if (ops.length) {
      const result = await Measurement.bulkWrite(ops, { ordered: false });
      const upserted = result.upsertedCount ?? result.nUpserted ?? 0;
      const modified = result.modifiedCount ?? result.nModified ?? 0;
      console.log(`✅ WAQI [${city}]: upserted ${upserted}, modified ${modified}`);
    }

    return docs;
  } catch (err) {
    console.error(`❌ fetchAndSaveWAQI [${city}] error:`, err.message || err);
    throw err;
  }
}

