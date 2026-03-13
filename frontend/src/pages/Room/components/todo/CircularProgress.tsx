import { useEffect, useRef, useState } from "react";

interface CircularProgressProps {
  value: number;
  size?: number;
  thickness?: number;
}

export default function CircularProgress({
  value,
  size = 55,
  thickness = 5,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const targetAngle = (clamped / 100) * 360;

  const [displayAngle, setDisplayAngle] = useState(0);
  const rafRef = useRef<number | null>(null);

  const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

  useEffect(() => {
    const duration = 700;
    const startTime = performance.now();
    const startAngle = displayAngle;
    const diff = targetAngle - startAngle;

    const animate = (now: number) => {
      let t = (now - startTime) / duration;
      if (t > 1) t = 1;

      const eased = easeOutQuad(t);
      setDisplayAngle(startAngle + diff * eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetAngle]);

  const ringRadius = size / 2 - thickness / 2;
  const dotSize = thickness + 5;
  const innerCircleSize = size - thickness * 2;
  const centerCircleSize = size - thickness * 4.5;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* 진행 링 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            from -360deg,
            #3E7358 0deg ${displayAngle}deg,
            #C5C8C7 ${displayAngle}deg 360deg
          )`,
        }}
      />

      {/* 시작점 */}
      <div
        className="absolute rounded-full bg-green-semidark"
        style={{
          top: "50%",
          left: "50%",
          width: thickness,
          height: thickness,
          transform: `translate(-50%, -50%) translateY(-${ringRadius}px)`,
          zIndex: 2,
        }}
      />

      {/* 끝 점 */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          zIndex: 3,
          transform: `rotate(${displayAngle}deg)`,
        }}
      >
        <div className="relative w-full h-full">
          <div
            className="absolute rounded-full bg-green-semidark"
            style={{
              top: "50%",
              left: "50%",
              width: dotSize,
              height: dotSize,
              transform: `translate(-50%, -50%) translateY(-${ringRadius}px)`,
            }}
          />
        </div>
      </div>

      {/* 내부 원 */}
      <div
        className="flex items-center justify-center rounded-full bg-[#CBCDCD]"
        style={{
          zIndex: 1,
          width: innerCircleSize,
          height: innerCircleSize,
        }}
      >
        <div
          className="flex items-center justify-center font-semibold text-white rounded-full bg-green-semidark select-none"
          style={{
            width: centerCircleSize,
            height: centerCircleSize,
            fontSize: size * 0.18,
          }}
        >
          {clamped}%
        </div>
      </div>
    </div>
  );
}
