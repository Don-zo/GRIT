import { useState, useRef, useEffect } from "react";

type ImageUploaderProps = {
  size?: number;
  initialImage?: string | null;
  onImageChange?: (file: File) => void;
  className?: string;
};

export function ImageUploader({
  size = 160,
  initialImage = null,
  onImageChange,
  className = "",
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

  return (
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
    </div>
  );
}
