import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, CheckCircle, QrCode } from 'lucide-react';
import './index.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [orderItems, setOrderItems] = useState([]);
  
  useEffect(() => {
    // Ưu tiên 1: Dữ liệu từ nút "Mua ngay" (1 sản phẩm)
    if (location.state?.product) {
      setOrderItems([location.state.product]);
    } 
    // Ưu tiên 2: Dữ liệu từ nút "Thanh toán giỏ hàng" (Nhiều sản phẩm)
    else if (location.state?.cartItems && location.state.cartItems.length > 0) {
      setOrderItems(location.state.cartItems);
    }
  }, [location.state]);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Hàm format giá tiền
  const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  // Tính tổng tiền đơn hàng
  // Lưu ý: Nếu sản phẩm không có quantity (khi mua ngay), mặc định là 1
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // --- THÔNG TIN TÀI KHOẢN NHẬN TIỀN (Sửa lại theo của bạn) ---
  const BANK_ID = "MB"; // Ngân hàng MBBank (hoặc VCB, TCB...)
  const ACCOUNT_NO = "0352089999"; // Số tài khoản của bạn
  const ACCOUNT_NAME = "NGUYEN VAN A"; // Tên chủ tài khoản
  const ORDER_ID = Math.floor(Math.random() * 10000); // Mã đơn hàng giả lập
  
  // Link tạo QR động từ VietQR (QuickLink) - Tự động điền số tiền và nội dung
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${totalAmount}&addInfo=DH${ORDER_ID}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

  // Nếu không có sản phẩm nào (người dùng gõ link trực tiếp) -> Báo lỗi & Quay về
  if (orderItems.length === 0) {
    return (
      <div className="checkout-container error">
        <div style={{textAlign: 'center', padding: '50px'}}>
          <p style={{fontSize: '18px', color: '#666', marginBottom: '20px'}}>
             Chưa có sản phẩm nào được chọn để thanh toán.
          </p>
          <button onClick={() => navigate('/products')} className="btn-back-link" style={{margin: '0 auto', fontSize: '16px', padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', border: 'none'}}>
             <ArrowLeft size={18} style={{marginRight: '8px'}}/> Quay lại mua sắm
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === 'banking') {
      // Nếu chọn chuyển khoản -> Hiện QR để quét
      setShowQR(true);
    } else {
      // Nếu chọn COD -> Hoàn thành đơn hàng luôn
      finishOrder();
    }
  };

  const finishOrder = () => {
    setIsSuccess(true);
    setShowQR(false); // Tắt popup QR nếu đang mở
    setTimeout(() => {
        alert(`Đặt hàng thành công! Mã đơn: DH${ORDER_ID}`);
        // Ở đây bạn có thể gọi hàm clearCart() từ Context nếu muốn xóa giỏ hàng sau khi mua
        navigate('/'); // Quay về trang chủ
    }, 2000);
  };

  return (
    <div className="checkout-container">
      <button onClick={() => navigate(-1)} className="btn-back-link">
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="checkout-grid">
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
        <div className="checkout-left">
          <h2 className="section-title">Thông tin giao hàng</h2>
          <form id="checkout-form" onSubmit={handlePayment}>
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nguyễn Văn A" required />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" placeholder="09xxxxxxxxx" required />
            </div>
            <div className="form-group">
              <label>Địa chỉ nhận hàng</label>
              <textarea placeholder="Số nhà, đường, phường/xã..." required rows="3"></textarea>
            </div>

            <h2 className="section-title mt-4">Phương thức thanh toán</h2>
            <div className="payment-methods">
              <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="payment-icon"><Truck size={24} /></div>
                <div className="payment-info">
                  <span className="payment-name">Thanh toán khi nhận hàng (COD)</span>
                  <span className="payment-desc">Thanh toán tiền mặt cho shipper.</span>
                </div>
              </label>

              <label className={`payment-option ${paymentMethod === 'banking' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="banking" 
                  checked={paymentMethod === 'banking'}
                  onChange={() => setPaymentMethod('banking')}
                />
                <div className="payment-icon"><QrCode size={24} /></div>
                <div className="payment-info">
                  <span className="payment-name">Chuyển khoản ngân hàng (QR Code)</span>
                  <span className="payment-desc">Quét mã VietQR tự động.</span>
                </div>
              </label>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
        <div className="checkout-right">
          <div className="order-summary">
            <h3>Đơn hàng ({orderItems.length} sản phẩm)</h3>
            
            <div className="order-items-list">
              {orderItems.map((item, index) => (
                <div key={index} className="product-mini">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p className="product-cat">{item.category}</p>
                    <div style={{display:'flex', justifyContent:'space-between', width: '100%'}}>
                       <p className="product-price">{formatPrice(item.price)}</p>
                       {/* Hiển thị số lượng nếu có, mặc định là 1 */}
                       <span style={{fontSize: '13px', color:'#666', fontWeight: 'bold'}}>
                         x{item.quantity || 1}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>Miễn phí</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <button type="submit" form="checkout-form" className="btn-confirm">
              {isSuccess ? <CheckCircle size={20} /> : (paymentMethod === 'banking' ? 'Tiếp tục thanh toán' : 'Đặt hàng ngay')}
            </button>
          </div>
        </div>
      </div>

      {/* --- POPUP HIỂN THỊ MÃ QR (Chỉ hiện khi chọn Banking và bấm Thanh toán) --- */}
      {showQR && (
        <div className="qr-overlay">
          <div className="qr-modal">
            <h3>Thanh toán qua VietQR</h3>
            <p>Vui lòng mở App Ngân hàng và quét mã bên dưới</p>
            
            <div className="qr-image-wrapper">
              <img src={qrUrl} alt="Mã QR VietQR" />
            </div>

            <div className="qr-info">
              <p>Số tiền: <strong>{formatPrice(totalAmount)}</strong></p>
              <p>Nội dung: <strong>DH{ORDER_ID}</strong></p>
              <p style={{fontSize: '12px', color: '#888', marginTop: '5px'}}>
                (Hệ thống sẽ tự động xác nhận sau khi bạn chuyển khoản)
              </p>
            </div>

            <div className="qr-actions">
              <button onClick={() => setShowQR(false)} className="btn-cancel">Quay lại</button>
              <button onClick={finishOrder} className="btn-done">Đã chuyển khoản xong</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;