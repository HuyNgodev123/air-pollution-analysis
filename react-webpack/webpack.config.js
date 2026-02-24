const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.js", // Dẫn tới file index.js ta đã tạo
  output: {
    path: path.join(__dirname, "/build"), // Thư mục chứa file được build ra
    filename: "bundle.js", // Tên file được build ra
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Sẽ sử dụng babel-loader cho những file .js
        exclude: /node_modules/, // Loại trừ thư mục node_modules
        use: ["babel-loader"]
      },
      {
        test: /\.css$/, // Sử dụng style-loader, css-loader cho file .css
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  // Chứa các plugins 
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      title: "Chất lượng không khí"
    })
  ],

  devServer: {
    port: 8080, // Port của webpack-dev-server (frontend)
    open: true, // Tự động mở trình duyệt
    hot: true,  // Bật hot reload
    historyApiFallback: true, // Cần thiết cho React Router

    proxy: [
      {
        context: ['/api'], // Các đường dẫn bắt đầu bằng '/api'
        target: 'http://localhost:5000', // Sẽ được chuyển đến server backend
        changeOrigin: true,
        secure: false
      }
    ]
  }
};
