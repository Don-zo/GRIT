import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  GroupMemberStudyTimeResponse,
  MemberStudyTimeResponse,
} from "@/apis/domains/studyTime/type";

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

export const groupStudyTimeApi = {
  getAll: async (
    groupCode: string,
  ): Promise<GroupMemberStudyTimeResponse[]> => {
    const response = await apiClient.get<GroupMemberStudyTimeResponse[]>(
      ENDPOINTS.LIVEKIT.STUDY_TIME(groupCode),
    );
    return response.data;
  },

  resume: async (
    groupCode: string,
  ): Promise<GroupMemberStudyTimeResponse> => {
    const response = await apiClient.post<GroupMemberStudyTimeResponse>(
      ENDPOINTS.LIVEKIT.STUDY_TIME_RESUME(groupCode),
    );
    return response.data;
  },

  pause: async (
    groupCode: string,
  ): Promise<GroupMemberStudyTimeResponse> => {
    const response = await apiClient.post<GroupMemberStudyTimeResponse>(
      ENDPOINTS.LIVEKIT.STUDY_TIME_PAUSE(groupCode),
    );
    return response.data;
  },
} as const;
