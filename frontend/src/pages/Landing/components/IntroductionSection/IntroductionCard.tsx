import LandingImageFrame from "../LandingImageFrame";

type IntroductionCardProps = {
  functionName: string;
  functionDescription: string;
  imageSrc?: string | string[];
  imageClassName?: string;
};

export default function IntroductionCard({
  functionName,
  functionDescription,
  imageSrc,
  imageClassName = "",
}: IntroductionCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
      <div className="text-center mb-8">
        <p className="text-lg text-[#4b5563] mb-2">{functionName}</p>
        <h2 className="text-2xl font-bold text-[#111827]">{functionDescription}</h2>
      </div>
      <LandingImageFrame>
        <div className={`absolute inset-0 rounded-2xl ${Array.isArray(imageSrc) ? "" : "overflow-hidden bg-[#d1d5db] shadow-md"}`}>
            {Array.isArray(imageSrc) ? (
              <div className="flex size-full items-center justify-center gap-8">
                {imageSrc.map((src, index) => (
                  <div
                    key={src}
                    className={`min-w-0 overflow-hidden shadow-md ${index === 0 ? "aspect-[772/660] w-[54%] rounded-xl" : "aspect-square w-[42%] rounded-full"}`}
                  >
                    <img
                      src={src}
                      alt={functionName}
                      className={`size-full rounded-xl object-contain ${imageClassName}`}
                    />
                  </div>
                ))}
              </div>
            ) : imageSrc ? (
              <img
                src={imageSrc}
                alt={functionName}
                className={`absolute inset-0 size-full object-cover ${imageClassName}`}
              />
            ) : null}
        </div>
      </LandingImageFrame>
    </div>
  );
}
