import apiClient from "@/apis/client/apiClient";
import { ENDPOINTS } from "@/apis/constants/endpoints";
import type {
  CreateTodoBody,
  CreateTodoCategoryBody,
  PatchTodoDoneBody,
  PatchTodoDueDateBody,
  ReorderTodoCategoriesBody,
  TodoAchievementResponse,
  TodoCategoryApiItem,
  TodoListByUserParams,
  TodoListByUserResponse,
  TodoApiItem,
  UpdateTodoBody,
} from "@/apis/domains/todo/type";

export const todoApi = {
  getListByUserId: async (
    userId: number,
    params?: TodoListByUserParams,
  ): Promise<TodoListByUserResponse> => {
    const response = await apiClient.get<TodoListByUserResponse>(
      ENDPOINTS.TODO.BY_USER(userId),
      { params },
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

  getAchievementByUserId: async (
    userId: number,
  ): Promise<TodoAchievementResponse> => {
    const response = await apiClient.get<TodoAchievementResponse>(
      ENDPOINTS.TODO.ACHIEVEMENT_BY_USER(userId),
    );
    return response.data;
  },

  createTodo: async (
    userId: number,
    body: CreateTodoBody,
  ): Promise<TodoApiItem> => {
    const response = await apiClient.post<TodoApiItem>(
      ENDPOINTS.TODO.BY_USER(userId),
      body,
    );
    return response.data;
  },

  updateTodo: async (
    todoId: number,
    body: UpdateTodoBody,
  ): Promise<TodoApiItem> => {
    const response = await apiClient.put<TodoApiItem>(
      ENDPOINTS.TODO.BY_ID(todoId),
      body,
    );
    return response.data;
  },

  patchTodoDone: async (
    todoId: number,
    body: PatchTodoDoneBody,
  ): Promise<TodoApiItem> => {
    const response = await apiClient.patch<TodoApiItem>(
      ENDPOINTS.TODO.DONE(todoId),
      body,
    );
    return response.data;
  },

  patchTodoDueDate: async (
    todoId: number,
    body: PatchTodoDueDateBody,
  ): Promise<TodoApiItem> => {
    const response = await apiClient.patch<TodoApiItem>(
      ENDPOINTS.TODO.DUE_DATE(todoId),
      body,
    );
    return response.data;
  },

  deleteTodo: async (todoId: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TODO.BY_ID(todoId));
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

  deleteCategory: async (userId: number, categoryId: number): Promise<void> => {
    await apiClient.delete(
      ENDPOINTS.TODO.CATEGORIES_BY_USER_CATEGORY(userId, categoryId),
    );
  },

  reorderCategories: async (
    userId: number,
    body: ReorderTodoCategoriesBody,
  ): Promise<TodoCategoryApiItem[]> => {
    const response = await apiClient.patch<TodoCategoryApiItem[]>(
      ENDPOINTS.TODO.CATEGORIES_REORDER(userId),
      body,
    );
    return response.data;
  },
};
