package com.sg25.spring_server.domain.note.domain.entity;

import com.sg25.spring_server.domain.model.BaseEntity;
import com.sg25.spring_server.domain.model.enums.NoteImageStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class NoteImage extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String storedPath;              // S3 key or local path

    @Enumerated(EnumType.STRING)
    private NoteImageStatus noteImageStatus;                  // WAITING, PROCESSING, DONE, ERROR

    @Column(columnDefinition = "TEXT")
    private String recognizedText;     // 추출된 손글씨 결과

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    public void updateRecognizedText(String text, NoteImageStatus status) {
        this.recognizedText = text;
        this.noteImageStatus = status;
    }
}
