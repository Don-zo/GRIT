import { useState } from "react";

export default function TodoCamCard() {
    const tabs = ["이유민", "김윤영", "양준영", "이차현"];
    const [currentTab, setCurrentTab] = useState("이유민");

    return (
        <div className="flex bg-[#1C1E27] w-screen h-screen">
            <div className="w-11/12" />

            <div className="flex flex-col items-start w-1/3 mt-20">
                {/* 탭 줄 */}
                <div className="relative flex self-start">
                    {tabs.map((name, idx) => {
                        const isActive = currentTab === name;
                        // 왼쪽 탭이 위에, 오른쪽으로 갈수록 밑으로
                        const z = tabs.length - idx; // 4,3,2,1...

                        return (
                            <div
                                key={name}
                                onClick={() => setCurrentTab(name)}
                                style={{ zIndex: z }}
                                className={`
                                    round-except-bt w-auto px-6 py-[4px] text-[14px] cursor-pointer
                                    relative transition-all
                                    ${idx !== 0 ? "ml-[-8px]" : ""}

                                    ${
                                        isActive
                                            ? "bg-[#E5E5E5] text-[#284F43] font-semibold"
                                            : "bg-[#284F43] text-white font-light shadow-[0_-2px_6px_rgba(0,0,0,0.25)]"
                                    }
                                `}
                            >
                                {name}
                            </div>
                        );
                    })}
                </div>

                {/* 카드 박스 (탭 바로 아래, 왼쪽 정렬) */}
                <div
                    className="
                        bg-[#E5E5E5] h-[150px] w-96 round-except-tl p-4
                        shadow-[0_4px_14px_rgba(0,0,0,0.15)]
                    "
                >
                    <p className="text-black text-bodyMd">{currentTab}님의 카드 정보</p>
                </div>
            </div>
        </div>
    );
}