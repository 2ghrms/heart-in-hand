package com.sg25.spring_server.domain.note.domain.repository;

import com.sg25.spring_server.domain.note.domain.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findAllByMemberId(Long memberId);
}
