package com.sg25.spring_server.domain.auth.service;

import com.sg25.spring_server.domain.auth.dto.LoginRequestDTO;
import com.sg25.spring_server.domain.auth.dto.LoginResponseDTO;
import com.sg25.spring_server.domain.auth.jwt.JwtProvider;
import com.sg25.spring_server.domain.member.domain.entity.Member;
import com.sg25.spring_server.domain.member.domain.repository.MemberRepository;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    // 로그아웃된 토큰을 저장하는 블랙리스트 (메모리 기반)
    private final Set<String> blacklistedTokens = Collections.synchronizedSet(new HashSet<>());

    // 로그인 처리 및 access/refresh 토큰 발급
    public LoginResponseDTO login(LoginRequestDTO loginRequest, HttpServletRequest httpServletRequest) {

        // 이메일 검증
        Member member = memberRepository.findByEmail(loginRequest.getEmail())
                .orElseGet(() -> {
                    throw new GeneralException(ErrorStatus._EMAIL_INVALID);
                });
        // 비밀번호 검증
        if (passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
            String accessToken = jwtProvider.generateAccessToken(loginRequest.getEmail());
            String refreshToken = jwtProvider.generateRefreshToken(loginRequest.getEmail());

            // 토큰 할당
            member.setAccessToken(accessToken);
            member.setRefreshToken(refreshToken);

            // DB에 토큰을 포함한 사용자 정보 저장
            memberRepository.save(member);

            // 세션에 토큰을 제외한 사용자 정보 저장
            HttpSession session = httpServletRequest.getSession(true);
            session.setAttribute("memberId", member.getId());
            session.setAttribute("email", member.getEmail());

            return LoginResponseDTO.builder()
                    .memberId(member.getId())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .accessTokenExpiresIn(jwtProvider.getAccessTokenExpiration())
                    .build();
        }

        throw new GeneralException(ErrorStatus._PASSWORD_INVALID);
    }

    public LoginResponseDTO register(LoginRequestDTO loginRequest, HttpServletRequest httpServletRequest) {

        // 이미 존재하는 이메일이면 예외 발생
        if (memberRepository.findByEmail(loginRequest.getEmail()).isPresent()) {
            throw new GeneralException(ErrorStatus._DUPLICATE_MEMBER);  // 예: 이메일 중복
        }

        // 새로운 사용자 생성 및 저장
        Member newMember = Member.builder()
                .email(loginRequest.getEmail())
                .password(passwordEncoder.encode(loginRequest.getPassword()))
                .build();
        memberRepository.save(newMember);

        // 토큰 발급
        String accessToken = jwtProvider.generateAccessToken(newMember.getEmail());
        String refreshToken = jwtProvider.generateRefreshToken(newMember.getEmail());

        // 토큰 저장
        newMember.setAccessToken(accessToken);
        newMember.setRefreshToken(refreshToken);
        memberRepository.save(newMember);

        // 세션에 사용자 정보 저장
        HttpSession session = httpServletRequest.getSession(true);
        session.setAttribute("memberId", newMember.getId());
        session.setAttribute("email", newMember.getEmail());

        // 응답 DTO 반환
        return LoginResponseDTO.builder()
                .memberId(newMember.getId())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiresIn(jwtProvider.getAccessTokenExpiration())
                .build();
    }

    // refresh token을 통한 access token 재발급
    public String refreshAccessToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new GeneralException(ErrorStatus._REFRESH_TOKEN_INVALID);
        }

        String email = jwtProvider.getEmailFromToken(refreshToken);
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

        if (!refreshToken.equals(member.getRefreshToken())) {
            throw new GeneralException(ErrorStatus._REFRESH_TOKEN_INVALID);
        }

        String newAccessToken = jwtProvider.generateAccessToken(email);
        member.setAccessToken(newAccessToken);
        memberRepository.save(member);

        return newAccessToken;
    }

    // 로그아웃 처리: 토큰을 블랙리스트에 추가하고 DB에서도 삭제
    public void logout(String token) {
        blacklistedTokens.add(token);

        String email = jwtProvider.getEmailFromToken(token);
        memberRepository.findByEmail(email).ifPresent(member -> {
            member.setAccessToken(null);
            member.setRefreshToken(null);
            memberRepository.save(member);
        });
    }

    // 해당 토큰이 블랙리스트에 등록되었는지 확인
    public boolean isTokenBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }

    // access token의 만료 시간 반환
    public long getAccessTokenExpiration() {
        return jwtProvider.getAccessTokenExpiration();
    }

    // refresh token의 만료 시간 반환
    public long getRefreshTokenExpiration() {
        return jwtProvider.getRefreshTokenExpiration();
    }

    public UserDetails loadUserByUserEmail(String email) throws UsernameNotFoundException {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(member.getEmail())
                .password(member.getPassword())
                .build();
    }
}