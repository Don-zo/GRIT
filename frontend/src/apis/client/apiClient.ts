import axios from "axios";
import { API_BASE_URL } from "@/apis/constants/endpoints";
import { PATHS } from "@/routes/path";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
} from "@/utils/tokenStorage";

export const refreshClient = axios.create({
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
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
        console.log("[refresh] start");

        const refreshResponse = await refreshClient.post(
          ENDPOINTS.AUTH.REFRESH,
        );

        console.log(
          "[refresh] success",
          refreshResponse.status,
          refreshResponse.data,
        );

        const newAccessToken = refreshResponse.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("refresh 응답에 accessToken이 없습니다.");
        }
        setAccessToken(newAccessToken);
        runPendingRequests(newAccessToken);

        originalRequest.headers = originalRequest.headers ?? {};

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);
        removeAccessToken();
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
