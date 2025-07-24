package com.sg25.spring_server.domain.auth.controller;

import com.sg25.spring_server.domain.auth.dto.LoginRequestDTO;
import com.sg25.spring_server.domain.auth.dto.LoginResponseDTO;
import com.sg25.spring_server.domain.auth.dto.RefreshTokenResponseDTO;
import com.sg25.spring_server.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import com.sg25.spring_server.global.apiPayLoad.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name = "인증 API", description = "로그인, 로그아웃, 토큰 갱신 등을 제공하는 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthRestController {

    private final AuthService authService;

    /**
     * 로그인 요청 처리
     * 사용자가 로그인하면 access token, refresh token을 쿠키에 저장하고,
     * memberId 및 만료 시간 정보를 응답으로 반환
     */
    @Operation(summary = "로그인", description = "이메일과 비밀번호로 로그인합니다.")
    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(
            @RequestBody LoginRequestDTO loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 내부적으로 DB에 동기화 + 세션 정보를 넘기도록 AuthService.login 메서드 설계됨
        LoginResponseDTO loginResponse = authService.login(loginRequest, request);

        // Access Token을 HttpOnly 쿠키에 저장
        Cookie accessCookie = new Cookie("access_token", loginResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (loginResponse.getAccessTokenExpiresIn() / 1000));
        // 배포 시 아래 옵션 활성화 필요 (HTTPS 환경)
        // accessCookie.setSecure(true);
        response.addCookie(accessCookie);

        // Refresh Token을 HttpOnly 쿠키에 저장
        Cookie refreshCookie = new Cookie("refresh_token", loginResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (loginResponse.getAccessTokenExpiresIn() / 1000)); // 예: 7일/1000
        // 배포 시 아래 옵션 활성화 필요 (HTTPS 환경)
        // refreshCookie.setSecure(true);
        response.addCookie(refreshCookie);

        return ApiResponse.onSuccess(loginResponse); // 토큰 포함된 전체 DTO 응답
    }

    /**
     * 로그인 요청 처리
     * 사용자가 로그인하면 access token, refresh token을 쿠키에 저장하고,
     * memberId 및 만료 시간 정보를 응답으로 반환
     */
    @Operation(summary = "회원가입", description = "이메일과 비밀번호로 회원가입합니다.")
    @PostMapping("/register")
    public ApiResponse<LoginResponseDTO> register(
            @RequestBody LoginRequestDTO loginRequest,
            HttpServletRequest request,
            HttpServletResponse response) {

        // 내부적으로 DB에 동기화 + 세션 정보를 넘기도록 AuthService.register 메서드 설계됨
        LoginResponseDTO loginResponse = authService.register(loginRequest, request);

        // Access Token을 HttpOnly 쿠키에 저장
        Cookie accessCookie = new Cookie("access_token", loginResponse.getAccessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (loginResponse.getAccessTokenExpiresIn() / 1000));
        // 배포 시 아래 옵션 활성화 필요 (HTTPS 환경)
        // accessCookie.setSecure(true);
        response.addCookie(accessCookie);

        // Refresh Token을 HttpOnly 쿠키에 저장
        Cookie refreshCookie = new Cookie("refresh_token", loginResponse.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge((int) (loginResponse.getAccessTokenExpiresIn() / 1000)); // 예: 7일/1000
        // 배포 시 아래 옵션 활성화 필요 (HTTPS 환경)
        // refreshCookie.setSecure(true);
        response.addCookie(refreshCookie);

        return ApiResponse.onSuccess(loginResponse); // 토큰 포함된 전체 DTO 응답
    }

    /**
     * Refresh Token으로 Access Token 재발급
     * 쿠키에서 refresh_token을 읽어 새로운 access_token을 발급 후, 쿠키로 전달
     */
    @Operation(summary = "Access Token 재발급", description = "Refresh Token을 사용하여 새로운 Access Token을 발급합니다.")
    @PostMapping("/refresh")
    public ApiResponse<RefreshTokenResponseDTO> refresh(
            @CookieValue("refresh_token") String refreshToken,
            HttpServletResponse response) {

        String newAccessToken = authService.refreshAccessToken(refreshToken);

        Cookie accessCookie = new Cookie("access_token", newAccessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge((int) (authService.getAccessTokenExpiration() / 1000));
        response.addCookie(accessCookie);

        RefreshTokenResponseDTO dto = RefreshTokenResponseDTO.builder()
                .accessToken(newAccessToken)
                .accessTokenExpiresIn(authService.getAccessTokenExpiration())
                .build();
        return ApiResponse.onSuccess(dto);
    }

    /**
     * 로그아웃 처리
     * 서버에서 토큰을 블랙리스트에 등록하고, 쿠키를 무효화
     */
    @Operation(summary = "로그아웃", description = "Access 및 Refresh Token을 만료 처리합니다.")
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@CookieValue("access_token") String token,
                                       HttpServletResponse response) {
        authService.logout(token);

        // 쿠키 무효화 (0초 만료)
        Cookie accessCookie = new Cookie("access_token", null);
        accessCookie.setHttpOnly(true);
        accessCookie.setMaxAge(0);
        accessCookie.setPath("/");
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refresh_token", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setMaxAge(0);
        refreshCookie.setPath("/");
        response.addCookie(refreshCookie);

        return ApiResponse.onSuccess(null);
    }
}
