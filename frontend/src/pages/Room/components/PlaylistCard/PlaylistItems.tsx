import type { PlaylistItemsProps } from "@/types/playlist";

export default function PlaylistItems({
  items,
  selectedIndex = 0,
}: PlaylistItemsProps) {
  return (
    <div className="flex flex-col items-start justify-center w-full gap-2 mt-2">
      <h2 className="mt-5 font-semibold text-md text-green-dark">
        기본 플레이리스트
      </h2>

      {items.map((item, index) => {
        const isSelected = index === selectedIndex;

        return (
          <div
            key={index}
            className={`w-full h-[50px] rounded-2xl p-3 gap-2 flex items-center
                            ${isSelected ? "bg-green-dark" : "bg-gray-normal"}
                        `}
          >
            <span
              className={`pl-1 text-[13px] font-normal
                                ${
                                  isSelected
                                    ? "text-gray-light"
                                    : "text-gray-semidark"
                                }
                            `}
            >
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
}
