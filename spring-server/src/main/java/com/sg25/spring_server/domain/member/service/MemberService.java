package com.sg25.spring_server.domain.member.service;

import com.sg25.spring_server.domain.member.dto.MemberRequestDTO;
import com.sg25.spring_server.domain.member.dto.MemberResponseDTO;

public interface MemberService {

    // 회원 조회
    MemberResponseDTO.MemberViewResponse find(Long id);

    // 회원 수정
    MemberResponseDTO.MemberViewResponse update(Long id, MemberRequestDTO.MemberUpdateRequest req);

    // 회원 삭제
    void delete(Long id);
}
