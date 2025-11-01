import React from 'react' // nạp thư viện react
import ReactDOM from 'react-dom/client' // nạp thư viện react-dom
import Dashboard from './components/Dashboard'
import './index.css'
import 'leaflet/dist/leaflet.css';
// Tạo component App
function App() {
    return (
        <React.StrictMode>
            <div className="container">
                {/* Render component Dashboard của chúng ta */}
                <Dashboard /> 
            </div>
        </React.StrictMode>
    )
}

//React 17 roi
// Render component App vào #root element
//ReactDOM.render(<App />, document.getElementById('root'))

//React 18 
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
