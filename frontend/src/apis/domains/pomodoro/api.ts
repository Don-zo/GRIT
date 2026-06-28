import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  PomodoroStatusResponse,
  StartPomodoroRequest,
} from "@/apis/domains/pomodoro/type";

export const pomodoroApi = {
  getStatus: async (groupCode: string): Promise<PomodoroStatusResponse> => {
    const response = await apiClient.get<PomodoroStatusResponse>(
      ENDPOINTS.POMODORO.STATUS(groupCode),
    );
    return response.data;
  },

  start: async (
    groupCode: string,
    body: StartPomodoroRequest,
  ): Promise<PomodoroStatusResponse> => {
    const response = await apiClient.post<PomodoroStatusResponse>(
      ENDPOINTS.POMODORO.START(groupCode),
      body,
    );
    return response.data;
  },

  pause: async (groupCode: string): Promise<PomodoroStatusResponse> => {
    const response = await apiClient.post<PomodoroStatusResponse>(
      ENDPOINTS.POMODORO.PAUSE(groupCode),
    );
    return response.data;
  },

  resume: async (groupCode: string): Promise<PomodoroStatusResponse> => {
    const response = await apiClient.post<PomodoroStatusResponse>(
      ENDPOINTS.POMODORO.RESUME(groupCode),
    );
    return response.data;
  },
} as const;
