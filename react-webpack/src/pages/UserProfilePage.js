import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Clock, LogOut, Edit2, Save, X } from 'lucide-react'; 
import './index.css';

const UserProfilePage = () => {
  const { user: authUser, logout, setUser } = useAuth(); // Lấy setUser nếu AuthContext hỗ trợ, hoặc reload lại trang
  const navigate = useNavigate();
  
  // State quản lý dữ liệu hiển thị
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý việc chỉnh sửa (Edit Mode)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [updateMsg, setUpdateMsg] = useState('');

  // 1. Lấy dữ liệu hồ sơ từ API khi trang được tải
  const fetchProfile = async () => {
    try {
      // Lấy token từ localStorage 
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/user/profile', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      
      setProfile(data);
      // Điền sẵn dữ liệu hiện tại vào form chỉnh sửa
      setEditForm({ name: data.name, email: data.email }); 
      
      if (data.searchHistory) {
        setHistory(data.searchHistory);
      }
    } catch (err) {
      console.error("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 2. Xử lý khi nhấn nút Lưu (Cập nhật thông tin)
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/profile', {
        method: 'PUT', // Gọi API PUT vừa tạo ở backend
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
        },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        
        // Cập nhật lại state local
        setProfile(updatedUser); 
        setIsEditing(false); // Tắt chế độ sửa
        setUpdateMsg('Cập nhật thành công!');
        
        // Nếu AuthContext của bạn có hàm setUser để update state toàn cục thì gọi nó:
        // if (setUser) setUser(updatedUser); 
        
        // Hoặc cách đơn giản nhất để đồng bộ Header là reload nhẹ trang web
        // window.location.reload(); 

      } else {
        const errorData = await res.json();
        setUpdateMsg(errorData.msg || 'Cập nhật thất bại.');
      }
    } catch (err) {
      console.error(err);
      setUpdateMsg('Lỗi kết nối đến server.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHistoryClick = (item) => {
    // Chuyển hướng về Dashboard và tự động chọn địa điểm này
    navigate('/', { 
      state: { 
        selectedLocation: { 
          value: item.value, 
          label: item.cityLabel, 
          lat: item.lat, 
          lon: item.lon 
        } 
      } 
    });
  };

  // Nếu đang tải hoặc chưa có profile (và không đang loading) thì hiện thông báo
  if (!profile && !loading) return <div className="profile-container">Vui lòng đăng nhập để xem hồ sơ.</div>;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        
        {/* --- HEADER HỒ SƠ --- */}
        <div className="profile-header">
          <div className="avatar-large">
             {profile?.picture ? <img src={profile.picture} alt="Avatar" /> : <User size={40} />}
          </div>
          
          {/* LOGIC HIỂN THỊ: CHẾ ĐỘ XEM vs CHẾ ĐỘ SỬA */}
          {!isEditing ? (
            <>
                {/* Chế độ XEM */}
                <h2>{profile?.name}</h2>
                <p className="email-text">{profile?.email}</p>
                
                <div className="header-actions">
                    <button onClick={() => setIsEditing(true)} className="btn-edit-profile">
                        <Edit2 size={16} /> Chỉnh sửa
                    </button>
                    <button onClick={handleLogout} className="btn-logout-profile">
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            </>
          ) : (
            /* Chế độ SỬA (Form nhập liệu) */
            <form onSubmit={handleUpdateProfile} className="edit-profile-form">
                <div className="form-group">
                    <label>Tên hiển thị:</label>
                    <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        required
                    />
                </div>
                
                <div className="edit-actions">
                    <button type="button" onClick={() => { setIsEditing(false); setUpdateMsg(''); }} className="btn-cancel">
                        <X size={16} /> Hủy
                    </button>
                    <button type="submit" className="btn-save">
                        <Save size={16} /> Lưu
                    </button>
                </div>
            </form>
          )}
          
          {/* Thông báo trạng thái cập nhật */}
          {updateMsg && (
            <p className={`msg-text ${updateMsg.includes('thất bại') || updateMsg.includes('Lỗi') ? 'error' : 'success'}`}>
              {updateMsg}
            </p>
          )}
        </div>

        {/* --- DANH SÁCH LỊCH SỬ TÌM KIẾM --- */}
        <div className="history-section">
          <h3><Clock size={20} /> Lịch sử tìm kiếm</h3>
          
          {loading ? (
            <div className="loading-state"><div className="spinner"></div></div>
          ) : history.length > 0 ? (
            <ul className="history-list">
              {history.map((item, index) => (
                <li key={index} onClick={() => handleHistoryClick(item)} className="history-item">
                  <div className="history-icon"><MapPin size={18} /></div>
                  <div className="history-info">
                    <span className="history-name">{item.cityLabel}</span>
                    <span className="history-time">
                      {new Date(item.searchedAt).toLocaleDateString('vi-VN', { 
                        year: 'numeric', month: '2-digit', day: '2-digit', 
                        hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state-small">
              <p>Chưa có lịch sử tìm kiếm nào.</p>
              <button onClick={() => navigate('/')} className="btn-link">Tìm kiếm ngay</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;