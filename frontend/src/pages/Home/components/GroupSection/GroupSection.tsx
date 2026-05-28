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
    <section className="w-auto h-auto bg-[#2E3039] rounded-3xl p-8">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 [@media(min-width:768px)_and_(max-width:1023px)]:justify-items-center [@media(min-width:768px)_and_(max-width:1023px)]:[&>*]:w-full [@media(min-width:768px)_and_(max-width:1023px)]:[&>*]:max-w-[clamp(180px,24vw,240px)]">
        <div className="flex flex-col gap-8">
          <Button
            icon={<Plus size={32} />}
            label="그룹 생성하기"
            className="flex-1"
            onClick={() => setIsCreateGroupModalOpen(true)}
          />
          <Button
            icon={
              <img
                src="/icons/group_join.svg"
                alt="group_join"
                style={{ width: "32px", height: "32px" }}
              />
            }
            label="그룹 참여하기"
            className="flex-1"
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
              isLive={group.isLive}
              liveParticipantCount={group.liveParticipantCount}
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
