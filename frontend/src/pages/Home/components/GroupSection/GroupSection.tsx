import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import GroupCard from "./GroupCard";
import { groupApi } from "@/apis/domains/group/api";
import CreateGroupModal from "@/pages/Home/components/Modals/CreateGroupModal";
import JoinGroupModal from "@/pages/Home/components/Modals/JoinGroupModal";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

const GROUPS_PER_PAGE = 8;

function getPageItems(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev === 2) items.push(prev + 1);
    else if (p - prev > 2) items.push("...");
    items.push(p);
    prev = p;
  }
  return items;
}

export default function GroupSection() {
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isJoinGroupModalOpen, setIsJoinGroupModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.groups.my,
    queryFn: groupApi.getMyGroupList,
  });

  const totalPages = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  if (page > totalPages) {
    setPage(totalPages);
  }
  const currentPage = Math.min(page, totalPages);
  const pagedGroups = groups.slice(
    (currentPage - 1) * GROUPS_PER_PAGE,
    currentPage * GROUPS_PER_PAGE,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4">
          <Button
            icon={<Plus size={20} />}
            label="그룹 생성하기"
            className="w-auto! gap-2 px-5 shadow-none!"
            onClick={() => setIsCreateGroupModalOpen(true)}
          />
          <Button
            icon={
              <img
                src="/icons/group_join.svg"
                alt="group_join"
                style={{ width: "20px", height: "20px" }}
              />
            }
            label="그룹 참여하기"
            className="w-auto! gap-2 px-5 shadow-none!"
            onClick={() => setIsJoinGroupModalOpen(true)}
          />
        </div>

        <div className="flex items-center gap-8 rounded-2xl bg-[#25272E] px-5 py-2 shadow-xl/20">
          <button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
            className="text-gray-300 transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2.5">
            {getPageItems(currentPage, totalPages).map((item, idx) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="text-lg text-gray-300 select-none"
                >
                  &hellip;
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => setPage(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`min-w-4 text-lg transition-colors ${
                    item === currentPage
                      ? "font-semibold text-gray-200"
                      : "font-normal text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
            className="text-gray-300 transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <section className="w-auto h-auto bg-[#2E3039] rounded-3xl p-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4 [@media(min-width:768px)_and_(max-width:1023px)]:justify-items-center [@media(min-width:768px)_and_(max-width:1023px)]:[&>*]:w-full [@media(min-width:768px)_and_(max-width:1023px)]:[&>*]:max-w-[clamp(180px,24vw,240px)]">
          {isLoading && (
            <div className="text-gray-300">그룹 불러오는 중...</div>
          )}
          {isError && (
            <div className="text-red-400">그룹 조회에 실패했습니다.</div>
          )}

          {!isLoading &&
            !isError &&
            pagedGroups.map((group) => (
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
      </section>

      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
      />
      <JoinGroupModal
        open={isJoinGroupModalOpen}
        onClose={() => setIsJoinGroupModalOpen(false)}
      />
    </div>
  );
}
