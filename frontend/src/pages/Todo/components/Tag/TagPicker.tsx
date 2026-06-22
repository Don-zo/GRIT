import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type PointerEvent,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import { GripVertical, X } from "lucide-react";
import type { Category } from "@/pages/Todo/components/types";
import {
  tagEmptyLabel,
  tagPickerChipClearBtnClass,
  tagPickerHintClass,
  tagPickerListRowSelectedClass,
  tagPickerRegisterInputClass,
  tagPickerRowLabelInListClass,
  tagPickerSelectedChipClass,
  tagPickerTriggerPlaceholderClass,
} from "./tagStyles";

const MAX_CATEGORY_NAME_LEN = 50;
const REGISTER_HINT = "태그 등록";
const EMPTY_LIST_HINT = "아직 태그가 없어요. 위에서 새로 만들 수 있어요.";
const PANEL_HINT = "태그 선택 또는 생성";
const DELETE_TAG_DISABLED_TITLE = "삭제할 태그가 없어요";

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

const reorderShiftTransition =
  "transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 1)";

const tagRowDeleteIconClass =
  "h-3.5 w-3.5 shrink-0 transition-[stroke-width] duration-150 ease-out [stroke-width:1.5px] group-hover:[stroke-width:2.65px]";

const tagRowGhostDeleteBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-white/45 outline-none transition-colors hover:text-white/90 focus-visible:ring-1 focus-visible:ring-white/35 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-30";

function siblingShiftPx(
  index: number,
  from: number,
  insertBefore: number,
  rowH: number,
): number {
  if (index === from) return 0;
  if (from < insertBefore) {
    if (index > from && index < insertBefore) return -rowH;
    return 0;
  }
  if (from > insertBefore) {
    if (index >= insertBefore && index < from) return rowH;
    return 0;
  }
  return 0;
}

type RowBand = { top: number; bottom: number };

