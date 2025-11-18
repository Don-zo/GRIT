import type { PlaylistItemsProps } from "@/types/playlist";

export default function PlaylistItems({
  items,
  selectedIndex = 0,
}: PlaylistItemsProps) {
  return (
    <div className="w-full flex mt-2 flex-col gap-2 justify-center items-start">
      <h2 className="text-md font-semibold text-green-dark mt-5">
        기본 플레이리스트
      </h2>

      {items.map((item, index) => {
        const isSelected = index === selectedIndex;

        return (
          <div
            key={index}
            className={`w-full h-[50px] rounded-2xl p-3 gap-2 flex items-center
                            ${isSelected ? "bg-green-dark" : "bg-green-dark/20"}
                        `}
          >
            <span
              className={`pl-1 text-[13px] font-normal
                                ${
                                  isSelected
                                    ? "text-gray-light"
                                    : "text-green-semidark"
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
