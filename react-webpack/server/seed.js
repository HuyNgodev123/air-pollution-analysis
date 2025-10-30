import Location from './models/Location.js';

// Danh sách các địa điểm chúng ta muốn hỗ trợ
const locationsToSeed = [
  // City Feeds
  { locationId: 'hanoi', name: 'Hà Nội', displayName: 'Hà Nội (Tổng hợp)', type: 'city' },
  { locationId: 'da-nang', name: 'Đà Nẵng', displayName: 'Đà Nẵng (Tổng hợp)', type: 'city' },
  { locationId: 'viet-tri', name: 'Việt Trì', displayName: 'Việt Trì (Tổng hợp)', type: 'city' },
  { locationId: 'nha-trang', name: 'Nha Trang', displayName: 'Nha Trang (Tổng hợp)', type: 'city' },
  
  // Station Feeds
  { locationId: '@13756', name: 'TP. HCM', displayName: 'TP. HCM (Nhà Bè)', type: 'station' },
  { locationId: '@13417', name: 'Gia Lai', displayName: 'Gia Lai (Trà Đa)', type: 'station' },
  { locationId: '@12488', name: 'Thừa Thiên Huế', displayName: 'Thừa Thiên Huế', type: 'station' },
  { locationId: '@13683', name: 'Hưng Yên', displayName: 'Hưng Yên', type: 'station' },
  { locationId: '@13687', name: 'Cần Thơ', displayName: 'Cần Thơ (Ninh Kiều)', type: 'station' },
  { locationId: '@12961', name: 'Bắc Ninh', displayName: 'Bắc Ninh (Suối Hoa)', type: 'station' },
  { locationId: '@14930', name: 'Vĩnh Long', displayName: 'Vĩnh Long', type: 'station' },
  { locationId: '@14642', name: 'Vũng Tàu', displayName: 'Vũng Tàu (Ngã tư)', type: 'station' }
];

/**
 * Tự động thêm/cập nhật (upsert) các địa điểm vào DB.
 * Chạy mỗi khi server khởi động.
 */
export async function seedLocations() {
  console.log('Seeding locations...');
  try {
    const promises = locationsToSeed.map(loc => 
      Location.updateOne(
        { locationId: loc.locationId }, // Tìm bằng ID này
        { $set: loc }, // Cập nhật/Ghi đè bằng dữ liệu này
        { upsert: true } // Nếu chưa có, tạo mới
      )
    );
    
    await Promise.all(promises);
    console.log(`✅ Location seeding complete. ${locationsToSeed.length} locations synced.`);
  } catch (err) {
    console.error('❌ Error seeding locations:', err.message);
  }
}
