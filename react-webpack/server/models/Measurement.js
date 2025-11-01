import mongoose from 'mongoose';

const MeasurementSchema = new mongoose.Schema({
  // city: ID ('hanoi' or '@12345')
  city: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  parameter: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [lon, lat]
  },
  source: {
    type: String,
    default: 'waqi'
  }
}, { 
  // Thêm tùy chọn timestamps để biết khi nào bản ghi được tạo/cập nhật
  timestamps: true 
});

// === BẮT ĐẦU THÊM MỚI: THÊM INDEX ===
// Thêm một compound index (index gộp)
// 1. Index 'city' để lọc (ví dụ: 'hanoi')
// 2. Index 'timestamp' (giảm dần) để lọc theo ngày VÀ sắp xếp
// 3. Index 'parameter' để lọc (ví dụ: 'aqi')
//
// Đây là "Mục lục" giúp API 'GET /api/measurements' chạy siêu nhanh
MeasurementSchema.index({ city: 1, timestamp: -1, parameter: 1 });
// === KẾT THÚC THÊM MỚI ===

export default mongoose.model('Measurement', MeasurementSchema);
