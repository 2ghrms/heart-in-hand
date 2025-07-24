package com.sg25.spring_server.domain.member.domain.entity;

import com.sg25.spring_server.domain.model.BaseEntity;
import com.sg25.spring_server.domain.note.domain.entity.Note;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.util.ArrayList;
import java.util.List;

@Entity
@DynamicUpdate // update 시에 변경된 필드만 포함
@DynamicInsert // insert 시에 null 칼럼 제외
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Member extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String email;

    @Column(nullable = false)
    private String password;

    // access token 저장
    @Column(length = 500)
    private String accessToken;

    // refresh token 저장
    @Column(length = 500)
    private String refreshToken;

    @Column(nullable = true, length = 20)
    private String name;

    @Builder.Default
    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> noteList = new ArrayList<>();
}