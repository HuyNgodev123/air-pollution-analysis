import React, { useState, useEffect } from 'react';
import { ShoppingCart, Filter, Database, Trash2, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react'; // Import icon mũi tên
import { useCart } from '../context/CartContext'; // <--- 1. IMPORT CONTEXT GIỎ HÀNG
import { useNavigate } from 'react-router-dom';
import './index.css'; 

// --- DỮ LIỆU MẪU ---
const SEED_DATA = [
  {
    name: "Atem X | Máy lọc không khí trong phòng",
    category: "Trong phòng",
    price: 38500000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/Atem_X_hero.jpg?v=1763393048&width=1940&crop=center",
    description: "Kích thước: 68.8 x 64 x 25.4 cm. Phòng: Trung bình đến lớn, lên đến 156 m²."
  },
  {
    name: "Atem Desk | Máy lọc không khí nhỏ gọn",
    category: "Cá nhân",
    price: 8900000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/Atem_Desk_hero.jpg?v=1763392590&width=1940&crop=center",
    description: "Kích thước: 33 x 33 x 8.5 cm. Phòng: Không gian nhỏ và riêng tư, lên đến 14 m²."
  },
  {
    name: "Atem Car | Máy lọc không khí ô tô",
    category: "Xe hơi",
    price: 10900000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/Atem_Car_hero.jpg?v=1763393015&width=1940&crop=center",
    description: "Kích thước: 30 x 30 x 8.5 cm. Trao đổi khí trong cabin: lên đến 20 lần mỗi giờ."
  },
  {
    name: "HealthPro 250 XE | Máy lọc không khí",
    category: "Chuyên dụng",
    price: 28500000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/HP_250_hero.jpg?v=1763392467&width=1940&crop=center",
    description: "Dòng XE mới nhất. Hiệu suất lọc vượt trội cho môi trường ô nhiễm nặng."
  },
  {
    name: "HealthPro 250 | Phòng lọc không khí",
    category: "Dân dụng",
    price: 24500000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/HP_250_NE_hero.jpg?v=1763392538&width=1940&crop=center",
    description: "Tiêu chuẩn vàng. Xử lý triệt để bụi mịn, vi khuẩn và virus."
  },
  {
    name: "GC MultiGas | Máy lọc không khí",
    category: "Chuyên dụng",
    price: 61884000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/CG_XE_hero.jpg?v=1763392446&width=1940&crop=center",
    description: "Chuyên gia kiểm soát khí gas, mùi hóa chất và khói thuốc lá."
  },
  {
    name: "HealthPro 100 | Máy lọc không khí",
    category: "Dân dụng",
    price: 18500000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/HP_100_NE_hero.jpg?v=1763394197&width=1940&crop=center",
    description: "Kích thước: 61 x 38 x 41 cm. Phòng: Trung bình đến lớn, lên đến 98 m²."
  },
  { // Thêm 1 cái để đủ 8 cái cho đẹp khi chia trang
    name: "IQAir Mask | Khẩu trang lọc khí",
    category: "Cá nhân",
    price: 1500000,
    image: "https://cdn.shopify.com/s/files/1/0677/4059/8571/files/GC_NE_hero.jpg?v=1763395682&width=1940&crop=center",
    description: "Bảo vệ hô hấp tối ưu với công nghệ lọc KN95 chuẩn Thụy Sĩ."
  }
];

const API_URL = 'http://localhost:5000/api/products'; 

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState(null);
  
  // --- 2. STATE PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4; // Số lượng sản phẩm mỗi trang

  // --- 3. LẤY HÀM addToCart TỪ CONTEXT ---
  const { addToCart } = useCart(); 

  const navigate = useNavigate();
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Lỗi kết nối Server: ${response.statusText}`);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError("Lỗi kết nối Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const seedDatabase = async () => {
    if (!window.confirm("Thêm dữ liệu mẫu vào Database?")) return;
    setIsSeeding(true);
    try {
      await fetch(API_URL, { method: 'DELETE' }); // Xóa cũ
      const promises = SEED_DATA.map(product => 
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        })
      );
      await Promise.all(promises);
      alert("Đã thêm dữ liệu thành công!");
      fetchProducts();
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const clearDatabase = async () => {
    if (!window.confirm("Xóa sạch dữ liệu?")) return;
    try {
      await fetch(API_URL, { method: 'DELETE' });
      fetchProducts();
    } catch (err) { alert("Lỗi kết nối"); }
  };

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  const handleImageError = (e) => { e.target.src = "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"; };

  // --- 3. HÀM XỬ LÝ MUA NGAY ---
  const handleBuyNow = (product) => {
    // Chuyển hướng sang trang /checkout
    // state: { product } giúp truyền dữ liệu sản phẩm sang trang mới mà không cần lưu vào localStorage
    navigate('/checkout', { state: { product } });
  };
  // --- 4. LOGIC TÍNH TOÁN PHÂN TRANG ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem); // Cắt mảng sản phẩm
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="products-page-container">
      
      {/* Header */}
      <div className="products-header">
        <div>
          <h1>Sản phẩm & Giải pháp</h1>
        </div>
        
        <div className="admin-tools">
          {products.length > 0 && (
            <button onClick={clearDatabase} className="btn" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}>
                <Trash2 size={18} /> <span>Reset Data</span>
            </button>
          )}
          <button onClick={seedDatabase} disabled={isSeeding} className="btn btn-seed">
            {isSeeding ? <span className="spinner" style={{width: 16, height: 16, borderWidth: 2}}></span> : <Database size={18} />}
            <span>Thêm Dữ liệu mẫu</span>
          </button>
          <button className="btn btn-filter">
            <Filter size={18} /> <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      {loading && <div className="loading-state"><div className="spinner"></div><p>Đang tải...</p></div>}
      {error && <div className="error-state"><p>{error}</p></div>}
      
      {!loading && !error && (
        <>
          {/* DANH SÁCH SẢN PHẨM (HIỂN THỊ currentProducts THAY VÌ TOÀN BỘ products) */}
          <div className="products-grid">
            {currentProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image-wrapper" onClick={() => handleBuyNow(product)} style={{cursor: 'pointer'}}>
                  <img src={product.image} alt={product.name} onError={handleImageError} />
                  <span className="product-badge">{product.category}</span>
                </div>
                <div className="product-info">
                  <h3 className="product-name" onClick={() => handleBuyNow(product)} style={{cursor: 'pointer'}} title={product.name}>{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    {/* NÚT MUA HÀNG: GỌI HÀM addToCart */}
                    <button 
                      className="btn-add-cart" 
                      onClick={() => addToCart(product)} 
                      title="Thêm vào giỏ"
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button 
                        className="btn-add-cart" 
                        onClick={() => handleBuyNow(product)} 
                        title="Mua ngay"
                        style={{width: 'auto', padding: '0 15px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', gap: '5px'}}
                    >
                        Mua ngay <CreditCard size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* THANH ĐIỀU HƯỚNG PHÂN TRANG */}
          {products.length > itemsPerPage && (
            <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '15px' }}>
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="btn"
                style={{ padding: '8px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={20} /> Trước
              </button>
              
              <span style={{ fontWeight: 'bold', color: '#374151' }}>
                Trang {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="btn"
                style={{ padding: '8px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                Sau <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
      
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
            <Database size={48} color="#d1d5db" style={{marginBottom: 16}} />
            <p>Database đang trống.</p>
            <p style={{fontSize: 14}}>Hãy nhấn nút <strong>Thêm Dữ liệu mẫu</strong>.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;