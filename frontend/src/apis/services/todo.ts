import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateTodoCategoryBody,
  TodoApiItem,
  TodoCategoryApiItem,
} from "@/apis/types/todo";

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

  createCategory: async (
    userId: number,
    body: CreateTodoCategoryBody,
  ): Promise<TodoCategoryApiItem> => {
    const response = await apiClient.post<TodoCategoryApiItem>(
      ENDPOINTS.TODO.CATEGORIES_BY_USER(userId),
      body,
    );
    return response.data;
  },

  deleteCategory: async (
    userId: number,
    categoryId: number,
  ): Promise<void> => {
    await apiClient.delete(
      ENDPOINTS.TODO.CATEGORIES_BY_USER_CATEGORY(userId, categoryId),
    );
  },
};
