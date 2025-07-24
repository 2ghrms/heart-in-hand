package com.sg25.spring_server.global.infra.gpt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GptCorrectionService {

    private final ObjectMapper objectMapper;

    @Value("${ai.openai.api-key}")
    private String gptKey;

    @Value("${ai.openai.url")
    private String gptUrl;

    public String correctRecognizedText(String recognizedText) {
        // 1. 프롬프트 구성
        String prompt = """
            다음 텍스트는 이미지에서 OCR로 인식된 텍스트입니다. 인식 오류가 있을 수 있으므로, 자연스럽고 정확한 문장으로 보정해 주세요. 
            단, 원래 의미를 최대한 유지해야 합니다.

            인식된 텍스트:
            %s
            """.formatted(recognizedText);

        try {
            // 2. WebClient 구성
            WebClient webClient = WebClient.builder()
                    .baseUrl(gptUrl)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + gptKey)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build();

            // 3. 요청 바디 구성
            Map<String, Object> requestBody = Map.of(
                    "model", "gpt-3.5-turbo",
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    )
            );

            // 4. 요청 전송 및 응답 파싱
            String response = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 5. 응답 JSON에서 보정된 텍스트 추출
            JsonNode root = objectMapper.readTree(response);
            String corrected = root
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            log.info("✅ GPT 보정 완료: {}", corrected);
            return corrected;
        } catch (Exception e) {
            log.error("❌ GPT 보정 실패", e);
            return recognizedText; // 실패 시 원문 반환
        }
    }
}