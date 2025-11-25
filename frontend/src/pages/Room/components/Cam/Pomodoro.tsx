"use client";

import React, { useEffect, useState } from "react";

type PomodoroProps = {
  studyMinutes: number;
  autoStart?: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
  onFinish?: () => void;
};

const ONE_HOUR_SECONDS = 3600;

const Pomodoro: React.FC<PomodoroProps> = ({
  studyMinutes,
  autoStart = true,
  size = 200,
  strokeWidth = 30,
  className = "",
  onFinish,
}) => {
  const studySeconds = studyMinutes * 60;
  const breakSeconds = Math.max(ONE_HOUR_SECONDS - studySeconds, 0);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);

  const isStudy = seconds < studySeconds;

  const phaseTotal = isStudy ? studySeconds : breakSeconds;
  const phaseElapsed = isStudy
    ? seconds
    : Math.min(seconds - studySeconds, breakSeconds);
  const remaining = Math.max(phaseTotal - phaseElapsed, 0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const studyRatio = studySeconds / ONE_HOUR_SECONDS;
  const breakRatio = breakSeconds / ONE_HOUR_SECONDS;

  const redInnerProgress =
    studySeconds > 0 ? Math.min(seconds, studySeconds) / studySeconds : 0;
  const redVisibleLen = circumference * studyRatio * redInnerProgress;

  const blueInnerProgress =
    !isStudy && breakSeconds > 0
      ? Math.min(seconds - studySeconds, breakSeconds) / breakSeconds
      : 0;
  const blueVisibleLen = circumference * breakRatio * blueInnerProgress;

  const redAngle = -90;
  const blueAngle = -90 + 360 * studyRatio;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;

        if (next >= ONE_HOUR_SECONDS) {
          clearInterval(timer);
          setRunning(false);
          onFinish?.();
          return ONE_HOUR_SECONDS;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, onFinish]);

  useEffect(() => {
    setSeconds(0);
    setRunning(autoStart);
  }, [studyMinutes, autoStart]);

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
            stroke="#2A2E36"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {blueVisibleLen > 0 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#353535"
              strokeWidth={strokeWidth}
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
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${redVisibleLen} ${circumference}`}
              transform={`rotate(${redAngle} ${size / 2} ${size / 2})`}
            />
          )}
        </svg>

        <div className="absolute flex flex-col items-center">
          {!isStudy && (
            <span className="text-[14px] text-sky-300 mb-1">쉬는시간</span>
          )}
          <span className="text-white font-semibold text-[28px] tracking-wide">
            {formatTime(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;