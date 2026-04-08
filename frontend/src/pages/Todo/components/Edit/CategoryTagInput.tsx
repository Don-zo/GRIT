import {
  Fragment,
  useState,
  type Dispatch,
  type DragEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { X } from "lucide-react";
import type { Category } from "@/pages/Todo/components/types";

const ADD_PLACEHOLDER = "추가 · Enter";
const MAX_CATEGORY_NAME_LEN = 50;

type CategoryTagInputProps = {
  categories: Category[];
  categoryId: string;
  onCategoryIdChange: (id: string) => void;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  canDeleteCategory: boolean;
  onRemoveCategory: (id: string) => void;
  onCreateCategory?: (name: string) => { tempId: string };
  /** 드래그로 순서 변경 시 새 id 순서 전달 (로그인 시 API 연동) */
  onReorderCategories?: (orderedIds: string[]) => void;
  /** true면 순서 변경 비활성 (예: 미저장 카테고리 있음, 요청 중) */
  reorderDisabled?: boolean;
};

function addOrSelectByLabel(
  raw: string,
  categories: Category[],
  setCategories: Dispatch<SetStateAction<Category[]>>,
): string | null {
  const label = raw.trim();
  if (!label) return null;
  const found = categories.find(
    (c) => c.label.trim().toLowerCase() === label.toLowerCase(),
  );
  if (found) return found.id;
  const id = crypto.randomUUID();
  setCategories((prev) => [...prev, { id, label }]);
  return id;
}

export default function CategoryTagInput({
  categories,
  categoryId,
  onCategoryIdChange,
  setCategories,
  canDeleteCategory,
  onRemoveCategory,
  onCreateCategory,
  onReorderCategories,
  reorderDisabled = false,
}: CategoryTagInputProps) {
  const [query, setQuery] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(
    null,
  );

  const canReorder =
    Boolean(onReorderCategories) && categories.length > 1 && !reorderDisabled;

  const reorderWithInsert = (draggedId: string, insertBeforeIndex: number) => {
    if (!onReorderCategories) return;
    const ids = categories.map((c) => c.id);
    const from = ids.indexOf(draggedId);
    if (from < 0) return;
    if (insertBeforeIndex < 0 || insertBeforeIndex > ids.length) return;

    const next = [...ids];
    next.splice(from, 1);
    let insertAt = insertBeforeIndex;
    if (from < insertBeforeIndex) insertAt -= 1;
    next.splice(insertAt, 0, draggedId);
    onReorderCategories(next);
  };

  const insertIndexFromPointer = (e: DragEvent, chipIndex: number) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mid = rect.left + rect.width / 2;
    return e.clientX < mid ? chipIndex : chipIndex + 1;
  };

  const onDragStartRow = (e: DragEvent, id: string) => {
    if (!canReorder) return;
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const onDragEndRow = () => {
    setDraggingId(null);
    setDropIndicatorIndex(null);
  };

  const onDragOverRow = (e: DragEvent, chipIndex: number) => {
    if (!canReorder || !draggingId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropIndicatorIndex(insertIndexFromPointer(e, chipIndex));
  };

  const onDropRow = (e: DragEvent, chipIndex: number) => {
    if (!canReorder) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    setDropIndicatorIndex(null);
    if (!draggedId) return;
    const insertBeforeIndex = insertIndexFromPointer(e, chipIndex);
    reorderWithInsert(draggedId, insertBeforeIndex);
  };

  const commitInput = async () => {
    const label = query.trim().slice(0, MAX_CATEGORY_NAME_LEN);
    if (!label) return;

    const found = categories.find(
      (c) => c.label.trim().toLowerCase() === label.toLowerCase(),
    );
    if (found) {
      onCategoryIdChange(found.id);
      setQuery("");
      return;
    }

    if (onCreateCategory) {
      const { tempId } = onCreateCategory(label);
      if (tempId) onCategoryIdChange(tempId);
      setQuery("");
      return;
    }

    const id = addOrSelectByLabel(query, categories, setCategories);
    if (id) onCategoryIdChange(id);
    setQuery("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    commitInput();
  };

  return (
    <div className="w-full">
      <span className="mb-2 block text-xs font-medium text-[#D6FDE5]">
        카테고리
        <span className="ml-1.5 font-normal text-white/40">(선택)</span>
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((c, chipIndex) => {
          const active = categoryId === c.id;
          const showLineBefore =
            canReorder &&
            draggingId !== null &&
            dropIndicatorIndex === chipIndex;

          return (
            <Fragment key={c.id}>
              {showLineBefore ? (
                <span
                  aria-hidden
                  className="inline-block h-7 w-[2px] shrink-0 rounded-full bg-[#82C397] shadow-[0_0_8px_rgba(130,195,151,0.65)]"
                />
              ) : null}
              <div
                draggable={canReorder}
                onDragStart={(e) => onDragStartRow(e, c.id)}
                onDragEnd={onDragEndRow}
                onDragOver={(e) => onDragOverRow(e, chipIndex)}
                onDrop={(e) => onDropRow(e, chipIndex)}
                className={`group/cat inline-flex items-center overflow-hidden rounded-lg text-xs font-medium leading-normal transition ${
                  canReorder ? "cursor-grab active:cursor-grabbing" : ""
                } ${
                  active
                    ? "ring-[1.5px] ring-inset ring-[#82C397]/50"
                    : "ring-1 ring-inset ring-white/12"
                } ${draggingId === c.id ? "opacity-60" : ""}`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onCategoryIdChange(active ? "" : c.id)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    onCategoryIdChange(active ? "" : c.id);
                  }}
                  className={`flex min-h-7 items-center px-2 py-1 transition ${
                    active
                      ? "bg-green-semidark text-[#EDFFF4] group-hover/cat:bg-emerald-800"
                      : "bg-white/10 text-[#D6FDE5]/85 group-hover/cat:bg-white/15"
                  }`}
                >
                  {c.label}
                </div>
                <button
                  type="button"
                  draggable={false}
                  disabled={!canDeleteCategory}
                  title={
                    canDeleteCategory
                      ? `${c.label} 삭제`
                      : "카테고리는 최소 1개 필요해요"
                  }
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCategory(c.id);
                  }}
                  className={`group/del flex min-h-7 shrink-0 items-center justify-center pl-1 pr-1.5 transition disabled:cursor-not-allowed disabled:opacity-35 ${
                    active
                      ? "bg-green-semidark text-[#D6FDE5] group-hover/cat:bg-emerald-800 group-hover/cat:text-[#EDFFF4]"
                      : "bg-white/10 text-[#D6FDE5]/55 group-hover/cat:bg-white/15"
                  }`}
                >
                  <X
                    aria-hidden
                    className="h-3 w-3 shrink-0 transition-[stroke-width] duration-150 ease-out [stroke-width:2.25px] group-hover/del:[stroke-width:3.5px]"
                  />
                </button>
              </div>
            </Fragment>
          );
        })}

        {canReorder &&
        draggingId !== null &&
        dropIndicatorIndex === categories.length ? (
          <span
            aria-hidden
            className="inline-block h-7 w-[2px] shrink-0 rounded-full bg-[#82C397] shadow-[0_0_8px_rgba(130,195,151,0.65)]"
          />
        ) : null}

        <div
          className="relative inline-block min-h-7 min-w-0 max-w-full overflow-x-auto rounded-lg bg-white/10 text-xs font-medium ring-1 ring-inset ring-white/12 transition focus-within:bg-white/[0.12] focus-within:ring-[1.5px] focus-within:ring-[#82C397]/50"
          onDragOver={(e) => {
            if (!canReorder || !draggingId) return;
            e.preventDefault();
            setDropIndicatorIndex(null);
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none invisible block whitespace-pre py-1 px-2 leading-normal"
          >
            {query.length > 0 ? query : ADD_PLACEHOLDER}
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value.slice(0, MAX_CATEGORY_NAME_LEN))
            }
            onKeyDown={onKeyDown}
            placeholder={ADD_PLACEHOLDER}
            aria-label="새 카테고리 이름"
            maxLength={MAX_CATEGORY_NAME_LEN}
            className="absolute inset-0 box-border min-h-7 min-w-0 w-full border-0 bg-transparent py-1 pl-2 pr-1 leading-normal text-[#D6FDE5]/85 outline-none placeholder:text-[#D6FDE5]/40 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
