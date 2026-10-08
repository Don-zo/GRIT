import { User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/Modal";
import { groupApi } from "@/apis/domains/group/api";
import { sortGroupMembersWithMeFirst } from "@/apis/domains/group/mappers";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type GroupMembersModalProps = {
  open: boolean;
  onClose: () => void;
  groupCode: string;
  groupName: string;
};

export default function GroupMembersModal({
  open,
  onClose,
  groupCode,
  groupName,
}: GroupMembersModalProps) {
  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.groups.members(groupCode),
    queryFn: () => groupApi.getGroupMembers(groupCode),
    enabled: open,
  });

  const sortedMembers = sortGroupMembersWithMeFirst(members);

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header className="flex flex-col items-center text-center">
          <Modal.Title size="sm" />
          <p className="mt-2 text-sm font-medium text-[#D6FDE5]">
            {groupName} 멤버
            {!isLoading && !isError && ` ${members.length}명`}
          </p>
        </Modal.Header>

        <Modal.Body className="pb-10">
          {isLoading && (
            <p className="mt-6 text-center text-sm text-[#D6FDE5]/80">
              불러오는 중…
            </p>
          )}
          {isError && (
            <div className="mt-6 text-center">
              <p className="text-sm text-red-300">
                목록을 불러오지 못했습니다.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-sm text-[#82C397] underline"
              >
                다시 시도
              </button>
            </div>
          )}
          {!isLoading && !isError && sortedMembers.length > 0 && (
            <ul className="mx-auto mt-3 grid w-full max-w-[400px] grid-cols-2 gap-x-6">
              {sortedMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex min-w-0 items-center gap-3 py-2.5"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#3E7358]">
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.nickname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white" />
                    )}
                  </div>
                  <span className="truncate text-sm font-medium text-[#D6FDE5]">
                    {member.nickname}
                  </span>
                  {member.me && (
                    <span className="shrink-0 rounded-md bg-[#3E7358] px-1.5 py-0.5 text-xs text-[#D6FDE5]">
                      나
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}
