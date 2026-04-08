export type Category = {
  id: string;
  label: string;
};

export type TodoItem = {
  id: string;
  title: string;
  dueDate: string;
  categoryId: string;
  categoryName?: string | null;
  completed: boolean;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "study", label: "공부" },
  { id: "life", label: "생활" },
  { id: "health", label: "운동" },
  { id: "other", label: "기타" },
];
