import type { DragEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import CustomCheckbox from "@/components/Checkbox";
import {
  tagEmptyLabel,
  tagListChipClass,
  tagListEmptyChipClass,
} from "@/pages/Todo/components/Tag/tagStyles";
import { DND_TODO_MIME } from "./weeklyTodo";
import type { TodoItem, TodoRowProps } from "./types";

const iconSvg =
  "h-3.5 w-3.5 shrink-0 transition-[stroke-width] duration-150 ease-out [stroke-width:1.5px] group-hover:[stroke-width:2.65px]";

const ghostEditBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-white/45 outline-none transition-colors hover:text-white/90 focus-visible:ring-1 focus-visible:ring-white/35 focus-visible:ring-offset-0";

const ghostDeleteBtn =
  "group inline-flex shrink-0 items-center justify-center p-0.5 text-red-300/80 outline-none transition-colors hover:text-red-100 focus-visible:ring-1 focus-visible:ring-red-400/50 focus-visible:ring-offset-0";

function TodoRowActions({
  todo,
  onEditTodo,
  onDeleteTodo,
}: {
  todo: TodoItem;
  onEditTodo: (todo: TodoItem) => void;
  onDeleteTodo: (id: string) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 pointer-events-none transition group-hover/row:pointer-events-auto group-hover/row:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100">
      <button
        type="button"
        onClick={() => onEditTodo(todo)}
        className={ghostEditBtn}
        aria-label="수정"
      >
        <Pencil className={iconSvg} absoluteStrokeWidth />
      </button>
      <button
        type="button"
        onClick={() => onDeleteTodo(todo.id)}
        className={ghostDeleteBtn}
        aria-label="삭제"
      >
        <Trash2 className={iconSvg} absoluteStrokeWidth />
      </button>
    </div>
  );
}

export default function TodoRow({
  todo,
  catLabel,
  onEditTodo,
  onDeleteTodo,
  onToggleComplete,
  weekDnD,
  isEditing = false,
}: TodoRowProps) {
  const done = todo.completed;

  const onWeekDragStart = (e: DragEvent<HTMLLIElement>) => {
    if (!weekDnD) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData(DND_TODO_MIME, todo.id);
    e.dataTransfer.setData("text/plain", todo.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const checkboxEl = (
    <CustomCheckbox
      checked={done}
      onChange={() => onToggleComplete(todo.id)}
      ariaLabel={done ? "완료 해제" : "완료"}
      size="sm"
    />
  );

  return (
    <li
      draggable={Boolean(weekDnD)}
      onDragStart={weekDnD ? onWeekDragStart : undefined}
      onDragEnd={weekDnD ? weekDnD.onDragEnd : undefined}
      className={`group/row relative rounded-md px-2 py-1.5 transition ${
        isEditing
          ? "bg-white/[0.06] ring-1 ring-inset ring-[#82C397]/45"
          : ""
      } ${weekDnD ? "cursor-grab active:cursor-grabbing" : ""} ${
        done ? "opacity-55" : ""
      }`}
    >
      <div className="flex flex-col w-full min-w-0 gap-1">
        <div className="flex w-full min-w-0 items-start justify-between gap-1.5">
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            <div className="shrink-0 pt-0.5">{checkboxEl}</div>
            {catLabel ? (
              <span className={tagListChipClass(done)}>{catLabel}</span>
            ) : (
              <span className={tagListEmptyChipClass(done)}>
                {tagEmptyLabel}
              </span>
            )}
          </div>
          <TodoRowActions
            todo={todo}
            onEditTodo={onEditTodo}
            onDeleteTodo={onDeleteTodo}
          />
        </div>
        <p
          className={`w-full min-w-0 max-w-full whitespace-pre-wrap break-words text-bodySm leading-snug pl-[calc(1rem+0.5rem)] ${
            done
              ? "text-white/40 line-through decoration-white/30"
              : "text-white/90"
          }`}
        >
          {todo.title}
        </p>
      </div>
    </li>
  );
}
