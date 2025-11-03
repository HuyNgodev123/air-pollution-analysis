import express from 'express';
import Location from '../models/Location.js'; 

const router = express.Router();

// === BẮT ĐẦU THÊM MỚI: API TÌM KIẾM ===
// @route   GET /api/locations/search?q=vung tau
// @desc    Tìm kiếm địa điểm cho thanh 'AsyncSelect'
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || ''; // Lấy từ khóa tìm kiếm (ví dụ: 'vung tau')
    
    // Nếu không có từ khóa (hoặc quá ngắn), trả về mảng rỗng
    if (query.length < 2) {
      return res.json([]);
    }

    // Tìm kiếm trong DB bằng 'regular expression' (regex)
    // '$options: 'i'' = không phân biệt hoa/thường
    const locations = await Location.find({
      displayName: { $regex: query, $options: 'i' }
    }).limit(15); // Giới hạn 15 kết quả để tăng tốc độ

    // Chuyển đổi format cho thư viện 'react-select'
    // (từ { locationId: '...' } thành { value: '...', label: '...' })
    const options = locations.map(loc => ({
      value: loc.locationId,  // ID ('@14642')
      label: loc.displayName // Tên đầy đủ ('Vũng Tàu/Ngã tư...')
    }));
    
    res.json(options); // Trả về mảng đã format

  } catch (err) {
    console.error('Lỗi API Search:', err.message);
    res.status(500).send('Lỗi Server');
  }
});
// === KẾT THÚC THÊM MỚI ===


// === API CŨ (GIỮ NGUYÊN) ===
// @route   GET /api/locations
// @desc    Lấy TẤT CẢ các địa điểm
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả và sắp xếp theo tên
    const locations = await Location.find().sort({ name: 1 }); 
    res.json(locations);
  } catch (err) {
    console.error('Lỗi API Get All:', err.message);
    res.status(500).send('Lỗi Server');
  }
});

export default router;

