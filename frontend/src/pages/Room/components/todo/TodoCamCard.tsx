import { useState } from "react";
import ToggleBtn from "@/components/ToggleBtn";
import { BookCheck, CalendarClock } from "lucide-react";
import TodoList from "./TodoList";
import type { TodoGroup } from "@/types/todo";
import { categoryDataByUser, dayDataByUser } from "@/mockdata/todoData";

export default function TodoCamCard() {
  const tabs = ["이유민", "김윤영", "양준영", "이차현"];
  const [currentTab, setCurrentTab] = useState("이유민");
  const [checked, setChecked] = useState(false);

  const groupsToShow: TodoGroup[] = checked
    ? dayDataByUser[currentTab]
    : categoryDataByUser[currentTab];

  return (
    <div className="flex flex-col items-end w-full h-full">
      <div className="flex flex-col items-start mr-20 mt-30">
        {/* 탭 줄 */}
        <div className="relative flex self-start">
          {tabs.map((name, idx) => {
            const isActive = currentTab === name;
            const z = tabs.length - idx;

            return (
              <div
                key={name}
                onClick={() => setCurrentTab(name)}
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
                {name}
              </div>
            );
          })}
        </div>

        {/* 카드 박스 */}
        <div
          className="
            bg-gray-light w-96 round-except-tl
            shadow-[0_4px_14px_rgba(0,0,0,0.15)]
            h-[600px]
            p-4
            flex flex-col
          "
        >
          {/* 토글 영역 */}
          <div className="flex justify-end mb-3">
            <ToggleBtn
              checked={checked}
              onChange={setChecked}
              labelOn="day"
              labelOff="category"
              circleIconOn={<BookCheck size={12} color="#284F43" />}
              circleIconOff={<CalendarClock size={12} color="#284F43" />}
            />
          </div>

          <div className="flex-1 pb-8 space-y-4 overflow-y-auto ">
            {groupsToShow.map((group) => (
              <TodoList
                key={group.id}
                title={group.title}
                initialItems={group.items}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
