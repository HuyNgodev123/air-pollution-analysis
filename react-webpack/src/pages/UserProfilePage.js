import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Clock,
  LogOut,
  Edit2,
  Save,
  X,
  Shield,
  ShoppingBag,
} from "lucide-react";
import "./index.css";

const UserProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // State quản lý dữ liệu
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]); // Lịch sử tìm kiếm
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [updateMsg, setUpdateMsg] = useState("");

  // State chuyển tab: 'orders' (mua hàng) hoặc 'history' (tìm kiếm)
  // Mặc định hiển thị Đơn hàng trước vì quan trọng hơn
  const [activeTab, setActiveTab] = useState("orders");

  // 1. Lấy dữ liệu hồ sơ từ API
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/user/profile", {
        headers: { "x-auth-token": token },
      });
      const data = await res.json();

      setProfile(data);
      setEditForm({ name: data.name, email: data.email });

      // Lấy cả 2 loại lịch sử nếu có
      if (data.searchHistory) setHistory(data.searchHistory);
      if (data.orderHistory) setOrders(data.orderHistory); // Lấy danh sách đơn hàng
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Xử lý cập nhật thông tin
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setProfile(updatedUser);
        setIsEditing(false);
        setUpdateMsg("Cập nhật thành công!");
        window.location.reload();
      } else {
        const errorData = await res.json();
        setUpdateMsg(errorData.msg || "Cập nhật thất bại.");
      }
    } catch (err) {
      setUpdateMsg("Lỗi kết nối.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHistoryClick = (item) => {
    navigate("/", {
      state: {
        selectedLocation: {
          value: item.value,
          label: item.cityLabel,
          lat: item.lat,
          lon: item.lon,
        },
      },
    });
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  if (!profile && !loading)
    return <div className="profile-container">Vui lòng đăng nhập.</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar-large">
            {profile?.picture ? (
              <img src={profile.picture} alt="Avatar" />
            ) : (
              <User size={40} />
            )}
          </div>

          {!isEditing ? (
            <>
              <h2>{profile?.name}</h2>
              <p className="email-text">{profile?.email}</p>
              <div className="header-actions">
                {profile?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="btn-edit-profile"
                    style={{
                      color: "#7c3aed",
                      borderColor: "#d8b4fe",
                      backgroundColor: "#f3e8ff",
                    }}
                  >
                    <Shield size={16} /> Trang Admin
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-edit-profile"
                >
                  <Edit2 size={16} /> Chỉnh sửa
                </button>
                <button onClick={handleLogout} className="btn-logout-profile">
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
              <div className="form-group">
                <label>Tên hiển thị:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="edit-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setUpdateMsg("");
                  }}
                  className="btn-cancel"
                >
                  <X size={16} /> Hủy
                </button>
                <button type="submit" className="btn-save">
                  <Save size={16} /> Lưu
                </button>
              </div>
            </form>
          )}
          {updateMsg && <p className="msg-text">{updateMsg}</p>}
        </div>

        {/* --- THANH CHUYỂN TAB (MỚI) --- */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={18} /> Đơn hàng của tôi
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock size={18} /> Lịch sử tìm kiếm
          </button>
        </div>

        {/* --- NỘI DUNG TAB --- */}
        <div className="tab-content-area">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* TAB 1: ĐƠN HÀNG */}
              {activeTab === "orders" && (
                <div className="orders-list">
                  {orders.length > 0 ? (
                    orders.map((order, idx) => (
                      <div key={idx} className="order-item">
                        {/* Header Đơn hàng */}
                        <div className="order-header">
                          <span className="order-id">
                            Mã đơn: <strong>{order.orderId}</strong>
                          </span>
                          <span className="order-date">
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                          <span className="order-status">
                            {order.status || "Thành công"}
                          </span>
                        </div>

                        {/* Danh sách sản phẩm trong đơn */}
                        <div className="order-body">
                          {order.items.map((prod, i) => (
                            <div key={i} className="order-product-row">
                              <span className="prod-name">
                                {prod.name}{" "}
                                <span className="qty">
                                  (x{prod.quantity || 1})
                                </span>
                              </span>
                              <span className="prod-price">
                                {formatPrice(prod.price * (prod.quantity || 1))}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Đơn hàng */}
                        <div className="order-footer">
                          <span className="payment-method">
                            TT: {order.paymentMethod}
                          </span>
                          <div className="total-group">
                            <span>Tổng tiền:</span>
                            <strong className="order-total">
                              {formatPrice(order.totalAmount)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state-small">
                      <p>Bạn chưa mua đơn hàng nào.</p>
                      <button
                        onClick={() => navigate("/products")}
                        className="btn-link"
                      >
                        Mua sắm ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LỊCH SỬ TÌM KIẾM (CŨ) */}
              {activeTab === "history" && (
                <ul className="history-list">
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleHistoryClick(item)}
                        className="history-item"
                      >
                        <div className="history-icon">
                          <MapPin size={18} />
                        </div>
                        <div className="history-info">
                          <span className="history-name">{item.cityLabel}</span>
                          <span className="history-time">
                            {new Date(item.searchedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div className="empty-state-small">
                      <p>Chưa có lịch sử tìm kiếm nào.</p>
                      <button
                        onClick={() => navigate("/")}
                        className="btn-link"
                      >
                        Tìm kiếm ngay
                      </button>
                    </div>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
