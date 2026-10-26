package grit.domain.member.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import grit.domain.auth.infrastructure.jwt.AuthenticationFilter;
import grit.domain.auth.infrastructure.jwt.JwtProvider;
import grit.domain.member.constant.Role;
import grit.domain.member.constant.SocialProvider;
import grit.domain.member.entity.Member;
import grit.domain.member.repository.MemberRepository;
import grit.domain.member.service.MemberService;
import grit.domain.member.service.MemberWithdrawalService;
import grit.domain.studytime.service.StudyTimeService;
import grit.global.handler.CustomAuthenticationEntryPoint;
import grit.global.s3.S3Service;
import grit.global.util.CookieUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

class MemberWithdrawalControllerTest {
    MemberRepository repository;
    MemberWithdrawalService withdrawal;
    MockMvc mvc;
    String token;

    @BeforeEach
    void setUp() {
        repository = mock(MemberRepository.class);
        withdrawal = mock(MemberWithdrawalService.class);
        JwtProvider jwt = new JwtProvider();
        ReflectionTestUtils.setField(jwt, "secret", "a-test-secret-with-at-least-thirty-two-bytes");
        ReflectionTestUtils.setField(jwt, "accessTokenTtl", 3600000L);
        ReflectionTestUtils.invokeMethod(jwt, "init");
        token = jwt.createAccessToken(Member.builder().id(1L).email("member@example.com")
                .provider(SocialProvider.GOOGLE).providerId("1").role(Role.USER).build());
        var controller = new MemberController(mock(MemberService.class), withdrawal, new CookieUtils(),
                mock(S3Service.class), mock(StudyTimeService.class));
        var filter = new AuthenticationFilter(jwt, repository, new CustomAuthenticationEntryPoint(new JsonMapper()));
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .addFilters(filter).build();
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returns204AndExpiresRefreshCookie() throws Exception {
        when(repository.existsById(1L)).thenReturn(true);
        mvc.perform(delete("/api/members/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""))
                .andExpect(header().string("Set-Cookie", Matchers.allOf(
                        Matchers.containsString("refresh_token="), Matchers.containsString("Max-Age=0"),
                        Matchers.containsString("Path=/"), Matchers.containsString("HttpOnly"),
                        Matchers.containsString("Secure"), Matchers.containsString("SameSite=None"))));
        verify(withdrawal).withdraw(1L);
    }

    @Test
    void rejectsEvenAnUnexpiredTokenAfterWithdrawal() throws Exception {
        when(repository.existsById(1L)).thenReturn(false);
        mvc.perform(delete("/api/members/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(withdrawal);
    }

    @Test
    void rejectsInvalidSignatureBeforeCheckingMember() throws Exception {
        mvc.perform(delete("/api/members/me").header("Authorization", "Bearer " + token + "bad"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(repository, withdrawal);
    }
}
