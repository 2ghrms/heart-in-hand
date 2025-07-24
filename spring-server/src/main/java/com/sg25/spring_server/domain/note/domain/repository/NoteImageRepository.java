package com.sg25.spring_server.domain.note.domain.repository;

import com.sg25.spring_server.domain.note.domain.entity.NoteImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteImageRepository extends JpaRepository<NoteImage, Long> {

    List<NoteImage> findAllByNoteId(Long noteId);

    void deleteAllByNoteId(Long noteId);
}
