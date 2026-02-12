export default function Header() {
  return (
    <header className="w-full bg-gray-100 px-10 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-green-semidark/80">GRIT</h1>

        <div className="flex gap-3">
          <button className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer">
            로그인
          </button>
          <button className="px-6 py-2 rounded-lg bg-green-semidark/80 text-white text-sm shadow-md hover:bg-green-semidark transition cursor-pointer">
            회원가입
          </button>
        </div>
      </div>
    </header>
  );
}
