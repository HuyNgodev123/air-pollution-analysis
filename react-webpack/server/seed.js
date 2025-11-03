import Location from './models/Location.js';

// Dữ liệu mới dựa trên file JSON 'search' của bạn
const locationsToSeed = [
  // City Feeds (url đơn giản)
  { "uid": 1583, "url": "vietnam/hanoi", "name": "Hanoi, Vietnam (Hà Nội)" },
  { "uid": 1584, "url": "vietnam/da-nang", "name": "Da Nang, Vietnam (TP Đà Nẵng)" },
  { "uid": 5506, "url": "vietnam/viet-tri", "name": "Viet Tri, Vietnam (Tp Việt Trì)" },
  { "uid": 1585, "url": "vietnam/nha-trang", "name": "Nha Trang, Vietnam" },

  // Station Feeds (url phức tạp)
  { "uid": 8688, "url": "vietnam/hanoi/unis", "name": "United Nations International School of Hanoi..." },
  { "uid": 13026, "url": "vietnam/ha-noi/chi-cuc-bvmt", "name": "Hà Nội/Chi cục BVMT, Vietnam" },
  { "uid": 13658, "url": "vietnam/da-nang/hoa-thuan-tay--hai-chau...", "name": "Đà Nẵng/Hòa Thuận Tây, Hải Châu..." },
  { "uid": 12488, "url": "vietnam/thua-thien-hue/83-hung-vuong", "name": "Thừa Thiên Huế/83 Hùng Vương, Vietnam" },
  { "uid": 13687, "url": "vietnam/can-tho/ninh-kieu-kttv-tram-cam-bien", "name": "Cần Thơ/Ninh Kiều - KTTV..." },
  { "uid": 13417, "url": "vietnam/gia-lai/bql-kcn-tra-da", "name": "Gia Lai/BQL KCN Trà Đa, Vietnam" },
  { "uid": 13683, "url": "vietnam/hung-yen/so-tnmt-437-nguyen-van-linh...", "name": "Hưng Yên/Sở TNMT - 437 Nguyễn Văn Linh..." },
  { "uid": 12961, "url": "vietnam/bac-ninh/tt-quan-trac-phuong-suoi-hoa...", "name": "Bắc Ninh/TT Quan trắc - phường Suối Hoa..." },
  { "uid": 13756, "url": "vietnam/tp-ho-chi-minh/duong-nguyen-van-tao...", "name": "Tp Hồ Chí Minh/Đường Nguyễn Văn Tạo, Nhà Bè..." },
  { "uid": 13012, "url": "vietnam/gia-lai/phuong-thong-nhat-pleiku", "name": "Gia Lai/phường Thống Nhất - Pleiku, Vietnam" },
  { "uid": 14930, "url": "vietnam/vinh-long/ubnd-tinh--duong-hoang-thai-hieu", "name": "Vĩnh Long/UBND tỉnh, đường Hoàng Thái Hiếu..." },
  { "uid": 13414, "url": "vietnam/bac-ninh/kcn-tien-son", "name": "Bắc Ninh/KCN Tiên Sơn, Vietnam" },
  { "uid": 8641, "url": "vietnam/hanoi/us-embassy", "name": "Hanoi US Embassy, Vietnam (Đại sứ quán Mỹ...)" },
  { "uid": 13762, "url": "vietnam/gia-lai/phu-dong--thanh-pho-pleiku...", "name": "Gia Lai/Phù Đổng, Thành phố Pleiku..." },
  { "uid": 13446, "url": "vietnam/quang-ninh/trung-tam-van-hoa-the-thao-cam-pha", "name": "Quảng Ninh/Trung tâm văn hóa thể thao Cẩm Phả" },
  { "uid": 14644, "url": "vietnam/vung-tau/nga-tu-phan-dang-luu...", "name": "Vũng Tàu/Ngã tư Phan Đăng Lưu... Tp.Bà Rịa" },
  { "uid": 14642, "url": "vietnam/vung-tau/nga-tu-gieng-nuoc-tp.vung-tau", "name": "Vũng Tàu/Ngã tư Giếng nước - Tp.Vũng Tàu" },
  { "uid": 14643, "url": "vietnam/vung-tau/tieu-hoc-toc-tien-tx.phu-my", "name": "Vũng Tàu/Tiểu học Tóc Tiên - TX.Phú Mỹ" }
];

/**
 * Phân tích URL để tạo ra locationId và type
 */
function getLocationDetails(station) {
  const parts = station.url.split('/');
  let locationId;
  let type;

  if (parts.length === 2) { // Ví dụ: 'vietnam/hanoi'
    locationId = parts[1];
    type = 'city';
  } else { // Ví dụ: 'vietnam/hanoi/unis'
    locationId = `@${station.uid}`; // Dùng ID trạm: '@8688'
    type = 'station';
  }
  
  return {
    locationId: locationId,
    name: station.name.split(',')[0].split('/')[0], // Tên ngắn: "Hà Nội" or "Vũng Tàu"
    displayName: station.name, // Tên đầy đủ
    type: type
  };
}

export async function seedLocations() {
  console.log('Seeding locations based on new JSON...');
  try {
    const locationsToSave = locationsToSeed.map(station => {
      return { ...getLocationDetails(station) };
    });

    const promises = locationsToSave.map(loc => 
      Location.updateOne(
        { locationId: loc.locationId },
        { $set: loc },
        { upsert: true }
      )
    );
    
    await Promise.all(promises);
    console.log(`✅ Location seeding complete. ${locationsToSave.length} locations synced.`);
  } catch (err) {
    console.error('❌ Error seeding locations:', err.message);
  }
}

