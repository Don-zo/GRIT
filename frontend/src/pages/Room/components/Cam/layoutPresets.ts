export function getLayoutPreset(count: number) {
    switch (count) {
      case 1:
        return [
          { id: 1, className: "col-start-1" },
        ];
  
      case 2:
        return [
            { id: 1, className: "col-start-1" },
            { id: 2, className: "col-start-2" },
        ];
  
        case 3:
          return [
            { id: 1, className: "col-start-3 col-end-7" },
            { id: 2, className: "col-start-1 col-end-5" },
            { id: 3, className: "col-start-5 col-end-9" },
            // { id: 1, className: "col-span-2 col-start-3" },
            // { id: 2, className: "col-span-2 col-start-2" },
            // { id: 3, className: "col-span-2 col-start-4" },
          ];        
  
      case 4:
        return [
          { id: 1, className: "col-start-1" },
          { id: 2, className: "col-start-2", nameBadgeLeftSpacing: "pl-18" },
          { id: 3, className: "col-start-1" },
          { id: 4, className: "col-start-2" },
        ];
  
      case 5:
        return [
          // { id: 1, className: "h-[80%] col-span-2 col-start-1" },
          // { id: 2, className: "h-[80%] col-span-2 col-start-3" },
          // { id: 3, className: "h-[80%] col-span-2 col-start-5" },
          // { id: 4, className: "h-[80%] col-span-2 col-start-2" },
          // { id: 5, className: "h-[80%] col-span-2 col-start-4" },
          { id: 1, className: "col-span-2 col-start-1" },
          { id: 2, className: "col-span-2 col-start-3" },
          { id: 3, className: "col-span-2 col-start-5" },
          { id: 4, className: "col-span-2 col-start-2", transform: "translateX(-96px)" },
          { id: 5, className: "col-span-2 col-start-4", transform: "translateX(96px)" },
        ];
  
      case 6:
        return [
          { id: 1, className: "col-span-4 row-span-2" },
          { id: 2, className: "col-span-2 col-start-5 row-start-1", avatarSize: 100 },
          { id: 3, className: "col-span-2 col-start-5 row-start-2", avatarSize: 100 },
          { id: 4, className: "col-span-2 col-start-1 row-start-3", avatarSize: 100 },
          { id: 5, className: "col-span-2 col-start-3 row-start-3", avatarSize: 100 },
          { id: 6, className: "col-span-2 col-start-5 row-start-3", avatarSize: 100 },
        ];

      case 7:
        return [
          { id: 1, className: "col-span-2 row-span-3" },
          { id: 2, className: "col-span-2 row-span-3", nameBadgeLeftSpacing: "pl-18" },
          { id: 3, className: "col-span-2 row-span-3" },
          { id: 4, className: "col-span-2 row-span-3" },
          { id: 5, className: "col-span-1 row-span-2 col-start-5 row-start-1", avatarSize: 100 },
          { id: 6, className: "col-span-1 row-span-2 col-start-5 row-start-3", avatarSize: 100 },
          { id: 7, className: "col-span-1 row-span-2 col-start-5 row-start-5", avatarSize: 100 },
        ];
  
      case 8:
        return [
          { id: 1, className: "col-span-3 col-start-1" },
          { id: 2, className: "col-span-3 col-start-4" },
          { id: 3, className: "col-span-3 col-start-7" },
          { id: 4, className: "col-span-3 col-start-2 row-start-2" },
          { id: 5, className: "col-span-3 col-start-6 row-start-2" },
          { id: 6, className: "col-span-3 col-start-1 row-start-3" },
          { id: 7, className: "col-span-3 col-start-4 row-start-3" },
          { id: 8, className: "col-span-3 col-start-7 row-start-3" },
        ];
        default:
            return [];
    }
}
  