function snapshotRowBands(
  listEl: HTMLDivElement,
  ids: string[],
  rowMap: Map<string, HTMLLIElement>,
): RowBand[] {
  const lr = listEl.getBoundingClientRect();
  const st = listEl.scrollTop;
  const bands: RowBand[] = [];
  for (const id of ids) {
    const el = rowMap.get(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    const top = r.top - lr.top + st;
    bands.push({ top, bottom: top + r.height });
  }
  return bands;
}

function insertBeforeFromContentY(y: number, bands: RowBand[]): number {
  for (let i = 0; i < bands.length; i++) {
    const mid = (bands[i].top + bands[i].bottom) / 2;
    if (y < mid) return i;
  }
  return bands.length;
}

type TagPickerProps = {
  categories: Category[];
  categoryId: string;
  onCategoryIdChange: (id: string) => void;
  setCategories: Dispatch<SetStateAction<Category[]>>;
  canDeleteCategory: boolean;
  onRemoveCategory: (id: string) => void;
  onCreateCategory?: (name: string) => { tempId: string };
  onReorderCategories?: (orderedIds: string[]) => void;
  reorderDisabled?: boolean;
  onDuplicateTagRegister?: () => void;
};

type DragSession = {
  pointerId: number;
  draggedId: string;
  startClientY: number;
  rowTop0: number;
  rowH: number;
  prevUserSelect: string;
  rowBands: RowBand[];
};

export default function TagPicker({
  categories,
  categoryId,
  onCategoryIdChange,
  setCategories,
  canDeleteCategory,
  onRemoveCategory,
  onCreateCategory,
  onReorderCategories,
  reorderDisabled = false,
  onDuplicateTagRegister,
}: TagPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelPos, setPanelPos] = useState({ left: 0, top: 0, width: 220 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragDy, setDragDy] = useState(0);
  const [dragHoverBefore, setDragHoverBefore] = useState<number | null>(null);
  const [dragRowHeight, setDragRowHeight] = useState(0);
  const [selectionHold, setSelectionHold] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const dragSessionRef = useRef<DragSession | null>(null);
  const dragPointerCleanupRef = useRef<(() => void) | null>(null);

  const canReorder =
    Boolean(onReorderCategories) && categories.length > 1 && !reorderDisabled;

  const setRowRef = useCallback((id: string, el: HTMLLIElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, []);

  const syncPanelPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = Math.min(320, Math.max(200, r.width));
    let left = r.left;
    if (left + w > window.innerWidth - 6) left = Math.max(6, window.innerWidth - w - 6);
    if (left < 6) left = 6;
    setPanelPos({ left, top: r.bottom + 4, width: w });
  };

  useLayoutEffect(() => {
    if (!open) return;
    syncPanelPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollResize = () => syncPanelPosition();
    window.addEventListener("resize", onScrollResize);
    window.addEventListener("scroll", onScrollResize, true);
    return () => {
      window.removeEventListener("resize", onScrollResize);
      window.removeEventListener("scroll", onScrollResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  useEffect(() => {
    if (!selectionHold) return;
    if (selectionHold.id !== categoryId) {
      setSelectionHold(null);
      return;
    }
    if (categories.some((c) => c.id === categoryId)) {
      setSelectionHold(null);
    }
  }, [categories, categoryId, selectionHold]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: globalThis.MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const endDragSession = useCallback(() => {
    dragPointerCleanupRef.current?.();
    dragPointerCleanupRef.current = null;
    const s = dragSessionRef.current;
    if (s) document.body.style.userSelect = s.prevUserSelect;
    dragSessionRef.current = null;
    setDraggingId(null);
    setDragDy(0);
    setDragHoverBefore(null);
    setDragRowHeight(0);
  }, []);

  useEffect(() => {
    if (!open) endDragSession();
  }, [open, endDragSession]);

  useEffect(() => {
    return () => endDragSession();
  }, [endDragSession]);

  const reorderWithInsert = useCallback(
    (draggedId: string, insertBeforeIndex: number) => {
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
    },
    [categories, onReorderCategories],
  );

  const clampDy = useCallback(
    (rawDy: number, session: DragSession): number => {
      const list = listScrollRef.current;
      if (!list) return rawDy;
      const listRect = list.getBoundingClientRect();
      const minD = listRect.top - session.rowTop0;
      const maxD = listRect.bottom - session.rowTop0 - session.rowH;
      return Math.max(minD, Math.min(maxD, rawDy));
    },
    [],
  );

  const onGripPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>, id: string) => {
      if (!canReorder || e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const row = rowRefs.current.get(id);
      const list = listScrollRef.current;
      if (!row || !list) return;

      const rowRect = row.getBoundingClientRect();
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const ids = categories.map((c) => c.id);
      const rowBands = snapshotRowBands(list, ids, rowRefs.current);
      if (rowBands.length !== categories.length) {
        document.body.style.userSelect = prevUserSelect;
        return;
      }

      const y0 =
        e.clientY - list.getBoundingClientRect().top + list.scrollTop;
      const hover0 = insertBeforeFromContentY(y0, rowBands);

      const session: DragSession = {
        pointerId: e.pointerId,
        draggedId: id,
        startClientY: e.clientY,
        rowTop0: rowRect.top,
        rowH: rowRect.height,
        prevUserSelect,
        rowBands,
      };
      dragSessionRef.current = session;
      setDraggingId(id);
      setDragDy(0);
      setDragRowHeight(rowRect.height);
      setDragHoverBefore(hover0);

      const onMove = (ev: globalThis.PointerEvent) => {
        if (ev.pointerId !== session.pointerId) return;
        const rawDy = ev.clientY - session.startClientY;
        setDragDy(clampDy(rawDy, session));
        const listEl = listScrollRef.current;
        if (!listEl) return;
        const y =
          ev.clientY - listEl.getBoundingClientRect().top + listEl.scrollTop;
        setDragHoverBefore(insertBeforeFromContentY(y, session.rowBands));
      };

      const finishDrag = (ev: globalThis.PointerEvent, commit: boolean) => {
        if (ev.pointerId !== session.pointerId) return;
        dragPointerCleanupRef.current?.();
        dragPointerCleanupRef.current = null;
        document.body.style.userSelect = session.prevUserSelect;
        const dragged = session.draggedId;
        const bands = session.rowBands;
        dragSessionRef.current = null;
        setDraggingId(null);
        setDragDy(0);
        setDragHoverBefore(null);
        setDragRowHeight(0);
        if (commit) {
          const listEl = listScrollRef.current;
          if (listEl) {
            const y =
              ev.clientY -
              listEl.getBoundingClientRect().top +
              listEl.scrollTop;
            reorderWithInsert(dragged, insertBeforeFromContentY(y, bands));
          }
        }
      };

      const onPointerUp = (ev: globalThis.PointerEvent) =>
        finishDrag(ev, true);
      const onPointerCancel = (ev: globalThis.PointerEvent) =>
        finishDrag(ev, false);

      const detachPointer = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
      };
      dragPointerCleanupRef.current = detachPointer;

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
    },
    [canReorder, categories, clampDy, reorderWithInsert],
  );

  const commitInput = () => {
    const label = query.trim().slice(0, MAX_CATEGORY_NAME_LEN);
    if (!label) return;

    const duplicate = categories.some(
      (c) => c.label.trim().toLowerCase() === label.toLowerCase(),
    );
    if (duplicate) {
      onDuplicateTagRegister?.();
      setQuery("");
      return;
    }

    if (onCreateCategory) {
      const { tempId } = onCreateCategory(label);
      if (tempId) {
        setSelectionHold({ id: tempId, label });
        onCategoryIdChange(tempId);
      }
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    const id = addOrSelectByLabel(query, categories, setCategories);
    if (id) {
      setSelectionHold({ id, label });
      onCategoryIdChange(id);
    }
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDownInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    commitInput();
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    setOpen((v) => !v);
  };

  const selectedInList = categories.find((c) => c.id === categoryId);
  const triggerSelected =
    selectedInList ??
    (selectionHold?.id === categoryId
      ? { id: selectionHold.id, label: selectionHold.label }
      : undefined);

  const toggleTag = (c: Category) => {
    const active = categoryId === c.id;
    if (active) onCategoryIdChange("");
    else {
      onCategoryIdChange(c.id);
      setOpen(false);
    }
  };

  const listScrollClassName =
    "max-h-[min(85vh,28rem)] [scrollbar-gutter:stable] py-0.5";
  const listScrollOverflowClass = draggingId
    ? "overflow-y-hidden"
    : "overflow-y-auto";

  const panel = open ? (
    <div
      ref={popoverRef}
      role="listbox"
      aria-label="태그 선택"
      style={{
        position: "fixed",
        left: panelPos.left,
        top: panelPos.top,
        width: panelPos.width,
        zIndex: 80,
      }}
      className="overflow-hidden rounded-md border border-white/5 bg-[#2A2F38] shadow-lg"
    >
      <div className="border-b border-white/8 px-3 py-1.5">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value.slice(0, MAX_CATEGORY_NAME_LEN))
          }
          onKeyDown={onKeyDownInput}
          placeholder={REGISTER_HINT}
          aria-label={REGISTER_HINT}
          maxLength={MAX_CATEGORY_NAME_LEN}
          className={tagPickerRegisterInputClass}
        />
      </div>
      <p className={tagPickerHintClass}>{PANEL_HINT}</p>
      {canReorder ? (
        <div
          ref={listScrollRef}
          className={`${listScrollClassName} ${listScrollOverflowClass}`}
        >
          {categories.length === 0 ? (
            <p className="px-3 py-3 text-[11px] leading-snug text-white/40">
              {EMPTY_LIST_HINT}
            </p>
          ) : (
          <ul className="list-none">
            {categories.map((c, i) => {
              const active = categoryId === c.id;
              const isDragging = draggingId === c.id;
              const fromIdx = draggingId
                ? categories.findIndex((x) => x.id === draggingId)
                : -1;
              const shiftPx =
                draggingId !== null &&
                dragHoverBefore !== null &&
                fromIdx >= 0 &&
                dragRowHeight > 0
                  ? siblingShiftPx(i, fromIdx, dragHoverBefore, dragRowHeight)
                  : 0;
              let transform: string | undefined;
              if (isDragging) transform = `translateY(${dragDy}px)`;
              else if (shiftPx !== 0) transform = `translateY(${shiftPx}px)`;

              const shiftTransition =
                draggingId && !isDragging ? reorderShiftTransition : undefined;

              return (
                <li
                  key={c.id}
                  ref={(el) => setRowRef(c.id, el)}
                  style={{
                    transform,
                    transition: isDragging ? undefined : shiftTransition,
                    zIndex: isDragging ? 10 : undefined,
                    position: isDragging ? "relative" : undefined,
                    touchAction: isDragging ? "none" : undefined,
                  }}
                  className={`flex items-center gap-1.5 px-1.5 py-0.5${
                    active ? ` ${tagPickerListRowSelectedClass}` : ""
                  }`}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => onGripPointerDown(e, c.id)}
                    className="flex items-center justify-center w-4 h-5 transition rounded select-none touch-none shrink-0 cursor-grab text-white/25 active:cursor-grabbing"
                    aria-label={`${c.label} 순서 변경`}
                    title="드래그하여 순서 변경"
                  >
                    <GripVertical className="w-3 h-3" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleTag(c)}
                    className={tagPickerRowLabelInListClass}
                  >
                    {c.label}
                  </button>
                  <button
                    type="button"
                    disabled={!canDeleteCategory}
                    title={
                      canDeleteCategory
                        ? `${c.label} 삭제`
                        : DELETE_TAG_DISABLED_TITLE
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canDeleteCategory) return;
                      onRemoveCategory(c.id);
                      if (categoryId === c.id) onCategoryIdChange("");
                    }}
                    className={`${tagRowGhostDeleteBtn} ml-auto shrink-0`}
                    aria-label={`${c.label} 삭제`}
                  >
                    <X className={tagRowDeleteIconClass} absoluteStrokeWidth />
                  </button>
                </li>
              );
            })}
          </ul>
          )}
        </div>
      ) : (
        <div
          ref={listScrollRef}
          className={`${listScrollClassName} overflow-y-auto`}
        >
          {categories.length === 0 ? (
            <p className="px-3 py-3 text-[11px] leading-snug text-white/40">
              {EMPTY_LIST_HINT}
            </p>
          ) : (
          <ul className="list-none">
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <li
                  key={c.id}
                  className={`flex items-center gap-1.5 px-1.5 py-0.5${
                    active ? ` ${tagPickerListRowSelectedClass}` : ""
                  }`}
                >
                  <span
                    className="flex items-center justify-center w-4 h-5 shrink-0 text-white/15"
                    aria-hidden
                  >
                    <GripVertical className="w-3 h-3" strokeWidth={2} />
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleTag(c)}
                    className={tagPickerRowLabelInListClass}
                  >
                    {c.label}
                  </button>
                  <button
                    type="button"
                    disabled={!canDeleteCategory}
                    title={
                      canDeleteCategory
                        ? `${c.label} 삭제`
                        : DELETE_TAG_DISABLED_TITLE
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canDeleteCategory) return;
                      onRemoveCategory(c.id);
                      if (categoryId === c.id) onCategoryIdChange("");
                    }}
                    className={`${tagRowGhostDeleteBtn} ml-auto shrink-0`}
                    aria-label={`${c.label} 삭제`}
                  >
                    <X className={tagRowDeleteIconClass} absoluteStrokeWidth />
                  </button>
                </li>
              );
            })}
          </ul>
          )}
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        role="combobox"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={triggerSelected ? "태그" : tagEmptyLabel}
        onKeyDown={onTriggerKeyDown}
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-0 max-w-full flex-1 flex-wrap items-center gap-1.5 rounded text-left outline-none transition hover:opacity-90 focus-visible:ring-1 focus-visible:ring-white/25"
      >
        {triggerSelected ? (
          <span className={tagPickerSelectedChipClass}>
            <span className="min-w-0 truncate">{triggerSelected.label}</span>
            <button
              type="button"
              className={tagPickerChipClearBtnClass}
              aria-label="태그 해제"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryIdChange("");
              }}
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </span>
        ) : null}
        {triggerSelected ? (
          <span className="min-h-6 min-w-2 flex-1" aria-hidden />
        ) : (
          <>
            <span className={tagPickerTriggerPlaceholderClass}>
              {tagEmptyLabel}
            </span>
            <span className="min-h-6 min-w-2 flex-1" aria-hidden />
          </>
        )}
      </div>
      {panel ? createPortal(panel, document.body) : null}
    </>
  );
}
