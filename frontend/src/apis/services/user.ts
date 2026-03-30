import apiClient from "@/apis/client/apiClient";
import type {
  MemberResponse,
  CreateMemberRequest,
  UpdateMemberRequest,
  NicknameAvailabilityResponse,
  S3uploadResponse,
} from "@/apis/types";
import { ENDPOINTS } from "@/apis/constants/endpoints";

export const userApi = {
  createInitialInfo: async (
    data: CreateMemberRequest,
  ): Promise<MemberResponse> => {
    const response = await apiClient.post<MemberResponse>(
      ENDPOINTS.MY.PROFILE,
      data,
    );
    return response.data;
  },

  get: async (): Promise<MemberResponse> => {
    const response = await apiClient.get<MemberResponse>(ENDPOINTS.MY.INFO);
    return response.data;
  },

  update: async (data: UpdateMemberRequest): Promise<MemberResponse> => {
    const response = await apiClient.patch<MemberResponse>(
      ENDPOINTS.MY.PROFILE,
      data,
    );
    return response.data;
  },

  checkNicknameAvailability: async (
    nickname: string,
  ): Promise<NicknameAvailabilityResponse> => {
    const response = await apiClient.get<NicknameAvailabilityResponse>(
      ENDPOINTS.MY.NICKNAME_CHECK,
      {
        params: { nickname },
      },
    );
    return response.data;
  },

  getPresignedInfo: async (): Promise<S3uploadResponse> => {
    const response = await apiClient.post<S3uploadResponse>(
      ENDPOINTS.MY.IMAGE_UPLOAD,
    );
    return response.data;
  },
};
