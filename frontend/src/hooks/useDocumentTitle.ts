import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (!title) return;

    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
