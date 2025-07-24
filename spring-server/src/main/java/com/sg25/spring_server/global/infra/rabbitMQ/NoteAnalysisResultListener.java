package com.sg25.spring_server.global.infra.rabbitMQ;

import com.sg25.spring_server.domain.model.enums.NoteImageStatus;
import com.sg25.spring_server.domain.note.domain.entity.NoteImage;
import com.sg25.spring_server.domain.note.domain.repository.NoteImageRepository;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import com.sg25.spring_server.global.infra.gpt.GptCorrectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class NoteAnalysisResultListener {

    public static final String RESULT_QUEUE = "note.analyze.result";
    private final NoteImageRepository noteImageRepository;

    private final GptCorrectionService gptCorrectionService;

    @RabbitListener(queues = RESULT_QUEUE)
    public void receiveAnalysisResult(Map<String, Object> message) {
        Long noteImageId = null;
        try {
            noteImageId = Long.valueOf(message.get("noteImageId").toString());
            String recognizedText = message.get("recognizedText").toString();

            NoteImage noteImage = noteImageRepository.findById(noteImageId)
                    .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

            // GPT 보정
            log.info("GPT 보정 시도: {}", recognizedText);
            String correctedText = gptCorrectionService.correctRecognizedText(recognizedText);

            // 분석 성공 처리
            log.info("GPT 보정 성공: {}", correctedText);
            noteImage.updateRecognizedText(correctedText, NoteImageStatus.DONE);
            noteImageRepository.save(noteImage);

            log.info("✅ MQ 분석 결과 저장 완료 (noteImageId: {}, recognizedText: {})", noteImageId, recognizedText);
        } catch (Exception e) {
            log.error("❌ MQ 분석 결과 처리 실패: {}", message, e);

            // 실패한 경우 NoteStatus를 ERROR로 업데이트
            if (noteImageId != null) {
                noteImageRepository.findById(noteImageId).ifPresent(noteImage -> {
                    noteImage.updateRecognizedText(null, NoteImageStatus.ERROR);
                    noteImageRepository.save(noteImage);
                });
            }
        }
    }
}
