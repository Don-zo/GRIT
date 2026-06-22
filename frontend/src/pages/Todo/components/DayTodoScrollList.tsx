import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SCROLL_EDGE = 6;

function useScrollMoreBelow(ref: React.RefObject<HTMLUListElement | null>) {
  const [showMore, setShowMore] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) {
      setShowMore(false);
      return;
    }
    const overflow = el.scrollHeight - el.clientHeight;
    const hasMore = overflow > SCROLL_EDGE;
    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EDGE;
    setShowMore(hasMore && !atBottom);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  return showMore;
}

type DayTodoScrollListProps = {
  children: ReactNode;
};

export default function DayTodoScrollList({ children }: DayTodoScrollListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const showMore = useScrollMoreBelow(listRef);

  const scrollDown = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight * 0.72, behavior: "smooth" });
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ul
        ref={listRef}
        className="relative z-[1] flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain list-none px-2 pt-2 pb-4 [scrollbar-gutter:stable]"
      >
        {children}
      </ul>

      <div
        className={`absolute inset-x-0 bottom-0 z-[2] flex justify-center transition-opacity duration-300 ease-out ${
          showMore ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!showMore}
      >
        <button
          type="button"
          tabIndex={showMore ? 0 : -1}
          onClick={scrollDown}
          className="group/scroll-more relative flex w-full flex-col items-center pb-2 pt-8"
          aria-label="아래로 스크롤하여 더 보기"
        >
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#2A2F38] from-25% via-[#2A2F38]/70 to-transparent"
            aria-hidden
          />
          <ChevronDown
            className="relative text-white/40 transition-colors group-hover/scroll-more:text-white/65"
            size={18}
            strokeWidth={2.25}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}
