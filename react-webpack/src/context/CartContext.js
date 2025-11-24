import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lấy dữ liệu giỏ hàng từ LocalStorage nếu có (để F5 không mất)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Lưu giỏ hàng mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. Thêm sản phẩm (Add to Cart)
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Kiểm tra xem sản phẩm đã có trong giỏ chưa
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        // Nếu có rồi thì tăng số lượng
        return prevItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Nếu chưa thì thêm mới với quantity = 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // 2. Giảm số lượng (Decrease / Remove)
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === productId);
      if (existingItem && existingItem.quantity > 1) {
        // Nếu số lượng > 1 thì giảm 1
        return prevItems.map((item) =>
          item._id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // Nếu số lượng = 1 thì xóa luôn khỏi mảng
      return prevItems.filter((item) => item._id !== productId);
    });
  };

  // 3. Xóa hẳn sản phẩm khỏi giỏ
  const deleteItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId));
  };

  // Tính tổng số lượng item để hiện lên Header (Badge)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, deleteItem, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);