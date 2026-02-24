import cron from 'node-cron';
import { fetchAndSaveWAQI } from '../services/fetchWAQI.js';
import Location from '../models/Location.js';

async function fetchAllSourcesForCity(city) {
  try {
    await fetchAndSaveWAQI(city);
  } catch (err) {
    if (err.message && !err.message.includes('Unknown station')) {
       console.error(`[WAQI] error for ${city}:`, err.message || err);
    }
  }
}

// ===  Quay lại vòng lặp tuần tự ===
async function pollOnce() {
  let citiesToPoll = [];
  try {
    const locations = await Location.find().select('locationId');
    citiesToPoll = locations.map(loc => loc.locationId); 
    
    if (citiesToPoll.length === 0) {
      console.warn('Poller: Không tìm thấy địa điểm nào trong DB.');
      return;
    }
    
    console.log('Poller: Đang chạy 1 lần (tuần tự) cho', citiesToPoll.length, 'địa điểm');

    // Dùng vòng lặp for...of (tuần tự)
    // Nó sẽ 'await' (chờ) cho mỗi API hoàn thành trước khi gọi cái tiếp theo
    for (const cityId of citiesToPoll) {
      await fetchAllSourcesForCity(cityId);
    } 
    
    console.log('Poller: Đã chạy xong 1 lần.');

  } catch (err) {
    console.error('Poller error during fetch:', err.message);
  }
}

export default function startPoller(cronExpr = '0 */1 * * *') { 
  // (Phần còn lại của file giữ nguyên)
  pollOnce().catch(e => console.error('Initial poll error', e.message || e));
  
  cron.schedule(cronExpr, async () => {
    console.log(`Cron: Đang chạy poller lúc ${new Date().toISOString()}`);
    await pollOnce();
  });

  console.log(`Poller đã được lên lịch (${cronExpr}).`);
}

