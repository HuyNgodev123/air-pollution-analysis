import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // 'email' là định danh duy nhất
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Thêm trường password (không bắt buộc)
  password: {
    type: String,
    required: false, // Không bắt buộc, vì Google User không có
  },
  // Google ID (không bắt buộc)
  googleId: {
    type: String,
    required: false, // Không bắt buộc, vì Email User không có
    unique: true,
    sparse: true, // Cho phép 'null' là duy nhất
  },
  picture: {
    type: String,
  },
}, { 
  timestamps: true 
});

export default mongoose.model('User', UserSchema);