import axios from 'axios';

const axiosInstance = axios.create({
  proxy: false,
});

export default axiosInstance;
