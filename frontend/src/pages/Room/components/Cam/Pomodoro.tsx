"use client";

import React, { useEffect, useRef, useState } from "react";
import type { PomodoroPhase, PomodoroStatus } from "@/apis/domains/pomodoro/type";

type PomodoroProps = {
  studyMinutes: number;
  breakMinutes: number;
  repeat?: number;
  autoStart?: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
  onFinish?: () => void;
  serverNow?: string;
  status?: PomodoroStatus;
  phase?: PomodoroPhase;
  focusEndsAt?: string | null;
  breakEndsAt?: string | null;
  pausedAt?: string | null;
  currentRound?: number;
};

const Pomodoro: React.FC<PomodoroProps> = ({
  studyMinutes,
  breakMinutes,
  repeat = 1,
  autoStart = true,
  size = 200,
  strokeWidth,
  className = "",
  onFinish,
  serverNow,
  status,
  phase,
  focusEndsAt,
  breakEndsAt,
  pausedAt,
  currentRound,
}) => {
  const calculatedStrokeWidth = strokeWidth ?? size * 0.15;
  const studySeconds = Math.max(studyMinutes, 0) * 60;
  const breakSeconds = Math.max(breakMinutes, 0) * 60;
  const cycleTotalSeconds = studySeconds + breakSeconds;
  const totalRepeats = Math.max(repeat, 1);
  const isServerMode = serverNow != null;

  const phaseEndsAt = phase === "FOCUS" ? focusEndsAt : breakEndsAt;

  const [secondsInCycle, setSecondsInCycle] = useState(0);
  const clockOffsetRef = useRef(0);
  const prevServerNowRef = useRef<string | undefined>(undefined);
  const [, forceTick] = useState(0);
  const [currentRepeat, setCurrentRepeat] = useState(currentRound ?? 1);
  const [running, setRunning] = useState(autoStart);

  if (isServerMode && serverNow && serverNow !== prevServerNowRef.current) {
    prevServerNowRef.current = serverNow;
    clockOffsetRef.current = Date.parse(serverNow) - Date.now();
  }

  const isPausedServer = isServerMode && status === "PAUSED";

  const serverRemainingMs = !isServerMode
    ? 0
    : isPausedServer && phaseEndsAt && serverNow
      ? Math.max(0, Date.parse(phaseEndsAt) - Date.parse(serverNow))
      : phaseEndsAt
        ? Math.max(
            0,
            Date.parse(phaseEndsAt) - (Date.now() + clockOffsetRef.current),
          )
        : 0;
  const serverRemainingSeconds = Math.floor(serverRemainingMs / 1000);

  const isStudy = isServerMode ? phase === "FOCUS" : secondsInCycle < studySeconds;

  const phaseTotal = isStudy ? studySeconds : breakSeconds;
  const phaseElapsed = isServerMode
    ? Math.max(phaseTotal - serverRemainingSeconds, 0)
    : isStudy
      ? secondsInCycle
      : Math.min(secondsInCycle - studySeconds, breakSeconds);
  const remaining = isServerMode
    ? serverRemainingSeconds
    : Math.max(phaseTotal - phaseElapsed, 0);
  const remainingExact = isServerMode
    ? serverRemainingMs / 1000
    : Math.max(phaseTotal - phaseElapsed, 0);

  const radius = (size - calculatedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const activePhaseSeconds = isStudy ? studySeconds : breakSeconds;
  const remainingRatio =
    activePhaseSeconds > 0
      ? Math.min(Math.max(remainingExact / activePhaseSeconds, 0), 1)
      : 0;
  const progressVisibleLen = circumference * remainingRatio;
  const progressColor = isStudy ? "#A43F3D" : "#555555";
  const progressAngle = -90;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isServerMode) return;
    setCurrentRepeat(currentRound ?? 1);
    setRunning(autoStart);
    forceTick((t) => t + 1);
  }, [autoStart, currentRound, isServerMode, phaseEndsAt, serverNow]);

  useEffect(() => {
    if (isServerMode || !running || cycleTotalSeconds <= 0) return;

    const timer = setInterval(() => {
      setSecondsInCycle((prev) => {
        const next = prev + 1;

        if (next >= cycleTotalSeconds) {
          if (currentRepeat < totalRepeats) {
            setCurrentRepeat((r) => r + 1);
            return 0;
          }

          clearInterval(timer);
          setRunning(false);
          onFinish?.();
          return cycleTotalSeconds;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, cycleTotalSeconds, totalRepeats, currentRepeat, onFinish, isServerMode]);

  useEffect(() => {
    if (!isServerMode || !running) return;

    let frameId = requestAnimationFrame(function tick() {
      forceTick((t) => t + 1);
      frameId = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frameId);
  }, [isServerMode, running]);

  useEffect(() => {
    if (isServerMode) return;
    setSecondsInCycle(0);
    setCurrentRepeat(1);
    setRunning(autoStart);
  }, [studyMinutes, breakMinutes, repeat, autoStart, isServerMode]);

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: "#1C1E27",
        }}
      >
        <svg
          width={size * 0.8}
          height={size * 0.8}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#353535"
            strokeWidth={calculatedStrokeWidth}
            fill="none"
          />

          {progressVisibleLen > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressColor}
              strokeWidth={calculatedStrokeWidth}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${progressVisibleLen} ${circumference}`}
              transform={`rotate(${progressAngle} ${size / 2} ${size / 2})`}
            />
          )}
        </svg>

        <div className="absolute flex flex-col items-center">
          {!isStudy && (
            <span
              className="text-[#555555] mb-1"
              style={{ fontSize: `${size * 0.07}px` }}
            >
              쉬는시간
            </span>
          )}
          <span
            className="text-white font-semibold tracking-wide"
            style={{ fontSize: `${size * 0.14}px` }}
          >
            {formatTime(remaining)}
          </span>
          <span
            className="mt-1 leading-none text-gray-400"
            style={{ fontSize: `${size * 0.05}px` }}
          >
            {currentRepeat} / {totalRepeats}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
