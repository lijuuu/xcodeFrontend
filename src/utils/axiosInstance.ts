import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:7000/api/v1',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      const headers: any = config.headers || {};
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
    return config;
  },
  (error) => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.isAxiosError) {
      console.error('Axios Response Error:', error.message);
    } else {
      console.error('Unexpected Response Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;