import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/apis/services/user";
import type { CreateMemberRequest } from "@/apis/types";
import Modal from "@/components/Modal";
import { Divider } from "@/components/Divider";
import { FormInput } from "@/components/FormInput";
import { ImageUploader } from "@/components/ImageUploader";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";

type ProfileSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  isInitialProfile: boolean;
};

export default function ProfileSettingsModal({
  open,
  onClose,
  isInitialProfile,
}: ProfileSettingsModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [dDayDate, setDDayDate] = useState("");
  const [dDayTitle, setDDayTitle] = useState("");
  const [weeklyStudyTimeGoal, setWeeklyStudyTimeGoal] = useState("");

  const {
    data: member,
    isLoading: isMemberInfoLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
    enabled: open,
  });

  useEffect(() => {
    if (!open || !member) return;
    setNickname(member.nickname);
    setIntroduction(member.introduction);
    setDDayDate(member.dDayDate ?? "");
    setDDayTitle(member.dDayTitle ?? "");
    setWeeklyStudyTimeGoal(member.weeklyStudyTimeGoal ?? "");
    setImageFile(null);
  }, [open, member]);

  const queryClient = useQueryClient();

  const { mutateAsync: saveProfile, isPending } = useMutation({
    mutationFn: async () => {
      const trimmedNickname = nickname.trim();

      if (!trimmedNickname) {
        throw new Error("닉네임을 입력해주세요");
      }

      if (!introduction) {
        throw new Error("소개를 입력해주세요");
      }

      if (isInitialProfile) {
        return userApi.createInitialInfo({
          nickname: trimmedNickname,
          introduction: introduction,
          dDayDate: dDayDate || null,
          dDayTitle: dDayTitle || null,
          weeklyStudyTimeGoal: weeklyStudyTimeGoal || null,
        });
      }
      return userApi.update({
        nickname: trimmedNickname,
        introduction: introduction,
        dDayDate: dDayDate || null,
        dDayTitle: dDayTitle || null,
        weeklyStudyTimeGoal: weeklyStudyTimeGoal || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.member.me });
      onClose();
    },
    onError: (error) => {
      console.error("프로필 초기화 에러", error);
    },
  });

  const handleSave = async () => {
    await saveProfile();
  };

  const isFormDisabled = isMemberInfoLoading || isPending;

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />

        <Modal.Header className="px-8 pt-8">
          <Modal.Title />
        </Modal.Header>

        <Modal.Body className="px-8 w-full">
          {isError && (
            <p className="mb-4 text-sm text-red-400">
              내 정보를 불러오지 못했습니다.
            </p>
          )}
          <section className="w-full">
            <h2 className="text-lg font-semibold text-[#D6FDE5]">
              개인 정보 설정
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
              <ImageUploader
                size={180}
                className="shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                onImageChange={(file) => setImageFile(file)}
              />
              <div className="flex flex-col gap-5">
                <FormInput
                  label="닉네임"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isFormDisabled}
                />
                <FormInput
                  label="한 줄 소개"
                  type="text"
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Divider />

          <section className="w-full">
            <h3 className="text-lg font-semibold text-[#D6FDE5]">D-day 설정</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormInput
                label="D-day 날짜"
                type="date"
                value={dDayDate}
                onChange={(e) => setDDayDate(e.target.value)}
              />
              <FormInput
                label="D-day 이름"
                type="text"
                value={dDayTitle}
                onChange={(e) => setDDayTitle(e.target.value)}
              />
            </div>
          </section>

          <Divider />

          <section className="w-full">
            <div className="flex items-end justify-between">
              <h3 className="text-lg font-semibold text-[#D6FDE5]">
                이번주 목표 공부시간 설정
              </h3>
              <span className="text-sm font-medium text-[#D6FDE5]">
                6시간 30분
              </span>
            </div>

            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={12 * 60}
                defaultValue={390}
                className="w-full accent-[#82C397]"
              />
            </div>
          </section>
        </Modal.Body>

        <Modal.Footer className="px-8 pb-8 flex justify-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-14 w-full max-w-[360px] rounded-lg bg-[#3E7358] text-lg font-semibold text-[#EDFFF4] hover:bg-emerald-800 transition disabled:opacity-50"
          >
            {isPending ? "저장 중..." : "저장하기"}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
