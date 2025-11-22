import React , {useState} from 'react';
import ReactPlayer from 'react-player';
import './style.css';

const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="video-section">
      <div className="video-column">
        <div className="player-wrapper">
          
          {!isPlaying ? (
            /* === TRẠNG THÁI 1: CHƯA CLICK (Hiện Ảnh + Nút Play) === */
            <div className="poster-container" onClick={() => setIsPlaying(true)}>
              {/* ĐÂY LÀ THẺ ẢNH - NÓ BẮT BUỘC PHẢI CÓ MẶT Ở ĐÂY */}
              <img 
                src="https://cdn.shopify.com/s/files/1/0677/4059/8571/files/preview_images/09e6905a80de4676b39652edfe21af30.thumbnail.0000000000.jpg?v=1750261022"
                alt="Video Poster"
                className="video-poster"
              />
              
              {/* Nút Play */}
              <button className="custom-play-button" aria-label="Play Video">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          ) : (
            /* === TRẠNG THÁI 2: ĐÃ CLICK (Hiện Video) === */
            <video
              className="react-player"
              controls
              autoPlay
              playsInline
            >
              <source 
                src="https://cdn.shopify.com/videos/c/vp/09e6905a80de4676b39652edfe21af30/09e6905a80de4676b39652edfe21af30.HD-1080p-7.2Mbps-49626250.mp4" 
                type="video/mp4" 
              />
              Trình duyệt không hỗ trợ thẻ video.
            </video>
          )}

        </div>
      </div>

      <div className="text-column">
        <h2>Sản xuất tại Đức với tình yêu</h2>
        <p>
          Mỗi thiết bị đều trải qua hiệu suất kiểm tra riêng biệt trước khi rời nhà máy, bao gồm các
          mình hiệu quả và độ chính xác của cảm biến. Các thành phần như cảm biến sử dụng thuật
          toán xác thực dữ liệu tiên tiến để đảm bảo đo lường đáng tin cậy lên đến 10 năm. Các mô-
          đun cảm biến hiệu chuẩn có thể thay thế loại bỏ nhu cầu hiệu chuẩn lại tại nhà máy.
        </p>
        
        <div className="flags-container">
          <div className="flag-item">
            <img 
              src="https://flagcdn.com/w40/ch.png" 
              alt="Swiss Flag" 
              className="flag-icon"
            />
            <span><strong>Swiss Design</strong></span>
          </div>
          <div className="flag-item">
            <img 
              src="https://flagcdn.com/w40/de.png" 
              alt="German Flag" 
              className="flag-icon"
            />
            <span><strong>Made in Germany</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;