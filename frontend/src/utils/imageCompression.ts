type CompressImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
};

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

  // EXIF Orientation을 반영해 비트맵을 생성 - 안 하면 모바일 세로 사진이 옆으로 눕는다.
  const imageBitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxWidth / imageBitmap.width, maxHeight / imageBitmap.height);
  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    imageBitmap.close();
    return file;
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  // PNG은 투명도를 잃지 않도록 원본 포맷을 유지하고, 그 외(주로 사진)는 JPEG로 변환해 용량을 더 줄인다.
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outputType, quality),
  );

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const fileName =
    outputType === "image/jpeg" && !/\.jpe?g$/i.test(file.name)
      ? `${file.name.replace(/\.[^./]+$/, "")}.jpg`
      : file.name;

  return new File([blob], fileName, { type: outputType });
}
