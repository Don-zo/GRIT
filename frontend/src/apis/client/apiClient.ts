import axios from "axios";
import { API_BASE_URL } from "@/apis/constants/endpoints";
import { PATHS } from "@/routes/path";
import { ENDPOINTS } from "@/apis/constants/endpoints";

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

let isRefreshingToken = false;
let pendingRequest: ((token: string) => void)[] = [];

const runPendingRequests = (newAccessToken: string) => {
  pendingRequest.forEach((callback) => callback(newAccessToken));
  pendingRequest = [];
};

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
        const refreshResponse = await refreshClient.post(
          ENDPOINTS.AUTH.REFRESH,
        );

        const newAccessToken = refreshResponse.data.accessToken;

        const storedAuth = localStorage.getItem("auth-storage");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          parsedAuth.state.accessToken = newAccessToken;
          localStorage.setItem("auth-storage", JSON.stringify(parsedAuth));
        }

        runPendingRequests(newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};
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
