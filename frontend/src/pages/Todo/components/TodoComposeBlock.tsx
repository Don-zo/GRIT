import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import CustomCheckbox from "@/components/Checkbox";
import TagPicker from "./Tag/TagPicker";
import type { Category, TodoItem } from "@/pages/Todo/components/types";
import {
  weeklyComposeBlockBgClass,
  weeklyComposeBlockTodayBgClass,
  weeklyDueDayTone,
} from "@/pages/Todo/components/weeklyTodo";

type CategoryPickerSyncProps = {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  onCreateCategory?: (name: string) => { tempId: string };
  onRemoveCategory: (id: string) => void;
  onReorderCategories?: (orderedIds: string[]) => void;
  reorderDisabled?: boolean;
  categoryRemap: { tempId: string; realId: string } | null;
  onCategoryRemapConsumed: () => void;
  categoryCreateFailedTempId: string | null;
  onCategoryCreateFailedConsumed: () => void;
  notify?: (text: string, variant?: "success" | "error") => void;
};

type TodoComposeBlockBase = CategoryPickerSyncProps & {
  isDueDateToday?: boolean;
  onCancel: () => void;
  onSubmit: (item: {
    title: string;
    dueDate: string;
    categoryId: string;
  }) => void;
};

export type TodoComposeBlockProps = TodoComposeBlockBase &
  (
    | { variant: "create"; dueDate: string }
    | { variant: "edit"; todo: TodoItem; onDelete: () => void }
  );

const iconSvg =
  "h-3.5 w-3.5 shrink-0 transition-[stroke-width] duration-150 ease-out [stroke-width:1.5px] group-hover:[stroke-width:2.65px]";

const ghostIconBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-white/45 outline-none transition-colors hover:text-white/90 focus-visible:ring-1 focus-visible:ring-white/35 focus-visible:ring-offset-0";

const ghostDeleteBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-red-300/80 outline-none transition-colors hover:text-red-100 focus-visible:ring-1 focus-visible:ring-red-400/50 focus-visible:ring-offset-0";

const ghostSaveBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-[#82C397]/75 outline-none transition-colors hover:text-[#B8EDD0] focus-visible:ring-1 focus-visible:ring-[#82C397]/45 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:text-white/20";

function TodoComposeRowActionStripReserve() {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 pointer-events-none select-none"
      aria-hidden
    >
      <span className="inline-flex shrink-0 items-center justify-center p-0.5 opacity-0">
        <Pencil className={iconSvg} absoluteStrokeWidth />
      </span>
      <span className="inline-flex shrink-0 items-center justify-center p-0.5 opacity-0">
        <Trash2 className={iconSvg} absoluteStrokeWidth />
      </span>
    </div>
  );
}

