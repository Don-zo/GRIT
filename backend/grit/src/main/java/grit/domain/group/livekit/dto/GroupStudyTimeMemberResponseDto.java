package grit.domain.group.livekit.dto;

import grit.domain.member.dto.MemberStudyTimeResponseDto;
import grit.domain.member.entity.Member;
import java.time.Instant;
import java.time.LocalDate;

public record GroupStudyTimeMemberResponseDto(
        Long memberId,
        String nickname,
        LocalDate weekStartDate,
        Long weeklyStudyTimeGoalSeconds,
        long currentWeekStudyTimeSeconds,
        boolean running,
        Instant serverNow,
        Instant lastStartedAt
) {

    public static GroupStudyTimeMemberResponseDto from(
            Member member,
            MemberStudyTimeResponseDto studyTime
    ) {
        return new GroupStudyTimeMemberResponseDto(
                member.getId(),
                member.getNickname(),
                studyTime.weekStartDate(),
                studyTime.weeklyStudyTimeGoalSeconds(),
                studyTime.currentWeekStudyTimeSeconds(),
                studyTime.running(),
                studyTime.serverNow(),
                studyTime.lastStartedAt()
        );
    }
}