import { useState, useRef } from "react";
import BaseModal from "@/components/BaseModal";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-wide text-[#82C397]">
            GRIT
          </h1>
        </div>

        <section className="w-full">
          <h2 className="text-lg font-semibold text-[#D6FDE5]">
            개인 정보 설정
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleImageClick}
                className="relative h-[180px] w-[180px] overflow-hidden rounded-2xl bg-white shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:opacity-80"
                aria-label="프로필 이미지 업로드"
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="프로필 이미지 미리보기"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-6xl font-light text-gray-300">
                    +
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
                  닉네임
                </label>
                <input
                  type="text"
                  className="h-12 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
                  한 줄 소개
                </label>
                <input
                  type="text"
                  className="h-12 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="my-8 h-px w-full bg-[#82C397]/30" />

        <section className="w-full">
          <h3 className="text-lg font-semibold text-[#D6FDE5]">D-day 설정</h3>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
                D-day 날짜
              </label>

              <input
                type="date"
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#D6FDE5]">
                D-day 이름
              </label>
              <input
                type="text"
                className="h-12 w-full rounded-lg bg-white px-4 text-gray-900 outline-none"
              />
            </div>
          </div>
        </section>

        <div className="my-8 h-px w-full bg-[#82C397]/30" />

        <section className="w-full">
          <div className="flex items-end justify-between">
            <h3 className="text-lg font-semibold text-[#D6FDE5]">
              이번주 목표 공부시간 설정
            </h3>
            <span className="text-sm font-medium text-[#D6FDE5]">
              6시간 30분
            </span>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={12 * 60}
              defaultValue={390}
              className="w-full accent-[#82C397]"
            />
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            className="h-14 w-full max-w-[360px] rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition"
          >
            저장하기
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
