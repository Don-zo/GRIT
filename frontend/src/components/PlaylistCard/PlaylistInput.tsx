import { useState } from "react";
import { Link } from 'lucide-react';

export default function playlistInput() {
    return (
        <div className="w-full h-[50px] bg-green-normal/50 rounded-2xl p-3 gap-2 flex items-center">
            <Link className="w-5 h-5 text-gray-dark"/>
            <input
                type="text"
                placeholder="유튜브 플레이리스트 링크를 입력하세요!"
                className="bg-transparent outline-none text-black text-[14px] font-light placeholder-gray-500 placeholder:text-[14px] placeholder:font-light flex-1"
            />
        </div>
    )
}