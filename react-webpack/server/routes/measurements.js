import express from 'express';
import Measurement from '../models/Measurement.js';
import mongoose from 'mongoose';

const router = express.Router();



// === BẮT ĐẦU THÊM MỚI: API CHO BẢN ĐỒ ===
// @route   GET /api/measurements/latest-all
// @desc    Lấy bản ghi 'aqi' mới nhất của TẤT CẢ các địa điểm
router.get('/latest-all', async (req, res) => {
  try {
    const latestData = await Measurement.aggregate([
      // 1. Chỉ tìm các bản ghi có 'aqi'
      { $match: { parameter: 'aqi' } },
      
      // 2. Sắp xếp theo ID địa điểm (city) và thời gian (mới nhất lên đầu)
      { $sort: { city: 1, timestamp: -1 } },
      
      // 3. Nhóm theo 'city' và lấy bản ghi $first (mới nhất)
      {
        $group: {
          _id: '$city', // Nhóm theo city ID (ví dụ: '@14642')
          latestRecord: { $first: '$$ROOT' }
        }
      },
      
      // 4. Thay thế 'root' bằng bản ghi mới nhất
      { $replaceRoot: { newRoot: '$latestRecord' } },
      
      // 5. Tham chiếu (lookup) sang collection 'locations'
      {
        $lookup: {
          from: 'locations',         
          localField: 'city',          
          foreignField: 'locationId',
          as: 'locationInfo'
        }
      },
      
      // 6. "Giải nén" mảng locationInfo (chỉ lấy phần tử đầu)
      { $unwind: '$locationInfo' }
    ]);

    res.json(latestData);
  } catch (err) {
    console.error('Lỗi /latest-all:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /api/measurements?city=Hanoi&parameter=pm25&limit=100&from=&to=
router.get('/', async (req, res) => {
try {
    const { city, parameter, limit = 100, from, to } = req.query;
    const q = {};
    if (city) q.city = new RegExp(city, 'i');
    if (parameter) q.parameter = parameter;
    if (from || to) q.timestamp = {};
    if (from) q.timestamp.$gte = new Date(from);
    if (to) q.timestamp.$lte = new Date(to);


const docs = await Measurement.find(q).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ count: docs.length, results: docs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;