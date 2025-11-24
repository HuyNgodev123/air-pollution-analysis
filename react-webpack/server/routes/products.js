import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// 1. GET /api/products - Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST /api/products - Thêm sản phẩm mới
router.post('/', async (req, res) => {
  const product = new Product({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    image: req.body.image,
    description: req.body.description
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. DELETE /api/products - Xóa toàn bộ data (để Reset)
router.delete('/', async (req, res) => {
  try {
    await Product.deleteMany({});
    res.json({ message: 'Đã xóa toàn bộ sản phẩm thành công!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;