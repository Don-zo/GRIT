export interface TodoCategoryApiItem {
  id: number;
  name: string;
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
