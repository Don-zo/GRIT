export default function Avatar() {
    return (
        <div
            className="flex bg-green-semidark items-center justify-center rounded-full"
            style={{
                width: 160,
                height: 160,
            }}
        >
            <img
                src="/icons/avatar.svg"
                alt="avatar"
                className="w-2/4 h-2/4"
            />
        </div>
    );
}