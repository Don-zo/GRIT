import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronLeft } from "lucide-react";
import CategoryTagInput from "./CategoryTagInput";
import type { Category, TodoItem } from "@/pages/Todo/components/types";

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type EditCardProps = {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  onRemoveCategory: (id: string) => void;
  onCreateCategory?: (name: string) => { tempId: string };
  categoryRemap: { tempId: string; realId: string } | null;
  onCategoryRemapConsumed: () => void;
  categoryCreateFailedTempId: string | null;
  onCategoryCreateFailedConsumed: () => void;
  editingTodo: TodoItem | null;
  onCancelEdit: () => void;
  onAddTodo: (item: {
    title: string;
    dueDate: string;
    categoryId: string;
  }) => void;
  onUpdateTodo: (
    id: string,
    item: { title: string; dueDate: string; categoryId: string },
  ) => void;
  onDeleteTodo: (id: string) => void;
  onReorderCategories?: (orderedIds: string[]) => void;
  reorderDisabled?: boolean;
};

const EditCard = ({
  categories,
  setCategories,
  onRemoveCategory: onRemoveCategoryFromPage,
  onCreateCategory,
  categoryRemap,
  onCategoryRemapConsumed,
  categoryCreateFailedTempId,
  onCategoryCreateFailedConsumed,
  editingTodo,
  onCancelEdit,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onReorderCategories,
  reorderDisabled,
}: EditCardProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => localDateKey());
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDueDate(editingTodo.dueDate.trim() || localDateKey());
      setCategoryId(editingTodo.categoryId);
    } else {
      setTitle("");
      setDueDate(localDateKey());
      setCategoryId("");
    }
  }, [editingTodo]);

  useEffect(() => {
    if (!categoryRemap) return;
    setCategoryId((prev) =>
      prev === categoryRemap.tempId ? categoryRemap.realId : prev,
    );
    onCategoryRemapConsumed();
  }, [categoryRemap, onCategoryRemapConsumed]);

  useEffect(() => {
    if (!categoryCreateFailedTempId) return;
    setCategoryId((id) =>
      id === categoryCreateFailedTempId ? "" : id,
    );
    onCategoryCreateFailedConsumed();
  }, [categoryCreateFailedTempId, onCategoryCreateFailedConsumed]);

  const isEditing = editingTodo !== null;

  const canSubmit =
    title.trim().length > 0 && dueDate.trim().length > 0;
  const canDeleteCategory = categories.length > 1;

  const handleRemoveCategory = (id: string) => {
    if (!canDeleteCategory) return;
    onRemoveCategoryFromPage(id);
    if (categoryId === id) setCategoryId("");
  };

  const handleAddTodo = () => {
    if (!canSubmit) return;
    onAddTodo({
      title: title.trim(),
      dueDate: dueDate.trim(),
      categoryId,
    });
    setTitle("");
    setDueDate(localDateKey());
    setCategoryId("");
  };

  const handleUpdateTodo = () => {
    if (!canSubmit || !editingTodo) return;
    onUpdateTodo(editingTodo.id, {
      title: title.trim(),
      dueDate: dueDate.trim(),
      categoryId,
    });
  };

  const handleDeleteTodo = () => {
    if (!editingTodo) return;
    onDeleteTodo(editingTodo.id);
  };

  return (
    <aside className="relative mx-6 my-20 flex min-h-0 min-w-0 flex-[1] flex-col overflow-hidden rounded-3xl bg-[#2B2F36] p-8 shadow-2xl">
      <div className="shrink-0">
        {isEditing ? (
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onCancelEdit}
              className="-ml-0.5 shrink-0 rounded-md p-1 text-[#D6FDE5]/70 transition hover:bg-white/10 hover:text-[#D6FDE5]"
              aria-label="수정 취소"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <h2 className="min-w-0 text-h3 font-semibold text-white">
              할 일 수정
            </h2>
          </div>
        ) : (
          <h2 className="text-h3 font-semibold text-white">새 할 일</h2>
        )}
        <div className="my-4 border-b border-gray-semidark" />
      </div>

      <div className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto">
        <section className="mb-4 w-full">
          <label
            htmlFor="todo-title"
            className="mb-2 block text-xs font-medium text-[#D6FDE5]"
          >
            할 일 내용
            <span className="ml-0.5 text-white" aria-hidden>
              *
            </span>
          </label>
          <textarea
            id="todo-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={2}
            placeholder="내용을 입력하세요"
            className="min-h-9 w-full resize-none rounded-lg bg-white px-3 py-2 text-xs leading-normal text-gray-900 outline-none placeholder:text-gray-500"
          />
        </section>

        <section className="mb-4 w-full">
          <label
            htmlFor="todo-due-date"
            className="mb-2 block text-xs font-medium text-[#D6FDE5]"
          >
            마감일
            <span className="ml-0.5 text-white" aria-hidden>
              *
            </span>
          </label>
          <div className="flex min-w-0 items-stretch gap-2">
            <input
              id="todo-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="min-w-0 flex-1 rounded-lg bg-white px-3 py-0 text-xs leading-normal text-gray-900 outline-none h-9"
            />
            <button
              type="button"
              onClick={() => setDueDate(localDateKey())}
              className="flex h-9 shrink-0 items-center justify-center rounded-lg bg-white/10 px-3 text-xs font-semibold text-[#82C397] transition hover:bg-white/15"
            >
              오늘
            </button>
          </div>
        </section>

        <section className="w-full">
          <CategoryTagInput
            categories={categories}
            categoryId={categoryId}
            onCategoryIdChange={setCategoryId}
            setCategories={setCategories}
            canDeleteCategory={canDeleteCategory}
            onRemoveCategory={handleRemoveCategory}
            onCreateCategory={onCreateCategory}
            onReorderCategories={onReorderCategories}
            reorderDisabled={reorderDisabled}
          />
        </section>
      </div>

      <div className="flex shrink-0 justify-center pt-5">
        {isEditing ? (
          <div className="flex w-full max-w-[280px] gap-2">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleUpdateTodo}
              className="h-10 min-w-0 flex-1 rounded-lg bg-[#3E7358] text-sm font-semibold text-[#EDFFF4] transition hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-40"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDeleteTodo}
              className="h-10 shrink-0 rounded-lg border border-tomato/55 bg-transparent px-4 text-sm font-semibold text-tomato transition hover:bg-tomato/10"
            >
              삭제
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleAddTodo}
            className="h-10 w-full max-w-[280px] rounded-lg bg-[#3E7358] text-sm font-semibold text-[#EDFFF4] transition hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-40"
          >
            추가
          </button>
        )}
      </div>
    </aside>
  );
};

export default EditCard;
