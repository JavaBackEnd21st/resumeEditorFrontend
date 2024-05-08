import axios from "axios";

const axiosInstance = axios.create(); // 매 요청별로 코드 전송
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("access"); // 로컬 스토리지에서 토큰을 가져오기
    const refreshToken = localStorage.getItem("refresh"); // 로컬 스토리지에서 리프레시 토큰을 가져오기

    config.headers["Content-Type"] = "application/json";

    if (config.url === "/reissue") {
      console.log("reissue");
      config.headers["refresh"] = refreshToken;
    } else {
      config.headers["access"] = accessToken;
    }

    return config;
  },
  (error: any) => {
    console.log(error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log(response);
    return response;
  },
  async (error) => {
    const {
      config,
      response: { status },
    } = error;
    if (status == 401) {
      const originalRequest = config;
      const refreshToken = localStorage.getItem("refresh");

      const response = await axios.post(
        "/reissue",
        {},
        { headers: { refresh: refreshToken } }
      );
      console.log(response);
      const accessToken = response.headers["access"];
      localStorage.removeItem("access");

      localStorage.setItem("access", accessToken);

      originalRequest.headers["access"] = accessToken;

      return originalRequest;
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
