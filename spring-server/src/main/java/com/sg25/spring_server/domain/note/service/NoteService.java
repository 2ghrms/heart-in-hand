package com.sg25.spring_server.domain.note.service;

import com.sg25.spring_server.domain.note.dto.NoteRequestDTO;
import com.sg25.spring_server.domain.note.dto.NoteResponseDTO;

import java.util.List;

public interface NoteService {

    NoteResponseDTO.NoteViewResponse createNote(NoteRequestDTO.CreateNoteRequest request, Long memberId);

    List<NoteResponseDTO.NoteSimpleViewResponse> getNoteList(Long memberId);

    NoteResponseDTO.NoteViewResponse getNoteDetail(Long noteId);

    void deleteNote(Long noteId, Long memberId);

}
