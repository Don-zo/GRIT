"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Play } from "lucide-react";
import ToggleBtn from "@/components/ToggleBtn";

type PomodoroModalProps = {
  open: boolean;
  onClose?: () => void;
  onStart?: (config: {
    studyMinutes: number;
    breakMinutes: number;
    repeat: number;
    enabled: boolean;
  }) => void;
  initialStudyMinutes?: number;
  initialRepeat?: number;
};

const ONE_HOUR_MINUTES = 60;

const clampStudyMinutes = (value: number) => {
  const rounded = Math.round(value / 5) * 5;
  if (rounded < 5) return 5;
  if (rounded > 55) return 55;
  return rounded;
};

function PomodoroPreview({
  studyMinutes,
  onChangeStudyMinutes,
  size = 150,
  strokeWidth = 22,
}: {
  studyMinutes: number;
  onChangeStudyMinutes: (minutes: number) => void;
  size?: number;
  strokeWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = studyMinutes / ONE_HOUR_MINUTES;
  const visibleLen = circumference * ratio;

  const breakMinutes = ONE_HOUR_MINUTES - studyMinutes;
  const angleDeg = ratio * 360 - 90;
  const angleRad = (angleDeg * Math.PI) / 180;
  const knobDistance = radius - strokeWidth / 2 + 5;
  const knobX = size / 2 + knobDistance * Math.cos(angleRad);
  const knobY = size / 2 + knobDistance * Math.sin(angleRad);

  const getMinutesFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    if (dx === 0 && dy === 0) return null;
    const degreeFromXAxis = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalized = (degreeFromXAxis + 450) % 360; // rotate start to top
    const minutes = (normalized / 360) * ONE_HOUR_MINUTES;
    return clampStudyMinutes(minutes);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const minutes = getMinutesFromPointer(event.clientX, event.clientY);
      if (minutes !== null) {
        onChangeStudyMinutes(minutes);
      }
    },
    [getMinutesFromPointer, onChangeStudyMinutes]
  );

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, isDragging]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    setIsDragging(true);
    const minutes = getMinutesFromPointer(event.clientX, event.clientY);
    if (minutes !== null) {
      onChangeStudyMinutes(minutes);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.9}
        height={size * 0.9}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2A2E36"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#A9443E"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${visibleLen} ${circumference}`}
        />
      </svg>

      <span
        onPointerDown={handlePointerDown}
        className="absolute w-3 h-3 bg-white rounded-full cursor-pointer"
        style={{
          left: knobX,
          top: knobY,
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="absolute flex flex-col items-center">
        <div className="flex items-end gap-1 leading-none">
          <span className="text-[32px] font-semibold text-white">
            {studyMinutes}
          </span>
          <span className="text-sm text-white mb-[2px]">분</span>
        </div>
        <span className="mt-1 text-xs text-gray-300">
          쉬는시간 {breakMinutes}분
        </span>
      </div>
    </div>
  );
}

export default function PomodoroModal({
  open,
  onClose,
  onStart,
  initialStudyMinutes = 45,
  initialRepeat = 1,
}: PomodoroModalProps) {
  if (!open) return null;

  const [studyMinutes, setStudyMinutes] = useState(
    clampStudyMinutes(initialStudyMinutes)
  );
  const [repeat, setRepeat] = useState(initialRepeat);
  const [enabled, setEnabled] = useState(true);

  const breakMinutes = ONE_HOUR_MINUTES - studyMinutes;

  const handleChangeRepeat = (delta: number) => {
    setRepeat((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 12) return 12;
      return next;
    });
  };

  const handleStart = () => {
    if (!enabled) {
      onClose?.();
      return;
    }
    onStart?.({
      studyMinutes,
      breakMinutes,
      repeat,
      enabled,
    });
    onClose?.();
  };

  return (
    <div
      className="absolute z-50 -translate-x-1/2 left-1/2"
      style={{ bottom: "calc(100% + 20px)" }}
    >
      <div
        className="
          relative
          w-[400px]
          bg-gray-dark/100
          rounded-2xl
          px-6 pt-4 pb-7
          shadow-xl
          text-white
          flex flex-col gap-4
        "
      >
        <div
          className="absolute w-8 h-8 rotate-45 -translate-x-1/2 rounded-md left-1/2 -bottom-2 bg-inherit"
        />

        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold">뽀모도로 설정</span>
          <div
            className={`pomodoro-toggle ${!enabled ? "pomodoro-toggle--off" : ""}`}
          >
            <ToggleBtn checked={enabled} onChange={setEnabled} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <PomodoroPreview
              studyMinutes={studyMinutes}
              onChangeStudyMinutes={setStudyMinutes}
            />
          </div>

          <div className="flex flex-col flex-1 gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white text-bodyMd">반복 횟수</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChangeRepeat(-1)}
                  className="flex items-center justify-center leading-none rounded-full text-h3 w-7 h-7"
                >
                  -
                </button>
                <div className="flex items-center justify-center w-10 h-10 text-h3 font-semibold bg-[#2B2B2B] rounded-lg">
                  {repeat}
                </div>
                <button
                  type="button"
                  onClick={() => handleChangeRepeat(1)}
                  className="flex items-center justify-center leading-none rounded-full text-h3 w-7 h-7"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={handleStart}
            className="flex items-center justify-center w-1/3 max-w-[160px] gap-2 py-2 text-sm transition-colors bg-[#2C2C2C] rounded-lg hover:bg-black/80"
          >
            <Play size={14} fill="currentColor" stroke="none" />
            <span>시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}