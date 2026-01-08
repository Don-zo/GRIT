interface AvatarProps {
    size?: number;
}

export default function Avatar({ size = 160 }: AvatarProps) {
    return (
        <div
            className="flex bg-green-semidark items-center justify-center rounded-full"
            style={{
                width: size,
                height: size,
            }}
        >
            <img
                src="/icons/avatar.svg"
                alt="avatar"
                style={{
                    width: size * 0.5,
                    height: size * 0.5,
                }}
            />
        </div>
    );
}