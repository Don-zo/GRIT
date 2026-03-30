import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

export type TodoToastPayload = {
  key: number;
  text: string;
  variant: "success" | "error";
};

type TodoToastProps = {
  toast: TodoToastPayload | null;
  onClear: () => void;
};

export default function TodoToast({ toast, onClear }: TodoToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onClear, 2800);
    return () => window.clearTimeout(id);
  }, [toast, onClear]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-8 md:pb-10"
      aria-live={toast?.variant === "error" ? "assertive" : "polite"}
    >
      <AnimatePresence mode="wait">
        {toast ? (
          <motion.div
            key={toast.key}
            role={toast.variant === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[min(100%,20rem)] rounded-xl border border-white/[0.09] bg-[#2B2F36]/92 px-3.5 py-2.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  toast.variant === "success"
                    ? "bg-[#82C397]/18 text-[#82C397]"
                    : "bg-tomato/18 text-[#e8a8a6]"
                }`}
                aria-hidden
              >
                {toast.variant === "success" ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </span>
              <span
                className={`min-w-0 flex-1 text-left text-[13px] font-medium leading-snug tracking-tight ${
                  toast.variant === "success"
                    ? "text-[#D6FDE5]/90"
                    : "text-[#f0d6d5]/95"
                }`}
              >
                {toast.text}
              </span>
            </div>
            <span
              className={`mx-auto mt-2.5 block h-px w-8 rounded-full ${
                toast.variant === "success"
                  ? "bg-[#82C397]/35"
                  : "bg-tomato/40"
              }`}
              aria-hidden
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
