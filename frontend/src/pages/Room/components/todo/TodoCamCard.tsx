import { useEffect, useMemo, useState, type ReactNode } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ToggleBtn from "@/components/ToggleBtn";
import { BookCheck, CalendarClock, Check, X } from "lucide-react";
import TodoList from "./TodoList";
import RoomCategorySelect from "./RoomCategorySelect";
import { groupApi } from "@/apis/domains/group/api";
import type {
  GroupMember,
  GroupMemberTodo,
  GroupMemberTodosResponse,
  GroupMemberTodoSection,
  GroupMemberTodoView,
} from "@/apis/domains/group/type";
import type { UpdateTodoBody } from "@/apis/domains/todo/type";
import {
  mapGroupMemberTodosToTodoGroups,
  sortGroupMembersWithMeFirst,
  updateGroupMemberTodoDoneInCache,
} from "@/apis/domains/group/mappers";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/domains/todo/api";
import { buildCreateTodoBody } from "@/hooks/todo/mappers";
import { useTodoCategories } from "@/hooks/todo/useTodoCategories";
import { useToastContext } from "@/contexts/ToastContext";
import type { TodoGroup } from "@/types/todo";
import { TODO_CONTENT_MAX_LENGTH } from "@/constants/todo";

type TodoCamCardProps = {
  variant?: "default" | "panel";
  groupCode?: string;
  members?: GroupMember[];
};

const truncateNickname = (nickname: string) =>
  nickname.length > 3 ? `${nickname.slice(0, 3)}...` : nickname;

const getDateKeyOffset = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

/** day 뷰: 항목의 카테고리, category 뷰: 항목의 D-day. 백엔드 응답에 아직 없어 더미로 표시 */
const DUMMY_BADGE_TEXT: Record<GroupMemberTodoView, string> = {
  day: "공부",
  category: "D-1",
};

