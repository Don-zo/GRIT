import React from "react";  
import { NameBadge } from "./NameBadge";
import Avatar from "./Avatar";
import { getLayoutPreset } from "./layoutPresets";

interface Participant {
  id: string;
  name: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  video?: React.ReactNode; // 실제 비디오 스트림 컴포넌트
}

type CamLayoutProps = {
  participants: Participant[];
  pomodoro?: React.ReactNode;
};

export default function CamLayout({ participants, pomodoro }: CamLayoutProps) {
  const count = participants.length;
  const layout = getLayoutPreset(count);

  const gridClass = (() => {
    switch (count) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2 grid-rows-1 py-20";
      case 3:
        return "grid-cols-8";
      case 4:
        return "grid-cols-2 grid-rows-2";
      case 5:
        return "grid-cols-6";
      case 6:
        return "grid-cols-6 grid-rows-3";
      case 7:
        return "grid-cols-5 grid-rows-6";
      case 8:
        return "grid-cols-9 grid-rows-3";
      default:
        return "grid-cols-3";
    }
  })();

  const verticalPadding = count === 5 ? "py-18" : "py-8";

  const pomodoroPositionClass = (() => {
    switch (count) {
      case 1:
        return "bottom-1 right-12";
      case 2:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case 3:
        return "top-6/11 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case 4:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case 5:
        return "bottom-25 left-1/2 -translate-x-1/2";
      case 6:
        return "bottom-55 right-115";
      case 7:
        return "top-1/2 left-113 -translate-y-1/2";
      case 8:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  })();


  return (
    <div
      className={`relative w-full h-full bg-gray-darkest px-18 ${verticalPadding}`}
    >
      <div className={`grid ${gridClass} gap-7 w-full h-full`}>
        {layout.map((box, index) => {
          const participant = participants[index];

          if (!participant) {
            return null;
          }

          return (
            <div
              key={box.id}
              className={`relative rounded-3xl bg-green-dark overflow-hidden ${box.className}`}
              style={'transform' in box && box.transform ? { transform: box.transform } : undefined}
            >
              <div className="flex items-center justify-center w-full h-full">
                {participant.video ?? <Avatar size={'avatarSize' in box && typeof box.avatarSize === 'number' ? box.avatarSize : undefined} />}
              </div>

              <div className={`absolute left-4 bottom-4 flex ${'nameBadgeLeftSpacing' in box && box.nameBadgeLeftSpacing ? box.nameBadgeLeftSpacing : ""}`}>
                <NameBadge
                  name={participant.name}
                  isMuted={participant.isMuted ?? false}
                  onToggleMute={participant.onToggleMute}
                />
              </div>
            </div>
          );
        })}

        {pomodoro && (
          <div
            className={`absolute z-50 ${pomodoroPositionClass}`}
          >
            {pomodoro}
          </div>
        )}
      </div>
    </div>
  );
}
