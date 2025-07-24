package com.sg25.spring_server.domain.note.dto;

import com.sg25.spring_server.domain.model.enums.NoteImageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.util.List;

public class NoteResponseDTO {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoteImageResponse {
        private Long imageId;
        private String imageUrl;
        private String analysisResult;
        private NoteImageStatus noteImageStatus;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoteViewResponse {
        private Long noteId;
        private String title;
        private String content;
        private List<NoteImageResponse> images;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NoteSimpleViewResponse {
        private Long noteId;
        private String title;
        private LocalDateTime createdAt;
    }
}
