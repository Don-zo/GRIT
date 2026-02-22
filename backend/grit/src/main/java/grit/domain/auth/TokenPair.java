package grit.domain.auth;

public record TokenPair (
        String accessToken,
        String refreshToken
) {}

