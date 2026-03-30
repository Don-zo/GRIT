export interface TodoCategoryApiItem {
  id: number;
  name: string;
}

export interface CreateTodoCategoryBody {
  name: string;
}

export interface CreateTodoBody {
  content: string;
  dueDate: string;
  categoryId?: number;
}

export interface UpdateTodoBody {
  content?: string;
  isDone?: boolean;
  dueDate?: string;
  removeCategory?: boolean;
  categoryId?: number;
}

export interface TodoApiItem {
  id: number;
  ownerId: number;
  ownerNickname: string;
  content: string;
  isDone: boolean;
  categoryId: number | null;
  categoryName: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}
