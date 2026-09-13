import { motion } from "motion/react";
import type { Variants } from "motion/react";

type SplitTextProps = {
  text: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
};

const containerVariants = (staggerChildren: number, delayChildren: number): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

const charVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function SplitText({
  text,
  className,
  delay = 0,
  staggerChildren = 0.035,
}: SplitTextProps) {
  const characters = Array.from(text);

  return (
    <motion.span
      className={className}
      style={{ display: "inline-block" }}
      initial="hidden"
      animate="visible"
      variants={containerVariants(staggerChildren, delay)}
      aria-label={text}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          aria-hidden="true"
          style={{ display: "inline-block", whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}
