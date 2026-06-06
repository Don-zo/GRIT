import { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ToggleBtn from "@/components/ToggleBtn";
import { BookCheck, CalendarClock } from "lucide-react";
import TodoList from "./TodoList";
import { groupApi } from "@/apis/domains/group/api";
import type {
  GroupMember,
  GroupMemberTodosResponse,
  GroupMemberTodoView,
} from "@/apis/domains/group/type";
import {
  mapGroupMemberTodosToTodoGroups,
  sortGroupMembersWithMeFirst,
  updateGroupMemberTodoDoneInCache,
} from "@/apis/domains/group/mappers";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { todoApi } from "@/apis/domains/todo/api";
import { useToastContext } from "@/contexts/ToastContext";

type TodoCamCardProps = {
  variant?: "default" | "panel";
  groupCode?: string;
  members?: GroupMember[];
};

const truncateNickname = (nickname: string) =>
  nickname.length > 3 ? `${nickname.slice(0, 3)}...` : nickname;

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

  const groupsToShow = useMemo(
    () =>
      todosResponse
        ? mapGroupMemberTodosToTodoGroups(todosResponse.sections)
        : [],
    [todosResponse],
  );

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
                  round-except-bt w-auto px-6 py-[4px] text-bodyMd cursor-pointer
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
              groupsToShow.map((group) => (
                <TodoList
                  key={`${selectedMemberId}-${view}-${group.id}`}
                  title={group.title}
                  items={group.items}
                  canToggle={canToggleTodos}
                  onToggleItem={handleToggleItem}
                />
              ))}
            {!isPending && !isError && groupsToShow.length === 0 && (
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
