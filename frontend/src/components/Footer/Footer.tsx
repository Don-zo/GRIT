import { useState } from "react";
import PrivacyPolicyModal from "@/components/Footer/PrivacyPolicyModal";

type FooterProps = {
  variant?: "dark" | "light";
};

const variantStyles = {
  dark: {
    bg: "bg-gray-darkest",
    brand: "text-white",
    muted: "text-gray-semidark",
    link: "text-gray-semidark hover:text-white/80",
    separator: "text-gray-semidark",
  },
  light: {
    bg: "bg-[#eef0ee]",
    brand: "text-green-semidark/80",
    muted: "text-gray-semidark",
    link: "text-gray-semidark hover:text-[#222222]",
    separator: "text-gray-semidark",
  },
} as const;

export default function Footer({ variant = "dark" }: FooterProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const styles = variantStyles[variant];

  return (
    <>
      <footer className={`w-full shrink-0 ${styles.bg} px-16 py-10`}>
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className={`text-h2 font-bold leading-none ${styles.brand}`}>
              GRIT
            </p>
            <p className={`mt-3 text-bodySm ${styles.muted}`}>
              공간을 넘어 이어지는 우리만의 독서실
            </p>
          </div>

          <div
            className={`flex shrink-0 items-center gap-3 text-bodySm ${styles.muted}`}
          >
            <span>© 2026 GRIT</span>
            <span className={styles.separator}>|</span>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className={`${styles.link} transition-colors`}
            >
              개인정보처리방침
            </button>
          </div>
        </div>
      </footer>

      <PrivacyPolicyModal
        open={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </>
  );
}
