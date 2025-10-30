import express from 'express';
import Location from '../models/Location.js';

const router = express.Router();

// @route   GET /api/locations
// @desc    Lấy tất cả các địa điểm
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả và sắp xếp theo tên
    const locations = await Location.find().sort({ name: 1 }); 
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Lỗi Server');
  }
});

export default router;
