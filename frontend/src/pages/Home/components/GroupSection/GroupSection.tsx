import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Button from "./Button";
import GroupCard from "./GroupCard";
import { groupApi } from "@/apis/domains/group/api";
import CreateGroupModal from "@/pages/Home/components/Modals/CreateGroupModal";
import JoinGroupModal from "@/pages/Home/components/Modals/JoinGroupModal";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

export default function GroupSection() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.groups.my,
    queryFn: groupApi.getMyGroupList,
  });

  return (
    <section className="w-auto h-auto bg-[#2E3039] rounded-3xl px-16 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-16">
        <div className="flex flex-col gap-10">
          <Button
            icon={<Plus size={45} />}
            label="그룹 생성하기"
            className="flex-1"
            onClick={() => setIsCreateGroupModalOpen(true)}
          />
          <Button
            icon={
              <img
                src="/icons/group_join.svg"
                alt="group_join"
                style={{ width: "45px", height: "45px" }}
              />
            }
            label="그룹 참여하기"
            className="flex-1 bg-green-semidark hover:bg-green-dark"
            onClick={() => setIsJoinGroupModalOpen(true)}
          />
        </div>

        {isLoading && <div className="text-gray-300">그룹 불러오는 중...</div>}
        {isError && (
          <div className="text-red-400">그룹 조회에 실패했습니다.</div>
        )}

        {!isLoading &&
          !isError &&
          groups.map((group) => (
            <GroupCard
              key={group.groupCode}
              groupCode={group.groupCode}
              name={group.name}
              memberCount={group.memberCount}
              imageUrl={group.imageUrl}
            />
          ))}
      </div>

      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
      <JoinGroupModal
        open={isJoinGroupModalOpen}
        onClose={() => setIsJoinGroupModalOpen(false)}
      />
    </section>
  );
}
