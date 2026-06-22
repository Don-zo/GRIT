import { useCallback, useState } from "react";
import type { ToastPayload } from "@/components/Toast";

export function useToast() {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  const notify = useCallback(
    (text: string, variant: "success" | "error" = "success") => {
      setToast((prev) => ({
        key: (prev?.key ?? 0) + 1,
        text,
        variant,
      }));
    },
    [],
  );

  return { toast, clearToast, notify };
}
