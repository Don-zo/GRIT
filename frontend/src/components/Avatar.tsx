interface AvatarProps {
  size?: number;
  src?: string | null;
}

export default function Avatar({ size = 140, src }: AvatarProps) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-semidark"
      style={{
        width: size,
        height: size,
      }}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <img
          src="/icons/avatar.svg"
          alt="avatar"
          style={{
            width: size * 0.5,
            height: size * 0.5,
          }}
        />
      )}
    </div>
  );
}
