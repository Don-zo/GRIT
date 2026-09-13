import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Category } from "@/pages/Todo/components/types";

type RoomCategorySelectProps = {
  categories: Category[];
  categoryId: string;
  onCategoryIdChange: (id: string) => void;
};

export default function RoomCategorySelect({
  categories,
  categoryId,
  onCategoryIdChange,
}: RoomCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ left: 0, top: 0, width: 160 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const syncPanelPosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(140, r.width);
    let left = r.left;
    if (left + width > window.innerWidth - 6) {
      left = Math.max(6, window.innerWidth - width - 6);
    }
    setPanelPos({ left, top: r.bottom + 4, width });
  };

  useLayoutEffect(() => {
    if (!open) return;
    syncPanelPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = categories.find((c) => c.id === categoryId);

  const panel = open ? (
    <div
      ref={popoverRef}
      role="listbox"
      aria-label="카테고리 선택"
      style={{
        position: "fixed",
        left: panelPos.left,
        top: panelPos.top,
        width: panelPos.width,
        zIndex: 80,
      }}
      className="overflow-hidden rounded-md border border-gray-normal bg-white shadow-lg"
    >
      {categories.length === 0 ? (
        <p className="px-3 py-3 text-caption text-gray-semidark">
          등록된 카테고리가 없어요.
        </p>
      ) : (
        <ul className="list-none max-h-[16rem] overflow-y-auto py-1">
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onCategoryIdChange(active ? "" : c.id);
                    if (!active) setOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-bodySm ${
                    active
                      ? "bg-green-normal/15 font-semibold text-green-dark"
                      : "text-green-darkest hover:bg-gray-light"
                  }`}
                >
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
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
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex cursor-pointer select-none items-center gap-1 rounded-full bg-gray-normal px-2.5 py-1 text-caption"
      >
        {selected ? (
          <>
            <span className="font-semibold text-green-dark">
              {selected.label}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCategoryIdChange("");
              }}
              aria-label="카테고리 해제"
              className="text-gray-semidark"
            >
              <X size={10} />
            </button>
          </>
        ) : (
          <span className="text-gray-semidark">카테고리 선택</span>
        )}
      </div>
      {panel ? createPortal(panel, document.body) : null}
    </>
  );
}
