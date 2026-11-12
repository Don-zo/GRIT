import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ToggleBtn from "@/components/ToggleBtn";
import {
  BookCheck,
  CalendarClock,
  Check,
  Crown,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
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
import { formatDDayLabel, isDDayUrgent } from "@/utils/date";
import {
  formatStudySecondsAsClock,
  getStudyTimeProgressPercent,
} from "@/utils/studyTime";

/** 멤버 탭 닉네임이 펼쳐지는 시간(ms) — duration-300과 맞춘다 */
const TAB_EXPAND_MS = 300;
/** 멤버 탭 줄이 넘지 말아야 할 폭 — 아래 패널(w-96)과 같다 */
const TAB_ROW_MAX_WIDTH = 384;
/** 접힌 탭 폭(px-4 양쪽 + 아이콘 16px), 탭끼리 겹치는 폭(ml-[-8px]) */
const TAB_COLLAPSED_WIDTH = 48;
const TAB_OVERLAP = 8;
/** 닉네임 앞 간격(ml-1.5), 닉네임 최대 폭(max-w-30) */
const TAB_NAME_GAP = 6;
const TAB_NAME_MAX_WIDTH = 120;

type MemberStudyProgress = {
  displayedSeconds: number;
  weeklyStudyTimeGoalSeconds: number | null;
  running: boolean;
};

type TodoCamCardProps = {
  variant?: "default" | "panel";
  groupCode?: string;
  members?: GroupMember[];
  getMemberStudyProgress?: (memberId: number) => MemberStudyProgress | undefined;
};

function MemberStudyProgressCard({
  progress,
}: {
  progress: MemberStudyProgress | undefined;
}) {
  const displayedSeconds = progress?.displayedSeconds ?? 0;
  const goalSeconds = progress?.weeklyStudyTimeGoalSeconds ?? null;
  const percent = getStudyTimeProgressPercent(displayedSeconds, goalSeconds);

  return (
    <div className="mb-3 shrink-0 rounded-xl bg-gray-normal p-3 select-none">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-h5 font-bold text-green-darkest">
            {formatStudySecondsAsClock(displayedSeconds)}
          </span>
          <span className="text-bodySm text-gray-semidark">
            {goalSeconds != null
              ? `/ ${formatStudySecondsAsClock(goalSeconds)}`
              : "/ 목표 미설정"}
          </span>
        </div>

        {progress?.running ? (
          <span className="flex shrink-0 items-center gap-1 text-caption font-semibold text-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-green-light animate-pulse" />
            공부 중
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 text-caption font-semibold text-gray-semidark">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-semidark/50" />
            쉬는 중
          </span>
        )}
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-light">
        <div
          className="h-full rounded-full bg-green-normal transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const getDateKeyOffset = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

export default function TodoCamCard({
  variant = "default",
  groupCode,
  members = [],
  getMemberStudyProgress,
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
    () => mapGroupMemberTodosToTodoGroups(sortedSections, view),
    [sortedSections, view],
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
          badgeText: formatDDayLabel(todo.dueDate),
          badgeTone: isDDayUrgent(todo.dueDate) ? "urgent" : "default",
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
        badgeText: formatDDayLabel(todo.dueDate),
        badgeTone: isDDayUrgent(todo.dueDate) ? "urgent" : "default",
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

  const deleteTodoMutation = useMutation({
    mutationFn: (todoId: number) => todoApi.deleteTodo(todoId),
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
      notify("삭제됐어요.", "success");
    },
    onError: (err) => {
      if (
        isAxiosError(err) &&
        (err.response?.status === 403 || err.response?.status === 404)
      ) {
        notify("할 일을 삭제할 수 없어요.", "error");
      } else {
        notify("삭제에 실패했어요.", "error");
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

  const handleDeleteItem = (todoId: number) => {
    if (!canToggleTodos || deleteTodoMutation.isPending) return;
    if (editingTodoId === todoId) handleCancelEdit();
    deleteTodoMutation.mutate(todoId);
  };

  // 멤버 탭 호버: 탭이 펼쳐지며 옆 탭이 밀릴 때 커서 밑으로 다른 탭이 지나가도 호버가 바뀌지 않도록
  // 실제 마우스 이동(mousemove)으로만 바꾸고, 펼쳐지는 동안은 잠깐 고정한다.
  const [hoveredTabId, setHoveredTabId] = useState<GroupMember["id"] | null>(
    null,
  );
  const hoverLockUntilRef = useRef(0);
  // 고정 중에 마지막으로 커서가 있던 탭 — 고정이 풀리면 반영한다
  const pendingHoverIdRef = useRef<GroupMember["id"] | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    },
    [],
  );

  // 다른 탭을 누르면 이전 선택 탭이 바로 접히면서 누른 탭이 커서 밑에서 밀려나 버린다.
  // 그래서 이전 선택 탭은 커서가 다른 탭으로 가거나 탭 줄을 벗어날 때까지 펼쳐 둔다.
  const [stickyTabId, setStickyTabId] = useState<GroupMember["id"] | null>(
    null,
  );

  const handleTabClick = (memberId: GroupMember["id"]) => {
    if (memberId === selectedMemberId) return;
    setStickyTabId(selectedMemberId);
    setSelectedMemberId(memberId);
  };

  const applyTabHover = (memberId: GroupMember["id"]) => {
    hoverLockUntilRef.current = performance.now() + TAB_EXPAND_MS;
    setHoveredTabId(memberId);
    setStickyTabId(null);
  };

  const handleTabMouseMove = (memberId: GroupMember["id"]) => {
    const remaining = hoverLockUntilRef.current - performance.now();
    if (remaining <= 0) {
      if (memberId !== hoveredTabId) applyTabHover(memberId);
      return;
    }
    pendingHoverIdRef.current = memberId;
    if (hoverTimerRef.current) return;
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      const pendingId = pendingHoverIdRef.current;
      pendingHoverIdRef.current = null;
      if (pendingId !== null) applyTabHover(pendingId);
    }, remaining);
  };

  const handleTabsMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    pendingHoverIdRef.current = null;
    hoverLockUntilRef.current = 0;
    setHoveredTabId(null);
    setStickyTabId(null);
  };

  // 펼쳐진 탭이 여러 개여도 탭 줄이 패널 폭을 넘지 않도록 남는 폭을 닉네임에 나눠 준다.
  // 짧은 닉네임은 필요한 만큼만 받고, 남은 폭은 긴 닉네임에 몰아줘서 쓸데없이 말줄임되지 않게 한다.
  const nameMeasureRef = useRef<HTMLDivElement | null>(null);
  const [nameWidths, setNameWidths] = useState<Map<GroupMember["id"], number>>(
    () => new Map(),
  );

  useLayoutEffect(() => {
    const el = nameMeasureRef.current;
    if (!el) return;
    const update = () => {
      const next = new Map<GroupMember["id"], number>();
      Array.from(el.children).forEach((child, i) => {
        const member = sortedMembers[i];
        if (member) {
          next.set(member.id, Math.ceil(child.getBoundingClientRect().width));
        }
      });
      setNameWidths(next);
    };
    update();
    // 웹폰트가 늦게 로드되면 너비가 바뀌므로 다시 잰다
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sortedMembers]);

  const expandedTabIds = [selectedMemberId, hoveredTabId, stickyTabId].filter(
    (id, i, ids): id is GroupMember["id"] =>
      id !== null &&
      ids.indexOf(id) === i &&
      sortedMembers.some((member) => member.id === id),
  );
  const collapsedRowWidth =
    sortedMembers.length * TAB_COLLAPSED_WIDTH -
    Math.max(0, sortedMembers.length - 1) * TAB_OVERLAP;

  const tabNameMaxWidths = new Map<GroupMember["id"], number>();
  let remainingNameWidth = Math.max(
    0,
    TAB_ROW_MAX_WIDTH -
      collapsedRowWidth -
      expandedTabIds.length * TAB_NAME_GAP,
  );
  expandedTabIds
    .map((id) => ({
      id,
      width: Math.min(nameWidths.get(id) ?? TAB_NAME_MAX_WIDTH, TAB_NAME_MAX_WIDTH),
    }))
    .sort((a, b) => a.width - b.width)
    .forEach(({ id, width }, i, list) => {
      const share = remainingNameWidth / (list.length - i);
      const given = Math.min(width, share);
      tabNameMaxWidths.set(id, Math.floor(given));
      remainingNameWidth -= given;
    });

  const isPanel = variant === "panel";

  return (
    <div className="flex flex-col items-end w-full h-full">
      <div
        className={`flex flex-col items-start ${isPanel ? "mr-0 mt-0" : "mr-20 mt-30"}`}
      >
        {/* 선택된 탭은 닉네임을 항상, 나머지는 아이콘만 있다가 마우스를 올리면 펼쳐지며 닉네임이 보인다.
            탭은 아래로 16px 더 길게 그려 패널 뒤로 들어가게 해서(-mb-4, 패널 z-10),
            패널 둥근 모서리 틈으로 배경 대신 탭 색이 보이게 한다. */}
        <div
          onMouseLeave={handleTabsMouseLeave}
          className="relative flex self-start -mb-4 select-none"
        >
          {/* 닉네임 실제 너비 측정용 (굵게 렌더링해 활성 탭 기준으로 잰다) */}
          <div
            ref={nameMeasureRef}
            aria-hidden
            className="absolute top-0 left-0 flex w-max invisible pointer-events-none text-bodyMd font-semibold whitespace-nowrap"
          >
            {sortedMembers.map((member) => (
              <span key={member.id}>{member.nickname}</span>
            ))}
          </div>
          {sortedMembers.map((member, idx) => {
            const isActive = selectedMemberId === member.id;
            const isExpanded = tabNameMaxWidths.has(member.id);
            const z = sortedMembers.length - idx;

            return (
              <div
                key={member.id}
                title={member.nickname}
                onClick={() => handleTabClick(member.id)}
                onMouseMove={() => handleTabMouseMove(member.id)}
                style={{
                  zIndex:
                    hoveredTabId === member.id ? sortedMembers.length + 1 : z,
                }}
                className={`
                  round-except-bt flex shrink-0 items-center whitespace-nowrap
                  px-4 pt-[4px] pb-[20px] text-bodyMd cursor-pointer
                  ${idx !== 0 ? "ml-[-8px]" : ""}
                  ${
                    isActive
                      ? "bg-gray-light text-green-dark font-semibold"
                      : "bg-[#33614E] text-white font-light shadow-[0_-2px_6px_rgba(0,0,0,0.25)]"
                  }
                `}
              >
                {member.me ? (
                  // 내 탭 강조: 금색 왕관 (밝은 활성 탭 위에선 대비를 위해 더 진하게)
                  <Crown
                    size={16}
                    strokeWidth={2}
                    fill="currentColor"
                    className={`shrink-0 ${isActive ? "text-[#D4A017]" : "text-[#F5C842]"}`}
                  />
                ) : (
                  <UserRound size={16} strokeWidth={2} className="shrink-0" />
                )}
                <span
                  className={`
                    overflow-hidden text-ellipsis
                    transition-[max-width,margin,opacity] duration-300 ease-out
                    ${isExpanded ? "ml-1.5 opacity-100" : "opacity-0"}
                  `}
                  style={{
                    maxWidth: isExpanded
                      ? (tabNameMaxWidths.get(member.id) ?? 0)
                      : 0,
                  }}
                >
                  {member.nickname}
                </span>
              </div>
            );
          })}
        </div>

        <div
          className="
            bg-gray-light w-96 round-except-tl
            shadow-[0_4px_14px_rgba(0,0,0,0.15)]
            [clip-path:inset(0_-24px_-24px_-24px)]
            h-[600px]
            p-4
            flex flex-col
            relative z-10
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

          {selectedMember && (
            <MemberStudyProgressCard
              progress={getMemberStudyProgress?.(selectedMember.id)}
            />
          )}

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
                      onDelete={() => handleDeleteItem(editingTodoId)}
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
  onDelete?: () => void;
  children: ReactNode;
};

function TodoFormRow({
  title,
  onTitleChange,
  onCancel,
  onSubmit,
  onDelete,
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
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
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
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label="삭제"
            className="flex items-center justify-center text-red-400/80 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        )}
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
