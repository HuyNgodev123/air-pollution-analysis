import React from 'react' // nạp thư viện react
import ReactDOM from 'react-dom/client' // nạp thư viện react-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Dashboard from './components/Dashboard'
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminUserPage  from './pages/AdminUserPage';

import './components/style.css'
import './index.css'
import 'leaflet/dist/leaflet.css';
import './pages/index.css'

const GOOGLE_CLIENT_ID = "796762141741-5umal96mbuje2thdc90cd2innuoludlb.apps.googleusercontent.com";

// Tạo component App
function App() {
    return (
        <>
            <Header />
            <div className="container">
                {/* Routes sẽ render component tương ứng với URL */}
                <Routes>
                    {/* Trang chủ (path="/") sẽ render Dashboard */}
                    <Route path="/" element={<Dashboard />} /> 
          
                    {/* Trang (path="/login") sẽ render LoginPage */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Trang (path="/register") sẽ render RegisterPage */}
                    <Route path="/register" element={<RegisterPage />} />

                    {/* --- 2. THÊM ROUTE CHO SẢN PHẨM Ở ĐÂY --- */}
                    <Route path="/products" element={<ProductsPage />} />

                    {/* --- 3. THÊM ROUTE CHO CHECKOUT Ở ĐÂY --- */}
                    <Route path="/checkout" element={<CheckoutPage />} />

                    <Route path="/profile" element={<UserProfilePage />} />

                    <Route path="/admin" element={<AdminUserPage />} />
                </Routes>
            </div>
            <Footer />
        </>
    )
}

//React 17 roi
// Render component App vào #root element
//ReactDOM.render(<App />, document.getElementById('root'))

//React 18 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
       <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                       <App /> 
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider> 
    </React.StrictMode>
    
);


//onst GOOGLE_CLIENT_ID = "796762141741-5umal96mbuje2thdc90cd2innuoludlb.apps.googleusercontent.com"; 

