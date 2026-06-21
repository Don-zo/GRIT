export interface TodoItem {
  id: number;
  label: string;
  done: boolean;
}

export interface TodoGroup {
  id: string;
  title: string;
  totalCount: number;
  doneCount: number;
  items: TodoItem[];
}
