import { Copy } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

type GroupCodeBadgeProps = {
  groupCode: string;
};

export default function GroupCodeBadge({ groupCode }: GroupCodeBadgeProps) {
  const { notify } = useToastContext();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(groupCode);
      notify("그룹 코드가 복사되었습니다.", "success");
    } catch {
      notify("복사에 실패했습니다.", "error");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="그룹 코드 복사"
      title="복사"
      className="pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-dark/60 px-3 py-1.5 text-white transition-colors hover:bg-gray-dark/75"
    >
      <span className="text-[11px] font-medium tracking-wide">
        {groupCode}
      </span>
      <Copy className="h-2.5 w-2.5 shrink-0 opacity-90" strokeWidth={2.5} />
    </button>
  );
}
