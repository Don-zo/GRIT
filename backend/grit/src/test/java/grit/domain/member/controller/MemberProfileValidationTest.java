package grit.domain.member.controller;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import grit.domain.member.dto.MemberProfileInitializeRequestDto;
import grit.domain.member.dto.MemberProfileUpdateRequestDto;
import grit.domain.member.service.MemberService;
import grit.domain.member.service.MemberWithdrawalService;
import grit.domain.studytime.service.StudyTimeService;
import grit.global.exception.GlobalExceptionHandler;
import grit.global.s3.S3Service;
import grit.global.util.CookieUtils;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.assertj.core.api.Assertions.assertThat;

class MemberProfileValidationTest {
    private MemberService memberService;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        memberService = mock(MemberService.class);
        var controller = new MemberController(memberService, mock(MemberWithdrawalService.class),
                new CookieUtils(), mock(S3Service.class), mock(StudyTimeService.class));
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @ParameterizedTest
    @CsvSource({"POST,nickname,11", "PUT,nickname,11", "POST,introduction,41", "PUT,introduction,41"})
    void rejectsOversizedProfileBeforeCallingService(String method, String field, int length) throws Exception {
        String nickname = field.equals("nickname") ? "가".repeat(length) : "그릿";
        String introduction = field.equals("introduction") ? "가".repeat(length) : "소개";
        String message = field.equals("nickname")
                ? "nickname: 닉네임은 10자 이하여야 합니다."
                : "introduction: 한 줄 소개는 40자 이하여야 합니다.";

        mvc.perform(request(HttpMethod.valueOf(method), "/api/members/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"" + nickname + "\",\"introduction\":\"" + introduction + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(message));
        verifyNoInteractions(memberService);
    }

    @Test
    void acceptsExactLimitsAndNullableIntroductionOnUpdate() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertThat(validator.validate(new MemberProfileInitializeRequestDto(
                    "가".repeat(10), "가".repeat(40), null, null, null, null))).isEmpty();
            assertThat(validator.validate(new MemberProfileUpdateRequestDto(
                    "가".repeat(10), "가".repeat(40), null, null, null, null))).isEmpty();
            assertThat(validator.validate(new MemberProfileUpdateRequestDto(
                    "그릿", null, null, null, null, null))).isEmpty();
        }
    }
}
