import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type { TodoApiItem, TodoCategoryApiItem } from "@/apis/types/todo";

export const todoApi = {
  getListByUserId: async (userId: number): Promise<TodoApiItem[]> => {
    const response = await apiClient.get<TodoApiItem[]>(
      ENDPOINTS.TODO.BY_USER(userId),
    );
    return response.data;
  },

  getCategoriesByUserId: async (
    userId: number,
  ): Promise<TodoCategoryApiItem[]> => {
    const response = await apiClient.get<TodoCategoryApiItem[]>(
      ENDPOINTS.TODO.CATEGORIES_BY_USER(userId),
    );
    return response.data;
  },
};
