import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true, // Ví dụ: "Dân dụng", "Xe hơi"
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String, // Lưu URL ảnh
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;