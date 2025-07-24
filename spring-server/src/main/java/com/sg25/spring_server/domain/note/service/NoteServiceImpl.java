package com.sg25.spring_server.domain.note.service;

import com.sg25.spring_server.domain.member.domain.entity.Member;
import com.sg25.spring_server.domain.member.domain.repository.MemberRepository;
import com.sg25.spring_server.domain.model.enums.NoteImageStatus;
import com.sg25.spring_server.domain.note.converter.NoteConverter;
import com.sg25.spring_server.domain.note.domain.entity.Note;
import com.sg25.spring_server.domain.note.domain.entity.NoteImage;
import com.sg25.spring_server.domain.note.domain.repository.NoteImageRepository;
import com.sg25.spring_server.domain.note.domain.repository.NoteRepository;
import com.sg25.spring_server.domain.note.dto.NoteRequestDTO;
import com.sg25.spring_server.domain.note.dto.NoteResponseDTO;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final NoteImageRepository noteImageRepository;
    private final MemberRepository memberRepository;
    private final NoteConverter noteConverter;
    private final WebClient webClient;

    @Value("${flask.base-url}")
    private String flaskBaseUrl;

    private static final String BASE_PATH = new File("src/main/resources/static/noteImages").getAbsolutePath();

    @Override
    @Transactional
    public NoteResponseDTO.NoteViewResponse createNote(NoteRequestDTO.CreateNoteRequest request, Long memberId) {
        // 회원 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

        // 노트 저장
        Note note = noteConverter.toEntity(request.getTitle(), request.getContent(), member);
        noteRepository.save(note);

        // 노트에서 ID 추출
        Long noteId = note.getId();
        // 사용자 이메일에서 아이디 부분 추출 (예: hogeun@example.com → hogeun)
        String emailPrefix = member.getEmail().split("@")[0];
        // 이메일/노트ID 기반 폴더 경로 설정
        String userFolderPath = BASE_PATH + "/" + emailPrefix + "/" + noteId + "/";
        // 폴더 없으면 생성
        File directory = new File(userFolderPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // 이미지 저장
        List<NoteImage> imageEntities = new ArrayList<>();

        log.info("📦 업로드된 이미지 개수: {}", request.getImages().size());

        for (MultipartFile file : request.getImages()) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String storedPath = userFolderPath + fileName;

            try {
                file.transferTo(new File(storedPath));
                log.info("📸 저장 완료: {}", storedPath);
            } catch (IOException e) {
                log.error("❌ 파일 저장 실패: {}", storedPath, e);
                throw new GeneralException(ErrorStatus._FILE_UPLOAD_FAIL);
            }

            // 저장된 경로: src/main/resources/static/noteImages/userEmailPrefix/noteId/a.png → NoteImage에는 전체 경로 저장
            NoteImage noteImage = NoteImage.builder()
                    .storedPath(storedPath)
                    .noteImageStatus(NoteImageStatus.NOT_RECOGNIZED) // 처리 전 표시
                    .note(note)
                    .build();

            noteImageRepository.save(noteImage);
            imageEntities.add(noteImage);

            // Flask API 통신 로직

            // 1. 이미지 파일을 byte[]로 읽고
            byte[] imageBytes;
            try {
                imageBytes = Files.readAllBytes(Paths.get(storedPath));
            } catch (IOException e) {
                throw new GeneralException(ErrorStatus._FILE_UPLOAD_FAIL);
            }

            // 2. base64로 인코딩
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // 3. JSON 직렬화 후, Body 구성
            Map<String, Object> body = Map.of(
                    "noteImageId", noteImage.getId(),
                    "imageBase64", base64Image, // Base64 이미지
                    "fileName", fileName // 기타 내용으로 변경 가능
            );

            // 4. API uri + header + body 후 전송 (WebFlux 활용 비동기 처리)
            webClient.post()
                    .uri(flaskBaseUrl+"/analyze")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(body)
                    .retrieve()
                    .toBodilessEntity() // 응답 본문 없이 상태만 받음 (204 No Content 등)
                    .subscribe(
                            response -> log.info("✅ 분석 요청 성공: status = {}", response.getStatusCode()),
                            error -> log.error("❌ 분석 요청 실패", error)
                    );
        }

        return noteConverter.toNoteResponseDTO(note, imageEntities);
    }

    @Override
    public List<NoteResponseDTO.NoteSimpleViewResponse> getNoteList(Long memberId) {
        List<Note> notes = noteRepository.findAllByMemberId(memberId);
        return notes.stream()
                .map(noteConverter::toSimpleNoteDTO)
                .toList();
    }

    @Override
    public NoteResponseDTO.NoteViewResponse getNoteDetail(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

        List<NoteImage> images = noteImageRepository.findAllByNoteId(noteId);
        return noteConverter.toNoteResponseDTO(note, images);
    }

    @Override
    @Transactional
    public void deleteNote(Long noteId, Long memberId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new GeneralException(ErrorStatus._NOT_FOUND));

        if (!Objects.equals(note.getMember().getId(), memberId)) {
            throw new GeneralException(ErrorStatus._UNAUTHORIZED);
        }

        // 연관 이미지 삭제
        noteImageRepository.deleteAllByNoteId(noteId);
        // 노트 삭제
        noteRepository.delete(note);
    }
}