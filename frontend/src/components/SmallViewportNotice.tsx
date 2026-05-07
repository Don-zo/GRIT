import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const MIN_TABLET_WIDTH = 700;

interface SmallViewportNoticeProps {
  children: ReactNode;
}

export default function SmallViewportNotice({ children }: SmallViewportNoticeProps) {
  const [isSmallViewport, setIsSmallViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MIN_TABLET_WIDTH - 1}px)`);

    const updateViewportState = () => {
      setIsSmallViewport(mediaQuery.matches);
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => mediaQuery.removeEventListener("change", updateViewportState);
  }, []);

  if (!isSmallViewport) return <>{children}</>;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-darkest px-6 text-center">
      <p className="text-lg font-semibold text-white">
        이 화면은 태블릿 이상 해상도에서 이용할 수 있어요.
        <br />
        창 크기를 더 넓혀서 다시 시도해 주세요.
      </p>
    </div>
  );
}