export default function TodoCamCard({
  variant = "default",
  groupCode,
  members = [],
}: TodoCamCardProps) {
  const queryClient = useQueryClient();
  const { notify } = useToastContext();

  const sortedMembers = useMemo(
    () => sortGroupMembersWithMeFirst(members),
    [members],
  );

  const defaultMemberId = sortedMembers[0]?.id ?? null;
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
    defaultMemberId,
  );
  const [isDayView, setIsDayView] = useState(true);
  const [addingGroupId, setAddingGroupId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newDueDate, setNewDueDate] = useState(() => getDateKeyOffset(0));
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  useEffect(() => {
    if (defaultMemberId == null) return;
    setSelectedMemberId((prev) => {
      if (prev != null && sortedMembers.some((m) => m.id === prev)) {
        return prev;
      }
      return defaultMemberId;
    });
  }, [defaultMemberId, sortedMembers]);

  const view: GroupMemberTodoView = isDayView ? "day" : "category";

  useEffect(() => {
    setAddingGroupId(null);
    setNewTitle("");
    setEditingTodoId(null);
    setEditTitle("");
  }, [selectedMemberId, view]);

  const selectedMember = sortedMembers.find(
    (member) => member.id === selectedMemberId,
  );
  const canToggleTodos = selectedMember?.me ?? false;
  const memberTodosQueryKey = QUERY_KEYS.groups.memberTodos(
    groupCode ?? "",
    selectedMemberId ?? 0,
    view,
  );

  const { data: todosResponse, isPending, isError } = useQuery({
    queryKey: QUERY_KEYS.groups.memberTodos(
      groupCode ?? "",
      selectedMemberId ?? 0,
      view,
    ),
    queryFn: () =>
      groupApi.getMemberTodos(groupCode!, selectedMemberId!, view),
    enabled: !!groupCode && selectedMemberId != null,
  });

  const { categories } = useTodoCategories();

  const categorySortOrderByCategoryId = useMemo(() => {
    const map = new Map<number, number | null>();
    categories.forEach((category) => {
      const id = Number(category.id);
      if (Number.isFinite(id)) map.set(id, category.sortOrder ?? null);
    });
    return map;
  }, [categories]);

  /**
   * /todo와 동일한 정렬: 완료된 항목은 맨 아래로.
   * day 뷰는 카테고리 순서 → 내용 오름차순, category 뷰는 마감일 순서 → 내용 오름차순.
   */
  const sortedSections = useMemo(() => {
    if (!todosResponse) return [];

    const compareTodos = (a: GroupMemberTodo, b: GroupMemberTodo) => {
      if (a.isDone !== b.isDone) return a.isDone ? 1 : -1;

      if (view === "day") {
        const aOrder =
          a.categoryId != null
            ? categorySortOrderByCategoryId.get(a.categoryId) ??
              a.categorySortOrder ??
              null
            : null;
        const bOrder =
          b.categoryId != null
            ? categorySortOrderByCategoryId.get(b.categoryId) ??
              b.categorySortOrder ??
              null
            : null;
        const aOrderMissing = aOrder == null ? 1 : 0;
        const bOrderMissing = bOrder == null ? 1 : 0;
        if (aOrderMissing !== bOrderMissing) {
          return aOrderMissing - bOrderMissing;
        }
        if (aOrder !== bOrder) return (aOrder ?? 0) - (bOrder ?? 0);
      } else if (a.dueDate !== b.dueDate) {
        return a.dueDate < b.dueDate ? -1 : 1;
      }

      const byContent = a.content.localeCompare(b.content, "ko");
      if (byContent !== 0) return byContent;
      return a.id - b.id;
    };

    return todosResponse.sections.map((section) => ({
      ...section,
      todos: [...section.todos].sort(compareTodos),
    }));
  }, [todosResponse, view, categorySortOrderByCategoryId]);

  const groupsToShow = useMemo(
    () => mapGroupMemberTodosToTodoGroups(sortedSections),
    [sortedSections],
  );

  const todoById = useMemo(() => {
    const map = new Map<number, GroupMemberTodo>();
    sortedSections.forEach((section) =>
      section.todos.forEach((todo) => map.set(todo.id, todo)),
    );
    return map;
  }, [sortedSections]);

  /**
   * category 뷰에서는 항목이 없는 카테고리도 카테고리 등록 순서대로 모두 보여준다.
   * (내 투두를 볼 때만 — 다른 멤버는 그 사람의 카테고리 목록을 알 수 없어 서버가 내려준 섹션만 사용)
   */
  const { displayGroups, fixedCategoryIdByGroupId } = useMemo(() => {
    const fixedCategoryIdByGroupId = new Map<string, number | null>();

    if (view !== "category" || !canToggleTodos) {
      return { displayGroups: groupsToShow, fixedCategoryIdByGroupId };
    }

    const sectionByCategoryId = new Map<number, GroupMemberTodoSection>();
    let uncategorizedSection: GroupMemberTodoSection | undefined;
    sortedSections.forEach((section) => {
      const catId = section.todos[0]?.categoryId ?? null;
      if (catId != null) sectionByCategoryId.set(catId, section);
      else uncategorizedSection = section;
    });

    const ordered: TodoGroup[] = categories.map((category) => {
      const catIdNum = Number(category.id);
      const section = Number.isFinite(catIdNum)
        ? sectionByCategoryId.get(catIdNum)
        : undefined;
      const groupId = section ? section.key : `category:${category.id}`;
      fixedCategoryIdByGroupId.set(
        groupId,
        Number.isFinite(catIdNum) ? catIdNum : null,
      );
      return {
        id: groupId,
        title: category.label,
        totalCount: section?.totalCount ?? 0,
        doneCount: section?.doneCount ?? 0,
        items: (section?.todos ?? []).map((todo) => ({
          id: todo.id,
          label: todo.content,
          done: todo.isDone,
        })),
      };
    });

    const uncategorizedGroupId = uncategorizedSection?.key ?? "uncategorized";
    fixedCategoryIdByGroupId.set(uncategorizedGroupId, null);
    ordered.push({
      id: uncategorizedGroupId,
      title: "태그 없음",
      totalCount: uncategorizedSection?.totalCount ?? 0,
      doneCount: uncategorizedSection?.doneCount ?? 0,
      items: (uncategorizedSection?.todos ?? []).map((todo) => ({
        id: todo.id,
        label: todo.content,
        done: todo.isDone,
      })),
    });

    return { displayGroups: ordered, fixedCategoryIdByGroupId };
  }, [view, canToggleTodos, sortedSections, categories, groupsToShow]);

  const toggleTodoDoneMutation = useMutation({
    mutationFn: ({
      todoId,
      isDone,
    }: {
      todoId: number;
      isDone: boolean;
    }) => todoApi.patchTodoDone(todoId, { isDone }),
    onMutate: async ({ todoId, isDone }) => {
      await queryClient.cancelQueries({ queryKey: memberTodosQueryKey });
      const previous =
        queryClient.getQueryData<GroupMemberTodosResponse>(memberTodosQueryKey);
      if (previous) {
        queryClient.setQueryData(
          memberTodosQueryKey,
          updateGroupMemberTodoDoneInCache(previous, todoId, isDone),
        );
      }
      return { previous };
    },
    onSuccess: (data) => {
      const current =
        queryClient.getQueryData<GroupMemberTodosResponse>(memberTodosQueryKey);
      if (current) {
        queryClient.setQueryData(
          memberTodosQueryKey,
          updateGroupMemberTodoDoneInCache(current, data.id, data.isDone),
        );
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos.all });
    },
    onError: (err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(memberTodosQueryKey, context.previous);
      }
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          notify("완료 상태를 바꿀 수 없어요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("할 일을 찾을 수 없어요.", "error");
        } else {
          notify("완료 처리에 실패했어요.", "error");
        }
      } else {
        notify("완료 처리에 실패했어요.", "error");
      }
    },
  });

  const handleToggleItem = (todoId: number, nextDone: boolean) => {
    if (!canToggleTodos || toggleTodoDoneMutation.isPending) return;
    toggleTodoDoneMutation.mutate({ todoId, isDone: nextDone });
  };

  const createTodoMutation = useMutation({
    mutationFn: (vars: { title: string; dueDate: string; categoryId: string }) =>
      todoApi.createTodo(buildCreateTodoBody(vars)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "groups",
          "memberTodos",
          groupCode ?? "",
          selectedMemberId ?? 0,
        ],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos.all });
      notify("할 일이 추가됐어요.", "success");
      setAddingGroupId(null);
      setNewTitle("");
      setNewCategoryId("");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          notify("입력값을 확인해주세요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else {
          notify("할 일 추가에 실패했어요.", "error");
        }
      } else {
        notify("할 일 추가에 실패했어요.", "error");
      }
    },
  });

  const handleStartAdd = (groupId: string) => {
    if (!canToggleTodos) return;
    setEditingTodoId(null);
    setAddingGroupId(groupId);
    setNewTitle("");
    setNewCategoryId("");
    setNewDueDate(getDateKeyOffset(0));
  };

  const handleCancelAdd = () => {
    setAddingGroupId(null);
    setNewTitle("");
    setNewCategoryId("");
  };

  const handleSubmitAdd = (dueDate: string, categoryId: string) => {
    const content = newTitle.trim();
    if (
      !content ||
      content.length > TODO_CONTENT_MAX_LENGTH ||
      createTodoMutation.isPending
    )
      return;
    createTodoMutation.mutate({ title: content, dueDate, categoryId });
  };

  const updateTodoMutation = useMutation({
    mutationFn: ({ todoId, body }: { todoId: number; body: UpdateTodoBody }) =>
      todoApi.updateTodo(todoId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "groups",
          "memberTodos",
          groupCode ?? "",
          selectedMemberId ?? 0,
        ],
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todos.all });
      notify("수정됐어요.", "success");
      setEditingTodoId(null);
      setEditTitle("");
      setEditCategoryId("");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 400) {
          notify("내용은 비울 수 없어요.", "error");
        } else if (status === 403) {
          notify("권한이 없어요.", "error");
        } else if (status === 404) {
          notify("할 일 또는 카테고리를 찾을 수 없어요.", "error");
        } else {
          notify("수정에 실패했어요.", "error");
        }
      } else {
        notify("수정에 실패했어요.", "error");
      }
    },
  });

  const handleStartEdit = (todoId: number) => {
    if (!canToggleTodos) return;
    const todo = todoById.get(todoId);
    if (!todo) return;
    setAddingGroupId(null);
    setEditingTodoId(todoId);
    setEditTitle(todo.content);
    setEditCategoryId(todo.categoryId != null ? String(todo.categoryId) : "");
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditTitle("");
    setEditCategoryId("");
  };

  const handleSubmitEdit = () => {
    if (editingTodoId == null) return;
    const content = editTitle.trim();
    if (
      !content ||
      content.length > TODO_CONTENT_MAX_LENGTH ||
      updateTodoMutation.isPending
    )
      return;
    const body: UpdateTodoBody = { content };
    const raw = editCategoryId.trim();
    if (!raw) {
      body.removeCategory = true;
    } else {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) {
        body.categoryId = n;
      } else {
        body.removeCategory = true;
      }
    }
    updateTodoMutation.mutate({ todoId: editingTodoId, body });
  };

  const isPanel = variant === "panel";

  return (
    <div className="flex flex-col items-end w-full h-full">
      <div
        className={`flex flex-col items-start ${isPanel ? "mr-0 mt-0" : "mr-20 mt-30"}`}
      >
        <div className="relative flex self-start select-none">
          {sortedMembers.map((member, idx) => {
            const isActive = selectedMemberId === member.id;
            const z = sortedMembers.length - idx;

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                style={{ zIndex: z }}
                className={`
                  round-except-bt w-auto shrink-0 whitespace-nowrap px-6 py-[4px] text-bodyMd cursor-pointer
                  ${idx !== 0 ? "ml-[-8px]" : ""}
                  ${
                    isActive
                      ? "bg-gray-light text-green-dark font-semibold"
                      : "bg-green-dark text-white font-light shadow-[0_-2px_6px_rgba(0,0,0,0.25)]"
                  }
                `}
              >
                {truncateNickname(member.nickname)}
              </div>
            );
          })}
        </div>

        <div
          className="
            bg-gray-light w-96 round-except-tl
            shadow-[0_4px_14px_rgba(0,0,0,0.15)]
            h-[600px]
            p-4
            flex flex-col
          "
        >
          <div className="flex justify-end mb-3 select-none">
            <ToggleBtn
              checked={isDayView}
              onChange={setIsDayView}
              labelOn="day"
              labelOff="category"
              circleIconOn={<BookCheck size={12} color="#284F43" />}
              circleIconOff={<CalendarClock size={12} color="#284F43" />}
            />
          </div>

          <div className="flex-1 pb-8 space-y-4 overflow-y-auto ">
            {isPending && (
              <p className="py-8 text-center text-caption text-gray-semidark">
                투두를 불러오는 중이에요...
              </p>
            )}
            {isError && (
              <p className="py-8 text-center text-caption text-gray-semidark">
                투두를 불러오지 못했어요.
              </p>
            )}
            {!isPending &&
              !isError &&
              displayGroups.map((group, index) => {
                const isAddingHere = addingGroupId === group.id;

                let addRow: ReactNode = null;
                if (isAddingHere) {
                  if (isDayView) {
                    const fixedDueDate = getDateKeyOffset(index);
                    addRow = (
                      <TodoFormRow
                        title={newTitle}
                        onTitleChange={setNewTitle}
                        onCancel={handleCancelAdd}
                        onSubmit={() =>
                          handleSubmitAdd(fixedDueDate, newCategoryId)
                        }
                      >
                        <RoomCategorySelect
                          categories={categories}
                          categoryId={newCategoryId}
                          onCategoryIdChange={setNewCategoryId}
                        />
                      </TodoFormRow>
                    );
                  } else {
                    const fixedCategoryId = fixedCategoryIdByGroupId.get(
                      group.id,
                    );
                    addRow = (
                      <TodoFormRow
                        title={newTitle}
                        onTitleChange={setNewTitle}
                        onCancel={handleCancelAdd}
                        onSubmit={() =>
                          handleSubmitAdd(
                            newDueDate,
                            fixedCategoryId != null
                              ? String(fixedCategoryId)
                              : "",
                          )
                        }
                      >
                        <input
                          type="date"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                          className="bg-transparent text-caption text-gray-semidark outline-none"
                        />
                      </TodoFormRow>
                    );
                  }
                }

                let editRow: ReactNode = null;
                if (
                  editingTodoId != null &&
                  group.items.some((item) => item.id === editingTodoId)
                ) {
                  editRow = (
                    <TodoFormRow
                      title={editTitle}
                      onTitleChange={setEditTitle}
                      onCancel={handleCancelEdit}
                      onSubmit={handleSubmitEdit}
                    >
                      <RoomCategorySelect
                        categories={categories}
                        categoryId={editCategoryId}
                        onCategoryIdChange={setEditCategoryId}
                      />
                    </TodoFormRow>
                  );
                }

                return (
                  <TodoList
                    key={`${selectedMemberId}-${view}-${group.id}`}
                    title={group.title}
                    items={group.items}
                    totalCount={group.totalCount}
                    doneCount={group.doneCount}
                    canToggle={canToggleTodos}
                    onToggleItem={handleToggleItem}
                    canAdd={canToggleTodos}
                    onStartAdd={() => handleStartAdd(group.id)}
                    addRow={addRow}
                    badgeText={DUMMY_BADGE_TEXT[view]}
                    editingItemId={editingTodoId}
                    editRow={editRow}
                    onEditItem={canToggleTodos ? handleStartEdit : undefined}
                  />
                );
              })}
            {!isPending && !isError && displayGroups.length === 0 && (
              <p className="py-8 text-center text-caption text-gray-semidark">
                등록된 투두가 없어요.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type TodoFormRowProps = {
  title: string;
  onTitleChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
};

function TodoFormRow({
  title,
  onTitleChange,
  onCancel,
  onSubmit,
  children,
}: TodoFormRowProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-normal rounded-xl">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) =>
            onTitleChange(e.target.value.slice(0, TODO_CONTENT_MAX_LENGTH))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder="할 일을 입력하세요"
          maxLength={TODO_CONTENT_MAX_LENGTH}
          autoFocus
          className="flex-1 min-w-0 bg-transparent text-bodySm text-green-darkest outline-none placeholder:text-gray-semidark"
        />
        <div className="shrink-0">{children}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-caption text-gray-semidark select-none">
          {title.length}/{TODO_CONTENT_MAX_LENGTH}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onCancel}
          aria-label="취소"
          className="flex items-center justify-center text-gray-semidark hover:text-green-darkest"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!title.trim() || title.length > TODO_CONTENT_MAX_LENGTH}
          aria-label="저장"
          className="flex items-center justify-center text-green-dark disabled:text-gray-semidark"
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  );
}
