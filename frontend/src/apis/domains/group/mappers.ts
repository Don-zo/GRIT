import type {
  GroupMemberTodoSection,
  GroupMemberTodosResponse,
} from "./type";
import type { TodoGroup } from "@/types/todo";

const UNCATEGORIZED_LABEL = "미분류";
const TAG_EMPTY_LABEL = "태그 없음";

const normalizeSectionLabel = (label: string) =>
  label === UNCATEGORIZED_LABEL ? TAG_EMPTY_LABEL : label;

export function mapGroupMemberTodosToTodoGroups(
  sections: GroupMemberTodoSection[],
): TodoGroup[] {
  return sections.map((section) => ({
    id: section.key,
    title: normalizeSectionLabel(section.label),
    totalCount: section.totalCount,
    doneCount: section.doneCount,
    items: section.todos.map((todo) => ({
      id: todo.id,
      label: todo.content,
      done: todo.isDone,
    })),
  }));
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

      return {
        ...section,
        doneCount: Math.max(0, section.doneCount + doneDelta),
        todos: section.todos.map((todo) =>
          todo.id === todoId ? { ...todo, isDone } : todo,
        ),
      };
    }),
  };
}
