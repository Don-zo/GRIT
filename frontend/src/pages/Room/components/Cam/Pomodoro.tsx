"use client";

import React, { useEffect, useState } from "react";
import type { PomodoroPhase } from "@/apis/domains/pomodoro/type";

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
  phase?: PomodoroPhase;
  focusEndsAt?: string | null;
  breakEndsAt?: string | null;
  currentRound?: number;
};

const getRemainingSeconds = (
  serverNow: string,
  endsAt: string | null | undefined,
) => {
  if (!endsAt) return 0;
  return Math.max(
    0,
    Math.floor((Date.parse(endsAt) - Date.parse(serverNow)) / 1000),
  );
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
  phase,
  focusEndsAt,
  breakEndsAt,
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
  const [serverRemainingSeconds, setServerRemainingSeconds] = useState(() =>
    isServerMode ? getRemainingSeconds(serverNow, phaseEndsAt) : 0,
  );
  const [currentRepeat, setCurrentRepeat] = useState(currentRound ?? 1);
  const [running, setRunning] = useState(autoStart);

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

  const radius = (size - calculatedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const studyRatio =
    cycleTotalSeconds > 0 ? studySeconds / cycleTotalSeconds : 0;
  const breakRatio =
    cycleTotalSeconds > 0 ? breakSeconds / cycleTotalSeconds : 0;

  const redInnerProgress =
    studySeconds > 0 ? Math.min(phaseElapsed, studySeconds) / studySeconds : 0;
  const redVisibleLen = circumference * studyRatio * redInnerProgress;

  const blueInnerProgress =
    !isStudy && breakSeconds > 0 ? phaseElapsed / breakSeconds : 0;
  const blueVisibleLen = circumference * breakRatio * blueInnerProgress;

  const redAngle = -90;
  const blueAngle = -90 + 360 * studyRatio;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isServerMode) return;
    setServerRemainingSeconds(getRemainingSeconds(serverNow, phaseEndsAt));
    setCurrentRepeat(currentRound ?? 1);
    setRunning(autoStart);
  }, [
    autoStart,
    currentRound,
    isServerMode,
    phaseEndsAt,
    serverNow,
  ]);

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

    const timer = setInterval(() => {
      setServerRemainingSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
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

          {blueVisibleLen > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#555555"
              strokeWidth={calculatedStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${blueVisibleLen} ${circumference}`}
              transform={`rotate(${blueAngle} ${size / 2} ${size / 2})`}
            />
          )}

          {redVisibleLen > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#A43F3D"
              strokeWidth={calculatedStrokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${redVisibleLen} ${circumference}`}
              transform={`rotate(${redAngle} ${size / 2} ${size / 2})`}
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
