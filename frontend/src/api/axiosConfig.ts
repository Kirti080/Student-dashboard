import axios from "axios";
import getBaseURL from "@/utils/getBaseURL";

const axiosConfig = axios.create({
  baseURL: getBaseURL(),
});

axiosConfig.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosConfig;
