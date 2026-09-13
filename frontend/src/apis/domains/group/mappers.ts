import type {
  GroupMemberTodo,
  GroupMemberTodoSection,
  GroupMemberTodosResponse,
  GroupMemberTodoView,
} from "./type";
import type { TodoGroup } from "@/types/todo";

const UNCATEGORIZED_LABEL = "미분류";
const TAG_EMPTY_LABEL = "태그 없음";

const normalizeSectionLabel = (label: string) =>
  label === UNCATEGORIZED_LABEL ? TAG_EMPTY_LABEL : label;

function compareGroupMemberTodos(
  a: GroupMemberTodo,
  b: GroupMemberTodo,
  view: GroupMemberTodoView,
): number {
  if (a.isDone !== b.isDone) {
    return a.isDone ? 1 : -1;
  }

  if (view === "day") {
    const aCategoryOrderNull = a.categorySortOrder == null ? 1 : 0;
    const bCategoryOrderNull = b.categorySortOrder == null ? 1 : 0;
    if (aCategoryOrderNull !== bCategoryOrderNull) {
      return aCategoryOrderNull - bCategoryOrderNull;
    }

    const aCategoryOrder = a.categorySortOrder ?? 0;
    const bCategoryOrder = b.categorySortOrder ?? 0;
    if (aCategoryOrder !== bCategoryOrder) {
      return aCategoryOrder - bCategoryOrder;
    }
  }

  const byContent = a.content.localeCompare(b.content, "ko");
  if (byContent !== 0) return byContent;

  return a.id - b.id;
}

export function mapGroupMemberTodosToTodoGroups(
  sections: GroupMemberTodoSection[],
  view: GroupMemberTodoView = "category",
): TodoGroup[] {
  return sections.map((section) => {
    const sortedTodos = [...section.todos].sort((a, b) =>
      compareGroupMemberTodos(a, b, view),
    );

    return {
      id: section.key,
      title: normalizeSectionLabel(section.label),
      totalCount: section.totalCount,
      doneCount: section.doneCount,
      items: sortedTodos.map((todo) => ({
        id: todo.id,
        label: todo.content,
        done: todo.isDone,
      })),
    };
  });
}

export function sortGroupMembersWithMeFirst<T extends { me: boolean }>(
  members: T[],
): T[] {
  return [...members].sort((a, b) => {
    if (a.me === b.me) return 0;
    return a.me ? -1 : 1;
  });
}

export function updateGroupMemberTodoDoneInCache(
  data: GroupMemberTodosResponse,
  todoId: number,
  isDone: boolean,
): GroupMemberTodosResponse {
  return {
    ...data,
    sections: data.sections.map((section) => {
      const targetTodo = section.todos.find((todo) => todo.id === todoId);
      if (!targetTodo || targetTodo.isDone === isDone) {
        return section;
      }

      const doneDelta = isDone ? 1 : -1;

      const todos = section.todos.map((todo) =>
        todo.id === todoId ? { ...todo, isDone } : todo,
      );

      return {
        ...section,
        doneCount: Math.max(0, section.doneCount + doneDelta),
        todos: [...todos].sort((a, b) =>
          compareGroupMemberTodos(a, b, data.view),
        ),
      };
    }),
  };
}
