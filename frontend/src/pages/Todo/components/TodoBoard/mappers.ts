import type {
  CreateTodoBody,
  TodoApiItem,
  TodoCategoryApiItem,
  UpdateTodoBody,
} from "@/apis/types/todo";
import type { Category, TodoItem } from "@/pages/Todo/components/types";

export function mapTodoCategoryApiToCategory(
  row: TodoCategoryApiItem,
): Category {
  return { id: String(row.id), label: row.name };
}

export function mapTodoApiToItem(row: TodoApiItem): TodoItem {
  return {
    id: String(row.id),
    title: row.content,
    completed: row.isDone,
    dueDate: row.dueDate,
    categoryId: row.categoryId != null ? String(row.categoryId) : "",
    categoryName: row.categoryName,
  };
}

export function buildCreateTodoBody(item: {
  title: string;
  dueDate: string;
  categoryId: string;
}): CreateTodoBody {
  const body: CreateTodoBody = {
    content: item.title.trim(),
    dueDate: item.dueDate.trim(),
  };
  const raw = item.categoryId?.trim();
  if (raw && !raw.startsWith("opt-")) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) {
      body.categoryId = n;
    }
  }
  return body;
}

export function buildUpdateTodoBody(
  prev: TodoItem,
  item: { title: string; dueDate: string; categoryId: string },
): UpdateTodoBody {
  const body: UpdateTodoBody = {
    content: item.title.trim(),
    dueDate: item.dueDate.trim(),
    isDone: prev.completed,
  };
  const raw = item.categoryId?.trim();
  if (!raw) {
    body.removeCategory = true;
    return body;
  }
  if (raw.startsWith("opt-")) {
    body.removeCategory = true;
    return body;
  }
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) {
    body.removeCategory = false;
    body.categoryId = n;
  } else {
    body.removeCategory = true;
  }
  return body;
}

export function buildOptimisticTodoItem(
  item: { title: string; dueDate: string; categoryId: string },
  tempId: string,
  categories: Category[],
): TodoItem {
  const raw = item.categoryId?.trim() ?? "";
  let categoryName: string | null | undefined;
  if (raw && !raw.startsWith("opt-")) {
    const cat = categories.find((c) => c.id === raw);
    categoryName = cat?.label ?? undefined;
  }
  return {
    id: tempId,
    title: item.title.trim(),
    dueDate: item.dueDate.trim(),
    categoryId: raw,
    categoryName,
    completed: false,
  };
}

export function applyTodoUpdateOptimistic(
  prev: TodoItem,
  body: UpdateTodoBody,
  categories: Category[],
): TodoItem {
  let categoryId = prev.categoryId;
  let categoryName = prev.categoryName ?? null;

  if (body.removeCategory) {
    categoryId = "";
    categoryName = null;
  } else if (body.categoryId !== undefined) {
    categoryId = String(body.categoryId);
    const cat = categories.find((c) => c.id === categoryId);
    categoryName = cat?.label ?? null;
  }

  return {
    ...prev,
    title: body.content !== undefined ? body.content : prev.title,
    completed: body.isDone !== undefined ? body.isDone : prev.completed,
    dueDate: body.dueDate !== undefined ? body.dueDate : prev.dueDate,
    categoryId,
    categoryName,
  };
}