export default function TodoComposeBlock(props: TodoComposeBlockProps) {
  const {
    variant,
    categories,
    setCategories,
    onCancel,
    onSubmit,
    onCreateCategory,
    onRemoveCategory,
    onReorderCategories,
    reorderDisabled,
    categoryRemap,
    onCategoryRemapConsumed,
    categoryCreateFailedTempId,
    onCategoryCreateFailedConsumed,
    notify,
    isDueDateToday = false,
  } = props;

  const isEdit = variant === "edit";
  const editSnapshot =
    props.variant === "edit"
      ? {
          id: props.todo.id,
          title: props.todo.title,
          categoryId: props.todo.categoryId,
          dueDate: props.todo.dueDate,
          completed: props.todo.completed,
        }
      : null;
  const dueDateStr =
    props.variant === "create" ? props.dueDate : props.todo.dueDate;
  const composeBgClass = isDueDateToday
    ? weeklyComposeBlockTodayBgClass
    : weeklyComposeBlockBgClass(weeklyDueDayTone(dueDateStr));
  const formKey =
    props.variant === "create" ? props.dueDate : props.todo.id;

  const [title, setTitle] = useState(() =>
    variant === "edit" ? props.todo.title : "",
  );
  const [categoryId, setCategoryId] = useState(() => {
    if (variant === "edit") {
      const id = props.todo.categoryId;
      if (id && categories.some((c) => c.id === id)) return id;
      return "";
    }
    return "";
  });

  const titleRef = useRef<HTMLTextAreaElement>(null);

  const syncTitleHeight = useCallback(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (!editSnapshot) return;
    setTitle(editSnapshot.title);
  }, [editSnapshot?.id, editSnapshot?.title]);

  useEffect(() => {
    if (!editSnapshot) return;
    setCategoryId((prev) => {
      const id = editSnapshot.categoryId;
      // 편집 중 사용자가 고른 태그(연속 등록 포함)가 스냅샷 원본보다 우선
      if (prev && categories.some((c) => c.id === prev)) return prev;
      // 서버 응답 전 opt- 임시 id가 목록에서 실제 id로 바뀌는 순간 prev가 잠깐 목록에 없을 수 있음
      if (prev?.startsWith("opt-")) return prev;
      if (id && categories.some((c) => c.id === id)) return id;
      return "";
    });
  }, [editSnapshot?.id, editSnapshot?.categoryId, categories]);

  useEffect(() => {
    if (isEdit) return;
    setCategoryId((prev) => {
      if (prev && categories.some((c) => c.id === prev)) return prev;
      if (prev?.startsWith("opt-")) return prev;
      return "";
    });
  }, [isEdit, categories]);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.focus();
    syncTitleHeight();
    if (isEdit) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [formKey, isEdit, syncTitleHeight]);

  useLayoutEffect(() => {
    syncTitleHeight();
  }, [title, syncTitleHeight]);

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

  const canDeleteCategory = categories.length > 0;
  const canSave = title.trim().length > 0;

  const handleRemoveCategory = (id: string) => {
    if (!canDeleteCategory) return;
    onRemoveCategory(id);
    if (categoryId === id) setCategoryId("");
  };

  const save = () => {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      dueDate: dueDateStr.trim(),
      categoryId,
    });
    if (!isEdit) setTitle("");
  };

  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    onCancel();
  };

  const onTitleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      save();
    }
  };

  const checkboxChecked = editSnapshot?.completed ?? false;
  const checkboxLabel = editSnapshot
    ? editSnapshot.completed
      ? "완료됨"
      : "미완료"
    : "새 할 일";

  return (
    <div
      className={`group relative flex flex-col rounded-md px-2 py-1.5 outline-none ${composeBgClass}`}
      onKeyDown={onRootKeyDown}
    >
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <div className="flex w-full min-w-0 items-start justify-between gap-1.5">
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            <div className="pointer-events-none shrink-0 pt-0.5">
              <CustomCheckbox
                checked={checkboxChecked}
                onChange={() => {}}
                ariaLabel={checkboxLabel}
                size="sm"
              />
            </div>
            <TagPicker
              categories={categories}
              categoryId={categoryId}
              onCategoryIdChange={setCategoryId}
              setCategories={setCategories}
              canDeleteCategory={canDeleteCategory}
              onRemoveCategory={handleRemoveCategory}
              onCreateCategory={onCreateCategory}
              onReorderCategories={onReorderCategories}
              reorderDisabled={reorderDisabled}
              onDuplicateTagRegister={
                notify
                  ? () => notify("이미 등록된 태그예요.", "error")
                  : undefined
              }
            />
          </div>
          <TodoComposeRowActionStripReserve />
        </div>
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onTitleKeyDown}
          rows={1}
          placeholder="할 일"
          className="min-h-[1.25rem] w-full min-w-0 resize-none overflow-hidden border-0 bg-transparent pl-[calc(1rem+0.5rem)] text-bodySm leading-snug text-white/90 outline-none placeholder:text-white/35"
          aria-label="할 일 제목"
        />
      </div>
      <div className="mt-2 flex items-center border-t border-white/10 pt-2">
        {isEdit ? (
          <button
            type="button"
            onClick={props.onDelete}
            className={ghostDeleteBtn}
            aria-label="삭제"
          >
            <Trash2 className={iconSvg} absoluteStrokeWidth />
          </button>
        ) : null}
        <span className="min-w-0 flex-1" aria-hidden />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onCancel}
            className={ghostIconBtn}
            aria-label="취소"
          >
            <X className={iconSvg} absoluteStrokeWidth />
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={save}
            className={ghostSaveBtn}
            aria-label="저장"
          >
            <Check className={iconSvg} absoluteStrokeWidth />
          </button>
        </div>
      </div>
    </div>
  );
}
