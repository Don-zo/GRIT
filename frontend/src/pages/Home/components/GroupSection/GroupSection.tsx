import { useState, useEffect } from "react";
import Button from "./Button";
import GroupCard from "./GroupCard";
import { groups } from "@/mockdata/groupData";
import { Plus, Users } from "lucide-react";
import CreateGroupModal from "@/pages/Home/components/Modals/CreateGroupModal";
import JoinGroupModal from "@/pages/Home/components/Modals/JoinGroupModal";

export default function GroupSection() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);

  useEffect(() => {}, []);

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
            key={group.id}
            id={group.id}
            groupName={group.groupName}
            isLive={group.isLive}
            liveMembers={group.liveMembers}
            totalMembers={group.totalMembers}
            image={group.image}
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
