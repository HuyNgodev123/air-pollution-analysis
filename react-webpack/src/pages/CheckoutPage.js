import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  CheckCircle,
  QrCode,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./index.css";

const CheckoutPage = () => {
  // --- LẤY USER VÀ TRẠNG THÁI AUTH ---
  const { user, isAuthReady } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [orderItems, setOrderItems] = useState(() => {
    if (location.state?.product) return [location.state.product];
    if (location.state?.cartItems) return location.state.cartItems;
    return [];
  });

  // --- 3. SỬA ĐỔI: THÊM LOGIC KIỂM TRA ĐĂNG NHẬP ---
  useEffect(() => {
    // Chỉ kiểm tra khi Auth đã tải xong (isAuthReady = true)
    if (isAuthReady && !user) {
      alert("Vui lòng đăng nhập để tiến hành thanh toán!");
      navigate("/login");
    }
  }, [user, isAuthReady, navigate]);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const BANK_ID = "MB";
  const ACCOUNT_NO = "20001122334455"; 
  const ACCOUNT_NAME = "NGO NHAT HUY"; 
  const ORDER_ID = Math.floor(Math.random() * 10000);

  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${totalAmount}&addInfo=DH${ORDER_ID}&accountName=${encodeURIComponent(
    ACCOUNT_NAME
  )}`;

  // --- CHẶN RENDER NẾU CHƯA LOGIN ---
  if (!isAuthReady)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Đang kiểm tra đăng nhập...
      </div>
    );
  if (!user) return null; 
  
  if (orderItems.length === 0) {
    return (
      <div className="checkout-container error">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            Chưa có sản phẩm nào được chọn để thanh toán.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="btn-back-link"
            style={{
              margin: "0 auto",
              fontSize: "16px",
              padding: "10px 20px",
              background: "#2563eb",
              color: "white",
              borderRadius: "8px",
              border: "none",
            }}
          >
            <ArrowLeft size={18} style={{ marginRight: "8px" }} /> Quay lại mua
            sắm
          </button>
        </div>
      </div>
    );
  }

  // --- HÀM GỌI API LƯU ĐƠN HÀNG ---
  const saveOrderToHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("/api/user/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          orderId: `DH${ORDER_ID}`,
          items: orderItems.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
          })),
          totalAmount: totalAmount,
          paymentMethod:
            paymentMethod === "cod"
              ? "Thanh toán khi nhận hàng (COD)"
              : "Chuyển khoản ngân hàng",
        }),
      });
    } catch (err) {
      console.error("Lỗi lưu đơn hàng:", err);
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (paymentMethod === "banking") {
      setShowQR(true);
    } else {
      finishOrder();
    }
  };

  const finishOrder = async () => {
    await saveOrderToHistory();
    setIsSuccess(true);
    setShowQR(false);

    setTimeout(() => {
      alert(`Đặt hàng thành công! Mã đơn: DH${ORDER_ID}`);
      navigate("/");
    }, 2000);
  };

  return (
    <div className="checkout-container">
      <button onClick={() => navigate(-1)} className="btn-back-link">
        <ArrowLeft size={18} /> Quay lại
      </button>

      <div className="checkout-grid">
        <div className="checkout-left">
          <h2 className="section-title">Thông tin giao hàng</h2>
          <form id="checkout-form" onSubmit={handlePayment}>
            {/* --- 5. SỬA ĐỔI: ĐIỀN TỰ ĐỘNG TÊN USER --- */}
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                defaultValue={user.name} // Điền sẵn tên
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            {/* --- 6. SỬA ĐỔI: HIỆN EMAIL USER (READONLY) --- */}
            <div className="form-group">
              <label>Email nhận thông báo</label>
              <input
                type="email"
                value={user.email} // Điền sẵn email
                disabled
                style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
              />
            </div>
            {/* ----------------------------------------------- */}

            <div className="form-group">
              <label>Số điện thoại</label>
              <input type="tel" placeholder="09xxxxxxxxx" required />
            </div>
            <div className="form-group">
              <label>Địa chỉ nhận hàng</label>
              <textarea
                placeholder="Số nhà, đường, phường/xã..."
                required
                rows="3"
              ></textarea>
            </div>

            <h2 className="section-title mt-4">Phương thức thanh toán</h2>
            <div className="payment-methods">
              <label
                className={`payment-option ${
                  paymentMethod === "cod" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <div className="payment-icon">
                  <Truck size={24} />
                </div>
                <div className="payment-info">
                  <span className="payment-name">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <span className="payment-desc">
                    Thanh toán tiền mặt cho shipper.
                  </span>
                </div>
              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "banking" ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="banking"
                  checked={paymentMethod === "banking"}
                  onChange={() => setPaymentMethod("banking")}
                />
                <div className="payment-icon">
                  <QrCode size={24} />
                </div>
                <div className="payment-info">
                  <span className="payment-name">
                    Chuyển khoản ngân hàng (QR Code)
                  </span>
                  <span className="payment-desc">Quét mã VietQR tự động.</span>
                </div>
              </label>
            </div>
          </form>
        </div>

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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <p className="product-price">{formatPrice(item.price)}</p>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          fontWeight: "bold",
                        }}
                      >
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
              {isSuccess ? (
                <CheckCircle size={20} />
              ) : paymentMethod === "banking" ? (
                "Tiếp tục thanh toán"
              ) : (
                "Đặt hàng ngay"
              )}
            </button>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="qr-overlay">
          <div className="qr-modal">
            <h3>Thanh toán qua VietQR</h3>
            <p>Vui lòng mở App Ngân hàng và quét mã bên dưới</p>

            <div className="qr-image-wrapper">
              <img src={qrUrl} alt="Mã QR VietQR" />
            </div>

            <div className="qr-info">
              <p>
                Số tiền: <strong>{formatPrice(totalAmount)}</strong>
              </p>
              <p>
                Nội dung: <strong>DH{ORDER_ID}</strong>
              </p>
              <p style={{ fontSize: "12px", color: "#888", marginTop: "5px" }}>
                (Hệ thống sẽ tự động xác nhận sau khi bạn chuyển khoản)
              </p>
            </div>

            <div className="qr-actions">
              <button onClick={() => setShowQR(false)} className="btn-cancel">
                Hủy bỏ
              </button>
              <button onClick={finishOrder} className="btn-done">
                Đã chuyển khoản xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
