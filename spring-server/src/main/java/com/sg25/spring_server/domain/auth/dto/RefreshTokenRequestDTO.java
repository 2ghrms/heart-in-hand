package com.sg25.spring_server.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Builder
public class RefreshTokenRequestDTO {
    @Email
    private String email;

    @NotBlank
    private String refreshToken;
}
