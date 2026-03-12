package grit.domain.member.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import grit.domain.member.entity.Member;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record MemberResponseDto(
        @Schema(description = "사용자 고유 ID (PK)", example = "1")
        Long id,

        @Schema(description = "닉네임", example = "그릿유저")
        String nickname,

        @Schema(description = "이메일", example = "grit1234@a.com")
        String email,

        @Schema(description = "한 줄 소개", example = "오늘 하루도 파이팅", nullable = true)
        String introduction,

        String image,

        LocalDate dDayDate,

        String dDayTitle,

        @JsonFormat(pattern = "HH:mm")
        LocalTime weeklyStudyTimeGoal
) {

    // Member 엔티티 -> DTO 변환
    public static MemberResponseDto from(Member member) {
        UUID img = member.getImage();
        return new MemberResponseDto(
                    member.getId(),
                    member.getNickname(),
                    member.getEmail(),
                    member.getIntroduction(),
                    img != null ? img.toString() : null,
                    member.getDDayDate(),
                    member.getDDayTitle(),
                    member.getWeeklyStudyTimeGoal()
        );
    }

    public static MemberResponseDto from(Member member, String imageUrl) {
        return new MemberResponseDto(
                    member.getId(),
                    member.getNickname(),
                    member.getEmail(),
                    member.getIntroduction(),
                    imageUrl,
                    member.getDDayDate(),
                    member.getDDayTitle(),
                    member.getWeeklyStudyTimeGoal()
        );
    }
}