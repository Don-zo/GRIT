import { useCallback, useEffect, useRef, useState } from "react";
import {
  columnCountForContainerWidth,
  type TodoWeekColumnCount,
} from "@/pages/Todo/components/todoWeekLayout";

export function useTodoWeekColumnCount() {
  const [columnCount, setColumnCount] = useState<TodoWeekColumnCount>(7);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const disconnectObserver = () => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  };

  const measure = useCallback(() => {
    const el = nodeRef.current;
    if (!el) return;
    const width = el.getBoundingClientRect().width;
    const next = columnCountForContainerWidth(width);
    setColumnCount((prev) => (prev === next ? prev : next));
  }, []);

  const layoutRef = useCallback(
    (node: HTMLDivElement | null) => {
      disconnectObserver();
      nodeRef.current = node;
      if (!node) return;

      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      observerRef.current = ro;
    },
    [measure],
  );

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      disconnectObserver();
    };
  }, [measure]);

  return { columnCount, layoutRef };
}
