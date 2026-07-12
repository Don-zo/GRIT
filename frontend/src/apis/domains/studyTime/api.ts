import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { MemberStudyTimeResponse } from "@/apis/domains/studyTime/type";

export const studyTimeApi = {
  get: async (): Promise<MemberStudyTimeResponse> => {
    const response = await apiClient.get<MemberStudyTimeResponse>(
      ENDPOINTS.MY.STUDY_TIME,
    );
    return response.data;
  },

  resume: async (): Promise<MemberStudyTimeResponse> => {
    const response = await apiClient.post<MemberStudyTimeResponse>(
      ENDPOINTS.MY.STUDY_TIME_RESUME,
    );
    return response.data;
  },

  pause: async (): Promise<MemberStudyTimeResponse> => {
    const response = await apiClient.post<MemberStudyTimeResponse>(
      ENDPOINTS.MY.STUDY_TIME_PAUSE,
    );
    return response.data;
  },
} as const;
