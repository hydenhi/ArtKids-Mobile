import axios from 'axios';

const axiosClient = axios.create({
  // Thay bằng IP máy tính của bạn nếu chạy trên điện thoại thật (VD: http://192.168.1.5:5000/api)
  // Hoặc dùng http://10.0.2.2:5000/api nếu dùng máy ảo Android
  baseURL: 'http://10.0.2.2:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;