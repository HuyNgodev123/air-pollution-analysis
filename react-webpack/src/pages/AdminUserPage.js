import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Shield, Search } from 'lucide-react';
import './index.css';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Gọi API lấy danh sách
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/all-users', {
        headers: { 'x-auth-token': token }
      });

      if (res.status === 403) {
        throw new Error("Bạn không có quyền truy cập trang này!");
      }
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

  // Xử lý xóa user
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa user: ${userName}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/user/${userId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (res.ok) {
        alert("Đã xóa thành công!");
        fetchUsers(); // Tải lại danh sách
      } else {
        const errData = await res.json();
        alert(errData.msg || "Lỗi khi xóa");
      }
    } catch (err) {
      alert("Lỗi kết nối");
    }
  };

  // Lọc user theo tìm kiếm
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-container loading">Đang tải dữ liệu...</div>;
  
  if (error) return (
    <div className="admin-container error">
      <h2>⛔ Truy cập bị từ chối</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/')} className="btn-back">Về trang chủ</button>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Quản lý Người dùng ({users.length})</h2>
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="user-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    {user.picture ? 
                      <img src={user.picture} alt="" className="avatar-small" /> : 
                      <div className="avatar-placeholder"><User size={16} /></div>
                    }
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                    {user.role === 'admin' ? <Shield size={12} /> : null}
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.name)} 
                      className="btn-delete"
                      title="Xóa người dùng"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserPage;