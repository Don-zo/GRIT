import type { Dispatch, SetStateAction } from "react";

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

export type TodoQuickAddConfig = {
  pendingDueDate: string | null;
  onCancel: () => void;
  onSubmit: (item: {
    title: string;
    dueDate: string;
    categoryId: string;
  }) => void;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  onRemoveCategory: (id: string) => void;
  onCreateCategory?: (name: string) => { tempId: string };
  onReorderCategories?: (orderedIds: string[]) => void;
  reorderDisabled?: boolean;
  categoryRemap: { tempId: string; realId: string } | null;
  onCategoryRemapConsumed: () => void;
  categoryCreateFailedTempId: string | null;
  onCategoryCreateFailedConsumed: () => void;
  notify?: (text: string, variant?: "success" | "error") => void;
};

export type TodoRowProps = {
  todo: TodoItem;
  catLabel: string;
  onEditTodo: (todo: TodoItem) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
  weekDnD?: { onDragEnd: () => void };
  isEditing?: boolean;
};
