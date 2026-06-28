import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { PomodoroStatusResponse } from "@/apis/domains/pomodoro/type";

export const pomodoroApi = {
  getStatus: async (groupCode: string): Promise<PomodoroStatusResponse> => {
    const response = await apiClient.get<PomodoroStatusResponse>(
      ENDPOINTS.POMODORO.STATUS(groupCode),
    );
    return response.data;
  },
} as const;
