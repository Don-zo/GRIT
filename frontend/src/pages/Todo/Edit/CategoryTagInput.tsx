import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import { X } from "lucide-react";
import type { Category } from "@/pages/Todo/types";

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
}: CategoryTagInputProps) {
  const [query, setQuery] = useState("");

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
      <div className="flex flex-wrap items-stretch gap-1.5">
        {categories.map((c) => {
          const active = categoryId === c.id;
          return (
            <div
              key={c.id}
              className={`group/cat inline-flex items-stretch overflow-hidden rounded-lg text-xs font-medium transition ${
                active
                  ? "ring-[1.5px] ring-inset ring-[#82C397]/50"
                  : "ring-1 ring-inset ring-white/12"
              }`}
            >
              <button
                type="button"
                onClick={() => onCategoryIdChange(active ? "" : c.id)}
                className={`min-h-7 px-2 py-1 transition ${
                  active
                    ? "bg-green-semidark text-[#EDFFF4] group-hover/cat:bg-emerald-800"
                    : "bg-white/10 text-[#D6FDE5]/85 group-hover/cat:bg-white/15"
                }`}
              >
                {c.label}
              </button>
              <button
                type="button"
                disabled={!canDeleteCategory}
                title={
                  canDeleteCategory
                    ? `${c.label} 삭제`
                    : "카테고리는 최소 1개 필요해요"
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCategory(c.id);
                }}
                className={`group/del flex items-center justify-center pl-1 pr-1.5 transition disabled:cursor-not-allowed disabled:opacity-35 ${
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
          );
        })}

        <div className="relative inline-block min-h-7 min-w-0 max-w-full overflow-x-auto rounded-lg bg-white/10 text-xs font-medium ring-1 ring-inset ring-white/12 transition focus-within:bg-white/[0.12] focus-within:ring-[1.5px] focus-within:ring-[#82C397]/50">
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
