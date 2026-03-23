import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "./Button";
import GroupCard from "./GroupCard";
import type { Group } from "@/apis/types/group";
import { groupApi } from "@/apis/services/group";
import CreateGroupModal from "@/pages/Home/components/Modals/CreateGroupModal";
import JoinGroupModal from "@/pages/Home/components/Modals/JoinGroupModal";

export default function GroupSection() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchMyGroupList = async () => {
      try {
        const response = await groupApi.getMyGroupList();
        setGroups(response ?? []);
      } catch (error) {
        console.error("내 그룹 조회 실패:", error);
        setGroups([]);
      }
    };
    fetchMyGroupList();
  }, []);

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

        {groups.map((group) => (
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
