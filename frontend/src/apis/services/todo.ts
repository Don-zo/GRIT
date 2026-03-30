import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { TodoApiItem } from "@/apis/types/todo";

export const fetchUserTodos = async (userId: number): Promise<TodoApiItem[]> => {
  const response = await apiClient.get<TodoApiItem[]>(
    ENDPOINTS.TODO.BY_USER(userId),
  );
  return response.data;
};
