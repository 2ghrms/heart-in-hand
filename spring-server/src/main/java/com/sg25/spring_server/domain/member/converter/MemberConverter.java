package com.sg25.spring_server.domain.member.converter;

import com.sg25.spring_server.domain.member.domain.entity.Member;
import com.sg25.spring_server.domain.member.dto.MemberResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MemberConverter {

    public MemberResponseDTO.MemberViewResponse toMemberViewResponse(Member m) {
        return MemberResponseDTO.MemberViewResponse.builder()
                .id(m.getId())
                .email(m.getEmail())
                .name(m.getName())
                .build();
    }
}
