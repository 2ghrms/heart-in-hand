package com.sg25.spring_server.domain.auth.dto;

import lombok.*;

@Getter
@Builder
public class LoginResponseDTO {
    private Long memberId;
    private String accessToken;
    private String refreshToken;
    private Long accessTokenExpiresIn;
}
