import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom"; L
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
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./index.css";

const AdminUserPage = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Chưa đăng nhập");

      const headers = { "x-auth-token": token };

      if (activeTab === "users") {
        const res = await fetch("/api/user/all-users", { headers });
        if (!res.ok) {
          if (res.status === 403)
            throw new Error("Bạn không có quyền truy cập!");
          throw new Error("Lỗi tải danh sách user");
        }
        const data = await res.json();
        setUsers(data);
      } else {
        const res = await fetch("/api/user/all-orders", { headers });
        if (!res.ok) {
          if (res.status === 403)
            throw new Error("Bạn không có quyền truy cập!");
          throw new Error("Lỗi tải danh sách đơn hàng");
        }
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [activeTab]);

  // --- XỬ LÝ ---
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Xóa user ${userName}?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/user/${userId}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      if (res.ok) {
        alert("Đã xóa!");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.msg || "Lỗi khi xóa");
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
  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

  // Lọc dữ liệu
  const filteredData =
    activeTab === "users"
      ? users.filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.includes(searchTerm)
        )
      : orders.filter(
          (o) =>
            o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // --- LOGIC PHÂN TRANG ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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
        <button onClick={() => navigate("/")}>Về trang chủ</button>
      </div>
    );

  return (
    <div className="admin-container">
      {/* HEADER & TABS */}
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
            placeholder={
              activeTab === "users"
                ? "Tìm user theo tên, email..."
                : "Tìm mã đơn, tên khách..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-tabs" style={{ marginBottom: "20px" }}>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <User size={18} /> Thành viên ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <ShoppingBag size={18} /> Đơn hàng ({orders.length})
        </button>
      </div>

      {/* --- TAB 1: DANH SÁCH USER --- */}
      {activeTab === "users" && (
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
              {currentData.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt=""
                          className="avatar-small"
                        />
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
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div className="action-buttons">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="btn-icon btn-view"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="btn-icon btn-delete"
                          title="Xóa"
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
      )}

      {/* --- TAB 2: DANH SÁCH ĐƠN HÀNG --- */}
      {activeTab === "orders" && (
        <div className="table-responsive">
          <table className="admin-table user-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th style={{ textAlign: "center" }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((order, idx) => (
                <tr key={idx}>
                  <td>
                    <strong className="order-id" style={{ color: "#2563eb" }}>
                      {order.orderId}
                    </strong>
                  </td>
                  <td>
                    <div
                      className="customer-cell"
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      <span>{order.customerName}</span>
                      <small style={{ color: "#9ca3af", fontSize: "12px" }}>
                        {order.customerEmail}
                      </small>
                    </div>
                  </td>
                  <td className="price-cell" style={{ fontWeight: 700 }}>
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td>
                    {order.paymentMethod.includes("Chuyển khoản") ? (
                      <span
                        className="method-banking"
                        style={{
                          color: "#7c3aed",
                          background: "#f3e8ff",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        Banking
                      </span>
                    ) : (
                      <span
                        className="method-cod"
                        style={{
                          color: "#ea580c",
                          background: "#ffedd5",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                      >
                        COD
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        order.status === "Thành công" ? "success" : "pending"
                      }`}
                      style={
                        order.status === "Thành công"
                          ? {
                              background: "#dcfce7",
                              color: "#166534",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }
                          : {
                              background: "#fef9c3",
                              color: "#854d0e",
                              padding: "4px 10px",
                              borderRadius: "20px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }
                      }
                    >
                      {order.status || "Thành công"}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn-icon view"
                      style={{
                        color: "#2563eb",
                        border: "1px solid #e5e7eb",
                        padding: "8px",
                        borderRadius: "6px",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- THANH PHÂN TRANG --- */}
      {filteredData.length > itemsPerPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
            gap: "15px",
          }}
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              opacity: currentPage === 1 ? 0.5 : 1,
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <span style={{ fontWeight: "bold", color: "#374151" }}>
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 12px",
              opacity: currentPage === totalPages ? 0.5 : 1,
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "white",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* --- MODAL CHI TIẾT ĐƠN HÀNG (DÙNG PORTAL ĐỂ FIX LỖI CHE LAYOUT) --- */}
      {selectedOrder &&
        createPortal(
          <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Chi tiết đơn hàng #{selectedOrder.orderId}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div
                  className="order-meta-info"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    padding: "15px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    marginBottom: "20px",
                  }}
                >
                  <p>
                    <strong>Khách hàng:</strong> {selectedOrder.customerName} (
                    {selectedOrder.customerEmail})
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <strong>Thanh toán:</strong> {selectedOrder.paymentMethod}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    <span
                      className="status-text success"
                      style={{ color: "#166534" }}
                    >
                      {selectedOrder.status || "Thành công"}
                    </span>
                  </p>
                </div>
                <div className="order-products-list">
                  <h4
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "5px",
                    }}
                  >
                    Sản phẩm ({selectedOrder.items.length})
                  </h4>
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="order-product-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        padding: "10px 0",
                        borderBottom: "1px dashed #eee",
                      }}
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="prod-img-small"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "contain",
                          border: "1px solid #eee",
                          borderRadius: "6px",
                        }}
                      />
                      <div className="prod-info" style={{ flex: 1 }}>
                        <span style={{ display: "block", fontWeight: 500 }}>
                          {item.name}
                        </span>
                        <small style={{ color: "#666" }}>
                          {formatPrice(item.price)} x {item.quantity}
                        </small>
                      </div>
                      <strong
                        className="prod-total"
                        style={{ color: "#2563eb" }}
                      >
                        {formatPrice(item.price * (item.quantity || 1))}
                      </strong>
                    </div>
                  ))}
                </div>
                <div
                  className="order-total-large"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#1f2937",
                    marginTop: "20px",
                    paddingTop: "15px",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <span>Tổng cộng:</span>
                  <span>{formatPrice(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>,
          document.body // <-- Render trực tiếp vào body
        )}

      {/* --- MODAL CHI TIẾT USER (DÙNG PORTAL) --- */}
      {selectedUser &&
        createPortal(
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
          </div>,
          document.body // <-- Render trực tiếp vào body
        )}
    </div>
  );
};

export default AdminUserPage;
