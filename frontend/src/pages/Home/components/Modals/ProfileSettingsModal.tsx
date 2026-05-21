import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/contexts/ToastContext";
import { userApi } from "@/apis/domains/user/api";
import { fileApi } from "@/apis/domains/file/api";
import Modal from "@/components/Modal";
import { Divider } from "@/components/Divider";
import { FormInput } from "@/components/FormInput";
import { ImageUploader } from "@/components/ImageUploader";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import WeeklyStudyGoalPicker from "@/pages/Home/components/Modals/WeeklyStudyGoalPicker";
import {
  detectStudyGoalFormat,
  normalizeStudyGoalMinutes,
  parseStudyGoal,
  serializeStudyGoal,
  type StudyGoalApiFormat,
} from "@/utils/studyGoalTime";

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
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [nickname, setNickname] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [dDayDate, setDDayDate] = useState("");
  const [dDayTitle, setDDayTitle] = useState("");
  const [studyGoalHours, setStudyGoalHours] = useState(0);
  const [studyGoalMinutes, setStudyGoalMinutes] = useState(0);
  const [studyGoalApiFormat, setStudyGoalApiFormat] =
    useState<StudyGoalApiFormat>("korean");

  const { notify } = useToastContext();

  const {
    data: member,
    isLoading: isMemberInfoLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.member.me,
    queryFn: userApi.get,
    enabled: open,
    staleTime: 0,
  });

  useEffect(() => {
    if (!open || !member) return;

    const rawGoal = member.weeklyStudyTimeGoal;
    const { hours, minutes } = parseStudyGoal(rawGoal);

    setNickname(member.nickname);
    setIntroduction(member.introduction);
    setDDayDate(member.dDayDate ?? "");
    setDDayTitle(member.dDayTitle ?? "");
    setStudyGoalApiFormat(detectStudyGoalFormat(rawGoal));
    setStudyGoalHours(hours);
    setStudyGoalMinutes(normalizeStudyGoalMinutes(minutes));
    setImageFile(null);
    setIsImageRemoved(false);
  }, [open, member]);

  const queryClient = useQueryClient();

  const { mutateAsync: saveProfile, isPending } = useMutation({
    mutationFn: async () => {
      const trimmedNickname = nickname.trim();

      if (!trimmedNickname) throw new Error("닉네임을 입력해주세요");
      if (!introduction) throw new Error("소개를 입력해주세요");

      const weeklyStudyTimeGoal = serializeStudyGoal(
        studyGoalHours,
        studyGoalMinutes,
        studyGoalApiFormat,
      );

      const profilePayload = {
        nickname: trimmedNickname,
        introduction,
        dDayDate: dDayDate || null,
        dDayTitle: dDayTitle || null,
        weeklyStudyTimeGoal,
      };

      if (imageFile) {
        const imageName = await fileApi.uploadFileWithPresignedInfo(
          imageFile,
          userApi.getPresignedInfo,
        );

        if (isInitialProfile) {
          return userApi.createInitialInfo({
            ...profilePayload,
            imageName,
          });
        }

        return userApi.update({
          ...profilePayload,
          imageName,
        });
      }

      const imagePatch = isImageRemoved ? { imageName: null } : {};

      if (isInitialProfile) {
        return userApi.createInitialInfo({
          ...profilePayload,
          ...imagePatch,
        });
      }

      return userApi.update({
        ...profilePayload,
        ...imagePatch,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.member.me });
      notify("프로필이 저장되었습니다.", "success");
      onClose();
    },
    onError: (error) => {
      console.error("프로필 저장 에러", error);
      notify(
        error instanceof Error ? error.message : "저장에 실패했습니다.",
        "error",
      );
    },
  });

  const { mutate: checkNicknameDuplicate, isPending: isNicknameCheckPending } =
    useMutation({
      mutationFn: (trimmedNickname: string) =>
        userApi.checkNicknameAvailability(trimmedNickname),
      onSuccess: (data) => {
        if (data.isAvailable) {
          notify("사용 가능한 닉네임입니다.", "success");
        } else {
          notify("이미 사용중인 닉네임입니다.", "error");
        }
      },
      onError: (error) => {
        console.log("닉네임 사용 불가", error);
        notify("오류가 발생했습니다. 다시 시도해주세요.", "error");
      },
    });

  const handleCheckNicknameDuplicate = () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) return;
    checkNicknameDuplicate(trimmedNickname);
  };

  const handleSave = async () => {
    await saveProfile();
  };

  const isFormDisabled = isMemberInfoLoading || isPending;

  return (
    <Modal isOpen={open} onClose={onClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.CloseButton />

        <Modal.Header className="px-6 pt-6">
          <Modal.Title />
        </Modal.Header>

        <Modal.Body className="w-full px-6">
          {isError && (
            <p className="mb-4 text-sm text-red-400">
              내 정보를 불러오지 못했습니다.
            </p>
          )}
          <section className="w-full">
            <h2 className="text-base font-semibold text-[#D6FDE5]">
              개인 정보 설정
            </h2>

            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
              <ImageUploader
                size={144}
                initialImage={member?.imageUrl}
                className="shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                clearButtonClassName="-right-[-25px] -top-1 h-6 w-6"
                onImageChange={(file) => {
                  setImageFile(file);
                  setIsImageRemoved(file === null);
                }}
              />
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-2">
                  <FormInput
                    label="닉네임"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isFormDisabled}
                  />
                  <button
                    type="button"
                    onClick={handleCheckNicknameDuplicate}
                    disabled={isFormDisabled || isNicknameCheckPending}
                    className="inline-flex h-12 min-w-[84px] shrink-0 items-center justify-center rounded-lg bg-[#3E7358] px-3 text-sm text-[#EDFFF4] transition hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {isNicknameCheckPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : (
                      "중복 확인"
                    )}
                  </button>
                </div>
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
            <h3 className="text-base font-semibold text-[#D6FDE5]">
              D-day 설정
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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

          <section className="mb-4 w-full">
            <h3 className="text-base font-semibold text-[#D6FDE5]">
              이번주 목표 공부시간 설정
            </h3>

            <div className="mt-4">
              <WeeklyStudyGoalPicker
                hours={studyGoalHours}
                minutes={studyGoalMinutes}
                disabled={isFormDisabled}
                onHoursChange={setStudyGoalHours}
                onMinutesChange={setStudyGoalMinutes}
              />
            </div>
          </section>
        </Modal.Body>

        <Modal.Footer className="flex justify-center px-6 pb-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex h-12 w-full max-w-[320px] items-center justify-center rounded-lg bg-[#3E7358] text-base font-semibold text-[#EDFFF4] transition hover:bg-emerald-800 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
            ) : (
              "저장하기"
            )}
          </button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
