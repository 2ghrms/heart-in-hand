package com.sg25.spring_server.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Builder
public class LoginRequestDTO {
    @Email
    private String email;

    @NotBlank
    private String password;
}
