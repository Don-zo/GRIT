import axios from "axios";
import { API_BASE_URL } from "@/apis/constants/endpoints";
import { PATHS } from "@/routes/path";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

//요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch (err) {
        console.error("토큰 파싱 에러:", err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//응답 인터셉터
let isRefreshingToken = false;

//refresh가 끝날 때까지 기다려야 하는 요청들을 담아두기 위한 배열
let pendingRequest: ((token: string) => void)[] = [];

//새로운 토큰이 발급되면 대기 중인 요청들에게 새 토큰 전달
const runPendingRequests = (newAccessToken: string) => {
  pendingRequest.forEach((callback) => callback(newAccessToken));
};

//대기중인 요청 추가
const addPendingRequest = (callback: (token: string) => void) => {
  pendingRequest.push(callback);
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== ENDPOINTS.AUTH.REFRESH
    ) {
      if (isRefreshingToken) {
        return new Promise((resolve) => {
          addPendingRequest((newAccessToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshingToken = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data.accessToken;

        const storedAuth = localStorage.getItem("auth-storage");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          parsedAuth.state.accessToken = newAccessToken;
          localStorage.setItem("auth-storage", JSON.stringify(parsedAuth));
        }

        runPendingRequests(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);
        localStorage.removeItem("auth-storage");
        window.location.href = PATHS.SIGNUP;
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }

    console.error("API 에러:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  },
);

export default apiClient;
