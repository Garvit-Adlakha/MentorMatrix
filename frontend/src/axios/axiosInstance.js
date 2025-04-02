import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:Vite.env.VITE_API_URL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance