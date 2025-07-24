package com.sg25.spring_server.global.config;

import com.sg25.spring_server.domain.auth.jwt.JwtAuthFilter;
import com.sg25.spring_server.domain.auth.jwt.JwtProvider;
import com.sg25.spring_server.domain.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class JwtFilterConfig {

    private final AuthService authService;
    private final JwtProvider jwtProvider;

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(jwtProvider, authService);
    }
}

