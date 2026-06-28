package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import grit.domain.member.entity.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record MemberResponseDto(

        @Schema(description = "사용자 고유 ID (PK)", example = "1")
        Long id,

        @Schema(description = "닉네임", example = "그릿유저")
        String nickname,

        @Schema(description = "이메일", example = "grit1234@a.com")
        String email,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
        String introduction,

        UUID imageName,

        String imageUrl,

        LocalDate dDayDate,

        String dDayTitle,

        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal
) {

    // Member 엔티티 -> DTO 변환 (전체 URL 생성 완료된 상태)

    public static MemberResponseDto fromWithResolvedUrl(Member member, String imageUrl) {
        return new MemberResponseDto(
                    member.getId(),
                    member.getNickname(),
                    member.getEmail(),
                    member.getIntroduction(),
                    member.getImageName(),
                    imageUrl,
                    member.getDDayDate(),
                    member.getDDayTitle(),
                    member.getWeeklyStudyTimeGoal()
        );
    }

    // 친구 목록용 변환 (이메일 제외)
    public static MemberResponseDto fromForFriend(Member member, String imageUrl) {
        return new MemberResponseDto(
                    member.getId(),
                    member.getNickname(),
                    null,          // email 비공개
                    member.getIntroduction(),
                    member.getImageName(),
                    imageUrl,
                    member.getDDayDate(),
                    member.getDDayTitle(),
                    member.getWeeklyStudyTimeGoal()
        );
    }
}
