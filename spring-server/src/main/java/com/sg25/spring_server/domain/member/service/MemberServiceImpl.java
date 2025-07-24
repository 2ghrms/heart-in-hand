package com.sg25.spring_server.domain.member.service;

import com.sg25.spring_server.domain.member.converter.MemberConverter;
import com.sg25.spring_server.domain.member.domain.entity.Member;
import com.sg25.spring_server.domain.member.domain.repository.MemberRepository;
import com.sg25.spring_server.domain.member.dto.MemberRequestDTO;
import com.sg25.spring_server.domain.member.dto.MemberResponseDTO;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final MemberConverter memberConverter;

    // 회원 조회
    @Override
    @Transactional(readOnly = true)
    public MemberResponseDTO.MemberViewResponse find(Long id) {
        return memberConverter.toMemberViewResponse(memberRepository.findById(id)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND)));
    }

    // 회원 수정
    @Override
    @Transactional
    public MemberResponseDTO.MemberViewResponse update(Long id, MemberRequestDTO.MemberUpdateRequest req) {
        Member m = memberRepository.findById(id)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

        // 필요시 다른 필드도 추가 가능
        m.setName(req.getName());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            m.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return memberConverter.toMemberViewResponse(m);
    }

    // 회원 삭제
    @Override
    @Transactional
    public void delete(Long id) {
        memberRepository.deleteById(id);
    }
}
