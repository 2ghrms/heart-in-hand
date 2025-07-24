package com.sg25.spring_server.domain.note.controller;

import com.sg25.spring_server.domain.note.dto.NoteRequestDTO;
import com.sg25.spring_server.domain.note.dto.NoteResponseDTO;
import com.sg25.spring_server.domain.note.service.NoteService;
import com.sg25.spring_server.global.apiPayLoad.ApiResponse;
import com.sg25.spring_server.global.apiPayLoad.code.status.ErrorStatus;
import com.sg25.spring_server.global.exception.GeneralException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "노트 API", description = "노트 생성, 조회, 삭제 관련 API")
@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
public class NoteRestController {

    private final NoteService noteService;

    @Operation(
            summary = "노트 생성",
            description = "노트를 생성하고 손글씨 이미지를 업로드합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            ),
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "노트 생성 성공",
                            content = @Content(schema = @Schema(implementation = NoteResponseDTO.NoteViewResponse.class))
                    )
            }
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<NoteResponseDTO.NoteViewResponse> createNote(
            @Parameter(description = "노트 제목") @RequestPart("title") String title,
            @Parameter(description = "노트 설명") @RequestPart("content") String content,
            @Parameter(description = "노트 이미지 파일들") @RequestPart("images") List<MultipartFile> images,
            HttpServletRequest request
    ) {
        Long memberId = (Long) request.getSession().getAttribute("memberId");

        if (memberId == null) {
            throw new GeneralException(ErrorStatus._UNAUTHORIZED);
        }

        NoteRequestDTO.CreateNoteRequest requestDTO = NoteRequestDTO.CreateNoteRequest.builder()
                .title(title)
                .content(content)
                .images(images)
                .build();

        return ApiResponse.onSuccess(noteService.createNote(requestDTO, memberId));
    }

    @Operation(
            summary = "노트 목록 조회",
            description = "현재 로그인한 사용자의 노트 목록을 조회합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "노트 목록 반환",
                            content = @Content(schema = @Schema(implementation = NoteResponseDTO.NoteSimpleViewResponse.class))
                    )
            }
    )
    @GetMapping("/my-notes")
    public ApiResponse<List<NoteResponseDTO.NoteSimpleViewResponse>> getNoteList(HttpServletRequest request) {
        Long memberId = (Long) request.getSession().getAttribute("memberId");
        if (memberId == null) {
            throw new GeneralException(ErrorStatus._UNAUTHORIZED);
        }
        return ApiResponse.onSuccess(noteService.getNoteList(memberId));
    }

    @Operation(
            summary = "노트 상세 조회",
            description = "노트 ID에 해당하는 상세 정보를 조회합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(
                            responseCode = "200",
                            description = "노트 상세 정보 반환",
                            content = @Content(schema = @Schema(implementation = NoteResponseDTO.NoteViewResponse.class))
                    )
            }
    )
    @GetMapping("/{noteId}")
    public ApiResponse<NoteResponseDTO.NoteViewResponse> getNoteDetail(
            @Parameter(description = "조회할 노트 ID") @PathVariable Long noteId
    ) {
        return ApiResponse.onSuccess(noteService.getNoteDetail(noteId));
    }

    @Operation(
            summary = "노트 삭제",
            description = "노트 ID에 해당하는 노트를 삭제합니다.",
            responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "노트 삭제 성공")
            }
    )
    @DeleteMapping("/{noteId}")
    public ApiResponse<Void> deleteNote(
            @Parameter(description = "삭제할 노트 ID") @PathVariable Long noteId,
            HttpServletRequest request
    ) {
        Long memberId = (Long) request.getSession().getAttribute("memberId");

        if (memberId == null) {
            throw new GeneralException(ErrorStatus._UNAUTHORIZED);
        }

        noteService.deleteNote(noteId, memberId);
        return ApiResponse.onSuccess(null);
    }
}
