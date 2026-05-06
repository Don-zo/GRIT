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
  getList: async (
    params?: TodoListByUserParams,
  ): Promise<TodoListByUserResponse> => {
    const response = await apiClient.get<TodoListByUserResponse>(
      ENDPOINTS.TODO.LIST,
      { params },
    );
    return response.data;
  },

  getCategories: async (): Promise<TodoCategoryApiItem[]> => {
    const response = await apiClient.get<TodoCategoryApiItem[]>(
      ENDPOINTS.TODO.CATEGORIES,
    );
    return response.data;
  },

  getAchievement: async (): Promise<TodoAchievementResponse> => {
    const response = await apiClient.get<TodoAchievementResponse>(
      ENDPOINTS.TODO.ACHIEVEMENT,
    );
    return response.data;
  },

  createTodo: async (body: CreateTodoBody): Promise<TodoApiItem> => {
    const response = await apiClient.post<TodoApiItem>(
      ENDPOINTS.TODO.LIST,
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
    body: CreateTodoCategoryBody,
  ): Promise<TodoCategoryApiItem> => {
    const response = await apiClient.post<TodoCategoryApiItem>(
      ENDPOINTS.TODO.CATEGORIES,
      body,
    );
    return response.data;
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(
      ENDPOINTS.TODO.CATEGORY_BY_ID(categoryId),
    );
  },

  reorderCategories: async (
    body: ReorderTodoCategoriesBody,
  ): Promise<TodoCategoryApiItem[]> => {
    const response = await apiClient.patch<TodoCategoryApiItem[]>(
      ENDPOINTS.TODO.CATEGORIES_REORDER,
      body,
    );
    return response.data;
  },
};
