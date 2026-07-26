import { useLayoutEffect, useRef, useState } from "react";
import CircularProgress from "./CircularProgress";
import CustomCheckbox from "@/components/Checkbox";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import type { TodoItem } from "@/types/todo";
import { camTodoTheme } from "./camTodoTheme";

interface TodoListProps {
  title: string;
  items: TodoItem[];
  totalCount: number;
  doneCount: number;
  canToggle?: boolean;
  onToggleItem?: (id: number, nextDone: boolean) => void;
}

export default function TodoList({
  title,
  items,
  totalCount,
  doneCount,
  canToggle = false,
  onToggleItem,
}: TodoListProps) {
  const [open, setOpen] = useState(false);

  const innerRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const left = Math.max(0, totalCount - doneCount);
  const progress =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  // 열림 상태에서 투두 추가/수정으로 높이가 바뀌면 maxHeight를 다시 맞춤
  useLayoutEffect(() => {
    if (!open) {
      setMaxHeight(0);
      return;
    }

    const inner = innerRef.current;
    if (!inner) return;

    const syncHeight = () => setMaxHeight(inner.scrollHeight);
    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [open, items]);

  const handleToggleItem = (id: number, nextDone: boolean) => {
    if (!canToggle || !onToggleItem) return;
    onToggleItem(id, nextDone);
  };

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col w-full mb-4">
      <div
        className={`flex justify-between w-full h-20 gap-4 p-4 ${camTodoTheme.headerBg}`}
      >
        <div className="flex items-center gap-4">
          <CircularProgress value={progress} />
          <div>
            <div
              className={`font-bold text-h5 select-none ${camTodoTheme.title}`}
            >
              {title}
            </div>
            <div
              className={`text-caption select-none ${camTodoTheme.subtitle}`}
            >
              {items.length === 0
                ? "등록된 투두가 없어요."
                : `${totalCount}개 중 ${left}개가 남았어요!`}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`
            ${camTodoTheme.chevronBtn} h-7 w-7 rounded-[10px] p-1 text-white 
            flex items-center justify-center self-end transition-all
          `}
        >
          {open ? (
            <ChevronsUp size={20} strokeWidth={1.5} />
          ) : (
            <ChevronsDown size={20} strokeWidth={1.5} />
          )}
        </button>
      </div>

      <div
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
          ref={innerRef}
          className={`
            ${camTodoTheme.listPanel} rounded-xl p-3 flex flex-col gap-2
            transition-all duration-500 ease-out
            ${open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
          `}
        >
          {items.length === 0 ? (
            <p
              className={`py-3 text-center text-caption select-none ${camTodoTheme.emptyText}`}
            >
              등록된 투두가 없어요.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-2 rounded-xl ${camTodoTheme.itemBg}`}
              >
                <CustomCheckbox
                  checked={item.done}
                  onChange={(nextDone) => handleToggleItem(item.id, nextDone)}
                  label={item.label}
                  labelClassName={camTodoTheme.checkboxLabel}
                  ariaLabel={
                    canToggle
                      ? item.done
                        ? "완료 해제"
                        : "완료"
                      : item.label
                  }
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
