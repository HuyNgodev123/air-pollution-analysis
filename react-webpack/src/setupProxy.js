const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Chỉ proxy các yêu cầu bắt đầu bằng '/api'
    createProxyMiddleware({
      target: 'http://localhost:8080', // Giả sử server backend của bạn chạy ở đây
      changeOrigin: true,
    })
  );
};