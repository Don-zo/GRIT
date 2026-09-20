export interface TodoItem {
  id: number;
  label: string;
  done: boolean;
  badgeText?: string;
}

export interface TodoGroup {
  id: string;
  title: string;
  totalCount: number;
  doneCount: number;
  items: TodoItem[];
}
