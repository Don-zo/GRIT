import {
  useState,
  useCallback,
  useContext,
  createContext,
  type ReactNode,
  useMemo,
} from "react";
import Toast, { type ToastPayload } from "@/components/Toast";

type ToastVariant = "success" | "error";

type ToastContextValue = {
  notify: (text: string, variant?: ToastVariant) => void;
  clearToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastProviderProps = {
  children: ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const clearToast = useCallback(() => setToast(null), []);

  const notify = useCallback(
    (text: string, variant: ToastVariant = "success") => {
      setToast((prev) => ({
        key: (prev?.key ?? 0) + 1,
        text,
        variant,
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      notify,
      clearToast,
    }),
    [notify, clearToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClear={clearToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(
      "useToastContext는 ToastProvider 내부에서만 사용할 수 있습니다.",
    );
  }
  return context;
}
