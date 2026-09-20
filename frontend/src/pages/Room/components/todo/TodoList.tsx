import { useEffect, useRef, useState, type ReactNode } from "react";
import CircularProgress from "./CircularProgress";
import CustomCheckbox from "@/components/Checkbox";
import { ChevronsDown, ChevronsUp, Pencil, Plus } from "lucide-react";
import type { TodoItem } from "@/types/todo";

interface TodoListProps {
  title: string;
  items: TodoItem[];
  totalCount: number;
  doneCount: number;
  canToggle?: boolean;
  onToggleItem?: (id: number, nextDone: boolean) => void;
  canAdd?: boolean;
  onStartAdd?: () => void;
  addRow?: ReactNode;
  /** 항목별 배지 텍스트(더미). day 뷰: 카테고리명, category 뷰: D-day */
  badgeText?: string;
  editingItemId?: number | null;
  editRow?: ReactNode;
  onEditItem?: (id: number) => void;
}

export default function TodoList({
  title,
  items,
  totalCount,
  doneCount,
  canToggle = false,
  onToggleItem,
  canAdd = false,
  onStartAdd,
  addRow,
  badgeText,
  editingItemId,
  editRow,
  onEditItem,
}: TodoListProps) {
  const [open, setOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const left = Math.max(0, totalCount - doneCount);
  const progress =
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  const handleToggleItem = (id: number, nextDone: boolean) => {
    if (!canToggle || !onToggleItem) return;
    onToggleItem(id, nextDone);
  };

  const handleToggle = () => {
    if (!open && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    }
    setOpen((prev) => !prev);
  };

  const hasAddRow = Boolean(addRow);
  const isEditingHere = items.some((item) => item.id === editingItemId);
  useEffect(() => {
    if (!open || !contentRef.current) return;
    setMaxHeight(contentRef.current.scrollHeight);
  }, [open, hasAddRow, items.length, isEditingHere]);

  return (
    <div className="flex flex-col w-full mb-4">
      <div className="flex justify-between w-full h-20 gap-4 p-4 bg-gray-normal rounded-xl">
        <div className="flex items-center gap-4">
          <CircularProgress value={progress} />
          <div>
            <div className="font-bold text-h5 text-green-darkest select-none">
              {title}
            </div>
            <div className="text-caption text-gray-semidark select-none">
              {totalCount}개 중 {left}개가 남았어요!
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
          {canAdd &&
            (addRow ?? (
              <button
                type="button"
                onClick={onStartAdd}
                aria-label="할 일 추가"
                className="flex items-center justify-center px-3 py-2 bg-gray-normal rounded-xl text-gray-semidark hover:text-green-dark"
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            ))}
          {items.map((item) =>
            item.id === editingItemId && editRow ? (
              <div key={item.id}>{editRow}</div>
            ) : (
              <div
                key={item.id}
                className="group/row flex items-start justify-between gap-2 px-3 py-2 bg-gray-normal rounded-xl"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <CustomCheckbox
                    checked={item.done}
                    onChange={(nextDone) =>
                      handleToggleItem(item.id, nextDone)
                    }
                    label={item.label}
                    ariaLabel={
                      canToggle
                        ? item.done
                          ? "완료 해제"
                          : "완료"
                        : item.label
                    }
                  />
                  {canToggle && onEditItem && (
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover/row:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEditItem(item.id)}
                        aria-label="수정"
                        className="flex items-center justify-center text-gray-semidark hover:text-green-dark"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {badgeText && (
                  <span className="shrink-0 rounded-full bg-green-normal/15 px-2 py-0.5 text-caption text-green-dark">
                    {badgeText}
                  </span>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
