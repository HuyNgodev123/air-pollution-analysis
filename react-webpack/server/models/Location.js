import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  // ID dùng để gọi API WAQI (ví dụ: 'hanoi' hoặc '@14642')
  locationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Tên "đẹp" để hiển thị trên UI (ví dụ: 'Vũng Tàu')
  name: {
    type: String,
    required: true,
  },
  // Tên hiển thị chi tiết (ví dụ: 'Vũng Tàu (Ngã tư Giếng nước)')
  displayName: {
    type: String,
    required: true,
  },
  // Loại ID: 'city' (tổng hợp) hoặc 'station' (trạm)
  type: {
    type: String,
    enum: ["city", "station"],
    required: true,
  },
});

export default mongoose.model("Location", LocationSchema);
