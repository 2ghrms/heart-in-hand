package com.sg25.spring_server.domain.member.controller;

import com.sg25.spring_server.domain.member.dto.MemberRequestDTO;
import com.sg25.spring_server.domain.member.dto.MemberResponseDTO;
import com.sg25.spring_server.domain.member.service.MemberService;
import com.sg25.spring_server.global.apiPayLoad.ApiResponse;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "회원 API", description = "회원 CRUD 관련 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberRestController {

    private final MemberService memberService;

    @Operation(summary = "회원 단건 조회", description = "회원 ID로 회원 정보를 조회합니다.")
    @GetMapping("/{id}")
    @PreAuthorize("#id == principal.id")
    public ApiResponse<MemberResponseDTO.MemberViewResponse> getMember(
            @Parameter(description = "회원 ID", required = true) @PathVariable Long id
    ) {
        MemberResponseDTO.MemberViewResponse response = memberService.find(id);
        return ApiResponse.onSuccess(response);
    }

    @Operation(summary = "내 정보 조회", description = "세션에 저장된 사용자 정보를 바탕으로 회원 정보를 조회합니다.")
    @GetMapping("/my-info")
    public ApiResponse<MemberResponseDTO.MemberViewResponse> getMyInfo(HttpServletRequest request) {
        // 내 정보 조회 시: 세션이 없으면 null 반환 → 로그인 안 한 상태
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("memberId") == null) {
            throw new GeneralException(ErrorStatus._NO_LOGIN);
        }

        Long memberId = (Long) session.getAttribute("memberId");
        MemberResponseDTO.MemberViewResponse response = memberService.find(memberId);

        return ApiResponse.onSuccess(response);
    }

    @Operation(summary = "회원 정보 수정", description = "회원 이름을 수정합니다.")
    @PatchMapping("/{id}")
    @PreAuthorize("#id == principal.id")
    public ApiResponse<MemberResponseDTO.MemberViewResponse> updateMember(
            @Parameter(description = "회원 ID", required = true) @PathVariable Long id,
            @RequestBody MemberRequestDTO.MemberUpdateRequest request
    ) {
        MemberResponseDTO.MemberViewResponse response = memberService.update(id, request);
        return ApiResponse.onSuccess(response);
    }

    @Operation(summary = "회원 삭제", description = "회원 ID로 회원을 삭제합니다.")
    @DeleteMapping("/{id}")
    @PreAuthorize("#id == principal.id")
    public ApiResponse<String> deleteMember(
            @Parameter(description = "회원 ID", required = true) @PathVariable Long id
    ) {
        memberService.delete(id);
        return ApiResponse.onSuccess(null);
    }
}
