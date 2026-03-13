import { useRef, useState } from "react";
import CircularProgress from "./CircularProgress";
import CustomCheckbox from "@/components/Checkbox";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import type { TodoItem } from "@/types/todo";

interface TodoListProps {
  title: string;
  initialItems: TodoItem[];
}

export default function TodoList({ title, initialItems }: TodoListProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<TodoItem[]>(() => initialItems);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const total = items.length;
  const completed = items.filter((item) => item.done).length;
  const left = total - completed;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const handleToggle = () => {
    if (!open && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col w-full mb-4">
      {/* 상단 카드 */}
      <div className="flex justify-between w-full h-20 gap-4 p-4 bg-gray-normal rounded-xl">
        <div className="flex items-center gap-4">
          <CircularProgress value={progress} />
          <div>
            <div className="font-bold text-h5 text-green-darkest select-none">{title}</div>
            <div className="text-caption text-gray-semidark select-none">
              {total}개 중 {left}개가 남았어요!
            </div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className="
            bg-[#A2ADA9] h-7 w-7 rounded-[10px] p-1 text-white 
            flex items-center justify-center self-end transition-all
          "
        >
          {open ? (
            <ChevronsUp size={20} strokeWidth={1.5} />
          ) : (
            <ChevronsDown size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* 펼쳐지는 영역 (애니메이션) */}
      <div
        ref={contentRef}
        style={{
          maxHeight: open ? maxHeight : 0,
          transition: "max-height 0.5s ease-out",
        }}
        className={`
          overflow-hidden
          ${open ? "mt-2" : ""}
        `}
      >
        <div
          className={`
            bg-gray-light rounded-xl p-3 flex flex-col gap-2
            transition-all duration-500 ease-out
            ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
          `}
        >
          {items.map((item) => (
            <div key={item.id} className="px-3 py-2 bg-gray-normal rounded-xl">
              <CustomCheckbox
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                label={item.label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
