package grit.global.handler;

import grit.global.exception.dto.ErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final JsonMapper jsonMapper;

    @Override
    public void commence(@NonNull HttpServletRequest request, HttpServletResponse response,
            @NonNull AuthenticationException authException) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json; charset=UTF-8");

        ErrorResponseDto errorResponse = ErrorResponseDto.of("인증 정보가 없습니다.");

        String result = jsonMapper.writeValueAsString(errorResponse);
        response.getWriter().write(result);
    }
}
