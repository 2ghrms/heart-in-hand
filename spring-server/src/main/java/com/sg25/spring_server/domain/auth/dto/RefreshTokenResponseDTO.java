package com.sg25.spring_server.domain.auth.dto;

import lombok.*;

@Getter
@Builder
public class RefreshTokenResponseDTO {
    private String accessToken;
    private Long accessTokenExpiresIn;
}
