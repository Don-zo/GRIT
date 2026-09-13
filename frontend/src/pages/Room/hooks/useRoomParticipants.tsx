import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import VideoTile from "@/pages/Room/components/Cam/VideoTile";
import {
  getParticipantMatchKeys,
  getProfileImageUrl,
} from "@/pages/Room/utils/participantUtils";
import { QUERY_KEYS } from "@/apis/constants/queryKeys";
import { groupApi } from "@/apis/domains/group/api";
import { useMember } from "@/hooks/useMember";
import type { ParticipantData } from "@/types/livekit";

export function useRoomParticipants(
  groupCode: string | undefined,
  remoteParticipants: ParticipantData[],
) {
  const { data: groupMembers = [] } = useQuery({
    queryKey: QUERY_KEYS.groups.members(groupCode ?? ""),
    queryFn: () => groupApi.getGroupMembers(groupCode!),
    enabled: !!groupCode,
  });

  const { data: currentMember } = useMember();

  const groupMemberByKey = useMemo(() => {
    const map = new Map<string, (typeof groupMembers)[number]>();

    groupMembers.forEach((member) => {
      getParticipantMatchKeys(member).forEach((key) => {
        map.set(key, member);
      });
    });

    return map;
  }, [groupMembers]);

  const participants = useMemo(
    () =>
      remoteParticipants.map((participant) => {
        const isCurrentParticipant =
          participant.identity === String(currentMember?.id) ||
          participant.identity === currentMember?.email ||
          participant.name === currentMember?.nickname;
        const matchedGroupMember =
          groupMemberByKey.get(participant.identity) ??
          groupMemberByKey.get(participant.name) ??
          (isCurrentParticipant ? currentMember : undefined);
        const profileImageUrl =
          participant.imageUrl ??
          getProfileImageUrl(matchedGroupMember) ??
          (isCurrentParticipant ? getProfileImageUrl(currentMember) : null);
        const hasVideo = participant.isVideoEnabled && participant.videoTrack;

        return {
          id: participant.identity,
          name: participant.name,
          isMuted: participant.isMuted,
          profileImageUrl,
          video: hasVideo ? (
            <VideoTile
              videoTrack={participant.videoTrack ?? undefined}
              audioTrack={
                isCurrentParticipant
                  ? undefined
                  : (participant.audioTrack ?? undefined)
              }
            />
          ) : undefined,
          audio:
            !hasVideo && !isCurrentParticipant ? (
              <VideoTile audioTrack={participant.audioTrack ?? undefined} />
            ) : undefined,
        };
      }),
    [currentMember, groupMemberByKey, remoteParticipants],
  );

  return {
    groupMembers,
    participants,
  };
}
