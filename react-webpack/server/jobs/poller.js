import cron from 'node-cron';
import { fetchAndSaveWAQI } from '../services/fetchWAQI.js'; 
import Location from '../models/Location.js';

/**
 * Try to fetch from all configured sources for a city.
 * (Hàm này bắt lỗi của chính nó)
 */
async function fetchAllSourcesForCity(city) {
  try {
    await fetchAndSaveWAQI(city);
  } catch (err) {
    // Không log lỗi "Unknown station"
    if (err.message && !err.message.includes('Unknown station')) {
       console.error(`[WAQI] error for ${city}:`, err.message || err);
    }
  }
}

// === BẮT ĐẦU CẢI TIẾN TỐC ĐỘ ===
// Chạy song song (concurrently) thay vì tuần tự (sequentially)
async function pollOnce() {
  let citiesToPoll = [];
  try {
    // Lấy danh sách địa điểm từ collection 'locations'
    const locations = await Location.find().select('locationId');
    citiesToPoll = locations.map(loc => loc.locationId); // Chỉ lấy mảng các ID
    
    if (citiesToPoll.length === 0) {
      console.warn('Poller: Không tìm thấy địa điểm nào trong DB.');
      return;
    }
    
    console.log('Poller: Đang chạy 1 lần cho', citiesToPoll.length, 'địa điểm');
    
    const promises = [];
    for (const c of citiesToPoll) {
      promises.push(fetchAllSourcesForCity(c)); 
    }
    await Promise.allSettled(promises); 
    console.log('Poller: Đã chạy xong 1 lần.');

  } catch (err) {
    console.error('Poller error during fetch:', err.message);
  }
}
// === KẾT THÚC CẢI TIẾN TỐC ĐỘ ===

export default function startPoller(cronExpr = '*/30 * * * *') { 
  // Chạy ngay 1 lần khi khởi động
  pollOnce().catch(e => console.error('Initial poll error', e.message || e));
  
  // Lên lịch chạy định kỳ
  cron.schedule(cronExpr, async () => {
    console.log(`Cron: Đang chạy poller lúc ${new Date().toISOString()}`);
    await pollOnce();
  });

  console.log(`Poller đã được lên lịch (${cronExpr}).`);
}


