import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
// เป็น ตัวกลางสำหรับส่ง Request จาก Frontend ไปยัง Backend API โดยตั้งค่า URL 
// กลาง ระยะเวลารอ การส่งข้อมูล JSON และแนบ Token สำหรับยืนยันตัวตนโดยอัตโนมัติ