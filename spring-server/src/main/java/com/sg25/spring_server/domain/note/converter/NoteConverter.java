package com.sg25.spring_server.domain.note.converter;

import com.sg25.spring_server.domain.member.domain.entity.Member;
import com.sg25.spring_server.domain.note.domain.entity.Note;
import com.sg25.spring_server.domain.note.domain.entity.NoteImage;
import com.sg25.spring_server.domain.note.dto.NoteResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NoteConverter {

    /**
     * Note 엔티티 생성
     */
    public Note toEntity(String title, String content, Member member) {
        return Note.builder()
                .title(title)
                .content(content)
                .member(member)
                .build();
    }

    /**
     * Note + 이미지 목록 → NoteViewResponse DTO 변환
     */
    public NoteResponseDTO.NoteViewResponse toNoteResponseDTO(Note note, List<NoteImage> images) {
        List<NoteResponseDTO.NoteImageResponse> imageDTOList = images.stream()
                .map(this::toNoteImageDTO)
                .collect(Collectors.toList());

        return NoteResponseDTO.NoteViewResponse.builder()
                .noteId(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .images(imageDTOList)
                .build();
    }

    /**
     * NoteImage → NoteImageDTO 변환
     */
    public NoteResponseDTO.NoteImageResponse toNoteImageDTO(NoteImage image) {
        String imageUrl = extractPublicUrlFromStoredPath(image.getStoredPath());

        return NoteResponseDTO.NoteImageResponse.builder()
                .imageId(image.getId())
                .imageUrl(imageUrl)
                .analysisResult(image.getRecognizedText())
                .noteImageStatus(image.getNoteImageStatus())
                .build();
    }

    /**
     * Note → 목록 조회용 SimpleNoteResponse DTO 변환
     */
    public NoteResponseDTO.NoteSimpleViewResponse toSimpleNoteDTO(Note note) {
        return NoteResponseDTO.NoteSimpleViewResponse.builder()
                .noteId(note.getId())
                .title(note.getTitle())
                .createdAt(note.getCreatedAt())
                .build();
    }

    /**
     * storedPath에서 정적 URL 경로 추출
     * 예: "src/main/resources/static/noteImages/a.png" → "/noteImages/a.png"
     */
    private String extractPublicUrlFromStoredPath(String storedPath) {
        // 경로의 OS 종속성 해결: 윈도우에서는 \가 들어올 수 있으므로 슬래시로 통일
        storedPath = storedPath.replace("\\", "/");

        // 기준점: static 폴더 이후 경로
        String marker = "/static/";
        int idx = storedPath.indexOf(marker);
        if (idx == -1) return storedPath; // fallback: 그대로 반환

        // "noteImages/..." 형태만 추출
        String relativePath = storedPath.substring(idx + marker.length());
        return "/" + relativePath; // "/noteImages/..." 형태
    }
}
