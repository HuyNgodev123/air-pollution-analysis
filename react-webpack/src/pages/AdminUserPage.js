import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  User,
  Shield,
  Search,
  Eye,
  X,
  MapPin,
  ShoppingBag,
  Clock,
} from "lucide-react";
import "./index.css";

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho Modal xem chi tiết
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/all-users", {
        headers: { "x-auth-token": token },
      });

      if (res.status === 403) throw new Error("Bạn không có quyền truy cập!");
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn xóa user: ${userName}? Hành động này không thể hoàn tác.`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/${userId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });

      if (res.ok) {
        alert("Đã xóa thành công!");
        fetchUsers();
      } else {
        const errData = await res.json();
        alert(errData.msg || "Lỗi khi xóa");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="admin-container loading">
        <div className="spinner"></div>Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="admin-container error">
        <h2>⛔ {error}</h2>
        <button onClick={() => navigate("/")} className="btn-back">
          Về trang chủ
        </button>
      </div>
    );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h2>Quản trị hệ thống</h2>
          <p style={{ color: "#6b7280", marginTop: "5px" }}>
            Theo dõi và quản lý thành viên
          </p>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm user theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Tham gia ngày</th>
              <th style={{ textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    {user.picture ? (
                      <img src={user.picture} alt="" className="avatar-small" />
                    ) : (
                      <div className="avatar-placeholder">
                        <User size={16} />
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>{user.name}</strong>
                      <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                        ID: {user._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "admin" ? "badge-admin" : "badge-user"
                    }`}
                  >
                    {user.role === "admin" ? <Shield size={12} /> : null}
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                <td style={{ textAlign: "center" }}>
                  <div className="action-buttons">
                    {/* NÚT XEM CHI TIẾT */}
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="btn-icon btn-view"
                      title="Xem chi tiết hoạt động"
                    >
                      <Eye size={18} />
                    </button>

                    {user.role !== "admin" && (
                      <button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="btn-icon btn-delete"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL CHI TIẾT USER --- */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hồ sơ người dùng</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* 1. Thông tin cơ bản */}
              <div className="user-info-section">
                <div className="avatar-large-modal">
                  {selectedUser.picture ? (
                    <img src={selectedUser.picture} alt="" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div className="info-text">
                  <h4>{selectedUser.name}</h4>
                  <p>{selectedUser.email}</p>
                  <span
                    className={`badge ${
                      selectedUser.role === "admin"
                        ? "badge-admin"
                        : "badge-user"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="user-activity-grid">
                {/* 2. Lịch sử Tìm kiếm */}
                <div className="activity-column">
                  <h4>
                    <Clock size={16} /> Lịch sử tìm kiếm (
                    {selectedUser.searchHistory?.length || 0})
                  </h4>
                  <ul className="activity-list">
                    {selectedUser.searchHistory &&
                    selectedUser.searchHistory.length > 0 ? (
                      selectedUser.searchHistory.map((item, idx) => (
                        <li key={idx}>
                          <MapPin size={14} className="icon-marker" />
                          <div>
                            <span className="loc-name">{item.cityLabel}</span>
                            <span className="time-sub">
                              {new Date(item.searchedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="empty-text">Chưa có lịch sử tìm kiếm.</p>
                    )}
                  </ul>
                </div>

                {/* 3. Lịch sử Mua hàng */}
                <div className="activity-column">
                  <h4>
                    <ShoppingBag size={16} /> Đơn hàng đã mua (
                    {selectedUser.orderHistory?.length || 0})
                  </h4>
                  <ul className="activity-list">
                    {selectedUser.orderHistory &&
                    selectedUser.orderHistory.length > 0 ? (
                      selectedUser.orderHistory.map((order, idx) => (
                        <li key={idx} className="order-item-mini">
                          <div className="order-head">
                            <strong>{order.orderId}</strong>
                            <span
                              className={`status ${
                                order.status === "Thành công" ? "success" : ""
                              }`}
                            >
                              {order.status || "Mới"}
                            </span>
                          </div>
                          <div className="order-detail">
                            <span>{order.items.length} sản phẩm</span>
                            <strong style={{ color: "#2563eb" }}>
                              {formatPrice(order.totalAmount)}
                            </strong>
                          </div>
                          <span className="time-sub">
                            {new Date(order.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            - {order.paymentMethod}
                          </span>
                        </li>
                      ))
                    ) : (
                      <p className="empty-text">Chưa có đơn hàng nào.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserPage;
