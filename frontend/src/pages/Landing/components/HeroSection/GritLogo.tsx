import { motion } from "motion/react";

const VIEW_BOX = "0 0 1520 416";
const STROKE_COLOR = "#447C60";

const LETTER_DURATION: Record<string, number> = {
  G: 2,
  R: 2,
  I: 2,
  T: 2,
  ".": 2,
};

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: ({ delay, duration }: { delay: number; duration: number }) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay, type: "spring" as const, duration, bounce: 0 },
      opacity: { delay, duration: 0.01 },
    },
  }),
};

const dotFade = {
  hidden: { opacity: 0 },
  visible: ({ delay }: { delay: number }) => ({
    opacity: 1,
    transition: { opacity: { delay, duration: 1.2, ease: "easeOut" } },
  }),
};

const strokeGap = 1;
const strokePartGap = 0.5;

type GritLogoProps = {
  startDelay?: number;
};

export default function GritLogo({ startDelay = 0.5 }: GritLogoProps) {
  const tG = startDelay;
  const tR = tG + strokeGap;
  const tI = tR + strokeGap;
  const tT = tI + strokeGap;
  const tDot = tT + strokeGap;

  return (
    <svg
      className="h-[150px] w-auto -mt-6"
      viewBox={VIEW_BOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(8px 8px 8px rgba(0,0,0,0.25))" }}
    >
      {/* G */}
      <motion.path
        d="M303.513 134.65C303.513 83.65 251.958 42.2285 174.513 45.1279C41.0125 50.1257 45.0127 206.127 45.0127 206.127C45.0127 206.127 44.7071 287.199 83.0123 326.127C113.155 356.76 147.445 372.744 187.013 370.127C315.513 361.627 315.513 219.65 315.513 219.65H187.013"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tG, duration: LETTER_DURATION.G }}
        initial="hidden"
        animate="visible"
      />

      {/* R */}
      <motion.path
        d="M492.513 4.12695V402.627"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tR, duration: LETTER_DURATION.R * 0.5 }}
        initial="hidden"
        animate="visible"
      />
      <motion.path
        d="M492.513 49.127H602.513C602.513 49.127 709.513 46.627 709.513 136.627C709.513 200.428 663.649 220.694 634.513 227.131M492.513 230.127H611.013C611.013 230.127 620.95 230.127 634.513 227.131"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tR + strokePartGap, duration: LETTER_DURATION.R * 0.5 }}
        initial="hidden"
        animate="visible"
      />
      <motion.path
        d="M634.513 227.131C596.013 219.627 709.513 335.627 709.513 402.627"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tR + strokePartGap * 2, duration: LETTER_DURATION.R * 0.5 }}
        initial="hidden"
        animate="visible"
      />

      {/* I */}
      <motion.path
        d="M889.513 4.12695V403.627"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tI, duration: LETTER_DURATION.I }}
        initial="hidden"
        animate="visible"
      />

      {/* T */}
      <motion.path
        d="M1013.01 45.127H1360.51"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tT, duration: LETTER_DURATION.T * 0.45 }}
        initial="hidden"
        animate="visible"
      />
      <motion.path
        d="M1186.76 45.127V404.127"
        stroke={STROKE_COLOR}
        strokeWidth={90}
        fill="transparent"
        variants={draw}
        custom={{ delay: tT + strokePartGap, duration: LETTER_DURATION.T * 0.55 }}
        initial="hidden"
        animate="visible"
      />

      {/* . */}
      <motion.path
        d="M1469.01 351.627V355.127"
        stroke={STROKE_COLOR}
        strokeWidth={100}
        fill="transparent"
        strokeLinecap="round"
        variants={dotFade}
        custom={{ delay: tDot }}
        initial="hidden"
        animate="visible"
      />
    </svg>
  );
}
