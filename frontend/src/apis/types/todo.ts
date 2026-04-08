export interface TodoCategoryApiItem {
  id: number;
  name: string;
  /** 작을수록 앞 순서. 목록 조회·재정렬 응답에 포함될 수 있음 */
  sortOrder?: number;
}

export interface ReorderTodoCategoriesBody {
  categoryIds: number[];
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

export interface PatchTodoDoneBody {
  isDone: boolean;
}

export interface PatchTodoDueDateBody {
  dueDate: string;
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
