package grit.domain.auth.dto;

import jakarta.validation.constraints.NotNull;

public record GoogleAuthRequestDto(
        @NotNull String code,
        @NotNull String redirectUri
) {}
