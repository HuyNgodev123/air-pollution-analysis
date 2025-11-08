import React from 'react' // nạp thư viện react
import ReactDOM from 'react-dom/client' // nạp thư viện react-dom
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Dashboard from './components/Dashboard'
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';

import './components/style.css'
import './index.css'
import 'leaflet/dist/leaflet.css';
import './pages/index.css'

const GOOGLE_CLIENT_ID = "796762141741-5umal96mbuje2thdc90cd2innuoludlb.apps.googleusercontent.com";

// Tạo component App
function App() {
    return (
        <React.StrictMode>
            <Header />
            <div className="container">
                {/* Routes sẽ render component tương ứng với URL */}
                <Routes>
                {/* Trang chủ (path="/") sẽ render Dashboard */}
                <Route path="/" element={<Dashboard />} /> 
          
                {/* Trang (path="/login") sẽ render LoginPage */}
                <Route path="/login" element={<LoginPage />} />
          
                {/* (Bạn có thể thêm Route cho /register ở đây sau) */}
                </Routes>
            </div>
            <Footer />
        </React.StrictMode>
    )
}

//React 17 roi
// Render component App vào #root element
//ReactDOM.render(<App />, document.getElementById('root'))

//React 18 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
        <App />
        </BrowserRouter>
    </GoogleOAuthProvider>
);


//onst GOOGLE_CLIENT_ID = "796762141741-5umal96mbuje2thdc90cd2innuoludlb.apps.googleusercontent.com"; 

