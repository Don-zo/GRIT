import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

type ImageUploaderProps = {
  size?: number;
  initialImage?: string | null;
  onImageChange?: (file: File | null) => void;
  className?: string;
  clearButtonClassName?: string;
};

export function ImageUploader({
  size = 160,
  initialImage = null,
  onImageChange,
  className = "",
  clearButtonClassName = "",
}: ImageUploaderProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    setPreviewImage(initialImage);
  }, [initialImage]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange?.(file);

      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleImageClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    setPreviewImage(null);
    onImageChange?.(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative inline-block">
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
        style={{ height: size, width: size }}
        className={`relative overflow-hidden rounded-2xl bg-white shadow-md transition hover:opacity-80 ${className}`}
        aria-label="이미지 업로드"
      >
        {previewImage ? (
          <img
            src={previewImage}
            alt="이미지 미리보기"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-6xl font-light text-gray-300">
            +
          </span>
        )}
      </button>
      {previewImage ? (
        <button
          type="button"
          onClick={handleImageClear}
          aria-label="이미지 삭제"
          className={[
            "absolute -right-2 -top-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-white/30 bg-[#2B2F36] text-white shadow-md transition hover:opacity-90 cursor-pointer",
            clearButtonClassName,
          ].join(" ")}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
